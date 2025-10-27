# backend/main.py
import os
import shutil
import asyncio
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse
from typing import List
from uuid import uuid4
import json
from queue import Queue
import threading

app = FastAPI(title="ARCFLOW Receipt Sorter API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change to your frontend domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "ARCFLOW API is live 🚀"}

BASE_DIR = os.path.dirname(__file__)
TEMP_DIR = os.path.join(BASE_DIR, "temp_uploads")
OUTPUT_DIR = os.path.join(BASE_DIR, "output")

os.makedirs(TEMP_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Global dictionary to store progress queues for each job
progress_queues = {}

def send_progress(job_id: str, message: str):
    """Send progress message to SSE stream for a specific job."""
    if job_id in progress_queues:
        progress_queues[job_id].put(message)

@app.get("/events/{job_id}")
async def stream_events(job_id: str):
    """SSE endpoint that streams progress updates for a specific job."""
    
    # Create queue for this job if it doesn't exist
    if job_id not in progress_queues:
        progress_queues[job_id] = Queue()
    
    async def event_generator():
        """Generate SSE events from the queue."""
        queue = progress_queues[job_id]
        
        try:
            while True:
                # Non-blocking check with small delay
                await asyncio.sleep(0.1)
                
                if not queue.empty():
                    message = queue.get_nowait()
                    
                    # Send as SSE format
                    yield f"data: {message}\n\n"
                    
                    # Check if processing is complete
                    if "✅ Word document saved" in message or "❌" in message:
                        # Give a moment for final messages
                        await asyncio.sleep(0.5)
                        break
                    
        except Exception as e:
            yield f"data: ❌ Stream error: {str(e)}\n\n"
        finally:
            # Cleanup queue when stream closes
            if job_id in progress_queues:
                del progress_queues[job_id]
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
            "Access-Control-Allow-Origin": "*",
        }
    )

@app.post("/process-receipts")
async def process_receipts_endpoint(files: List[UploadFile] = File(...)):
    """
    Accepts multiple uploaded files, returns job_id immediately.
    Processing happens in background thread with SSE updates.
    """
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")

    # Create unique job
    job_id = str(uuid4())
    job_tmp_dir = os.path.join(TEMP_DIR, job_id)
    os.makedirs(job_tmp_dir, exist_ok=True)

    # Initialize progress queue for this job
    progress_queues[job_id] = Queue()

    saved_paths = []
    try:
        # Save uploaded files
        for uploaded in files:
            filename = os.path.basename(uploaded.filename)
            dest_path = os.path.join(job_tmp_dir, filename)
            with open(dest_path, "wb") as f:
                content = await uploaded.read()
                f.write(content)
            saved_paths.append(dest_path)

        # Output file path
        output_filename = f"sorted_receipts_{job_id}.docx"
        output_path = os.path.join(OUTPUT_DIR, output_filename)
        
        # Import the modified function
        from utils.receipt_sorter import process_receipts_with_sse
        
        # Start processing in background thread
        thread = threading.Thread(
            target=process_receipts_with_sse,
            args=(saved_paths, output_path, job_id, send_progress, job_tmp_dir)
        )
        thread.daemon = True
        thread.start()

        # Return job_id immediately for client to connect to SSE
        return JSONResponse({
            "job_id": job_id,
            "stream_url": f"/events/{job_id}",
            "total_files": len(saved_paths)
        })

    except Exception as e:
        # Cleanup on error
        shutil.rmtree(job_tmp_dir, ignore_errors=True)
        if job_id in progress_queues:
            del progress_queues[job_id]
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/download/{filename}")
def download_file(filename: str):
    path = os.path.join(OUTPUT_DIR, filename)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(
        path, 
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document", 
        filename=filename
    )