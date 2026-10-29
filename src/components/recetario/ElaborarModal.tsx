import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Receta } from '../../types';
import {
  X,
  Flame,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Package,
  Layers,
  Sparkles,
  Scale,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { convertUnit, formatDualUnit } from '../../utils/units';

interface ElaborarModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRecetaId?: string | null;
}

export const ElaborarModal: React.FC<ElaborarModalProps> = ({
  isOpen,
  onClose,
  defaultRecetaId,
}) => {
  const {
    recetas,
    insumos,
    elaborarReceta,
    executeWithAdminAuth,
    formatMoney,
    convertCurrency,
    config,
  } = useApp();

  const [recetaId, setRecetaId] = useState<string>(
    defaultRecetaId || recetas[0]?.id || ''
  );
  const [multiplicador, setMultiplicador] = useState<number>(1.0);
  const [escalaNombre, setEscalaNombre] = useState<string>('1x Estándar');
  const [unidadesObtenidas, setUnidadesObtenidas] = useState<number>(56);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync default recipe
  React.useEffect(() => {
    if (defaultRecetaId) {
      setRecetaId(defaultRecetaId);
    }
  }, [defaultRecetaId]);

  const receta = useMemo(() => {
    return recetas.find((r) => r.id === recetaId) || recetas[0] || null;
  }, [recetas, recetaId]);

  // Update default units when recipe or multiplier changes
  React.useEffect(() => {
    if (receta) {
      setUnidadesObtenidas(Math.round(receta.porcionesBase * multiplicador));
    }
  }, [receta, multiplicador]);

  if (!isOpen || !receta) return null;

  // Calculate required ingredients & check inventory
  const calculoMateriales = useMemo(() => {
    let costoTotalBs = 0;
    const items = receta.ingredientes.map((ing) => {
      const insumo = insumos.find((i) => i.id === ing.insumoId);
      const cantidadNecesaria = ing.cantidad * multiplicador;
      const stockDisponible = insumo ? insumo.restante : 0;

      // Convertir a la unidad del insumo en el inventario
      const insumoUnidad = insumo ? insumo.unidad : ing.unidad;
      const cantidadEnUnidadInsumo = insumo
        ? convertUnit(cantidadNecesaria, ing.unidad, insumo.unidad)
        : cantidadNecesaria;

      const stockSuficiente = stockDisponible >= cantidadEnUnidadInsumo;
      const costoUnit = insumo ? insumo.costoPorUnidadBase : 0;
      const costoTotalItem = cantidadEnUnidadInsumo * costoUnit;

      costoTotalBs += costoTotalItem;

      return {
        ...ing,
        cantidadNecesaria,
        cantidadEnUnidadInsumo,
        insumoUnidad,
        stockDisponible,
        stockSuficiente,
        costoTotalItem,
      };
    });

    const costoTotalUSD = convertCurrency(costoTotalBs, 'Bs', '$');
    const todosDisponibles = items.every((i) => i.stockSuficiente);

    const ingresoEstimado = unidadesObtenidas * receta.precioSugeridoVenta;
    const gananciaEstimada = ingresoEstimado - costoTotalBs;
    const costoUnitario = unidadesObtenidas > 0 ? costoTotalBs / unidadesObtenidas : 0;

    return {
      items,
      costoTotalBs,
      costoTotalUSD,
      todosDisponibles,
      ingresoEstimado,
      gananciaEstimada,
      costoUnitario,
    };
  }, [receta, multiplicador, insumos, unidadesObtenidas, convertCurrency]);

  const handleConfirmar = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (unidadesObtenidas <= 0) {
      setErrorMsg('Por favor especifica una cantidad válida de unidades obtenidas.');
      return;
    }

    if (!calculoMateriales.todosDisponibles) {
      setErrorMsg(
        'No hay inventario suficiente de algunos insumos para elaborar esta receta con el tamaño seleccionado.'
      );
      return;
    }

    executeWithAdminAuth(() => {
      const result = elaborarReceta(
        receta.id,
        unidadesObtenidas,
        escalaNombre,
        multiplicador
      );

      if (!result.success) {
        setErrorMsg(result.error || 'Ocurrió un error al procesar la elaboración');
        return;
      }

      // Celebratory confetti
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D97706', '#3E2010', '#16A34A'],
      });

      onClose();
    }, `confirmar la elaboración de ${unidadesObtenidas}x ${receta.nombre} y descontar insumos del inventario`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-2xl bg-white dark:bg-[#1E1714] rounded-2xl shadow-2xl border border-[#3E2010]/20 dark:border-[#52301A] overflow-hidden my-6">
        {/* Header */}
        <div className="bg-[#3E2010] text-[#FBF9F6] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-[#592D16] rounded-lg">
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm sm:text-base">
                Confirmar Elaboración / Hornear Producto
              </h3>
              <p className="text-[11px] text-[#D8B490]">
                Descuento en tiempo real de insumos y alta en ventas
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

        <form onSubmit={handleConfirmar} className="p-6 space-y-5">
          {/* Receta Selector & Info */}
          <div className="flex items-center gap-4 p-3 bg-[#F8F6F2] dark:bg-[#261C18] rounded-xl border border-[#3E2010]/10">
            <img
              src={receta.imagen}
              alt={receta.nombre}
              className="w-14 h-14 rounded-xl object-cover ring-1 ring-[#3E2010]/20 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <label className="text-[10px] font-semibold text-[#8C6D58] uppercase">
                Seleccionar Receta:
              </label>
              <select
                value={recetaId}
                onChange={(e) => setRecetaId(e.target.value)}
                className="w-full py-1 px-2 mt-0.5 bg-white dark:bg-[#1E1714] border border-[#3E2010]/20 rounded-lg text-xs font-semibold text-[#2C1810] dark:text-[#F1EAE4]"
              >
                {recetas.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nombre} ({r.categoria})
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-[#8C6D58]">
                <span>Base: {receta.porcionesBase} porciones</span>
                <span>•</span>
                <span>Precio venta: {formatMoney(receta.precioSugeridoVenta)}</span>
              </div>
            </div>
          </div>

          {/* Escala & Multiplicador */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#5C3D2E] dark:text-[#C5A898]">
              Tamaño de Batch / Multiplicador:
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: '0.5x (Mitad)', mult: 0.5 },
                { label: '1x (Estándar)', mult: 1.0 },
                { label: '1.5x (Mediano)', mult: 1.5 },
                { label: '2x (Doble)', mult: 2.0 },
              ].map((esc) => (
                <button
                  type="button"
                  key={esc.mult}
                  onClick={() => {
                    setMultiplicador(esc.mult);
                    setEscalaNombre(esc.label);
                  }}
                  className={`py-2 px-2 rounded-xl text-xs font-medium border transition-all ${
                    multiplicador === esc.mult
                      ? 'bg-[#3E2010] text-white border-[#3E2010] shadow-xs'
                      : 'bg-white dark:bg-[#261C18] text-[#5C3D2E] dark:text-[#C5A898] border-[#3E2010]/15 hover:bg-[#F8F6F2]'
                  }`}
                >
                  {esc.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cantidad final que salieron del horno (Prompt requirement) */}
          <div className="space-y-1.5 bg-[#FFFBEB] dark:bg-[#2D2416] p-4 rounded-xl border border-amber-200 dark:border-amber-900/50">
            <label className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-amber-700" />
              <span>¿Qué cantidad de producto salieron finalmente del horno?</span>
            </label>
            <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
              Ingresa el número real de porciones, unidades o piezas listas para vender.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <input
                type="number"
                min={1}
                required
                value={unidadesObtenidas}
                onChange={(e) => setUnidadesObtenidas(parseInt(e.target.value) || 1)}
                className="w-32 py-2 px-3 text-base font-mono font-bold bg-white dark:bg-[#1E1714] border border-amber-300 dark:border-amber-800 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-center"
              />
              <span className="text-xs font-medium text-amber-900 dark:text-amber-200">
                unidades / porciones listas para venta
              </span>
            </div>
          </div>

          {/* Insumos a descontar del inventario */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[#2C1810] dark:text-[#F1EAE4]">
              Materiales e Insumos a descontar del Inventario:
            </h4>
            <div className="overflow-x-auto rounded-xl border border-[#3E2010]/15 max-h-44 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#3E2010] text-[#FBF9F6]">
                    <th className="py-2 px-3 font-medium">Insumo</th>
                    <th className="py-2 px-3 font-medium text-center">Gasto</th>
                    <th className="py-2 px-3 font-medium text-center">Disponible</th>
                    <th className="py-2 px-3 font-medium text-right">Costo ({config.monedaPrincipal})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3E2010]/10">
                  {calculoMateriales.items.map((item, idx) => {
                    const gastoDual = formatDualUnit(item.cantidadNecesaria, item.unidad);
                    const dispDual = formatDualUnit(item.stockDisponible, item.insumoUnidad);

                    return (
                      <tr
                        key={idx}
                        className={!item.stockSuficiente ? 'bg-red-50 dark:bg-red-950/20' : ''}
                      >
                        <td className="py-2.5 px-3 font-medium text-[#2C1810] dark:text-[#F1EAE4]">
                          <div>{item.nombre}</div>
                          {item.insumoUnidad !== item.unidad && (
                            <span className="text-[10px] text-[#8C6D58] font-mono block">
                              (Deduce {item.cantidadEnUnidadInsumo.toFixed(2)} {item.insumoUnidad} de inventario)
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono">
                          <div className="font-semibold">{gastoDual.primary}</div>
                          {gastoDual.secondary && (
                            <span className="text-[10px] text-[#8C6D58] block">
                              ({gastoDual.secondary})
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono">
                          <span
                            className={
                              item.stockSuficiente
                                ? 'text-emerald-700 font-semibold'
                                : 'text-red-600 font-bold'
                            }
                          >
                            {dispDual.primary}
                          </span>
                          {dispDual.secondary && (
                            <span className="text-[10px] text-[#8C6D58] block">
                              ({dispDual.secondary})
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-medium">
                          {item.costoTotalItem.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Resumen de Costo y Ganancia (Prompt Requirement: Sale el total en $ y costo) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 bg-[#F6EFE9] dark:bg-[#2A1F1B] rounded-xl border border-[#3E2010]/15">
            <div>
              <span className="text-[10px] text-[#7A5B49] block">Total Costo (Bs):</span>
              <span className="font-mono text-sm font-bold text-[#2C1810] dark:text-[#F1EAE4]">
                {calculoMateriales.costoTotalBs.toFixed(2)} Bs
              </span>
            </div>
            <div>
              <span className="text-[10px] text-emerald-800 dark:text-emerald-400 font-medium block">
                Total Costo en $:
              </span>
              <span className="font-mono text-sm font-bold text-emerald-800 dark:text-emerald-400">
                $ {calculoMateriales.costoTotalUSD.toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#7A5B49] block">Costo por Unidad:</span>
              <span className="font-mono text-sm font-bold text-[#2C1810] dark:text-[#F1EAE4]">
                {calculoMateriales.costoUnitario.toFixed(2)} {config.monedaPrincipal}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-emerald-800 dark:text-emerald-400 font-medium block">
                Ganancia Estimada:
              </span>
              <span className="font-mono text-sm font-bold text-emerald-800 dark:text-emerald-400">
                {calculoMateriales.gananciaEstimada.toFixed(2)} {config.monedaPrincipal}
              </span>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#3E2010]/10">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 text-xs font-medium text-[#6B4B38] bg-[#F1ECE4] rounded-xl hover:bg-[#E7DFD4]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!calculoMateriales.todosDisponibles}
              className={`py-2.5 px-6 text-xs font-semibold text-white rounded-xl shadow-xs flex items-center gap-1.5 transition-all ${
                calculoMateriales.todosDisponibles
                  ? 'bg-[#3E2010] hover:bg-[#28150A] active:scale-95'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Confirmar y Enviar a Ventas</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
