import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Venta, MetodoPago } from '../../types';
import {
  X,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Clock,
  KeyRound,
  Sparkles,
  CreditCard,
  User,
  Package,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface EditarPagoModalProps {
  isOpen: boolean;
  onClose: () => void;
  venta: Venta | null;
}

export const EditarPagoModal: React.FC<EditarPagoModalProps> = ({
  isOpen,
  onClose,
  venta,
}) => {
  const { editVentaPayment, executeWithAdminAuth, formatMoney, config } = useApp();

  const [unidadesPagadas, setUnidadesPagadas] = useState<number>(0);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('Pago Móvil');
  const [referenciaPago, setReferenciaPago] = useState<string>('');
  const [nota, setNota] = useState<string>('');

  useEffect(() => {
    if (venta) {
      setUnidadesPagadas(venta.unidadesPagadas);
      setMetodoPago(venta.metodoPago);
      setReferenciaPago(venta.referenciaPago || '');
      setNota(venta.nota || '');
    }
  }, [venta, isOpen]);

  if (!isOpen || !venta) return null;

  const totalCompradas = venta.cantidadComprada;
  const unidadesSinPagar = Math.max(0, totalCompradas - unidadesPagadas);
  const montoPagado = unidadesPagadas * venta.precioUnitario;
  const montoPendiente = unidadesSinPagar * venta.precioUnitario;
  const estaCompletamentePagado = unidadesSinPagar === 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    executeWithAdminAuth(() => {
      editVentaPayment(venta.id, {
        unidadesPagadas,
        metodoPago,
        referenciaPago,
        nota,
      });

      if (estaCompletamentePagado) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#16A34A', '#3E2010', '#E8C39E'],
        });
      }

      onClose();
    }, `actualizar el pago de ${venta.clienteNombre} (${unidadesPagadas} de ${totalCompradas} unidades pagadas)`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white dark:bg-[#1E1714] rounded-3xl shadow-2xl border border-[#3E2010]/20 dark:border-[#52301A] overflow-hidden my-6">
        {/* Header */}
        <div className="bg-[#3E2010] text-[#FBF9F6] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#552D17] rounded-xl text-amber-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm sm:text-base">
                Editar Pago & Unidades
              </h3>
              <p className="text-[11px] text-[#D8B490]">
                Cliente: <span className="font-semibold text-white">{venta.clienteNombre}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#D8B490] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Resumen del pedido del cliente */}
          <div className="p-3.5 bg-[#FAF7F2] dark:bg-[#261C18] rounded-2xl border border-[#3E2010]/10 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#2C1810] dark:text-[#F1EAE4] flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-amber-700" />
                {venta.productoNombre}
              </span>
              <span className="font-mono font-bold text-[#3E2010] dark:text-[#E8C39E]">
                {formatMoney(venta.montoTotal)}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#8C6D58]">
              <span>Cantidad comprada: {totalCompradas} unidades</span>
              <span>Precio unitario: {formatMoney(venta.precioUnitario)} c/u</span>
            </div>
          </div>

          {/* Selector de Unidades Pagadas */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#5C3D2E] dark:text-[#C5A898] flex items-center justify-between">
              <span>¿Cuántas unidades ya pagó el cliente?</span>
              <span className="font-mono text-xs font-bold text-[#3E2010] dark:text-[#E8C39E]">
                {unidadesPagadas} de {totalCompradas} unids
              </span>
            </label>

            {/* Input y Botones de acceso rápido */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={0}
                  max={totalCompradas}
                  required
                  value={unidadesPagadas}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    setUnidadesPagadas(Math.max(0, Math.min(totalCompradas, val)));
                  }}
                  className="w-28 py-2.5 px-3 text-center text-lg font-mono font-bold bg-[#FBF9F6] dark:bg-[#261C18] border border-[#3E2010]/20 rounded-xl text-[#2C1810] dark:text-[#F1EAE4] outline-none focus:border-[#3E2010]"
                />
                <div className="flex-1 flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setUnidadesPagadas(totalCompradas)}
                    className="flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300 hover:bg-emerald-100 transition-colors"
                  >
                    Pagó Todo ({totalCompradas})
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnidadesPagadas((prev) => Math.min(totalCompradas, prev + 1))}
                    className="py-2 px-3 rounded-xl text-xs font-semibold bg-[#F1ECE4] dark:bg-[#2A1F1B] text-[#5C3D2E] hover:bg-[#E7DFD4]"
                  >
                    +1
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnidadesPagadas(0)}
                    className="py-2 px-2.5 rounded-xl text-xs font-semibold bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 hover:bg-red-100"
                  >
                    Debe (0)
                  </button>
                </div>
              </div>

              {/* Slider táctil para teléfono o desktop */}
              <input
                type="range"
                min={0}
                max={totalCompradas}
                value={unidadesPagadas}
                onChange={(e) => setUnidadesPagadas(parseInt(e.target.value) || 0)}
                className="w-full accent-[#3E2010] cursor-pointer"
              />
            </div>

            {/* Resumen de estados y montos */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-900/40 text-center">
                <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-semibold uppercase block">
                  Pagadas ({unidadesPagadas})
                </span>
                <span className="font-mono text-sm font-bold text-emerald-800 dark:text-emerald-300">
                  {formatMoney(montoPagado)}
                </span>
              </div>

              <div
                className={`p-3 rounded-xl border text-center ${
                  unidadesSinPagar > 0
                    ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/40'
                    : 'bg-stone-50 dark:bg-stone-900 border-stone-200'
                }`}
              >
                <span className="text-[10px] text-amber-800 dark:text-amber-300 font-semibold uppercase block">
                  Pendiente ({unidadesSinPagar})
                </span>
                <span className="font-mono text-sm font-bold text-amber-800 dark:text-amber-300">
                  {formatMoney(montoPendiente)}
                </span>
              </div>
            </div>
          </div>

          {/* Método de Pago & Referencia */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#5C3D2E] dark:text-[#C5A898]">
                Método de Pago:
              </label>
              <select
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value as MetodoPago)}
                className="w-full py-2 px-3 bg-[#FBF9F6] dark:bg-[#261C18] border border-[#3E2010]/20 rounded-xl text-xs font-medium text-[#2C1810] dark:text-[#F1EAE4]"
              >
                <option value="Pago Móvil">Pago Móvil</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Dólares Efectivo">Dólares Efectivo</option>
                <option value="Zelle">Zelle</option>
                <option value="Ninguno">Ninguno (Fiado)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#5C3D2E] dark:text-[#C5A898]">
                Ref. Comprobante:
              </label>
              <input
                type="text"
                value={referenciaPago}
                onChange={(e) => setReferenciaPago(e.target.value)}
                placeholder="Ej: 9980 o 1234"
                className="w-full py-2 px-3 bg-[#FBF9F6] dark:bg-[#261C18] border border-[#3E2010]/20 rounded-xl text-xs font-mono text-[#2C1810] dark:text-[#F1EAE4]"
              />
            </div>
          </div>

          {/* Nota */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#5C3D2E] dark:text-[#C5A898]">
              Nota u Observación (Opcional):
            </label>
            <input
              type="text"
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              placeholder="Ej: Pagó la mitad hoy, cancela el resto el viernes"
              className="w-full py-2 px-3 bg-[#FBF9F6] dark:bg-[#261C18] border border-[#3E2010]/20 rounded-xl text-xs text-[#2C1810] dark:text-[#F1EAE4]"
            />
          </div>

          {/* Estado resultante badge */}
          <div className="p-2.5 rounded-xl bg-[#F8F6F2] dark:bg-[#261C18] border border-[#3E2010]/10 flex items-center justify-between text-xs">
            <span className="text-[#8C6D58]">Nuevo Estado:</span>
            <span
              className={`px-2.5 py-0.5 rounded-full font-bold text-xs flex items-center gap-1 ${
                estaCompletamentePagado
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : unidadesPagadas > 0
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                  : 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
              }`}
            >
              {estaCompletamentePagado ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Pagado Completo
                </>
              ) : unidadesPagadas > 0 ? (
                <>
                  <Clock className="w-3.5 h-3.5" /> Pago Parcial ({unidadesSinPagar} pendientes)
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5" /> Sin Pagar
                </>
              )}
            </span>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#3E2010]/10">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 text-xs font-medium text-[#6B4B38] bg-[#F1ECE4] rounded-xl hover:bg-[#E7DFD4]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="py-2.5 px-6 text-xs font-semibold text-white bg-[#3E2010] hover:bg-[#2C160B] rounded-xl shadow-xs flex items-center gap-1.5"
            >
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span>Guardar Pago de Cliente</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
