import { useState } from 'react';
import { askQuestion } from '../api/client';

const welcomeMessage = {
  id: crypto.randomUUID(),
  role: 'assistant',
  content: 'Upload a PDF, then ask me what you want to find inside it.',
  sources: [],
};

export function useChat() {
  const [messages, setMessages] = useState([welcomeMessage]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function ask(question) {
    const trimmed = question.trim();
    if (!trimmed || loading) return;

    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
      sources: [],
    };
    setMessages((current) => [...current, userMessage]);
    setLoading(true);
    setError('');

    try {
      const response = await askQuestion(trimmed);
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: response.answer,
          sources: response.sources || [],
        },
      ]);
    } catch (err) {
      const detail = err.response?.data?.detail || 'Something went wrong while asking.';
      setError(detail);
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: detail,
          sources: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function clear() {
    setMessages([welcomeMessage]);
    setError('');
  }

  return { messages, loading, error, ask, clear };
}
