# backend/main.py
import os
import shutil
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from typing import List
from uuid import uuid4
from utils.receipt_sorter import process_receipts  # import the wrapper you added

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

@app.post("/process-receipts")
async def process_receipts_endpoint(files: List[UploadFile] = File(...)):
    """
    Accepts multiple uploaded files (browser can upload a folder as multiple files).
    Saves them temporarily, calls process_receipts(), returns download URL.
    """
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")

    # create unique job folder
    job_id = str(uuid4())
    job_tmp_dir = os.path.join(TEMP_DIR, job_id)
    os.makedirs(job_tmp_dir, exist_ok=True)

    saved_paths = []
    try:
        # Save uploaded files
        for uploaded in files:
            # Normalize filename to avoid path traversal
            filename = os.path.basename(uploaded.filename)
            dest_path = os.path.join(job_tmp_dir, filename)
            with open(dest_path, "wb") as f:
                content = await uploaded.read()
                f.write(content)
            saved_paths.append(dest_path)

        # call the processing function (this is synchronous and may take time)
        output_filename = f"sorted_receipts_{job_id}.docx"
        output_path = os.path.join(OUTPUT_DIR, output_filename)

        result_docx = process_receipts(saved_paths, output_doc=output_path)

        # Return download URL (served by /download)
        return JSONResponse({"download_url": f"/download/{os.path.basename(result_docx)}", "job_id": job_id})

    except Exception as e:
        # cleanup on error
        shutil.rmtree(job_tmp_dir, ignore_errors=True)
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        # optionally remove uploaded files to keep temp small
        shutil.rmtree(job_tmp_dir, ignore_errors=True)


@app.get("/download/{filename}")
def download_file(filename: str):
    path = os.path.join(OUTPUT_DIR, filename)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(path, media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document", filename=filename)
