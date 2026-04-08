import { useState, useEffect, useCallback, useRef } from 'react';
import type { Puesto, CreatePuestoPayload } from './types/puesto';
import { getPuestos, createPuesto, updatePuesto, deletePuesto } from './services/api';
import PuestosTable from './components/PuestosTable';
import PuestoModal from './components/PuestoModal';

export default function App() {
  const [puestos, setPuestos] = useState<Puesto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Puesto | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const fetchPuestos = useCallback(async (nombre?: string) => {
    setLoading(true);
    setError('');
    try {
      const activoFilter = showInactive ? undefined : true;
      const data = await getPuestos(nombre || undefined, activoFilter);
      setPuestos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar puestos');
    } finally {
      setLoading(false);
    }
  }, [showInactive]);

  useEffect(() => {
    fetchPuestos(search);
  }, [showInactive]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchPuestos(search);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async (data: CreatePuestoPayload, id?: number) => {
    if (id) {
      await updatePuesto(id, data);
    } else {
      await createPuesto(data);
    }
    await fetchPuestos(search);
  };

  const handleDelete = async (p: Puesto) => {
    if (!window.confirm(`¿Eliminar (desactivar) el puesto "${p.nombre}"?`)) return;
    try {
      await deletePuesto(p.id);
      await fetchPuestos(search);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (p: Puesto) => {
    setEditing(p);
    setModalOpen(true);
  };

  const activos = puestos.filter((p) => p.activo).length;
  const inactivos = puestos.filter((p) => !p.activo).length;

  // Group puestos by area
  const grouped = puestos.reduce<Record<string, Puesto[]>>((acc, p) => {
    if (!acc[p.area]) acc[p.area] = [];
    acc[p.area].push(p);
    return acc;
  }, {});
  const areas = Object.keys(grouped);

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between px-6 h-[52px]">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-[#C2185B] tracking-tight">magentta</span>
            <span className="text-xs text-gray-500 border-l border-gray-200 pl-3">
              Reclutamiento &middot; Arquitectura organizacional
            </span>
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-[#C2185B] rounded-[7px] hover:bg-[#9C1449] border border-[#C2185B] transition-colors"
          >
            + Nuevo puesto
          </button>
        </div>
      </header>

      {/* Sub header */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-[15px] font-semibold text-gray-900">Catálogo de áreas y puestos</h1>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Gestión de puestos de trabajo &middot; Modalidad y Jornada separados
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-[11px] font-medium text-gray-500 bg-white border border-gray-200 px-3 py-1.5 rounded-[7px] hover:bg-[#F9FAFB] transition-colors">
            Exportar
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-3 px-6 py-4">
        <div className="bg-white border border-gray-200 rounded-[10px] px-4 py-3">
          <div className="text-[22px] font-semibold text-gray-900">{areas.length}</div>
          <div className="text-[11px] text-gray-500 mt-0.5">Áreas</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-[10px] px-4 py-3">
          <div className="text-[22px] font-semibold text-[#C2185B]">{puestos.length}</div>
          <div className="text-[11px] text-gray-500 mt-0.5">Total de puestos</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-[10px] px-4 py-3">
          <div className="text-[22px] font-semibold text-[#1D9E75]">{activos}</div>
          <div className="text-[11px] text-gray-500 mt-0.5">Puestos activos</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-[10px] px-4 py-3">
          <div className="text-[22px] font-semibold text-gray-400">{inactivos}</div>
          <div className="text-[11px] text-gray-500 mt-0.5">Puestos inactivos</div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 pb-3 flex items-center gap-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre..."
          className="border border-gray-300 rounded-[7px] px-3 py-2 text-sm w-72 focus:border-[#C2185B] focus:ring-1 focus:ring-[#F8E8EF] outline-none bg-white"
        />
        <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="rounded border-gray-300 accent-[#C2185B]"
          />
          Mostrar inactivos
        </label>
        {loading && <span className="text-xs text-gray-400">Cargando...</span>}
      </div>

      {/* Content */}
      <div className="px-6 pb-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-[7px] px-4 py-3 mb-4 text-sm">
            {error}
          </div>
        )}

        {puestos.length === 0 && !loading ? (
          <div className="bg-white border border-gray-200 rounded-[10px] text-center py-12 text-gray-400 text-sm">
            No se encontraron puestos.
          </div>
        ) : (
          <div className="space-y-3">
            {areas.map((area) => (
              <AreaBlock
                key={area}
                area={area}
                puestos={grouped[area]}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        <div className="mt-3 text-[11px] text-gray-400">
          {puestos.length} puesto{puestos.length !== 1 ? 's' : ''} en {areas.length} área{areas.length !== 1 ? 's' : ''}
        </div>
      </div>

      <PuestoModal
        open={modalOpen}
        puesto={editing}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}

function AreaBlock({
  area,
  puestos,
  onEdit,
  onDelete,
}: {
  area: string;
  puestos: Puesto[];
  onEdit: (p: Puesto) => void;
  onDelete: (p: Puesto) => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="bg-white border border-gray-200 rounded-[10px] overflow-hidden">
      {/* Area header */}
      <div
        className="flex items-center justify-between px-5 py-3.5 cursor-pointer select-none hover:bg-[#F9FAFB] transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#C2185B] flex-shrink-0" />
          <div>
            <div className="text-sm font-semibold text-gray-900">{area}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-medium text-[#C2185B] bg-[#F8E8EF] px-2.5 py-0.5 rounded-full">
            {puestos.length} puesto{puestos.length !== 1 ? 's' : ''}
          </span>
          <span className={`text-gray-400 text-sm transition-transform ${open ? 'rotate-180' : ''}`}>
            ▾
          </span>
        </div>
      </div>

      {/* Table */}
      {open && <PuestosTable puestos={puestos} onEdit={onEdit} onDelete={onDelete} />}
    </div>
  );
}
