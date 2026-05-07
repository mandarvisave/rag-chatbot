import { useRef, useState } from 'react';
import { FileText, Loader2, UploadCloud } from 'lucide-react';
import { uploadPDF } from '../api/client';

export default function PDFUploader() {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');

  async function handleFile(file) {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const response = await uploadPDF(file);
      setStatus(response);
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <FileText className="h-5 w-5 text-indigo-600" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-slate-950">Upload PDF</h2>
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          handleFile(event.dataTransfer.files?.[0]);
        }}
        className={`flex min-h-40 w-full flex-col items-center justify-center rounded-md border border-dashed px-4 text-center transition ${
          dragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 bg-slate-50'
        }`}
      >
        {uploading ? (
          <Loader2 className="mb-3 h-7 w-7 animate-spin text-indigo-600" aria-hidden="true" />
        ) : (
          <UploadCloud className="mb-3 h-7 w-7 text-slate-500" aria-hidden="true" />
        )}
        <span className="text-sm font-medium text-slate-900">
          {uploading ? 'Indexing document...' : 'Drop a PDF here or click to browse'}
        </span>
        <span className="mt-1 text-xs text-slate-500">Text is chunked, embedded, and saved locally.</span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />

      {status && (
        <div className="mt-3 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          <div className="font-medium">{status.filename}</div>
          <div>{status.chunks_stored} chunks indexed</div>
        </div>
      )}
      {error && <div className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">{error}</div>}
    </section>
  );
}
