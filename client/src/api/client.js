import axios from 'axios';
import { API_BASE } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 120000,
});

export async function convertText(text, direction, currency) {
  const res = await api.post('/convert', {
    inputType: 'text',
    direction,
    currency,
    text,
  });
  return res.data;
}

export async function convertFile(file, inputType, direction, currency) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('inputType', inputType);
  formData.append('direction', direction);
  formData.append('currency', currency);

  const res = await api.post('/convert', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function exportExcel(conversion, confidence) {
  const res = await api.post('/export/excel', { conversion, confidence }, {
    responseType: 'blob',
  });
  return res.data;
}

export default api;
