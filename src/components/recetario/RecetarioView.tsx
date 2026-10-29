import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Receta } from '../../types';
import {
  Search,
  Plus,
  Clock,
  Flame,
  Cookie,
  Cake,
  Sparkles,
  Edit2,
  Trash2,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface RecetarioViewProps {
  onOpenNewRecetaModal: () => void;
  onOpenEditRecetaModal: (receta: Receta) => void;
  onOpenElaborarModal: (recetaId: string) => void;
}

export const RecetarioView: React.FC<RecetarioViewProps> = ({
  onOpenNewRecetaModal,
  onOpenEditRecetaModal,
  onOpenElaborarModal,
}) => {
  const { recetas, deleteReceta, executeWithAdminAuth, formatMoney } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'Todas', icon: '✨' },
    { id: 'Cookie', label: 'Cookies', icon: '🍪' },
    { id: 'Cake', label: 'Cakes', icon: '🍰' },
    { id: 'Brownie', label: 'Brownie', icon: '🍫' },
    { id: 'Tarta', label: 'Tartas', icon: '🥧' },
    { id: 'Postre Frío', label: 'Postres Fríos', icon: '🍮' },
    { id: 'Panadería', label: 'Panadería', icon: '🥐' },
  ];

  const filteredRecetas = useMemo(() => {
    return recetas.filter((r) => {
      const matchSearch =
        r.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.categoria.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory =
        selectedCategory === 'all' || r.categoria === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [recetas, searchTerm, selectedCategory]);

  const recientes = useMemo(() => {
    return recetas.slice(0, 3);
  }, [recetas]);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-7 bg-[#FBF9F6] dark:bg-[#150F0D]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#2C1810] dark:text-[#F1EAE4]">
            Recetario
          </h1>
          <p className="text-xs text-[#8C6D58] dark:text-[#A0816E] mt-1">
            Registre meticulosamente tus exquisitos productos de pastelería para su negocio.
          </p>
        </div>
        <button
          onClick={onOpenNewRecetaModal}
          className="px-4 py-2.5 rounded-xl bg-[#3E2010] hover:bg-[#28150A] text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nueva Receta</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar receta o categoría..."
          className="w-full py-2.5 pl-9 pr-4 bg-white dark:bg-[#1E1613] border border-[#3E2010]/15 dark:border-[#38261E] rounded-xl text-xs text-[#2C1810] dark:text-[#F1EAE4] outline-none focus:border-[#3E2010]"
        />
        <Search className="w-4 h-4 text-[#8C6D58] absolute left-3 top-3" />
      </div>

      {/* Categories Bar (Screenshots 9 & 10) */}
      <div className="space-y-2">
        <h3 className="font-display font-bold text-xs uppercase tracking-wider text-[#8C6D58] dark:text-[#A0816E]">
          Categorías
        </h3>
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl min-w-[76px] transition-all border ${
                  isSelected
                    ? 'bg-[#3E2010] text-[#FBF9F6] border-[#3E2010] shadow-sm'
                    : 'bg-white dark:bg-[#1E1613] text-[#5C3D2E] dark:text-[#C5A898] border-[#3E2010]/10 hover:border-[#3E2010]/20'
                }`}
              >
                <span className="text-xl mb-1">{cat.icon}</span>
                <span className="text-[11px] font-semibold">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section: Mas Recientes (Screenshots 9 & 10) */}
      {selectedCategory === 'all' && !searchTerm && (
        <div className="space-y-3">
          <h3 className="font-display font-bold text-xs uppercase tracking-wider text-[#8C6D58] dark:text-[#A0816E]">
            Mas Recientes
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recientes.map((receta) => (
              <div
                key={receta.id}
                className="group relative bg-white dark:bg-[#1E1613] rounded-2xl overflow-hidden border border-[#3E2010]/15 dark:border-[#38261E] shadow-2xs hover:shadow-md transition-all flex flex-col"
              >
                <div className="relative h-44 w-full overflow-hidden bg-[#2C1810]">
                  <img
                    src={receta.imagen}
                    alt={receta.nombre}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Floating Badges */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/60 text-white backdrop-blur-xs flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-300" />
                      {receta.tiempo}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#3E2010]/80 text-[#E8C39E] backdrop-blur-xs">
                      {receta.categoria}
                    </span>
                  </div>
                  <div className="absolute top-2.5 right-2.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-700/80 text-white backdrop-blur-xs">
                      En venta
                    </span>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="font-display font-bold text-base text-[#2C1810] dark:text-[#F1EAE4]">
                      {receta.nombre}
                    </h4>
                    <p className="text-xs text-[#8C6D58] line-clamp-2 mt-0.5">
                      {receta.descripcion || `${receta.ingredientes.length} ingredientes configurados`}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#3E2010]/10 text-xs">
                    <span className="text-[#8C6D58]">
                      Rinde:{' '}
                      <strong className="text-[#2C1810] dark:text-[#F1EAE4]">
                        {receta.porcionesBase} porciones
                      </strong>
                    </span>
                    <span className="font-mono font-bold text-[#3E2010] dark:text-[#E8C39E]">
                      {formatMoney(receta.precioSugeridoVenta)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => onOpenElaborarModal(receta.id)}
                      className="flex-1 py-2 px-3 rounded-xl bg-[#3E2010] text-white text-xs font-semibold hover:bg-[#28150A] active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      <span>Hornear / Elaborar</span>
                    </button>
                    <button
                      onClick={() => onOpenEditRecetaModal(receta)}
                      className="p-2 rounded-xl text-[#5C3D2E] hover:bg-[#F1ECE4] dark:hover:bg-[#2A1F1B] border border-[#3E2010]/15"
                      title="Editar receta"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section: Tus Recetas (All) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-xs uppercase tracking-wider text-[#8C6D58] dark:text-[#A0816E]">
            Tus Recetas ({filteredRecetas.length})
          </h3>
        </div>

        {filteredRecetas.length === 0 ? (
          <div className="py-12 text-center bg-white dark:bg-[#1E1613] rounded-2xl border border-dashed border-[#3E2010]/20">
            <p className="text-xs text-[#8C6D58]">No se encontraron recetas con ese criterio.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRecetas.map((receta) => (
              <div
                key={receta.id}
                className="bg-white dark:bg-[#1E1613] rounded-2xl border border-[#3E2010]/15 dark:border-[#38261E] overflow-hidden p-4 flex flex-col justify-between space-y-3 shadow-2xs hover:shadow-xs transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={receta.imagen}
                    alt={receta.nombre}
                    className="w-16 h-16 rounded-xl object-cover ring-1 ring-[#3E2010]/15 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-semibold text-[#8C6D58] uppercase">
                      {receta.categoria}
                    </span>
                    <h4 className="font-display font-bold text-sm text-[#2C1810] dark:text-[#F1EAE4] truncate">
                      {receta.nombre}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-[#8C6D58]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {receta.tiempo}
                      </span>
                      <span>•</span>
                      <span>{receta.porcionesBase} porc.</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#3E2010]/10 text-xs">
                  <span className="text-[11px] text-[#8C6D58]">
                    {receta.ingredientes.length} ingredientes
                  </span>
                  <span className="font-mono font-bold text-[#3E2010] dark:text-[#E8C39E]">
                    {formatMoney(receta.precioSugeridoVenta)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenElaborarModal(receta.id)}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-[#3E2010] text-white text-xs font-semibold hover:bg-[#28150A] active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>Hornear</span>
                  </button>
                  <button
                    onClick={() => onOpenEditRecetaModal(receta)}
                    className="p-1.5 rounded-lg text-[#5C3D2E] hover:bg-[#F1ECE4] border border-[#3E2010]/15"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      executeWithAdminAuth(() => {
                        if (confirm(`¿Eliminar la receta "${receta.nombre}"?`)) {
                          deleteReceta(receta.id);
                        }
                      }, `eliminar la receta "${receta.nombre}"`);
                    }}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 border border-red-200"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
