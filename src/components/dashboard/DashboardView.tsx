import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp,
  DollarSign,
  Package,
  AlertTriangle,
  Flame,
  Users,
  Boxes,
  Plus,
  ArrowRight,
  Clock,
  Sparkles,
} from 'lucide-react';

interface DashboardViewProps {
  onOpenElaborarModal: () => void;
  onOpenNewInsumoModal: () => void;
  onOpenNewClienteModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenElaborarModal,
  onOpenNewInsumoModal,
  onOpenNewClienteModal,
}) => {
  const {
    lotes,
    ventas,
    insumos,
    clientes,
    setActiveNavTab,
    setSelectedLoteId,
    formatMoney,
    convertCurrency,
    config,
  } = useApp();

  const totalVendidoBs = useMemo(() => {
    return ventas.reduce((sum, v) => sum + v.montoTotal, 0);
  }, [ventas]);

  const totalCobradoBs = useMemo(() => {
    return ventas.reduce((sum, v) => sum + v.montoPagado, 0);
  }, [ventas]);

  const totalPorCobrarBs = useMemo(() => {
    return ventas.reduce((sum, v) => sum + v.montoPendiente, 0);
  }, [ventas]);

  const totalPorcionesEnStock = useMemo(() => {
    return lotes.reduce((sum, l) => sum + l.unidadesRestantes, 0);
  }, [lotes]);

  const insumosAlertas = useMemo(() => {
    return insumos.filter((i) => i.status === 'Por agotarse' || i.status === 'Agotado');
  }, [insumos]);

  const lotesActivos = useMemo(() => {
    return lotes.filter((l) => l.status === 'En Venta');
  }, [lotes]);

  const ultimasVentas = useMemo(() => {
    return [...ventas].reverse().slice(0, 5);
  }, [ventas]);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-[#FBF9F6] dark:bg-[#150F0D]">
      {/* Banner Bienvenida */}
      <div className="bg-gradient-to-r from-[#3E2010] to-[#592D16] text-[#FBF9F6] p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-[#E8C39E] font-semibold">
            Panel Principal
          </span>
          <h1 className="font-display font-bold text-2xl sm:text-3xl mt-0.5">
            ¡Hola, {config.nombreUsuario || 'Yulihanny'}! 👩‍🍳
          </h1>
          <p className="text-xs text-[#D8B490] mt-1 max-w-md">
            Gestiona la producción, el inventario de materia prima y el cobro de ventas en tiempo
            real.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenElaborarModal}
            className="px-4 py-2.5 rounded-xl bg-white text-[#3E2010] text-xs font-bold hover:bg-[#FBF9F6] shadow-sm flex items-center gap-1.5 transition-transform active:scale-95"
          >
            <Flame className="w-4 h-4 text-amber-600" />
            <span>Hornear Lote</span>
          </button>
          <button
            onClick={() => setActiveNavTab('ventas')}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs flex items-center gap-1.5 transition-colors"
          >
            <span>Ver Ventas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4 KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white dark:bg-[#1E1613] p-4 rounded-2xl border border-[#3E2010]/15 dark:border-[#38261E] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#8C6D58] dark:text-[#A0816E]">
              Total Ventas
            </span>
            <span className="p-1.5 bg-[#F6EFE9] dark:bg-[#2A1F1B] rounded-lg text-[#3E2010]">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <h3 className="font-mono text-xl font-bold text-[#2C1810] dark:text-[#F1EAE4] mt-2">
            {formatMoney(totalVendidoBs)}
          </h3>
          <span className="text-[10px] text-emerald-700 font-mono mt-1 block">
            Cobrado: {formatMoney(totalCobradoBs)}
          </span>
        </div>

        <div className="bg-white dark:bg-[#1E1613] p-4 rounded-2xl border border-[#3E2010]/15 dark:border-[#38261E] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-red-600 dark:text-red-400">
              Por Cobrar (Fiado)
            </span>
            <span className="p-1.5 bg-red-50 dark:bg-red-950/30 rounded-lg text-red-600">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <h3 className="font-mono text-xl font-bold text-red-600 mt-2">
            {formatMoney(totalPorCobrarBs)}
          </h3>
          <button
            onClick={() => setActiveNavTab('clientes')}
            className="text-[10px] text-[#8C6D58] hover:underline mt-1 block"
          >
            Ver {clientes.filter((c) => c.totalDeuda > 0).length} clientes con deuda →
          </button>
        </div>

        <div className="bg-white dark:bg-[#1E1613] p-4 rounded-2xl border border-[#3E2010]/15 dark:border-[#38261E] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#8C6D58] dark:text-[#A0816E]">
              Porciones en Venta
            </span>
            <span className="p-1.5 bg-[#F6EFE9] dark:bg-[#2A1F1B] rounded-lg text-[#3E2010]">
              <Package className="w-4 h-4" />
            </span>
          </div>
          <h3 className="font-mono text-xl font-bold text-[#2C1810] dark:text-[#F1EAE4] mt-2">
            {totalPorcionesEnStock}
          </h3>
          <span className="text-[10px] text-[#8C6D58] mt-1 block">
            En {lotesActivos.length} productos horneados
          </span>
        </div>

        <div className="bg-white dark:bg-[#1E1613] p-4 rounded-2xl border border-[#3E2010]/15 dark:border-[#38261E] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400">
              Insumos en Alerta
            </span>
            <span className="p-1.5 bg-amber-50 dark:bg-amber-950/30 rounded-lg text-amber-600">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <h3 className="font-mono text-xl font-bold text-amber-800 dark:text-amber-400 mt-2">
            {insumosAlertas.length}
          </h3>
          <button
            onClick={() => setActiveNavTab('inventario')}
            className="text-[10px] text-[#8C6D58] hover:underline mt-1 block"
          >
            Revisar inventario →
          </button>
        </div>
      </div>

      {/* Grid: Lotes en Venta Activos & Insumos por Agotarse */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productos En Venta */}
        <div className="bg-white dark:bg-[#1E1613] p-5 rounded-2xl border border-[#3E2010]/15 dark:border-[#38261E] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-sm sm:text-base text-[#2C1810] dark:text-[#F1EAE4]">
              Productos Terminados Listos para la Venta
            </h3>
            <button
              onClick={() => setActiveNavTab('ventas')}
              className="text-xs text-[#8C4A27] font-semibold hover:underline"
            >
              Ver todos →
            </button>
          </div>

          <div className="space-y-2">
            {lotesActivos.length === 0 ? (
              <p className="text-xs text-[#8C6D58] py-4 text-center">
                No hay lotes en venta actualmente. ¡Hornea uno nuevo!
              </p>
            ) : (
              lotesActivos.map((lote) => (
                <div
                  key={lote.id}
                  onClick={() => {
                    setSelectedLoteId(lote.id);
                    setActiveNavTab('ventas');
                  }}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#FBF9F6] dark:bg-[#261C18] border border-[#3E2010]/10 hover:border-[#3E2010]/25 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={lote.imagen}
                      alt={lote.nombre}
                      className="w-10 h-10 rounded-xl object-cover shrink-0 ring-1 ring-[#3E2010]/15"
                    />
                    <div>
                      <h4 className="font-display font-semibold text-xs text-[#2C1810] dark:text-[#F1EAE4]">
                        {lote.nombre}
                      </h4>
                      <span className="text-[10px] text-[#8C6D58]">
                        Horneado: {lote.fechaTexto.split(' - ')[0]}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono text-xs font-bold text-[#3E2010] dark:text-[#E8C39E] block">
                      {lote.unidadesRestantes} disp.
                    </span>
                    <span className="text-[10px] text-emerald-700">
                      {formatMoney(lote.precioVenta)} c/u
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Últimas Ventas Registradas */}
        <div className="bg-white dark:bg-[#1E1613] p-5 rounded-2xl border border-[#3E2010]/15 dark:border-[#38261E] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-sm sm:text-base text-[#2C1810] dark:text-[#F1EAE4]">
              Últimas Ventas Registradas
            </h3>
            <button
              onClick={() => setActiveNavTab('ventas')}
              className="text-xs text-[#8C4A27] font-semibold hover:underline"
            >
              Panel Ventas →
            </button>
          </div>

          <div className="space-y-2">
            {ultimasVentas.length === 0 ? (
              <p className="text-xs text-[#8C6D58] py-4 text-center">
                No hay ventas registradas aún.
              </p>
            ) : (
              ultimasVentas.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#FBF9F6] dark:bg-[#261C18] border border-[#3E2010]/10 text-xs"
                >
                  <div>
                    <span className="font-semibold text-[#2C1810] dark:text-[#F1EAE4] block">
                      {v.clienteNombre} — {v.cantidadComprada}x {v.productoNombre}
                    </span>
                    <span className="text-[10px] text-[#8C6D58]">
                      {v.fechaTexto} • {v.metodoPago}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-[#2C1810] dark:text-[#F1EAE4] block">
                      {formatMoney(v.montoTotal)}
                    </span>
                    <span
                      className={`text-[10px] font-semibold ${
                        v.status === 'Pagado' ? 'text-emerald-700' : 'text-red-600'
                      }`}
                    >
                      {v.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
