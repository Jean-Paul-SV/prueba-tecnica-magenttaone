import type { Puesto, CreatePuestoPayload, UpdatePuestoPayload } from '../types/puesto';

const BASE = '/api/puestos';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message = body?.detail || body?.title || `Error ${res.status}`;
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export async function getPuestos(nombre?: string, activo?: boolean): Promise<Puesto[]> {
  const params = new URLSearchParams();
  if (nombre) params.set('nombre', nombre);
  if (activo !== undefined) params.set('activo', String(activo));
  const query = params.toString();
  const res = await fetch(`${BASE}${query ? `?${query}` : ''}`);
  return handleResponse<Puesto[]>(res);
}

export async function getPuesto(id: number): Promise<Puesto> {
  const res = await fetch(`${BASE}/${id}`);
  return handleResponse<Puesto>(res);
}

export async function createPuesto(data: CreatePuestoPayload): Promise<Puesto> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Puesto>(res);
}

export async function updatePuesto(id: number, data: UpdatePuestoPayload): Promise<Puesto> {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Puesto>(res);
}

export async function deletePuesto(id: number): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
  return handleResponse<void>(res);
}
