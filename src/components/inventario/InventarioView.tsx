import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Insumo, InsumoStatus } from '../../types';
import {
  Boxes,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Calendar,
  Edit2,
  Trash2,
  RefreshCw,
  TrendingDown,
  ArrowUpRight,
  Package,
  Scale,
} from 'lucide-react';
import { formatDualUnit, isWeightUnit, isVolumeUnit } from '../../utils/units';

interface InventarioViewProps {
  onOpenNewInsumoModal: () => void;
  onOpenEditInsumoModal: (insumo: Insumo) => void;
}

export const InventarioView: React.FC<InventarioViewProps> = ({
  onOpenNewInsumoModal,
  onOpenEditInsumoModal,
}) => {
  const {
    insumos,
    deleteInsumo,
    restockInsumo,
    executeWithAdminAuth,
    formatMoney,
    config,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todos' | InsumoStatus>('Todos');

  // Modal / Prompt de Reabastecimiento
  const [restockModalItem, setRestockModalItem] = useState<Insumo | null>(null);
  const [restockAmount, setRestockAmount] = useState<number>(5);
  const [restockCost, setRestockCost] = useState<number>(50);

  // Stats
  const stats = useMemo(() => {
    const totalValor = insumos.reduce((sum, i) => sum + i.restante * i.costoPorUnidadBase, 0);
    const agotados = insumos.filter((i) => i.status === 'Agotado').length;
    const porAgotarse = insumos.filter((i) => i.status === 'Por agotarse').length;
    const disponibles = insumos.filter((i) => i.status === 'Disponible').length;
    return { totalValor, agotados, porAgotarse, disponibles };
  }, [insumos]);

  const filteredInsumos = useMemo(() => {
    return insumos.filter((i) => {
      const matchSearch =
        i.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (i.proveedor && i.proveedor.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchStatus = statusFilter === 'Todos' || i.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [insumos, searchTerm, statusFilter]);

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockModalItem) return;

    executeWithAdminAuth(() => {
      restockInsumo(restockModalItem.id, restockAmount, restockCost);
      setRestockModalItem(null);
    }, `reabastecer ${restockAmount} ${restockModalItem.unidad} de ${restockModalItem.nombre}`);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-[#FBF9F6] dark:bg-[#150F0D]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#2C1810] dark:text-[#F1EAE4]">
            Inventario de Insumos & Materia Prima
          </h1>
          <p className="text-xs text-[#8C6D58] dark:text-[#A0816E] mt-1">
            Seguimiento en tiempo real de insumos comprados, consumidos y restantes.
          </p>
        </div>
        <button
          onClick={onOpenNewInsumoModal}
          className="px-4 py-2.5 rounded-xl bg-[#3E2010] hover:bg-[#28150A] text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Registrar Insumo</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-[#1E1613] p-4 rounded-2xl border border-[#3E2010]/15 dark:border-[#38261E] shadow-2xs">
          <span className="text-[11px] font-medium text-[#8C6D58] dark:text-[#A0816E]">
            Valor en Stock
          </span>
          <h3 className="font-mono text-xl font-bold text-[#2C1810] dark:text-[#F1EAE4] mt-0.5">
            {formatMoney(stats.totalValor)}
          </h3>
          <span className="text-[10px] text-[#8C6D58] mt-1 block">Costo materia prima</span>
        </div>

        <div className="bg-white dark:bg-[#1E1613] p-4 rounded-2xl border border-[#3E2010]/15 dark:border-[#38261E] shadow-2xs">
          <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
            Disponibles
          </span>
          <h3 className="font-mono text-xl font-bold text-emerald-800 dark:text-emerald-400 mt-0.5">
            {stats.disponibles}
          </h3>
          <span className="text-[10px] text-emerald-700/80 mt-1 block">Con stock saludable</span>
        </div>

        <div className="bg-white dark:bg-[#1E1613] p-4 rounded-2xl border border-[#3E2010]/15 dark:border-[#38261E] shadow-2xs">
          <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400">
            Por Agotarse
          </span>
          <h3 className="font-mono text-xl font-bold text-amber-800 dark:text-amber-400 mt-0.5">
            {stats.porAgotarse}
          </h3>
          <span className="text-[10px] text-amber-700/80 mt-1 block">Requiere compra pronta</span>
        </div>

        <div className="bg-white dark:bg-[#1E1613] p-4 rounded-2xl border border-[#3E2010]/15 dark:border-[#38261E] shadow-2xs">
          <span className="text-[11px] font-medium text-red-700 dark:text-red-400">
            Agotados
          </span>
          <h3 className="font-mono text-xl font-bold text-red-800 dark:text-red-400 mt-0.5">
            {stats.agotados}
          </h3>
          <span className="text-[10px] text-red-700/80 mt-1 block">Sin existencias (0)</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por insumo o proveedor..."
            className="w-full py-2 pl-9 pr-3 bg-white dark:bg-[#1E1613] border border-[#3E2010]/15 rounded-xl text-xs text-[#2C1810] dark:text-[#F1EAE4] outline-none focus:border-[#3E2010]"
          />
          <Search className="w-4 h-4 text-[#8C6D58] absolute left-3 top-2.5" />
        </div>

        {/* Status segmented filters */}
        <div className="flex items-center gap-1 p-1 bg-[#F1ECE4] dark:bg-[#261C18] rounded-xl self-start sm:self-auto overflow-x-auto">
          {(['Todos', 'Disponible', 'Por agotarse', 'Agotado'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`py-1.5 px-3 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-[#3E2010] text-[#FBF9F6] shadow-xs'
                  : 'text-[#6B4B38] dark:text-[#B59685] hover:text-[#2C1810]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table: Prompt requirement:
          "todos los productos deben ser registrados con su respectiva información la cual es nombre,precio,cantidad,gastada,restante,status,Gramos/kilos,liitros y fecha de caducidad"
      */}
      <div className="overflow-x-auto rounded-2xl border border-[#3E2010]/15 dark:border-[#38261E] bg-white dark:bg-[#1E1613] shadow-2xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#3E2010] text-[#FBF9F6]">
              <th className="py-3 px-4 font-semibold">Insumo</th>
              <th className="py-3 px-3 font-semibold text-right">Precio Compra</th>
              <th className="py-3 px-3 font-semibold text-center">Cant. Comprada</th>
              <th className="py-3 px-3 font-semibold text-center">Gastada</th>
              <th className="py-3 px-3 font-semibold text-center">Restante</th>
              <th className="py-3 px-3 font-semibold text-center">Unidad</th>
              <th className="py-3 px-3 font-semibold text-center">Status</th>
              <th className="py-3 px-3 font-semibold text-center">Fecha Caducidad</th>
              <th className="py-3 px-4 font-semibold text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#3E2010]/10 dark:divide-[#332219]">
            {filteredInsumos.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-10 text-center text-xs text-[#8C6D58]">
                  No se encontraron insumos con esos filtros.
                </td>
              </tr>
            ) : (
              filteredInsumos.map((item) => {
                const isExpired = new Date(item.fechaCaducidad) < new Date();
                const isNearExpiry =
                  !isExpired &&
                  new Date(item.fechaCaducidad).getTime() - Date.now() <
                    30 * 24 * 60 * 60 * 1000;

                const cantDual = formatDualUnit(item.cantidad, item.unidad);
                const gastadaDual = formatDualUnit(item.gastada, item.unidad);
                const restanteDual = formatDualUnit(item.restante, item.unidad);

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-[#FBF9F6] dark:hover:bg-[#261C18] transition-colors"
                  >
                    <td className="py-3 px-4 font-semibold text-[#2C1810] dark:text-[#F1EAE4]">
                      <div className="flex flex-col">
                        <span>{item.nombre}</span>
                        {item.paquetes && item.pesoPorPaquete && (
                          <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded-md bg-amber-100/70 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 text-[10px] font-mono font-medium w-fit">
                            <Package className="w-3 h-3 text-amber-700" />
                            {item.paquetes} paq. × {item.pesoPorPaquete} {item.unidadPaquete || item.unidad}
                          </span>
                        )}
                        {item.proveedor && (
                          <span className="block text-[10px] text-[#8C6D58] font-normal truncate max-w-xs mt-0.5">
                            {item.proveedor}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-medium">
                      <div>{item.precio.toFixed(2)} {config.monedaPrincipal}</div>
                      <span className="block text-[10px] text-[#8C6D58] font-mono">
                        {item.costoPorUnidadBase.toFixed(2)}/{item.unidad}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono">
                      <div className="font-bold">{item.cantidad} {item.unidad}</div>
                      {cantDual.secondary && (
                        <span className="block text-[10px] text-[#8C6D58]">
                          {cantDual.secondary}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-amber-700 dark:text-amber-400">
                      <div>{item.gastada.toFixed(2)} {item.unidad}</div>
                      {gastadaDual.secondary && (
                        <span className="block text-[10px] text-amber-600/80">
                          {gastadaDual.secondary}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-[#2C1810] dark:text-[#F1EAE4]">
                      <div className="text-emerald-700 dark:text-emerald-400">
                        {item.restante.toFixed(2)} {item.unidad}
                      </div>
                      {restanteDual.secondary && (
                        <span className="block text-[10px] text-emerald-600 font-normal">
                          {restanteDual.secondary}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-md bg-[#F1ECE4] dark:bg-[#2A1F1B] font-mono text-[11px] text-[#5C3D2E] dark:text-[#C5A898]">
                        {item.unidad}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          item.status === 'Disponible'
                            ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : item.status === 'Por agotarse'
                            ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                            : 'bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.status === 'Disponible'
                              ? 'bg-emerald-500'
                              : item.status === 'Por agotarse'
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                          }`}
                        />
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-[11px]">
                      <span
                        className={
                          isExpired
                            ? 'text-red-600 font-bold'
                            : isNearExpiry
                            ? 'text-amber-600 font-semibold'
                            : 'text-[#5C3D2E] dark:text-[#C5A898]'
                        }
                      >
                        {item.fechaCaducidad}
                        {isExpired && ' (Vencido)'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setRestockModalItem(item);
                            setRestockAmount(item.cantidad > 10 ? 10 : 5);
                            setRestockCost(item.precio);
                          }}
                          title="Reabastecer existencias"
                          className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onOpenEditInsumoModal(item)}
                          title="Editar insumo"
                          className="p-1.5 rounded-lg text-[#5C3D2E] hover:bg-[#F1ECE4] dark:hover:bg-[#2A1F1B] transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            executeWithAdminAuth(() => {
                              if (confirm(`¿Eliminar el insumo "${item.nombre}"?`)) {
                                deleteInsumo(item.id);
                              }
                            }, `eliminar el insumo "${item.nombre}"`);
                          }}
                          title="Eliminar insumo"
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Reabastecer Quick Modal */}
      {restockModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-[#1E1714] rounded-2xl shadow-xl border border-[#3E2010]/20 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-sm text-[#2C1810] dark:text-[#F1EAE4]">
                Reabastecer: {restockModalItem.nombre}
              </h3>
              <button
                onClick={() => setRestockModalItem(null)}
                className="p-1 text-[#8C6D58]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRestockSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-[#7A5B49]">
                  Cantidad a Agregar ({restockModalItem.unidad}):
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(parseFloat(e.target.value) || 0)}
                  className="w-full py-2 px-3 bg-[#FBF9F6] border border-[#3E2010]/20 rounded-xl text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-[#7A5B49]">
                  Costo de Compra ({config.monedaPrincipal}):
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  required
                  value={restockCost}
                  onChange={(e) => setRestockCost(parseFloat(e.target.value) || 0)}
                  className="w-full py-2 px-3 bg-[#FBF9F6] border border-[#3E2010]/20 rounded-xl text-xs font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRestockModalItem(null)}
                  className="py-2 px-3 text-xs bg-[#F1ECE4] rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 text-xs font-semibold text-white bg-[#3E2010] rounded-xl"
                >
                  Confirmar Reabastecimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
