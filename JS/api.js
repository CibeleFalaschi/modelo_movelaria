import API_BASE from './config.js';

// token helpers
export function setToken(token) {
  localStorage.setItem('jwt', token);
}

export function getToken() {
  return localStorage.getItem('jwt');
}

export function clearToken() {
  localStorage.removeItem('jwt');
}

function getErrorMessage(body) {
  if (typeof body === 'string' && body.trim()) return body;
  return body?.error || body?.message || 'Erro ao comunicar com a API';
}

async function parseResponse(res) {
  const contentType = res.headers.get('content-type') || '';
  const body = contentType.includes('application/json')
    ? await res.json().catch(() => null)
    : await res.text().catch(() => '');

  if (!res.ok) {
    const error = new Error(getErrorMessage(body));
    error.status = res.status;
    error.body = body;
    throw error;
  }

  return body;
}

export async function loginRequest(login, senha) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login, senha })
  });
  return parseResponse(res);
}

export async function authFetch(path, opts = {}) {
  const token = getToken();
  const headers = new Headers(opts.headers || {});
  if (token) headers.set('Authorization', 'Bearer ' + token);
  if (opts.body && !(opts.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const body = opts.body && typeof opts.body !== 'string' && !(opts.body instanceof FormData)
    ? JSON.stringify(opts.body)
    : opts.body;

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), opts.timeout || 15000);
  let res;

  try {
    res = await fetch(`${API_BASE}${path}`, { ...opts, body, headers, signal: controller.signal });
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('A solicitação demorou demais. Tente novamente.');
    }
    throw new Error('Não foi possível conectar à API.');
  } finally {
    window.clearTimeout(timeout);
  }

  if (res.status === 401) {
    clearToken();
  }
  return parseResponse(res);
}

export async function logoutRequest() {
  clearToken();
}
