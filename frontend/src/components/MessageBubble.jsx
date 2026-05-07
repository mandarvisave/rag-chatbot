import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  const [open, setOpen] = useState(false);
  const sources = message.sources || [];

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[82%] rounded-lg px-4 py-3 text-sm leading-6 shadow-sm ${
          isUser
            ? 'bg-indigo-600 text-white'
            : 'border border-slate-200 bg-white text-slate-900'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>

        {!isUser && sources.length > 0 && (
          <div className="mt-3 border-t border-slate-100 pt-2">
            <button
              type="button"
              onClick={() => setOpen((current) => !current)}
              className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-950"
            >
              {open ? (
                <ChevronDown className="h-4 w-4" aria-hidden="true" />
              ) : (
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              )}
              {sources.length} sources
            </button>

            {open && (
              <div className="mt-2 space-y-2">
                {sources.map((source, index) => (
                  <div key={`${source.filename}-${source.page}-${index}`} className="rounded-md bg-slate-50 p-2 text-xs text-slate-600">
                    <div className="mb-1 font-medium text-slate-800">
                      {source.filename || 'Document'}
                      {source.page ? `, page ${source.page}` : ''}
                    </div>
                    <div>{source.content}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
