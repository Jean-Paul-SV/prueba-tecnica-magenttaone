import type { Puesto } from '../types/puesto';
import { NIVELES, MODALIDADES, JORNADAS } from '../types/puesto';

interface Props {
  puestos: Puesto[];
  onEdit: (p: Puesto) => void;
  onDelete: (p: Puesto) => void;
}

function nivelLabel(val: string) {
  return NIVELES.find((n) => n.value === val)?.label ?? val;
}
function modalidadLabel(val: string) {
  return MODALIDADES.find((m) => m.value === val)?.label ?? val;
}
function jornadaLabel(val: string) {
  return JORNADAS.find((j) => j.value === val)?.label ?? val;
}

const nivelStyles: Record<string, string> = {
  Jr: 'bg-[#EAF3DE] text-[#3B6D11]',
  Sr: 'bg-[#E6F1FB] text-[#185FA5]',
  Lider: 'bg-[#F8E8EF] text-[#C2185B]',
  Gerente: 'bg-[#EEEDFE] text-[#3C3489]',
  SinNivel: 'bg-gray-100 text-gray-400',
};

function formatSalario(val: number | null) {
  if (val === null || val === undefined) return <span className="text-gray-400 italic text-[11px]">Sin definir</span>;
  return '$' + val.toLocaleString('es-MX');
}

export default function PuestosTable({ puestos, onEdit, onDelete }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-[#F9FAFB] border-t border-b border-gray-200">
            <th className="text-left text-[11px] font-medium text-gray-500 px-4 py-2">Puesto</th>
            <th className="text-left text-[11px] font-medium text-gray-500 px-4 py-2">Nivel</th>
            <th className="text-left text-[11px] font-medium text-gray-500 px-4 py-2">Modalidad</th>
            <th className="text-left text-[11px] font-medium text-gray-500 px-4 py-2">Jornada</th>
            <th className="text-left text-[11px] font-medium text-gray-500 px-4 py-2">Salario ref.</th>
            <th className="text-left text-[11px] font-medium text-gray-500 px-4 py-2">Estado</th>
            <th className="text-right text-[11px] font-medium text-gray-500 px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {puestos.map((p) => (
            <tr key={p.id} className="border-b border-gray-100 last:border-b-0 hover:bg-[#F9FAFB] transition-colors">
              <td className="px-4 py-2.5 text-xs font-semibold text-gray-900">
                {p.nombre}
                {p.modalidad === 'Remoto' && (
                  <span className="ml-1.5 inline-block text-[10px] font-medium px-1.5 py-0 rounded-full bg-[#E6F1FB] text-[#185FA5]">
                    Remoto
                  </span>
                )}
              </td>
              <td className="px-4 py-2.5">
                <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full ${nivelStyles[p.nivel] ?? 'bg-gray-100 text-gray-500'}`}>
                  {nivelLabel(p.nivel)}
                </span>
              </td>
              <td className="px-4 py-2.5 text-xs text-gray-600">{modalidadLabel(p.modalidad)}</td>
              <td className="px-4 py-2.5 text-xs text-gray-600">{jornadaLabel(p.jornada)}</td>
              <td className="px-4 py-2.5 text-xs text-gray-500">{formatSalario(p.salarioReferencia)}</td>
              <td className="px-4 py-2.5">
                {p.activo ? (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#0F6E56] bg-[#EAF3DE] px-2.5 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75]" />
                    Activo
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                    Inactivo
                  </span>
                )}
              </td>
              <td className="px-4 py-2.5 text-right">
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => onEdit(p)}
                    className="text-[11px] font-medium text-gray-500 bg-white border border-gray-200 px-2.5 py-1 rounded-[7px] hover:bg-[#F9FAFB] transition-colors"
                  >
                    Editar
                  </button>
                  {p.activo && (
                    <button
                      onClick={() => onDelete(p)}
                      className="text-[11px] font-medium text-[#A32D2D] bg-[#FCEBEB] border border-[#FECACA] px-2.5 py-1 rounded-[7px] hover:bg-red-100 transition-colors"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
