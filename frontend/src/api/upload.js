import axios from 'axios';

const apiBase = (process.env.REACT_APP_API_URL || '/api').replace(/\/$/, '');

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('image', file, file.name);
  const response = await axios.post(`${apiBase}/upload`, formData);
  return response.data;
}

export async function checkHealth() {
  try {
    const response = await axios.get(`${apiBase}/health`, { timeout: 6000 });
    return response.status === 200;
  } catch {
    return false;
  }
}

export function normalizeError(err) {
  const serverMessage = err?.response?.data?.error;
  if (serverMessage) return serverMessage;

  if (err?.code === 'ERR_NETWORK') {
    return `Cannot reach the analysis server at ${apiBase}. Check that it is running and reachable.`;
  }

  const status = err?.response?.status;
  if (status === 404) {
    return `The analysis server responded 404 at ${apiBase}/upload. The endpoint or backend Space may be offline.`;
  }
  if (status === 413) {
    return 'That image is too large for the server. Try one under 16 MB.';
  }
  if (status === 503) {
    return 'The model is not loaded on the server. Try again in a moment.';
  }
  if (typeof status === 'number') {
    return `Analysis server returned HTTP ${status}. Try again or check the backend logs.`;
  }

  return err?.message || 'Something went wrong processing this image. Please try again.';
}
