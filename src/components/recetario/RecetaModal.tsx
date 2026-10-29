import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Receta, IngredienteReceta, UnitType } from '../../types';
import {
  X,
  Plus,
  Clock,
  Sparkles,
  Trash2,
  Image as ImageIcon,
  Check,
  Scale,
  Coins,
  Calculator,
} from 'lucide-react';
import { formatDualUnit, convertUnit, isWeightUnit, isVolumeUnit } from '../../utils/units';

interface RecetaModalProps {
  isOpen: boolean;
  onClose: () => void;
  recetaToEdit?: Receta | null;
}

export const RecetaModal: React.FC<RecetaModalProps> = ({
  isOpen,
  onClose,
  recetaToEdit,
}) => {
  const { insumos, addReceta, updateReceta, executeWithAdminAuth, config } = useApp();

  const [nombre, setNombre] = useState(recetaToEdit ? recetaToEdit.nombre : '');
  const [categoria, setCategoria] = useState<Receta['categoria']>(
    recetaToEdit ? recetaToEdit.categoria : 'Cookie'
  );
  const [tiempo, setTiempo] = useState(recetaToEdit ? recetaToEdit.tiempo : '30 min');
  const [imagen, setImagen] = useState(
    recetaToEdit
      ? recetaToEdit.imagen
      : '/src/assets/images/galletas_chocolate_1792170725059.jpg'
  );
  const [porcionesBase, setPorcionesBase] = useState(
    recetaToEdit ? recetaToEdit.porcionesBase : 24
  );
  const [precioSugeridoVenta, setPrecioSugeridoVenta] = useState(
    recetaToEdit ? recetaToEdit.precioSugeridoVenta : 15.0
  );
  const [descripcion, setDescripcion] = useState(recetaToEdit?.descripcion || '');

  // Builder de Ingredientes
  const [ingredientes, setIngredientes] = useState<IngredienteReceta[]>(
    recetaToEdit ? recetaToEdit.ingredientes : []
  );
  const [selectedInsumoId, setSelectedInsumoId] = useState<string>(
    insumos[0]?.id || ''
  );
  const [ingredienteCantidad, setIngredienteCantidad] = useState<number>(1);
  const [ingredienteUnidad, setIngredienteUnidad] = useState<UnitType>('kg');

  if (!isOpen) return null;

  const handleAddIngrediente = () => {
    const insumo = insumos.find((i) => i.id === selectedInsumoId);
    if (!insumo) return;
    if (ingredienteCantidad <= 0) return;

    setIngredientes((prev) => [
      ...prev,
      {
        insumoId: insumo.id,
        nombre: insumo.nombre,
        cantidad: ingredienteCantidad,
        unidad: ingredienteUnidad,
      },
    ]);

    // Reset ingredient form
    setIngredienteCantidad(1);
  };

  const handleRemoveIngrediente = (index: number) => {
    setIngredientes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      alert('Por favor ingresa un nombre para la receta');
      return;
    }
    if (ingredientes.length === 0) {
      alert('Por favor agrega al menos un ingrediente para la receta');
      return;
    }

    executeWithAdminAuth(() => {
      if (recetaToEdit) {
        updateReceta({
          ...recetaToEdit,
          nombre,
          categoria,
          tiempo,
          imagen,
          porcionesBase,
          precioSugeridoVenta,
          descripcion,
          ingredientes,
        });
      } else {
        addReceta({
          nombre,
          categoria,
          tiempo,
          imagen,
          porcionesBase,
          precioSugeridoVenta,
          descripcion,
          ingredientes,
          escalas: [
            { id: 'esc-1', etiqueta: '1x Estándar', multiplicador: 1.0, porciones: porcionesBase },
            { id: 'esc-2', etiqueta: '2x Doble', multiplicador: 2.0, porciones: porcionesBase * 2 },
          ],
        });
      }
      onClose();
    }, recetaToEdit ? `actualizar la receta "${nombre}"` : `registrar la nueva receta "${nombre}"`);
  };

  const presetImages = [
    { label: 'Galletas Choc', url: '/src/assets/images/galletas_chocolate_1792170725059.jpg' },
    { label: 'Torta Auyama', url: '/src/assets/images/torta_auyama_1792170725115.jpg' },
    { label: 'Torta Choc', url: '/src/assets/images/torta_chocolate_1792170724704.jpg' },
    { label: 'Marquesa', url: '/src/assets/images/marquesa_chocolate_1792170727074.jpg' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-2xl bg-white dark:bg-[#1E1714] rounded-2xl shadow-2xl border border-[#3E2010]/20 dark:border-[#52301A] overflow-hidden my-6">
        {/* Header */}
        <div className="bg-[#3E2010] text-[#FBF9F6] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-display font-bold text-base">
              {recetaToEdit ? 'Editar Receta' : 'Formulario de Registro de Receta'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#D8B490] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Preset Image selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#5C3D2E] dark:text-[#C5A898] flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Imagen de la Receta:</span>
            </label>
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {presetImages.map((img) => (
                <button
                  type="button"
                  key={img.url}
                  onClick={() => setImagen(img.url)}
                  className={`relative shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                    imagen === img.url
                      ? 'border-[#3E2010] scale-105 shadow-md'
                      : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt={img.label} className="w-16 h-16 object-cover" />
                  {imagen === img.url && (
                    <div className="absolute inset-0 bg-[#3E2010]/40 flex items-center justify-center text-white">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={imagen}
              onChange={(e) => setImagen(e.target.value)}
              placeholder="O ingresa URL de imagen personalizada..."
              className="w-full text-xs py-2 px-3 bg-[#FBF9F6] dark:bg-[#261C18] border border-[#3E2010]/20 rounded-xl"
            />
          </div>

          {/* Form Fields: Nombre, Tiempo, Categoria */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1 space-y-1">
              <label className="text-[11px] font-semibold text-[#5C3D2E] dark:text-[#C5A898]">
                Nombre de la Receta:
              </label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Galletas de Chocolate"
                className="w-full py-2 px-3 bg-[#FBF9F6] dark:bg-[#261C18] border border-[#3E2010]/20 rounded-xl text-xs font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#5C3D2E] dark:text-[#C5A898]">
                Tiempo:
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={tiempo}
                  onChange={(e) => setTiempo(e.target.value)}
                  placeholder="Ej: 20 min"
                  className="w-full py-2 pl-7 pr-3 bg-[#FBF9F6] dark:bg-[#261C18] border border-[#3E2010]/20 rounded-xl text-xs font-medium"
                />
                <Clock className="w-3.5 h-3.5 text-[#8C6D58] absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#5C3D2E] dark:text-[#C5A898]">
                Categoría:
              </label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as Receta['categoria'])}
                className="w-full py-2 px-3 bg-[#FBF9F6] dark:bg-[#261C18] border border-[#3E2010]/20 rounded-xl text-xs font-medium"
              >
                <option value="Cookie">Cookie</option>
                <option value="Cake">Cake</option>
                <option value="Brownie">Brownie</option>
                <option value="Tarta">Tarta</option>
                <option value="Postre Frío">Postre Frío</option>
                <option value="Panadería">Panadería</option>
              </select>
            </div>
          </div>

          {/* Porciones base y Precio sugerido */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#5C3D2E] dark:text-[#C5A898]">
                Porciones / Unidades que rinde:
              </label>
              <input
                type="number"
                min={1}
                value={porcionesBase}
                onChange={(e) => setPorcionesBase(parseInt(e.target.value) || 1)}
                className="w-full py-2 px-3 bg-[#FBF9F6] dark:bg-[#261C18] border border-[#3E2010]/20 rounded-xl text-xs font-mono font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#5C3D2E] dark:text-[#C5A898]">
                Precio Sugerido Venta c/u ({config.monedaPrincipal}):
              </label>
              <input
                type="number"
                step="0.5"
                min={0}
                value={precioSugeridoVenta}
                onChange={(e) => setPrecioSugeridoVenta(parseFloat(e.target.value) || 0)}
                className="w-full py-2 px-3 bg-[#FBF9F6] dark:bg-[#261C18] border border-[#3E2010]/20 rounded-xl text-xs font-mono font-medium"
              />
            </div>
          </div>

          {/* Ingredientes Builder (Screenshots 9-13) */}
          <div className="space-y-2 pt-2 border-t border-[#3E2010]/10">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#2C1810] dark:text-[#F1EAE4] flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-amber-700" />
                <span>Ingredientes Requeridos (Kilos / Gramos / Litros / Unidades)</span>
              </h4>
              <span className="text-[10px] text-[#8C6D58]">
                Conversión automática de peso y volumen
              </span>
            </div>

            <div className="p-3 bg-[#F8F6F2] dark:bg-[#261C18] rounded-xl border border-[#3E2010]/10 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] text-[#7A5B49] font-medium">Producto (Insumo):</label>
                  <select
                    value={selectedInsumoId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setSelectedInsumoId(id);
                      const ins = insumos.find((i) => i.id === id);
                      if (ins) {
                        setIngredienteUnidad(ins.unidad);
                      }
                    }}
                    className="w-full py-1.5 px-2 bg-white dark:bg-[#1E1714] border border-[#3E2010]/20 rounded-lg text-xs"
                  >
                    {insumos.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.nombre} (Disp: {formatDualUnit(i.restante, i.unidad).combined})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-[#7A5B49] font-medium">Cantidad:</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={ingredienteCantidad}
                    onChange={(e) => setIngredienteCantidad(parseFloat(e.target.value) || 0)}
                    className="w-full py-1.5 px-2 bg-white dark:bg-[#1E1714] border border-[#3E2010]/20 rounded-lg text-xs font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-[#7A5B49] font-medium">Unidad:</label>
                  <div className="flex gap-1">
                    <select
                      value={ingredienteUnidad}
                      onChange={(e) => setIngredienteUnidad(e.target.value as UnitType)}
                      className="flex-1 py-1.5 px-2 bg-white dark:bg-[#1E1714] border border-[#3E2010]/20 rounded-lg text-xs font-medium"
                    >
                      <option value="kg">kg (kilos)</option>
                      <option value="gr">gr (gramos)</option>
                      <option value="lt">lt (litros)</option>
                      <option value="ml">ml (mililitros)</option>
                      <option value="unidades">unidades</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleAddIngrediente}
                      className="px-3 py-1.5 bg-[#3E2010] text-white rounded-lg text-xs font-semibold hover:bg-[#28150A] shadow-xs"
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              </div>

              {/* Vista previa de conversión en tiempo real */}
              {ingredienteCantidad > 0 && (
                <div className="flex items-center justify-between px-2.5 py-1.5 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200/60 dark:border-amber-900/40 text-[11px]">
                  <span className="text-amber-950 dark:text-amber-200 font-medium">
                    Especificado para la receta:
                  </span>
                  <span className="font-mono font-bold text-amber-900 dark:text-amber-300">
                    {formatDualUnit(ingredienteCantidad, ingredienteUnidad).combined}
                  </span>
                </div>
              )}
            </div>

            {/* Lista de Productos Agregados a la Receta */}
            <div className="space-y-1.5 max-h-52 overflow-y-auto">
              {ingredientes.length === 0 ? (
                <p className="text-xs text-[#8C6D58] py-3 text-center bg-[#FBF9F6] rounded-xl border border-dashed border-[#3E2010]/15">
                  Aún no has agregado ingredientes a esta receta. Selecciona productos arriba.
                </p>
              ) : (
                ingredientes.map((ing, idx) => {
                  const insumo = insumos.find((i) => i.id === ing.insumoId);
                  const cantEnInsumo = insumo
                    ? convertUnit(ing.cantidad, ing.unidad, insumo.unidad)
                    : ing.cantidad;
                  const costoEstimado = insumo ? cantEnInsumo * insumo.costoPorUnidadBase : 0;
                  const dual = formatDualUnit(ing.cantidad, ing.unidad);

                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 bg-[#FBF9F6] dark:bg-[#231A16] rounded-xl border border-[#3E2010]/10 text-xs"
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold text-[#2C1810] dark:text-[#F1EAE4]">
                          {ing.nombre}
                        </span>
                        <span className="text-[10px] text-[#8C6D58] font-mono">
                          Costo aprox: {costoEstimado.toFixed(2)} {config.monedaPrincipal}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="font-mono font-bold text-[#5C3D2E] dark:text-[#C5A898] block">
                            {dual.primary}
                          </span>
                          {dual.secondary && (
                            <span className="text-[10px] text-[#8C6D58] font-mono block">
                              ({dual.secondary})
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveIngrediente(idx)}
                          className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                          title="Eliminar ingrediente"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#3E2010]/10">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 text-xs font-medium text-[#6B4B38] bg-[#F1ECE4] rounded-xl hover:bg-[#E7DFD4]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="py-2.5 px-6 text-xs font-semibold text-white bg-[#3E2010] hover:bg-[#2C160B] rounded-xl shadow-xs"
            >
              Guardar Receta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
