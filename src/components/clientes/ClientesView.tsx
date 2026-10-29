import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Cliente, Venta, VentaStatus } from '../../types';
import {
  Users,
  UserPlus,
  Search,
  Phone,
  MapPin,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Clock,
  Edit2,
  Trash2,
  Receipt,
  MessageCircle,
} from 'lucide-react';
import { EditarPagoModal } from '../ventas/EditarPagoModal';

interface ClientesViewProps {
  onOpenNewClienteModal: () => void;
  onOpenEditClienteModal: (cliente: Cliente) => void;
}

export const ClientesView: React.FC<ClientesViewProps> = ({
  onOpenNewClienteModal,
  onOpenEditClienteModal,
}) => {
  const {
    clientes,
    ventas,
    deleteCliente,
    updateVentaStatus,
    executeWithAdminAuth,
    formatMoney,
    config,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterDebtOnly, setFilterDebtOnly] = useState(false);
  const [selectedClienteId, setSelectedClienteId] = useState<string | null>(
    clientes[0]?.id || null
  );
  const [editingVenta, setEditingVenta] = useState<Venta | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const selectedCliente = useMemo(() => {
    return clientes.find((c) => c.id === selectedClienteId) || clientes[0] || null;
  }, [clientes, selectedClienteId]);

  // Ventas asociadas al cliente seleccionado
  const clienteVentas = useMemo(() => {
    if (!selectedCliente) return [];
    return ventas.filter((v) => v.clienteId === selectedCliente.id);
  }, [ventas, selectedCliente]);

  const filteredClientes = useMemo(() => {
    return clientes.filter((c) => {
      const matchSearch =
        c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.referencia.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.telefono.includes(searchTerm);
      const matchDebt = filterDebtOnly ? c.totalDeuda > 0 : true;
      return matchSearch && matchDebt;
    });
  }, [clientes, searchTerm, filterDebtOnly]);

  const totalDeudaGeneral = useMemo(() => {
    return clientes.reduce((sum, c) => sum + c.totalDeuda, 0);
  }, [clientes]);

  const totalVentasGeneral = useMemo(() => {
    return clientes.reduce((sum, c) => sum + c.totalComprado, 0);
  }, [clientes]);

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden bg-[#FBF9F6] dark:bg-[#150F0D]">
      {/* LEFT LIST: Directorio de Clientes */}
      <div className="w-full lg:w-80 shrink-0 border-r border-[#3E2010]/10 dark:border-[#332219] flex flex-col bg-white dark:bg-[#1C1411] h-auto lg:h-full max-h-[40vh] lg:max-h-full">
        {/* Header */}
        <div className="p-4 border-b border-[#3E2010]/10 dark:border-[#332219] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#3E2010] dark:text-[#E8C39E]" />
              <h2 className="font-display font-bold text-base text-[#2C1810] dark:text-[#F1EAE4]">
                Clientes ({clientes.length})
              </h2>
            </div>
            <button
              onClick={onOpenNewClienteModal}
              className="p-1.5 rounded-lg bg-[#3E2010] text-white hover:bg-[#28150A] text-xs font-semibold px-2 flex items-center gap-1 shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Nuevo</span>
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar cliente o referencia..."
              className="w-full py-1.5 pl-8 pr-3 bg-[#FBF9F6] dark:bg-[#261C18] border border-[#3E2010]/15 rounded-xl text-xs"
            />
            <Search className="w-3.5 h-3.5 text-[#8C6D58] absolute left-2.5 top-2.5" />
          </div>

          {/* Quick toggle debt only */}
          <div className="flex items-center justify-between text-xs pt-1">
            <button
              onClick={() => setFilterDebtOnly(!filterDebtOnly)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                filterDebtOnly
                  ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
                  : 'bg-[#F1ECE4] text-[#6B4B38] hover:bg-[#E7DFD4]'
              }`}
            >
              {filterDebtOnly ? '● Solo con deuda' : 'Todos los clientes'}
            </button>
            <span className="font-mono text-[11px] text-[#8C6D58]">
              Deuda: <strong className="text-red-600">{formatMoney(totalDeudaGeneral)}</strong>
            </span>
          </div>
        </div>

        {/* Client List items */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
          {filteredClientes.map((cliente) => {
            const isSelected = selectedCliente?.id === cliente.id;
            const hasDebt = cliente.totalDeuda > 0;

            return (
              <div
                key={cliente.id}
                onClick={() => setSelectedClienteId(cliente.id)}
                className={`p-3 rounded-xl cursor-pointer transition-all border ${
                  isSelected
                    ? 'bg-[#F6EFE9] dark:bg-[#2D1F1A] border-[#3E2010]/30 shadow-xs'
                    : 'bg-white dark:bg-[#201714] border-transparent hover:bg-[#F9F7F4]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-display font-semibold text-xs text-[#2C1810] dark:text-[#F1EAE4] truncate">
                    {cliente.nombre}
                  </h4>
                  {hasDebt ? (
                    <span className="text-[10px] font-mono font-bold text-red-600 bg-red-50 dark:bg-red-950/30 px-1.5 py-0.5 rounded">
                      Debe: {formatMoney(cliente.totalDeuda)}
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      Al día
                    </span>
                  )}
                </div>

                {cliente.referencia && (
                  <p className="text-[11px] text-[#8C6D58] truncate mt-1">
                    {cliente.referencia}
                  </p>
                )}

                <div className="flex items-center justify-between text-[10px] text-[#8C6D58] mt-1 pt-1 border-t border-[#3E2010]/5">
                  <span>{cliente.telefono || 'Sin teléfono'}</span>
                  <span className="font-mono">
                    Total: {formatMoney(cliente.totalComprado)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT DETAIL: Historial y Ficha del Cliente */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {selectedCliente ? (
          <>
            {/* Header Ficha Cliente */}
            <div className="bg-white dark:bg-[#1E1613] p-5 sm:p-6 rounded-2xl border border-[#3E2010]/15 dark:border-[#38261E] shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display font-bold text-xl sm:text-2xl text-[#2C1810] dark:text-[#F1EAE4]">
                      {selectedCliente.nombre}
                    </h2>
                    {selectedCliente.totalDeuda > 0 ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300">
                        Debe {formatMoney(selectedCliente.totalDeuda)}
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                        Cuenta Al Día
                      </span>
                    )}
                  </div>
                  {selectedCliente.referencia && (
                    <div className="flex items-center gap-1.5 text-xs text-[#5C3D2E] dark:text-[#C5A898] mt-1">
                      <MapPin className="w-3.5 h-3.5 text-[#8C6D58]" />
                      <span>{selectedCliente.referencia}</span>
                    </div>
                  )}
                  {selectedCliente.telefono && (
                    <div className="flex items-center gap-1.5 text-xs text-[#5C3D2E] dark:text-[#C5A898] mt-0.5">
                      <Phone className="w-3.5 h-3.5 text-[#8C6D58]" />
                      <span className="font-mono">{selectedCliente.telefono}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenEditClienteModal(selectedCliente)}
                    className="p-2 rounded-xl text-[#5C3D2E] hover:bg-[#F1ECE4] border border-[#3E2010]/15 text-xs font-medium flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Editar Ficha</span>
                  </button>

                  {confirmDeleteId === selectedCliente.id ? (
                    <div className="flex items-center gap-1.5 p-1 bg-red-50 dark:bg-red-950/40 border border-red-200 rounded-xl text-xs">
                      <span className="text-[11px] text-red-700 font-medium px-1">¿Confirmar?</span>
                      <button
                        onClick={() => {
                          executeWithAdminAuth(() => {
                            deleteCliente(selectedCliente.id);
                            setConfirmDeleteId(null);
                          }, `eliminar al cliente ${selectedCliente.nombre}`);
                        }}
                        className="px-2 py-1 bg-red-600 text-white rounded-lg text-[10px] font-bold hover:bg-red-700"
                      >
                        Sí, eliminar
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-2 py-1 bg-gray-200 text-gray-700 rounded-lg text-[10px]"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(selectedCliente.id)}
                      className="p-2 rounded-xl text-red-500 hover:bg-red-50 border border-red-200"
                      title="Eliminar cliente"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* KPI Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-[#F8F6F2] dark:bg-[#261C18] p-3 rounded-xl border border-[#3E2010]/10">
                  <span className="text-[11px] text-[#7A5B49] block">Total Comprado:</span>
                  <span className="font-mono text-base font-bold text-[#2C1810] dark:text-[#F1EAE4]">
                    {formatMoney(selectedCliente.totalComprado)}
                  </span>
                </div>
                <div className="bg-[#F8F6F2] dark:bg-[#261C18] p-3 rounded-xl border border-[#3E2010]/10">
                  <span className="text-[11px] text-[#7A5B49] block">Total Fiado Pendiente:</span>
                  <span className="font-mono text-base font-bold text-red-600">
                    {formatMoney(selectedCliente.totalDeuda)}
                  </span>
                </div>
                <div className="bg-[#F8F6F2] dark:bg-[#261C18] p-3 rounded-xl border border-[#3E2010]/10 col-span-2 sm:col-span-1">
                  <span className="text-[11px] text-[#7A5B49] block">Total Pedidos:</span>
                  <span className="font-mono text-base font-bold text-[#2C1810] dark:text-[#F1EAE4]">
                    {clienteVentas.length} ventas registradas
                  </span>
                </div>
              </div>
            </div>

            {/* Historial de Compras del Cliente */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-base text-[#2C1810] dark:text-[#F1EAE4]">
                    Historial de Ventas & Pagos de {selectedCliente.nombre}
                  </h3>
                  <p className="text-[11px] text-[#8C6D58]">
                    Haz clic sobre cualquier venta para editar las porciones pagadas y registrar pagos.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-[#3E2010]/15 bg-white dark:bg-[#1E1613]">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[#3E2010] text-[#FBF9F6]">
                      <th className="py-2.5 px-3 font-semibold">Producto</th>
                      <th className="py-2.5 px-3 font-semibold text-center">Cantidad</th>
                      <th className="py-2.5 px-3 font-semibold text-center">Pagadas</th>
                      <th className="py-2.5 px-3 font-semibold text-center">Sin Pagar</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Monto</th>
                      <th className="py-2.5 px-3 font-semibold">Método</th>
                      <th className="py-2.5 px-3 font-semibold text-center">Fecha</th>
                      <th className="py-2.5 px-3 font-semibold text-center">Status</th>
                      <th className="py-2.5 px-3 font-semibold text-center">Editar Pago</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3E2010]/10">
                    {clienteVentas.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-[#8C6D58]">
                          No hay ventas registradas para este cliente.
                        </td>
                      </tr>
                    ) : (
                      clienteVentas.map((v) => {
                        const isPaid = v.status === 'Pagado';
                        return (
                          <tr
                            key={v.id}
                            onClick={() => setEditingVenta(v)}
                            title="Haz clic para editar unidades pagadas y registrar cobro"
                            className="hover:bg-amber-50/50 dark:hover:bg-[#281D18] cursor-pointer transition-colors group"
                          >
                            <td className="py-3 px-3 font-semibold text-[#2C1810] dark:text-[#F1EAE4]">
                              <div className="flex items-center gap-1.5">
                                <span className="group-hover:text-amber-800 underline-offset-2 group-hover:underline">
                                  {v.productoNombre}
                                </span>
                                <Edit2 className="w-3 h-3 text-[#8C6D58] opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                              {v.nota && (
                                <span className="block text-[10px] text-[#8C6D58] font-normal">
                                  {v.nota}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-center font-mono font-medium">
                              {v.cantidadComprada}
                            </td>
                            <td className="py-3 px-3 text-center font-mono font-bold text-emerald-700">
                              {v.unidadesPagadas}
                            </td>
                            <td className="py-3 px-3 text-center font-mono font-bold text-red-600">
                              {v.unidadesSinPagar}
                            </td>
                            <td className="py-3 px-3 text-right font-mono font-bold">
                              {v.montoTotal.toFixed(2)} {config.monedaPrincipal}
                            </td>
                            <td className="py-3 px-3 text-[#5C3D2E]">
                              {v.metodoPago} {v.referenciaPago ? `(${v.referenciaPago})` : ''}
                            </td>
                            <td className="py-3 px-3 text-center font-mono text-[11px] text-[#8C6D58]">
                              {v.fechaTexto}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                  isPaid
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-red-50 text-red-700'
                                }`}
                              >
                                {v.status}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingVenta(v);
                                }}
                                className="px-2.5 py-1 bg-[#3E2010] hover:bg-[#28150A] text-white rounded-lg text-[10px] font-semibold flex items-center gap-1 mx-auto shadow-2xs"
                              >
                                <Edit2 className="w-3 h-3 text-amber-300" />
                                <span>{isPaid ? 'Ver / Editar' : 'Registrar Pago'}</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal para editar pago y unidades */}
            <EditarPagoModal
              isOpen={Boolean(editingVenta)}
              onClose={() => setEditingVenta(null)}
              venta={editingVenta}
            />
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center">
            <Users className="w-12 h-12 text-[#C5A898] mb-3" />
            <h3 className="font-display font-semibold text-base text-[#2C1810]">
              No hay clientes registrados
            </h3>
            <button
              onClick={onOpenNewClienteModal}
              className="mt-3 px-4 py-2 bg-[#3E2010] text-white rounded-xl text-xs font-semibold"
            >
              + Agregar Primer Cliente
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
