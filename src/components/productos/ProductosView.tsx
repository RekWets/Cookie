import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Package, Calendar, Flame, DollarSign, Layers, Plus } from 'lucide-react';

interface ProductosViewProps {
  onOpenElaborarModal: () => void;
}

export const ProductosView: React.FC<ProductosViewProps> = ({ onOpenElaborarModal }) => {
  const { lotes, setActiveNavTab, setSelectedLoteId, formatMoney } = useApp();

  const totalRestantes = useMemo(() => {
    return lotes.reduce((acc, l) => acc + l.unidadesRestantes, 0);
  }, [lotes]);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-[#FBF9F6] dark:bg-[#150F0D]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#2C1810] dark:text-[#F1EAE4]">
            Productos Terminados (Lotes)
          </h1>
          <p className="text-xs text-[#8C6D58] dark:text-[#A0816E] mt-1">
            Seguimiento de bandejas y productos horneados disponibles para la venta.
          </p>
        </div>
        <button
          onClick={onOpenElaborarModal}
          className="px-4 py-2.5 rounded-xl bg-[#3E2010] hover:bg-[#28150A] text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-all self-start sm:self-auto"
        >
          <Flame className="w-4 h-4 text-amber-400" />
          <span>+ Hornear Nuevo Lote</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {lotes.map((lote) => {
          const isAgotado = lote.unidadesRestantes === 0;

          return (
            <div
              key={lote.id}
              className="bg-white dark:bg-[#1E1613] rounded-2xl border border-[#3E2010]/15 dark:border-[#38261E] overflow-hidden p-4 flex flex-col justify-between space-y-4 shadow-2xs hover:shadow-xs transition-shadow"
            >
              <div className="flex items-center gap-3">
                <img
                  src={lote.imagen}
                  alt={lote.nombre}
                  className="w-16 h-16 rounded-xl object-cover ring-1 ring-[#3E2010]/15 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        lote.status === 'En Venta'
                          ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                      }`}
                    >
                      ● {lote.status}
                    </span>
                    <span className="text-[10px] text-[#8C6D58]">{lote.categoria}</span>
                  </div>
                  <h3 className="font-display font-bold text-sm text-[#2C1810] dark:text-[#F1EAE4] truncate mt-1">
                    {lote.nombre}
                  </h3>
                  <p className="text-[11px] text-[#8C6D58] flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3" />
                    {lote.fechaTexto}
                  </p>
                </div>
              </div>

              {/* Stats strip */}
              <div className="grid grid-cols-3 gap-2 p-2.5 bg-[#F8F6F2] dark:bg-[#261C18] rounded-xl text-center">
                <div>
                  <span className="text-[10px] text-[#7A5B49] block">Producidas:</span>
                  <span className="font-mono text-xs font-bold text-[#2C1810] dark:text-[#F1EAE4]">
                    {lote.unidadesProducidas}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#7A5B49] block">Vendidas:</span>
                  <span className="font-mono text-xs font-bold text-emerald-700">
                    {lote.unidadesVendidas}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#7A5B49] block">Restantes:</span>
                  <span
                    className={`font-mono text-xs font-bold ${
                      isAgotado ? 'text-red-600' : 'text-[#2C1810] dark:text-[#F1EAE4]'
                    }`}
                  >
                    {lote.unidadesRestantes}
                  </span>
                </div>
              </div>

              {/* Price & Action */}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-[10px] text-[#8C6D58] block">Precio de venta:</span>
                  <span className="font-mono text-sm font-bold text-[#3E2010] dark:text-[#E8C39E]">
                    {formatMoney(lote.precioVenta)}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSelectedLoteId(lote.id);
                    setActiveNavTab('ventas');
                  }}
                  className="py-2 px-3.5 bg-[#3E2010] text-white rounded-xl text-xs font-semibold hover:bg-[#28150A] transition-all shadow-xs"
                >
                  Gestionar en Ventas →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
