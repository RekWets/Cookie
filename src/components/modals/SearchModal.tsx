import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, X, Package, BookOpen, Users, Boxes, ArrowRight } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectReceta: (id: string) => void;
  onSelectLote: (id: string) => void;
  onSelectCliente: (id: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectReceta,
  onSelectLote,
  onSelectCliente,
}) => {
  const { recetas, lotes, clientes, insumos, setActiveNavTab } = useApp();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const filteredRecetas = query
    ? recetas.filter((r) => r.nombre.toLowerCase().includes(query.toLowerCase()))
    : [];

  const filteredLotes = query
    ? lotes.filter((l) => l.nombre.toLowerCase().includes(query.toLowerCase()))
    : [];

  const filteredClientes = query
    ? clientes.filter(
        (c) =>
          c.nombre.toLowerCase().includes(query.toLowerCase()) ||
          c.referencia.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const filteredInsumos = query
    ? insumos.filter((i) => i.nombre.toLowerCase().includes(query.toLowerCase()))
    : [];

  const hasResults =
    filteredRecetas.length > 0 ||
    filteredLotes.length > 0 ||
    filteredClientes.length > 0 ||
    filteredInsumos.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white dark:bg-[#1E1714] rounded-2xl shadow-2xl border border-[#3E2010]/20 dark:border-[#52301A] overflow-hidden">
        {/* Search Input bar */}
        <div className="p-4 border-b border-[#3E2010]/10 flex items-center gap-3">
          <Search className="w-5 h-5 text-[#8C6D58]" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar recetas, lotes en venta, clientes o insumos..."
            className="flex-1 text-sm bg-transparent outline-none text-[#2C1810] dark:text-[#F1EAE4] placeholder-[#8C6D58]"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#8C6D58] hover:bg-[#F1ECE4]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {!query ? (
            <p className="text-xs text-[#8C6D58] text-center py-4">
              Escribe algo para buscar en DulceGestión...
            </p>
          ) : !hasResults ? (
            <p className="text-xs text-[#8C6D58] text-center py-4">
              No se encontraron coincidencias para &quot;{query}&quot;.
            </p>
          ) : (
            <>
              {/* Lotes en Venta */}
              {filteredLotes.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-[#8C6D58]">
                    Lotes en Venta
                  </span>
                  {filteredLotes.map((lote) => (
                    <div
                      key={lote.id}
                      onClick={() => {
                        onSelectLote(lote.id);
                        onClose();
                      }}
                      className="p-2 rounded-xl hover:bg-[#FBF9F6] flex items-center justify-between cursor-pointer text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-[#8C4A27]" />
                        <span className="font-semibold text-[#2C1810] dark:text-[#F1EAE4]">
                          {lote.nombre}
                        </span>
                        <span className="text-[10px] text-[#8C6D58]">
                          ({lote.unidadesRestantes} disp.)
                        </span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#8C6D58]" />
                    </div>
                  ))}
                </div>
              )}

              {/* Recetas */}
              {filteredRecetas.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-[#8C6D58]">
                    Recetas
                  </span>
                  {filteredRecetas.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => {
                        onSelectReceta(r.id);
                        onClose();
                      }}
                      className="p-2 rounded-xl hover:bg-[#FBF9F6] flex items-center justify-between cursor-pointer text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-[#8C4A27]" />
                        <span className="font-semibold text-[#2C1810] dark:text-[#F1EAE4]">
                          {r.nombre}
                        </span>
                        <span className="text-[10px] text-[#8C6D58]">({r.categoria})</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#8C6D58]" />
                    </div>
                  ))}
                </div>
              )}

              {/* Clientes */}
              {filteredClientes.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-[#8C6D58]">
                    Clientes
                  </span>
                  {filteredClientes.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => {
                        onSelectCliente(c.id);
                        onClose();
                      }}
                      className="p-2 rounded-xl hover:bg-[#FBF9F6] flex items-center justify-between cursor-pointer text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#8C4A27]" />
                        <span className="font-semibold text-[#2C1810] dark:text-[#F1EAE4]">
                          {c.nombre}
                        </span>
                        {c.referencia && (
                          <span className="text-[10px] text-[#8C6D58]">
                            - {c.referencia}
                          </span>
                        )}
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#8C6D58]" />
                    </div>
                  ))}
                </div>
              )}

              {/* Insumos */}
              {filteredInsumos.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-[#8C6D58]">
                    Inventario (Insumos)
                  </span>
                  {filteredInsumos.map((i) => (
                    <div
                      key={i.id}
                      onClick={() => {
                        setActiveNavTab('inventario');
                        onClose();
                      }}
                      className="p-2 rounded-xl hover:bg-[#FBF9F6] flex items-center justify-between cursor-pointer text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Boxes className="w-4 h-4 text-[#8C4A27]" />
                        <span className="font-semibold text-[#2C1810] dark:text-[#F1EAE4]">
                          {i.nombre}
                        </span>
                        <span className="text-[10px] text-[#8C6D58]">
                          (Restante: {i.restante} {i.unidad})
                        </span>
                      </div>
                      <span className="text-[10px] text-[#8C6D58]">{i.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
