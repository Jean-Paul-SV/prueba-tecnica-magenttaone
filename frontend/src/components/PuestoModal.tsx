import { useState, useEffect } from 'react';
import type {
  Puesto,
  CreatePuestoPayload,
  Modalidad,
  Jornada,
  NivelPuesto,
} from '../types/puesto';
import { AREAS, NIVELES, MODALIDADES, JORNADAS } from '../types/puesto';

interface Props {
  open: boolean;
  puesto: Puesto | null;
  onClose: () => void;
  onSave: (data: CreatePuestoPayload, id?: number) => Promise<void>;
}

const empty: CreatePuestoPayload = {
  area: AREAS[0],
  nombre: '',
  nivel: 'Jr',
  modalidad: 'Presencial',
  jornada: 'TiempoCompleto',
  salarioReferencia: null,
};

interface FormErrors {
  nombre?: string;
  salarioReferencia?: string;
}

function validate(form: CreatePuestoPayload): FormErrors {
  const errors: FormErrors = {};
  if (!form.nombre.trim()) {
    errors.nombre = 'El nombre del puesto es obligatorio.';
  }
  if (form.salarioReferencia !== null && form.salarioReferencia < 0) {
    errors.salarioReferencia = 'El salario debe ser mayor o igual a 0.';
  }
  return errors;
}

export default function PuestoModal({ open, puesto, onClose, onSave }: Props) {
  const [form, setForm] = useState<CreatePuestoPayload>(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (puesto) {
      setForm({
        area: puesto.area,
        nombre: puesto.nombre,
        nivel: puesto.nivel,
        modalidad: puesto.modalidad,
        jornada: puesto.jornada,
        salarioReferencia: puesto.salarioReferencia,
      });
    } else {
      setForm(empty);
    }
    setError('');
    setFieldErrors({});
  }, [puesto, open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validate(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setError('');
    setSaving(true);
    try {
      await onSave(form, puesto?.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = (hasError?: string) =>
    `w-full border rounded-[7px] px-3 py-2 text-sm outline-none transition-colors ${
      hasError
        ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-200'
        : 'border-gray-300 focus:border-[#C2185B] focus:ring-1 focus:ring-[#F8E8EF]'
    }`;

  const selectClass = 'w-full border border-gray-300 rounded-[7px] px-3 py-2 text-sm focus:border-[#C2185B] focus:ring-1 focus:ring-[#F8E8EF] outline-none transition-colors';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/42"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[14px] w-full max-w-lg mx-4 shadow-xl border border-gray-200 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900">
            {puesto ? 'Editar puesto' : 'Nuevo puesto'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-[#F9FAFB] text-xl leading-none px-1.5 py-0.5 rounded transition-colors"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-1 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-[7px] px-3 py-2 text-xs">
              {error}
            </div>
          )}

          {/* Área */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Área <span className="text-[#C2185B]">*</span>
            </label>
            <select
              value={form.area}
              onChange={(e) => setForm({ ...form, area: e.target.value })}
              className={selectClass}
              required
            >
              {AREAS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Nombre del puesto <span className="text-[#C2185B]">*</span>
            </label>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => {
                setForm({ ...form, nombre: e.target.value });
                if (fieldErrors.nombre) setFieldErrors({ ...fieldErrors, nombre: undefined });
              }}
              placeholder="Ej. Técnico Instalador"
              className={inputClass(fieldErrors.nombre)}
              required
            />
            {fieldErrors.nombre && (
              <p className="text-[11px] text-red-500 mt-1">{fieldErrors.nombre}</p>
            )}
          </div>

          {/* Nivel + Modalidad */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Nivel <span className="text-[#C2185B]">*</span>
              </label>
              <select
                value={form.nivel}
                onChange={(e) => setForm({ ...form, nivel: e.target.value as NivelPuesto })}
                className={selectClass}
                required
              >
                {NIVELES.map((n) => (
                  <option key={n.value} value={n.value}>{n.label}</option>
                ))}
              </select>
              <p className="text-[11px] text-gray-400 mt-1">Catálogo controlado.</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Modalidad</label>
              <select
                value={form.modalidad}
                onChange={(e) => setForm({ ...form, modalidad: e.target.value as Modalidad })}
                className={selectClass}
              >
                {MODALIDADES.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Jornada */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Jornada</label>
            <select
              value={form.jornada}
              onChange={(e) => setForm({ ...form, jornada: e.target.value as Jornada })}
              className={selectClass}
            >
              {JORNADAS.map((j) => (
                <option key={j.value} value={j.value}>{j.label}</option>
              ))}
            </select>
            <p className="text-[11px] text-gray-400 mt-1">
              La jornada define los horarios predeterminados en la descripción de puesto.
            </p>
          </div>

          {/* Salario */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Salario de referencia (MXN/mes)
            </label>
            <input
              type="number"
              value={form.salarioReferencia ?? ''}
              onChange={(e) => {
                const val = e.target.value ? Number(e.target.value) : null;
                setForm({ ...form, salarioReferencia: val });
                if (fieldErrors.salarioReferencia) setFieldErrors({ ...fieldErrors, salarioReferencia: undefined });
              }}
              placeholder="Opcional"
              min={0}
              step={100}
              className={inputClass(fieldErrors.salarioReferencia)}
            />
            {fieldErrors.salarioReferencia && (
              <p className="text-[11px] text-red-500 mt-1">{fieldErrors.salarioReferencia}</p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <span className="text-[11px] text-gray-400">
              {puesto ? `Editando #${puesto.id}` : 'Registro nuevo'}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-[7px] hover:bg-[#F9FAFB] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-xs font-medium text-white bg-[#C2185B] border border-[#C2185B] rounded-[7px] hover:bg-[#9C1449] disabled:opacity-50 transition-colors"
              >
                {saving ? 'Guardando...' : puesto ? 'Guardar cambios' : 'Crear puesto'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
