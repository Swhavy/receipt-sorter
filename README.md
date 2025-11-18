**ARCFLOW – Receipt Sorting and Document Generator***

ARCFLOW is a modern web application designed to simplify receipt management. Upload your receipts, automatically sort them by date, and generate Word documents for accounting or tax purposes. The app also includes live progress updates using Server-Sent Events (SSE).

*Features*

Smart Upload: Drag-and-drop receipt images or folders for instant processing.

Auto Sort by Date: Organizes receipts chronologically.

Export to Word: Generates beautifully formatted Word documents with all receipt details.

Live Progress Updates: Track processing status in real-time with SSE.

Responsive UI: Clean, modern landing page built with Next.js and Tailwind CSS.

Theme Toggle: Switch between light and dark modes.

*Tech Stack*

Frontend: Next.js, React, Tailwind CSS, Lucide Icons

Backend: FastAPI (Python), SSE for live updates

File Handling: Multiple file uploads, background processing with threading

Document Generation: Python (Word document creation)

*How It Works*

Upload Receipts: Users select receipt images or drag-and-drop entire folders.

Assign Job ID: The backend generates a unique job ID for the session.

Real-Time Processing: Receipts are sorted by date in a background thread. Progress updates are streamed to the frontend via SSE.

Word Document Generation: Once sorting is complete, a Word document is generated containing all receipts, properly organized.

Download Document: Users download the finished Word file directly from the interface.

*Workflow Diagram:*
```

User Uploads Receipts
         |
         v
   Backend Receives Files
         |
         v
 Background Processing Thread
         |
         v
  SSE Streams Progress Updates
         |
         v
Word Document Generated (Sorted Receipts)
         |
         v
       Download
```

*Installation*

Clone the repository:
```
git clone https://github.com/Swhavy/arcfow.git
cd arcfow
```

*Install Backend Dependencies:*
```
pip install fastapi uvicorn python-multipart
```

*Install Frontend Dependencies:*
```
npm install
```

*Run Backend Server:*
```
uvicorn backend.main:app --reload
```

*Run Frontend:*
```
npm run dev
```

Access the app at: http://localhost:3000

*API Endpoints*

POST /process-receipts – Upload receipt images for processing. Returns a job_id.

GET /events/{job_id} – SSE stream for live progress updates.

GET /download/{filename} – Download the processed Word document.

*Usage*

Navigate to the ARCFLOW landing page.

Upload receipt images or folders.

Monitor processing progress in real-time via SSE.

Download the generated Word document when processing is complete.

*Project Structure*
```
/frontend                  # Next.js frontend
/backend                   # FastAPI backend
    main.py                # API routes and SSE logic
    utils/
        receipt_sorter.py  # Receipt processing and Word document generation logic
```
Live Progress Display (SSE)

ARCFLOW uses Server-Sent Events (SSE) to provide live updates on the status of each uploaded job. This ensures users can see:

Which receipts have been processed

Any errors encountered during processing

Completion of Word document generation

Contributing

Contributions are welcome! Please fork the repository and submit a pull request for improvements or new features.
