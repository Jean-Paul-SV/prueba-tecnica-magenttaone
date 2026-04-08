export type Modalidad = 'Presencial' | 'Remoto' | 'Hibrido';
export type Jornada = 'TiempoCompleto' | 'MedioTiempo';
export type NivelPuesto = 'Jr' | 'Sr' | 'Lider' | 'Gerente' | 'SinNivel';

export interface Puesto {
  id: number;
  area: string;
  nombre: string;
  nivel: NivelPuesto;
  modalidad: Modalidad;
  jornada: Jornada;
  salarioReferencia: number | null;
  activo: boolean;
  fechaCreacion: string;
}

export interface CreatePuestoPayload {
  area: string;
  nombre: string;
  nivel: NivelPuesto;
  modalidad: Modalidad;
  jornada: Jornada;
  salarioReferencia: number | null;
}

export type UpdatePuestoPayload = CreatePuestoPayload;

export const AREAS = [
  'Gerencia de Operaciones',
  'Gerencia de Ventas',
  'Gerencia de Administracion',
  'Desarrollo de Sistemas',
] as const;

export const NIVELES: { value: NivelPuesto; label: string }[] = [
  { value: 'Jr', label: 'Jr' },
  { value: 'Sr', label: 'Sr' },
  { value: 'Lider', label: 'Lider' },
  { value: 'Gerente', label: 'Gerente' },
  { value: 'SinNivel', label: 'Sin nivel' },
];

export const MODALIDADES: { value: Modalidad; label: string }[] = [
  { value: 'Presencial', label: 'Presencial' },
  { value: 'Remoto', label: 'Remoto' },
  { value: 'Hibrido', label: 'Hibrido' },
];

export const JORNADAS: { value: Jornada; label: string }[] = [
  { value: 'TiempoCompleto', label: 'Tiempo completo' },
  { value: 'MedioTiempo', label: 'Medio tiempo' },
];
