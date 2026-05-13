import axios from 'axios';

const DEFAULT_BACKEND_URL = 'https://rag-chatbot-psx6.onrender.com';

function normalizeApiBaseUrl(value) {
  const rawValue = value || (import.meta.env.DEV ? DEFAULT_BACKEND_URL : '');

  if (!rawValue) {
    throw new Error('Missing VITE_API_URL. Set it to your deployed backend URL in Vercel.');
  }

  if (rawValue.startsWith('/')) {
    return rawValue.replace(/\/$/, '');
  }

  const url = new URL(rawValue);
  url.pathname = url.pathname.replace(/\/$/, '');

  if (!url.pathname.endsWith('/api')) {
    url.pathname = `${url.pathname}/api`;
  }

  return url.toString().replace(/\/$/, '');
}

export const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
});

export async function uploadPDF(file) {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post('upload-pdf', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function askQuestion(question) {
  const { data } = await api.post('chat', { question });
  return data;
}
