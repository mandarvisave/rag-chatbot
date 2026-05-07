import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

export async function uploadPDF(file) {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post('/upload-pdf', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function askQuestion(question) {
  const { data } = await api.post('/chat', { question });
  return data;
}
