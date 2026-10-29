import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { History, Flame, Receipt, Boxes, Clock } from 'lucide-react';

export const ActividadView: React.FC = () => {
  const { lotes, ventas, insumos, formatMoney, config } = useApp();

  // Combine lotes and sales into a single timeline
  const timeline = useMemo(() => {
    const items: Array<{
      id: string;
      tipo: 'elaboracion' | 'venta';
      titulo: string;
      detalle: string;
      fechaTexto: string;
      montoTexto?: string;
    }> = [];

    lotes.forEach((l) => {
      items.push({
        id: `el-${l.id}`,
        tipo: 'elaboracion',
        titulo: `Elaboración de Lote: ${l.nombre}`,
        detalle: `Se hornearon ${l.unidadesProducidas} porciones. Costo de insumos: ${l.costoTotalMateriales.toFixed(2)} ${config.monedaPrincipal}.`,
        fechaTexto: l.fechaTexto,
      });
    });

    ventas.forEach((v) => {
      items.push({
        id: `ve-${v.id}`,
        tipo: 'venta',
        titulo: `Venta a ${v.clienteNombre}: ${v.cantidadComprada}x ${v.productoNombre}`,
        detalle: `Método: ${v.metodoPago}${v.referenciaPago ? ` (Ref: ${v.referenciaPago})` : ''} • Estado: ${v.status} • Tipo: ${v.tipo}`,
        fechaTexto: v.fechaTexto,
        montoTexto: `${v.montoTotal.toFixed(2)} ${config.monedaPrincipal}`,
      });
    });

    return items;
  }, [lotes, ventas, config]);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-[#FBF9F6] dark:bg-[#150F0D]">
      <div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#2C1810] dark:text-[#F1EAE4]">
          Registro de Actividad
        </h1>
        <p className="text-xs text-[#8C6D58] dark:text-[#A0816E] mt-1">
          Historial cronológico de producciones, consumos y ventas registradas.
        </p>
      </div>

      <div className="bg-white dark:bg-[#1E1613] rounded-2xl border border-[#3E2010]/15 dark:border-[#38261E] p-5 shadow-2xs">
        <div className="space-y-4">
          {timeline.length === 0 ? (
            <p className="text-xs text-[#8C6D58] py-8 text-center">
              Aún no hay actividad registrada en el sistema.
            </p>
          ) : (
            timeline.map((act) => (
              <div
                key={act.id}
                className="flex items-start gap-3.5 pb-4 border-b border-[#3E2010]/10 last:border-b-0 last:pb-0"
              >
                <div
                  className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                    act.tipo === 'elaboracion'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                  }`}
                >
                  {act.tipo === 'elaboracion' ? (
                    <Flame className="w-4 h-4" />
                  ) : (
                    <Receipt className="w-4 h-4" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h4 className="font-display font-semibold text-xs text-[#2C1810] dark:text-[#F1EAE4]">
                      {act.titulo}
                    </h4>
                    <span className="text-[10px] text-[#8C6D58] font-mono shrink-0">
                      {act.fechaTexto}
                    </span>
                  </div>
                  <p className="text-xs text-[#5C3D2E] dark:text-[#C5A898] mt-0.5">
                    {act.detalle}
                  </p>
                  {act.montoTexto && (
                    <span className="inline-block mt-1 text-[11px] font-mono font-bold text-[#3E2010] dark:text-[#E8C39E]">
                      Monto: {act.montoTexto}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
