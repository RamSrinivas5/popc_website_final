/**
 * API Client — mirrors Swift ApiClient.swift
 * All requests go through Vite proxy → Django backend (no CORS needed)
 */

const API_BASE = ''; // Vite proxy handles routing

function getToken() {
  return localStorage.getItem('popc_token');
}

async function request(endpoint, { method = 'GET', body = null, requiresAuth = true, isChat = false } = {}) {
  const url = `${API_BASE}/${endpoint}`;
  const headers = { Accept: 'application/json' };

  if (body) headers['Content-Type'] = 'application/json';
  if (requiresAuth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Token ${token}`;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), isChat ? 300000 : 60000);

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const text = await res.text();
    let data = null;
    try { data = JSON.parse(text); } catch { data = text; }

    if (!res.ok) {
      const msg = (data && (data.error || data.detail || JSON.stringify(data))) || res.statusText;
      throw new Error(msg);
    }
    return data;
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

async function multipartRequest(endpoint, { method = 'POST', fields = {}, image = null } = {}) {
  const url = `${API_BASE}/${endpoint}`;
  const token = getToken();
  const headers = { Accept: 'application/json' };
  if (token) headers['Authorization'] = `Token ${token}`;

  const form = new FormData();
  Object.entries(fields).forEach(([k, v]) => form.append(k, v));
  if (image) form.append('photo', image, image.name || 'photo.jpg');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  try {
    const res = await fetch(url, { method, headers, body: form, signal: controller.signal });
    clearTimeout(timeout);
    const text = await res.text();
    let data = null;
    try { data = JSON.parse(text); } catch { data = text; }
    if (!res.ok) {
      const msg = (data && (data.error || data.detail || JSON.stringify(data))) || res.statusText;
      throw new Error(msg);
    }
    return data;
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

async function multipartProfileRequest(endpoint, { method = 'PATCH', fields = {}, image = null } = {}) {
  const url = `${API_BASE}/${endpoint}`;
  const token = getToken();
  const headers = { Accept: 'application/json' };
  if (token) headers['Authorization'] = `Token ${token}`;

  const form = new FormData();
  Object.entries(fields).forEach(([k, v]) => form.append(k, v));
  if (image) form.append('profile_image', image, image.name || 'profile.jpg');

  const res = await fetch(url, { method, headers, body: form });
  const text = await res.text();
  let data = null;
  try { data = JSON.parse(text); } catch { data = text; }
  if (!res.ok) throw new Error(data?.error || data?.detail || JSON.stringify(data) || res.statusText);
  return data;
}

const api = { request, multipartRequest, multipartProfileRequest, getToken };
export default api;
