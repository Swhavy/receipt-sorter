# backend/utils/receipt_sorter_sse.py
import os
import shutil
from utils.receipt_sorter import (
    create_temp_folder,
    extract_date_from_image,
    create_receipt_document,
    cleanup_temp_files,
    logger
)

def process_receipts_with_progress(image_paths, output_doc, job_id, send_progress, job_tmp_dir):
    """
    Process receipts with real-time progress updates via SSE.
    
    Args:
        image_paths: List of image file paths
        output_doc: Path to save the output document
        job_id: Unique job identifier
        send_progress: Callback function to send progress updates
        job_tmp_dir: Temporary directory to cleanup
    """
    try:
        # Send initial status
        send_progress(job_id, "started", {
            "message": "Processing started",
            "total_files": len(image_paths),
            "status": "initializing"
        })
        
        # Ensure temp folder exists
        create_temp_folder()
        
        receipts_by_date = {}
        processed_count = 0
        
        # Process each image
        for idx, img_path in enumerate(image_paths, 1):
            filename = os.path.basename(img_path)
            
            try:
                # Send processing update
                send_progress(job_id, "processing", {
                    "message": f"Processing {filename}",
                    "current_file": filename,
                    "progress": idx,
                    "total": len(image_paths),
                    "percentage": int((idx / len(image_paths)) * 100)
                })
                
                logger.info(f"[Job {job_id}] Processing: {filename}")
                
                # Extract date from image
                date_str = extract_date_from_image(img_path)
                
                # Organize by date
                if date_str not in receipts_by_date:
                    receipts_by_date[date_str] = []
                receipts_by_date[date_str].append(img_path)
                
                processed_count += 1
                
                # Send success update for this file
                send_progress(job_id, "file_complete", {
                    "message": f"Extracted date from {filename}",
                    "filename": filename,
                    "date": date_str,
                    "progress": idx,
                    "total": len(image_paths)
                })
                
                logger.info(f"[Job {job_id}] Assigned '{date_str}' to {filename}")
                
            except Exception as e:
                logger.error(f"[Job {job_id}] Error processing {img_path}: {e}")
                
                # Add to unknown date
                receipts_by_date.setdefault("Unknown Date", []).append(img_path)
                
                # Send error update
                send_progress(job_id, "file_error", {
                    "message": f"Error processing {filename}",
                    "filename": filename,
                    "error": str(e),
                    "progress": idx,
                    "total": len(image_paths)
                })
        
        # Send document generation status
        send_progress(job_id, "generating", {
            "message": "Creating Word document",
            "status": "generating_document",
            "total_receipts": processed_count,
            "dates_found": len(receipts_by_date)
        })
        
        # Create document
        logger.info(f"[Job {job_id}] Creating Word document...")
        doc = create_receipt_document(receipts_by_date)
        
        # Save document
        doc.save(output_doc)
        logger.info(f"[Job {job_id}] Saved Word doc to: {output_doc}")
        
        # Cleanup temp files
        cleanup_temp_files()
        
        # Cleanup job temp directory
        try:
            shutil.rmtree(job_tmp_dir, ignore_errors=True)
        except Exception as e:
            logger.warning(f"[Job {job_id}] Could not cleanup temp dir: {e}")
        
        # Send completion
        send_progress(job_id, "complete", {
            "message": "Processing complete!",
            "status": "completed",
            "download_url": f"/download/{os.path.basename(output_doc)}",
            "total_processed": processed_count,
            "summary": {
                date: len(files) for date, files in receipts_by_date.items()
            }
        })
        
    except Exception as e:
        logger.error(f"[Job {job_id}] Fatal error: {e}")
        
        # Send error event
        send_progress(job_id, "error", {
            "message": "Processing failed",
            "error": str(e),
            "status": "failed"
        })
        
        # Cleanup on error
        try:
            shutil.rmtree(job_tmp_dir, ignore_errors=True)
        except:
            pass