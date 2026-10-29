import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { LoteProducto, Venta, VentaStatus, MetodoPago, TipoVenta } from '../../types';
import {
  Plus,
  Calendar,
  Clock,
  DollarSign,
  Package,
  TrendingUp,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Folder,
  CheckCircle2,
  Clock3,
  XCircle,
  MoreVertical,
  Trash2,
  Receipt,
  UserPlus,
  Sparkles,
  Edit2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatDualUnit } from '../../utils/units';
import { EditarPagoModal } from './EditarPagoModal';

interface VentasViewProps {
  onOpenElaborarModal: () => void;
  onOpenClienteModal: () => void;
}

export const VentasView: React.FC<VentasViewProps> = ({
  onOpenElaborarModal,
  onOpenClienteModal,
}) => {
  const {
    lotes,
    ventas,
    clientes,
    selectedLoteId,
    setSelectedLoteId,
    addVenta,
    updateVentaStatus,
    deleteVenta,
    deleteLote,
    formatMoney,
    executeWithAdminAuth,
    config,
  } = useApp();

  // Sub-tab: 'clientes' (Registro de venta & compradores) vs 'datos' (Costos, ingredientes y cálculo)
  const [activeTab, setActiveTab] = useState<'clientes' | 'datos'>('clientes');

  // Formulario de Venta
  const [clienteId, setClienteId] = useState<string>('');
  const [cantidadComprada, setCantidadComprada] = useState<number>(1);
  const [pagadas, setPagadas] = useState<number>(1);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('Efectivo');
  const [referenciaPago, setReferenciaPago] = useState<string>('');
  const [statusVenta, setStatusVenta] = useState<VentaStatus>('Pagado');
  const [tipoVenta, setTipoVenta] = useState<TipoVenta>('Para llevar');
  const [nota, setNota] = useState<string>('');
  const [editingVenta, setEditingVenta] = useState<Venta | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmDeleteLote, setConfirmDeleteLote] = useState(false);

  // Folders expand/collapse
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    Recientes: true,
    Junio: true,
    Antiguas: false,
  });

  // Selected Lote
  const currentLote = useMemo(() => {
    return lotes.find((l) => l.id === selectedLoteId) || lotes[0] || null;
  }, [lotes, selectedLoteId]);

  // Ventas asociadas al lote seleccionado
  const loteVentas = useMemo(() => {
    if (!currentLote) return [];
    return ventas.filter((v) => v.loteId === currentLote.id);
  }, [ventas, currentLote]);

  // Totales dinámicos del lote
  const totalCancelado = useMemo(() => {
    return loteVentas.reduce((sum, v) => sum + v.montoPagado, 0);
  }, [loteVentas]);

  const totalPendiente = useMemo(() => {
    return loteVentas.reduce((sum, v) => sum + v.montoPendiente, 0);
  }, [loteVentas]);

  // Clientes options (defaulting to first client if not set)
  React.useEffect(() => {
    if (clientes.length > 0 && !clienteId) {
      setClienteId(clientes[0].id);
    }
  }, [clientes, clienteId]);

  // Auto-sync status when pagadas changes
  const handlePagadasChange = (val: number) => {
    const p = Math.max(0, Math.min(val, cantidadComprada));
    setPagadas(p);
    if (p === cantidadComprada) {
      setStatusVenta('Pagado');
    } else if (p === 0) {
      setStatusVenta('Sin pagar');
    } else {
      setStatusVenta('Debe');
    }
  };

  const handleCantidadChange = (val: number) => {
    const c = Math.max(1, val);
    setCantidadComprada(c);
    setPagadas(c);
    setStatusVenta('Pagado');
  };

  // Submit sale with Admin Auth
  const handleInsertarVenta = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!currentLote) return;

    if (cantidadComprada <= 0) {
      setFormError('La cantidad comprada debe ser mayor a 0.');
      return;
    }
    if (cantidadComprada > currentLote.unidadesRestantes) {
      setFormError(
        `No hay suficientes unidades disponibles. Solo quedan ${currentLote.unidadesRestantes} porciones en inventario.`
      );
      return;
    }

    const selectedClient = clientes.find((c) => c.id === clienteId);
    if (!selectedClient) {
      setFormError('Por favor selecciona o crea un cliente primero.');
      return;
    }

    executeWithAdminAuth(() => {
      const precioUnit = currentLote.precioVenta;
      const montoTotal = cantidadComprada * precioUnit;
      const montoPagado = pagadas * precioUnit;
      const montoPendiente = (cantidadComprada - pagadas) * precioUnit;
      const unidadesSinPagar = cantidadComprada - pagadas;

      addVenta({
        loteId: currentLote.id,
        productoNombre: currentLote.nombre,
        clienteId: selectedClient.id,
        clienteNombre: selectedClient.nombre,
        cantidadComprada,
        unidadesPagadas: pagadas,
        unidadesSinPagar,
        precioUnitario: precioUnit,
        montoTotal,
        montoPagado,
        montoPendiente,
        metodoPago,
        referenciaPago,
        tipo: tipoVenta,
        status: statusVenta,
        nota,
      });

      // Reset form
      setCantidadComprada(1);
      setPagadas(1);
      setNota('');
      setReferenciaPago('');

      // Confetti celebration if paid!
      if (statusVenta === 'Pagado') {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.65 },
          colors: ['#3E2010', '#E8C39E', '#16A34A'],
        });
      }
    }, `registrar la venta de ${cantidadComprada}x ${currentLote.nombre} a ${selectedClient.nombre}`);
  };

  const toggleFolder = (folderName: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderName]: !prev[folderName],
    }));
  };

  // Group lotes: Recientes vs folders
  const groupedLotes = useMemo(() => {
    const recientes: LoteProducto[] = [];
    const otros: Record<string, LoteProducto[]> = {};

    lotes.forEach((lote, index) => {
      if (index < 4) {
        recientes.push(lote);
      } else {
        const folder = lote.mesCarpeta || 'Antiguas';
        if (!otros[folder]) otros[folder] = [];
        otros[folder].push(lote);
      }
    });

    return { recientes, otros };
  }, [lotes]);

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden bg-[#FBF9F6] dark:bg-[#150F0D]">
      {/* LEFT COLUMN: Lista de Ventas (Batches) */}
      <div className="w-full lg:w-80 shrink-0 border-r border-[#3E2010]/10 dark:border-[#332219] flex flex-col bg-white dark:bg-[#1C1411] h-auto lg:h-full max-h-[45vh] lg:max-h-full">
        {/* Header */}
        <div className="p-4 border-b border-[#3E2010]/10 dark:border-[#332219] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-display font-bold text-base text-[#2C1810] dark:text-[#F1EAE4]">
              Lista de Ventas
            </h2>
            <span className="text-[11px] font-mono bg-[#F1ECE4] dark:bg-[#2A1F1B] text-[#5C3D2E] dark:text-[#C5A898] px-2 py-0.5 rounded-full">
              {lotes.length}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onOpenElaborarModal}
              title="Hornear / Elaborar nuevo lote de producto"
              className="p-1.5 rounded-lg bg-[#3E2010] text-white hover:bg-[#2A150B] active:scale-95 transition-all shadow-xs flex items-center gap-1 text-xs font-semibold px-2.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Hornear</span>
            </button>
          </div>
        </div>

        {/* List of Batches */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* Section: Mas Recientes */}
          <div>
            <span className="text-[11px] font-medium text-[#8C6D58] dark:text-[#A0816E] px-1 mb-2 block">
              Mas Recientes
            </span>
            <div className="space-y-1.5">
              {groupedLotes.recientes.map((lote) => {
                const isSelected = currentLote?.id === lote.id;
                return (
                  <div
                    key={lote.id}
                    onClick={() => setSelectedLoteId(lote.id)}
                    className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-[#F6EFE9] dark:bg-[#2D1F1A] border-[#3E2010]/30 dark:border-[#6B4028] shadow-xs'
                        : 'bg-white dark:bg-[#201714] border-transparent hover:border-[#3E2010]/10 hover:bg-[#F9F7F4] dark:hover:bg-[#261C18]'
                    }`}
                  >
                    <img
                      src={lote.imagen}
                      alt={lote.nombre}
                      className="w-11 h-11 rounded-full object-cover shrink-0 ring-1 ring-[#3E2010]/15"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-display font-semibold text-xs text-[#2C1810] dark:text-[#F1EAE4] truncate">
                        {lote.nombre}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md text-[10px] font-medium ${
                            lote.status === 'En Venta'
                              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              lote.status === 'En Venta' ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                          />
                          {lote.status}
                        </span>
                        <span className="text-[10px] text-[#8C6D58] dark:text-[#A0816E] truncate">
                          {lote.fechaTexto.split(' - ')[0]}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section: Folders / Historical */}
          {Object.entries(groupedLotes.otros).map(([folderName, folderLotes]) => {
            const isExpanded = !!expandedFolders[folderName];
            return (
              <div key={folderName} className="space-y-1.5">
                <button
                  onClick={() => toggleFolder(folderName)}
                  className="w-full flex items-center gap-2 text-xs font-semibold text-[#5C3D2E] dark:text-[#C5A898] py-1 px-1 hover:text-[#2C1810] transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                  <Folder className="w-4 h-4 text-[#C5A898]" />
                  <span>{folderName}</span>
                  <span className="text-[10px] text-[#8C6D58]">({folderLotes.length})</span>
                </button>

                {isExpanded && (
                  <div className="space-y-1.5 pl-3 border-l-2 border-[#3E2010]/10 dark:border-[#332219] ml-2">
                    {folderLotes.map((lote) => {
                      const isSelected = currentLote?.id === lote.id;
                      return (
                        <div
                          key={lote.id}
                          onClick={() => setSelectedLoteId(lote.id)}
                          className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all border ${
                            isSelected
                              ? 'bg-[#F6EFE9] dark:bg-[#2D1F1A] border-[#3E2010]/30 shadow-xs'
                              : 'bg-white dark:bg-[#201714] border-transparent hover:bg-[#F9F7F4]'
                          }`}
                        >
                          <img
                            src={lote.imagen}
                            alt={lote.nombre}
                            className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-[#3E2010]/15"
                          />
                          <div className="min-w-0 flex-1">
                            <h4 className="font-display font-semibold text-xs text-[#2C1810] dark:text-[#F1EAE4] truncate">
                              {lote.nombre}
                            </h4>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] text-[#8C6D58] dark:text-[#A0816E]">
                                {lote.unidadesRestantes > 0
                                  ? `${lote.unidadesRestantes} disp.`
                                  : 'Agotado'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT MAIN PANEL: HUD de Ventas & Clientes */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {currentLote ? (
          <>
            {/* Top Product Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#3E2010]/10 dark:border-[#332219]">
              <div className="flex items-center gap-4">
                <img
                  src={currentLote.imagen}
                  alt={currentLote.nombre}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-[#3E2010]/15 shadow-sm"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="font-display font-bold text-xl sm:text-2xl text-[#2C1810] dark:text-[#F1EAE4]">
                      {currentLote.nombre}
                    </h1>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        currentLote.status === 'En Venta'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      ● {currentLote.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#8C6D58] dark:text-[#A0816E] mt-1">
                    <span>
                      Cantidad:{' '}
                      <strong className="text-[#3E2010] dark:text-[#E8C39E]">
                        {currentLote.unidadesProducidas}
                      </strong>
                    </span>
                    <span>•</span>
                    <span>
                      Precio Venta:{' '}
                      <strong className="text-[#3E2010] dark:text-[#E8C39E]">
                        {formatMoney(currentLote.precioVenta)}
                      </strong>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {currentLote.fechaTexto}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {confirmDeleteLote ? (
                  <div className="flex items-center gap-1.5 p-1 bg-red-50 dark:bg-red-950/40 border border-red-200 rounded-xl text-xs">
                    <span className="text-[11px] text-red-700 font-medium px-1">¿Eliminar lote?</span>
                    <button
                      onClick={() => {
                        executeWithAdminAuth(() => {
                          deleteLote(currentLote.id);
                          setConfirmDeleteLote(false);
                        }, `eliminar el lote "${currentLote.nombre}"`);
                      }}
                      className="px-2 py-1 bg-red-600 text-white rounded-lg text-[10px] font-bold hover:bg-red-700"
                    >
                      Sí, eliminar
                    </button>
                    <button
                      onClick={() => setConfirmDeleteLote(false)}
                      className="px-2 py-1 bg-gray-200 text-gray-700 rounded-lg text-[10px]"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteLote(true)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors"
                    title="Eliminar lote"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Sub Tabs: Datos del Producto vs Clientes */}
            <div className="flex items-center p-1 bg-[#F1ECE4] dark:bg-[#261C18] rounded-xl max-w-md">
              <button
                onClick={() => setActiveTab('datos')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'datos'
                    ? 'bg-[#3E2010] text-[#FBF9F6] shadow-xs'
                    : 'text-[#6B4B38] dark:text-[#B59685] hover:text-[#2C1810]'
                }`}
              >
                Datos del Producto
              </button>
              <button
                onClick={() => setActiveTab('clientes')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'clientes'
                    ? 'bg-[#3E2010] text-[#FBF9F6] shadow-xs'
                    : 'text-[#6B4B38] dark:text-[#B59685] hover:text-[#2C1810]'
                }`}
              >
                Clientes & Ventas ({loteVentas.length})
              </button>
            </div>

            {/* TAB 1: CLIENTES & REGISTRO DE VENTA */}
            {activeTab === 'clientes' && (
              <div className="space-y-6">
                {/* 5 KPI Metric boxes from Screenshot 3 */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="bg-[#EAE4DC] dark:bg-[#281E1A] p-3 rounded-xl border border-[#3E2010]/10 dark:border-[#3E281F]">
                    <span className="text-[11px] font-medium text-[#7A5B49] dark:text-[#B09282] block">
                      Precio Venta:
                    </span>
                    <span className="font-mono text-base font-bold text-[#2C1810] dark:text-[#F1EAE4]">
                      {currentLote.precioVenta.toFixed(2)}
                    </span>
                  </div>

                  <div className="bg-[#EAE4DC] dark:bg-[#281E1A] p-3 rounded-xl border border-[#3E2010]/10 dark:border-[#3E281F]">
                    <span className="text-[11px] font-medium text-[#7A5B49] dark:text-[#B09282] block">
                      Unidades:
                    </span>
                    <span className="font-mono text-base font-bold text-[#2C1810] dark:text-[#F1EAE4]">
                      {currentLote.unidadesProducidas}
                    </span>
                  </div>

                  <div className="bg-[#EAE4DC] dark:bg-[#281E1A] p-3 rounded-xl border border-[#3E2010]/10 dark:border-[#3E281F]">
                    <span className="text-[11px] font-medium text-[#7A5B49] dark:text-[#B09282] block">
                      Vendidas:
                    </span>
                    <span className="font-mono text-base font-bold text-[#2C1810] dark:text-[#F1EAE4]">
                      {currentLote.unidadesVendidas}
                    </span>
                  </div>

                  <div className="bg-[#EAE4DC] dark:bg-[#281E1A] p-3 rounded-xl border border-[#3E2010]/10 dark:border-[#3E281F]">
                    <span className="text-[11px] font-medium text-[#7A5B49] dark:text-[#B09282] block">
                      Total Cancelado:
                    </span>
                    <span className="font-mono text-base font-bold text-emerald-800 dark:text-emerald-400">
                      {totalCancelado.toFixed(2)}
                    </span>
                  </div>

                  <div className="bg-[#EAE4DC] dark:bg-[#281E1A] p-3 rounded-xl border border-[#3E2010]/10 dark:border-[#3E281F] col-span-2 sm:col-span-1">
                    <span className="text-[11px] font-medium text-[#7A5B49] dark:text-[#B09282] block">
                      Restantes:
                    </span>
                    <span
                      className={`font-mono text-base font-bold ${
                        currentLote.unidadesRestantes === 0
                          ? 'text-red-600'
                          : 'text-[#2C1810] dark:text-[#F1EAE4]'
                      }`}
                    >
                      {currentLote.unidadesRestantes}
                    </span>
                  </div>
                </div>

                {/* FORMULARIO DE INSERCIÓN DE VENTA (Screenshots 1 & 3) */}
                <div className="bg-white dark:bg-[#1E1613] p-5 sm:p-6 rounded-2xl border border-[#3E2010]/15 dark:border-[#3D281E] shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display font-bold text-sm sm:text-base text-[#2C1810] dark:text-[#F1EAE4]">
                      Ventas - Clientes
                    </h3>
                    <button
                      type="button"
                      onClick={onOpenClienteModal}
                      className="text-xs font-semibold text-[#8C4A27] hover:underline flex items-center gap-1"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>+ Nuevo Cliente</span>
                    </button>
                  </div>

                  <form onSubmit={handleInsertarVenta} className="space-y-4">
                    {formError && (
                      <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>{formError}</span>
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                      {/* Cliente */}
                      <div className="space-y-1 sm:col-span-2 lg:col-span-1">
                        <label className="text-[11px] font-medium text-[#7A5B49] dark:text-[#B09282]">
                          Nombre del Cliente:
                        </label>
                        <select
                          value={clienteId}
                          onChange={(e) => setClienteId(e.target.value)}
                          className="w-full py-2 px-3 bg-[#FBF9F6] dark:bg-[#261C18] border border-[#3E2010]/20 dark:border-[#422C21] rounded-xl text-xs font-medium text-[#2C1810] dark:text-[#F1EAE4] outline-none focus:border-[#3E2010]"
                        >
                          {clientes.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.nombre} {c.referencia ? `(${c.referencia})` : ''}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Cantidad Comprada */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-[#7A5B49] dark:text-[#B09282]">
                          Cantidad Comprada:
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={currentLote.unidadesRestantes || 1}
                          value={cantidadComprada}
                          onChange={(e) => handleCantidadChange(parseInt(e.target.value) || 1)}
                          className="w-full py-2 px-3 bg-[#FBF9F6] dark:bg-[#261C18] border border-[#3E2010]/20 dark:border-[#422C21] rounded-xl text-xs font-mono font-semibold text-[#2C1810] dark:text-[#F1EAE4] outline-none focus:border-[#3E2010]"
                        />
                      </div>

                      {/* Pagadas */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-[#7A5B49] dark:text-[#B09282]">
                          Pagadas:
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={cantidadComprada}
                          value={pagadas}
                          onChange={(e) => handlePagadasChange(parseInt(e.target.value) || 0)}
                          className="w-full py-2 px-3 bg-[#FBF9F6] dark:bg-[#261C18] border border-[#3E2010]/20 dark:border-[#422C21] rounded-xl text-xs font-mono font-semibold text-[#2C1810] dark:text-[#F1EAE4] outline-none focus:border-[#3E2010]"
                        />
                      </div>

                      {/* Método de Pago */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-[#7A5B49] dark:text-[#B09282]">
                          Método de Pago:
                        </label>
                        <select
                          value={metodoPago}
                          onChange={(e) => setMetodoPago(e.target.value as MetodoPago)}
                          className="w-full py-2 px-3 bg-[#FBF9F6] dark:bg-[#261C18] border border-[#3E2010]/20 dark:border-[#422C21] rounded-xl text-xs font-medium text-[#2C1810] dark:text-[#F1EAE4] outline-none focus:border-[#3E2010]"
                        >
                          <option value="Efectivo">Efectivo</option>
                          <option value="Transferencia">Transferencia</option>
                          <option value="Pago Móvil">Pago Móvil</option>
                          <option value="Zelle">Zelle</option>
                          <option value="Dólares Efectivo">Dólares Efectivo</option>
                          <option value="Ninguno">Ninguno (Fiado)</option>
                        </select>
                      </div>

                      {/* Referencia */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-[#7A5B49] dark:text-[#B09282]">
                          Ref. Comprobante:
                        </label>
                        <input
                          type="text"
                          value={referenciaPago}
                          onChange={(e) => setReferenciaPago(e.target.value)}
                          placeholder="Ej: 9980 o 0000"
                          className="w-full py-2 px-3 bg-[#FBF9F6] dark:bg-[#261C18] border border-[#3E2010]/20 dark:border-[#422C21] rounded-xl text-xs font-mono text-[#2C1810] dark:text-[#F1EAE4] outline-none focus:border-[#3E2010]"
                        />
                      </div>

                      {/* Total */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-[#7A5B49] dark:text-[#B09282]">
                          Total ({config.monedaPrincipal}):
                        </label>
                        <div className="py-2 px-3 bg-[#EAE4DC] dark:bg-[#281E1A] border border-[#3E2010]/15 rounded-xl text-xs font-mono font-bold text-[#2C1810] dark:text-[#F1EAE4]">
                          {(cantidadComprada * currentLote.precioVenta).toFixed(2)}
                        </div>
                      </div>

                      {/* Tipo */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-[#7A5B49] dark:text-[#B09282]">
                          Tipo:
                        </label>
                        <select
                          value={tipoVenta}
                          onChange={(e) => setTipoVenta(e.target.value as TipoVenta)}
                          className="w-full py-2 px-3 bg-[#FBF9F6] dark:bg-[#261C18] border border-[#3E2010]/20 dark:border-[#422C21] rounded-xl text-xs font-medium text-[#2C1810] dark:text-[#F1EAE4] outline-none focus:border-[#3E2010]"
                        >
                          <option value="Para llevar">Para llevar</option>
                          <option value="Comer aquí">Comer aquí</option>
                          <option value="Fiado">Fiado</option>
                          <option value="Encargo">Encargo</option>
                        </select>
                      </div>

                      {/* Status */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-[#7A5B49] dark:text-[#B09282]">
                          Status:
                        </label>
                        <select
                          value={statusVenta}
                          onChange={(e) => setStatusVenta(e.target.value as VentaStatus)}
                          className="w-full py-2 px-3 bg-[#FBF9F6] dark:bg-[#261C18] border border-[#3E2010]/20 dark:border-[#422C21] rounded-xl text-xs font-semibold text-[#2C1810] dark:text-[#F1EAE4] outline-none focus:border-[#3E2010]"
                        >
                          <option value="Pagado">Pagado</option>
                          <option value="Sin pagar">Sin Pagar</option>
                          <option value="No Pagado">No Pagado</option>
                          <option value="Debe">Debe (Parcial)</option>
                        </select>
                      </div>
                    </div>

                    {/* Nota & Botón Insertar */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                      <div className="w-full sm:flex-1">
                        <input
                          type="text"
                          value={nota}
                          onChange={(e) => setNota(e.target.value)}
                          placeholder="Nota / Observaciones de la venta..."
                          className="w-full py-2.5 px-3 bg-[#FBF9F6] dark:bg-[#261C18] border border-[#3E2010]/20 dark:border-[#422C21] rounded-xl text-xs text-[#2C1810] dark:text-[#F1EAE4] outline-none focus:border-[#3E2010]"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={currentLote.unidadesRestantes <= 0}
                        className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-display font-semibold text-xs text-white shadow-sm flex items-center justify-center gap-2 transition-all ${
                          currentLote.unidadesRestantes > 0
                            ? 'bg-[#3E2010] hover:bg-[#28150A] active:scale-95'
                            : 'bg-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <Receipt className="w-4 h-4" />
                        <span>Insertar Venta</span>
                      </button>
                    </div>

                    {currentLote.unidadesRestantes <= 0 && (
                      <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 p-2 rounded-lg">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>Este lote está agotado. Hornea un nuevo lote para continuar vendiendo.</span>
                      </div>
                    )}
                  </form>
                </div>

                {/* TABLA: LISTA DE CLIENTES QUE COMPRARON (Screenshots 1 & 3) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-bold text-sm sm:text-base text-[#2C1810] dark:text-[#F1EAE4]">
                      Lista de Clientes
                    </h3>
                    <span className="text-xs text-[#8C6D58]">
                      {loteVentas.length} registros para este lote
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-[#3E2010]/15 dark:border-[#3D281E] bg-white dark:bg-[#1E1613]">
                    <table className="w-full text-left text-xs border-collapse">
                      {/* Deep Brown Table Header matching Screenshot 1 */}
                      <thead>
                        <tr className="bg-[#3E2010] text-[#FBF9F6]">
                          <th className="py-2.5 px-3 font-semibold">Cliente</th>
                          <th className="py-2.5 px-3 font-semibold text-center">Unidades</th>
                          <th className="py-2.5 px-3 font-semibold text-center">Sin Pagar</th>
                          <th className="py-2.5 px-3 font-semibold text-center">Pagadas</th>
                          <th className="py-2.5 px-3 font-semibold text-right">
                            Total {config.monedaPrincipal}
                          </th>
                          <th className="py-2.5 px-3 font-semibold">Método de Pago</th>
                          <th className="py-2.5 px-3 font-semibold">Tipo</th>
                          <th className="py-2.5 px-3 font-semibold text-center">Status</th>
                          <th className="py-2.5 px-3 font-semibold text-center">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#3E2010]/10 dark:divide-[#332219]">
                        {loteVentas.length === 0 ? (
                          <tr>
                            <td
                              colSpan={9}
                              className="py-8 text-center text-xs text-[#8C6D58] dark:text-[#A0816E]"
                            >
                              No hay ventas registradas aún para este lote de producto.
                            </td>
                          </tr>
                        ) : (
                          loteVentas.map((venta) => {
                            const isPaid = venta.status === 'Pagado';
                            const isDebt = venta.status === 'Debe';

                            return (
                              <tr
                                key={venta.id}
                                onClick={() => setEditingVenta(venta)}
                                title="Presiona para editar pago y unidades de este cliente"
                                className="hover:bg-amber-50/40 dark:hover:bg-[#261C18] transition-colors cursor-pointer group"
                              >
                                <td className="py-3 px-3 font-semibold text-[#2C1810] dark:text-[#F1EAE4]">
                                  <div className="flex items-center gap-1.5">
                                    <span className="group-hover:text-amber-800 dark:group-hover:text-amber-300 underline-offset-2 group-hover:underline">
                                      {venta.clienteNombre}
                                    </span>
                                    <Edit2 className="w-3 h-3 text-[#8C6D58] opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                  {venta.nota && (
                                    <span className="block text-[10px] text-[#8C6D58] font-normal truncate max-w-xs">
                                      {venta.nota}
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-3 text-center font-mono font-medium">
                                  {venta.cantidadComprada}
                                </td>
                                <td className="py-3 px-3 text-center font-mono font-bold text-red-600">
                                  {venta.unidadesSinPagar}
                                </td>
                                <td className="py-3 px-3 text-center font-mono font-bold text-emerald-700">
                                  {venta.unidadesPagadas}
                                </td>
                                <td className="py-3 px-3 text-right font-mono font-bold text-[#2C1810] dark:text-[#F1EAE4]">
                                  {venta.montoTotal.toFixed(2)}
                                </td>
                                <td className="py-3 px-3 text-[#5C3D2E] dark:text-[#C5A898]">
                                  {venta.metodoPago}
                                  {venta.referenciaPago ? `: ${venta.referenciaPago}` : ''}
                                </td>
                                <td className="py-3 px-3 text-[#5C3D2E] dark:text-[#C5A898]">
                                  {venta.tipo}
                                </td>
                                <td className="py-3 px-3 text-center">
                                  {/* Clickable Status Badge opens EditarPagoModal */}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingVenta(venta);
                                    }}
                                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all inline-flex items-center gap-1 ${
                                      isPaid
                                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 hover:bg-emerald-100'
                                        : isDebt
                                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 hover:bg-amber-100'
                                        : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 hover:bg-red-100'
                                    }`}
                                  >
                                    {isPaid ? (
                                      <CheckCircle2 className="w-3 h-3" />
                                    ) : (
                                      <Clock3 className="w-3 h-3" />
                                    )}
                                    <span>{venta.status}</span>
                                  </button>
                                </td>
                                <td className="py-3 px-3 text-center">
                                  <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                                    <button
                                      type="button"
                                      onClick={() => setEditingVenta(venta)}
                                      title="Editar cuántas unidades pagó"
                                      className="p-1.5 text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/20 rounded-md transition-colors"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        executeWithAdminAuth(() => {
                                          if (
                                            confirm(
                                              `¿Eliminar la venta de ${venta.cantidadComprada}x a ${venta.clienteNombre}?`
                                            )
                                          ) {
                                            deleteVenta(venta.id);
                                          }
                                        }, `eliminar la venta de ${venta.clienteNombre}`);
                                      }}
                                      title="Eliminar venta"
                                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md transition-colors"
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
                </div>
              </div>
            )}

            {/* TAB 2: DATOS DEL PRODUCTO & COSTOS (Screenshots 4 & 5) */}
            {activeTab === 'datos' && (
              <div className="space-y-6">
                {/* 3 Dark Badges: Tiempo, Unidades c/u, Precio Venta */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-[#3E2010] text-white p-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-xs">
                    <Clock className="w-4 h-4 text-[#E8C39E]" />
                    <span className="font-semibold text-xs">Tiempo: 30 min</span>
                  </div>
                  <div className="bg-[#3E2010] text-white p-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-xs">
                    <Package className="w-4 h-4 text-[#E8C39E]" />
                    <span className="font-semibold text-xs">
                      {currentLote.unidadesProducidas} c/u
                    </span>
                  </div>
                  <div className="bg-[#3E2010] text-white p-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-xs">
                    <DollarSign className="w-4 h-4 text-[#E8C39E]" />
                    <span className="font-semibold text-xs">
                      {formatMoney(currentLote.precioVenta)}
                    </span>
                  </div>
                </div>

                {/* Tabla de Materiales Gastados en la Elaboración */}
                <div className="space-y-2">
                  <h3 className="font-display font-bold text-sm text-[#2C1810] dark:text-[#F1EAE4]">
                    Ingredientes & Materiales Consumidos del Inventario
                  </h3>
                  <div className="overflow-x-auto rounded-xl border border-[#3E2010]/15 dark:border-[#3D281E] bg-white dark:bg-[#1E1613]">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-[#3E2010] text-[#FBF9F6]">
                          <th className="py-2.5 px-4 font-semibold">Productos / Insumos</th>
                          <th className="py-2.5 px-4 font-semibold text-right">Cantidad Gastada</th>
                          <th className="py-2.5 px-4 font-semibold text-right">
                            Total {config.monedaPrincipal}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#3E2010]/10 dark:divide-[#332219]">
                        {currentLote.materialesGastados.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="py-4 text-center text-[#8C6D58]">
                              No hay desglose de insumos guardado para este lote.
                            </td>
                          </tr>
                        ) : (
                          currentLote.materialesGastados.map((mat, idx) => {
                            const dual = formatDualUnit(mat.cantidadGastada, mat.unidad);
                            return (
                              <tr key={idx} className="hover:bg-[#FBF9F6]">
                                <td className="py-2.5 px-4 font-medium text-[#2C1810] dark:text-[#F1EAE4]">
                                  {mat.nombre}
                                </td>
                                <td className="py-2.5 px-4 text-right font-mono">
                                  <span className="font-semibold">{dual.primary}</span>
                                  {dual.secondary && (
                                    <span className="text-[10px] text-[#8C6D58] block">
                                      ({dual.secondary})
                                    </span>
                                  )}
                                </td>
                                <td className="py-2.5 px-4 text-right font-mono font-semibold text-[#2C1810] dark:text-[#F1EAE4]">
                                  {mat.costo.toFixed(2)}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Sección Cálculo (Gastos, Unidades, Precio Venta, Total, Ganancia) */}
                <div className="space-y-3 bg-[#F8F6F2] dark:bg-[#201714] p-5 rounded-2xl border border-[#3E2010]/10">
                  <h3 className="font-display font-bold text-sm text-[#2C1810] dark:text-[#F1EAE4]">
                    Cálculo Financiero del Lote
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="bg-white dark:bg-[#281E1A] p-3 rounded-xl border border-[#3E2010]/10">
                      <span className="text-[11px] text-[#7A5B49] block">Gastos (Costo Materia):</span>
                      <span className="font-mono text-sm font-bold text-[#2C1810] dark:text-[#F1EAE4]">
                        {currentLote.costoTotalMateriales.toFixed(2)} {config.monedaPrincipal}
                      </span>
                    </div>

                    <div className="bg-white dark:bg-[#281E1A] p-3 rounded-xl border border-[#3E2010]/10">
                      <span className="text-[11px] text-[#7A5B49] block">Unidades:</span>
                      <span className="font-mono text-sm font-bold text-[#2C1810] dark:text-[#F1EAE4]">
                        {currentLote.unidadesProducidas}
                      </span>
                    </div>

                    <div className="bg-white dark:bg-[#281E1A] p-3 rounded-xl border border-[#3E2010]/10">
                      <span className="text-[11px] text-[#7A5B49] block">Precio Venta c/u:</span>
                      <span className="font-mono text-sm font-bold text-[#2C1810] dark:text-[#F1EAE4]">
                        {currentLote.precioVenta.toFixed(2)}
                      </span>
                    </div>

                    <div className="bg-white dark:bg-[#281E1A] p-3 rounded-xl border border-[#3E2010]/10">
                      <span className="text-[11px] text-[#7A5B49] block">Total Ingreso Proyectado:</span>
                      <span className="font-mono text-sm font-bold text-[#2C1810] dark:text-[#F1EAE4]">
                        {(currentLote.unidadesProducidas * currentLote.precioVenta).toFixed(2)}
                      </span>
                    </div>

                    <div className="bg-white dark:bg-[#281E1A] p-3 rounded-xl border border-[#3E2010]/10 col-span-2 sm:col-span-1">
                      <span className="text-[11px] text-emerald-800 dark:text-emerald-400 font-medium block">
                        Ganancia Estimada:
                      </span>
                      <span className="font-mono text-sm font-bold text-emerald-800 dark:text-emerald-400">
                        {currentLote.gananciaEstimada.toFixed(2)} {config.monedaPrincipal}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => setActiveTab('clientes')}
                      className="px-6 py-2.5 rounded-xl font-display font-semibold text-xs text-white bg-[#3E2010] hover:bg-[#2C160B] active:scale-95 transition-all shadow-xs"
                    >
                      Ir a Registrar Ventas
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center">
            <Package className="w-12 h-12 text-[#C5A898] mb-3" />
            <h3 className="font-display font-semibold text-base text-[#2C1810] dark:text-[#F1EAE4]">
              No hay lote seleccionado
            </h3>
            <p className="text-xs text-[#8C6D58] max-w-sm mt-1">
              Selecciona un producto de la lista a la izquierda o haz clic en Hornear para producir un
              nuevo lote.
            </p>
            <button
              onClick={onOpenElaborarModal}
              className="mt-4 px-4 py-2 bg-[#3E2010] text-white rounded-xl text-xs font-semibold"
            >
              + Elaborar Producto
            </button>
          </div>
        )}
      </div>

      {/* Modal para editar pago y unidades del cliente */}
      <EditarPagoModal
        isOpen={Boolean(editingVenta)}
        onClose={() => setEditingVenta(null)}
        venta={editingVenta}
      />
    </div>
  );
};
