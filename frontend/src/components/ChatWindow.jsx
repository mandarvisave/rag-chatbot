import { Send, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import MessageBubble from './MessageBubble';

export default function ChatWindow({ messages, loading, ask, clear }) {
  const [draft, setDraft] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  function submit(event) {
    event.preventDefault();
    ask(draft);
    setDraft('');
  }

  return (
    <section className="flex min-h-[calc(100vh-2rem)] flex-1 flex-col rounded-lg border border-slate-200 bg-white shadow-sm">
      <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div>
          <h1 className="text-lg font-semibold text-slate-950">AI Document Search</h1>
          <p className="text-sm text-slate-500">Ask grounded questions across your uploaded PDFs.</p>
        </div>
        <button
          type="button"
          onClick={clear}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50"
          title="Clear chat"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Clear chat</span>
        </button>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 px-5 py-5">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
              Searching documents...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={submit} className="flex gap-3 border-t border-slate-200 p-4">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Ask a question about the uploaded PDF"
          className="min-h-11 flex-1 rounded-md border border-slate-300 px-3 text-sm outline-none ring-indigo-200 transition focus:border-indigo-500 focus:ring-4"
        />
        <button
          type="submit"
          disabled={loading || !draft.trim()}
          className="inline-flex min-h-11 items-center gap-2 rounded-md bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
          Ask
        </button>
      </form>
    </section>
  );
}
