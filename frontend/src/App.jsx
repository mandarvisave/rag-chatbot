import { Database, FileSearch, Layers3 } from 'lucide-react';
import ChatWindow from './components/ChatWindow';
import PDFUploader from './components/PDFUploader';
import { useChat } from './hooks/useChat';

export default function App() {
  const chat = useChat();

  return (
    <main className="min-h-screen bg-[#f6f7fb] p-4">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row">
        <aside className="w-full space-y-4 lg:w-80 lg:shrink-0">
          <PDFUploader />

          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <FileSearch className="h-5 w-5 text-indigo-600" aria-hidden="true" />
              <h2 className="text-sm font-semibold text-slate-950">How It Works</h2>
            </div>
            <div className="space-y-4 text-sm text-slate-600">
              <div className="flex gap-3">
                <Layers3 className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                <p>PDF text is split into overlapping chunks for precise retrieval.</p>
              </div>
              <div className="flex gap-3">
                <Database className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                <p>Embeddings are stored in FAISS and persisted between backend restarts.</p>
              </div>
              <div className="flex gap-3">
                <FileSearch className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                <p>The top matches are sent with your question so the answer stays grounded.</p>
              </div>
            </div>
          </section>
        </aside>

        <ChatWindow messages={chat.messages} loading={chat.loading} ask={chat.ask} clear={chat.clear} />
      </div>
    </main>
  );
}
