import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Insumo, UnitType } from '../../types';
import { X, Boxes, Package, Scale, Calculator, Info, Check } from 'lucide-react';
import { formatDualUnit, convertUnit, isWeightUnit, isVolumeUnit } from '../../utils/units';

interface InsumoModalProps {
  isOpen: boolean;
  onClose: () => void;
  insumoToEdit?: Insumo | null;
}

export const InsumoModal: React.FC<InsumoModalProps> = ({
  isOpen,
  onClose,
  insumoToEdit,
}) => {
  const { addInsumo, updateInsumo, executeWithAdminAuth, config } = useApp();

  // Tipo de registro: 'paquetes' (ej: 10 paquetes de 1kg) o 'directo' (ej: 10 kg a granel)
  const [registroPorPaquetes, setRegistroPorPaquetes] = useState<boolean>(
    Boolean(insumoToEdit?.paquetes && insumoToEdit.paquetes > 0)
  );

  const [nombre, setNombre] = useState(insumoToEdit?.nombre || '');
  const [proveedor, setProveedor] = useState(insumoToEdit?.proveedor || '');
  const [fechaCaducidad, setFechaCaducidad] = useState(
    insumoToEdit?.fechaCaducidad ||
      new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  // Campos para modo paquetes
  const [numPaquetes, setNumPaquetes] = useState<number>(insumoToEdit?.paquetes || 10);
  const [pesoPorPaquete, setPesoPorPaquete] = useState<number>(insumoToEdit?.pesoPorPaquete || 1);
  const [unidadPaquete, setUnidadPaquete] = useState<UnitType>(insumoToEdit?.unidadPaquete || 'kg');

  // Campos para modo directo
  const [cantidadDirecta, setCantidadDirecta] = useState<number>(insumoToEdit?.cantidad || 10);
  const [unidadDirecta, setUnidadDirecta] = useState<UnitType>(insumoToEdit?.unidad || 'kg');

  // Precios
  const [tipoPrecio, setTipoPrecio] = useState<'total' | 'por_paquete'>('total');
  const [precioTotal, setPrecioTotal] = useState<number>(insumoToEdit?.precio || 36.0);
  const [precioPorPaquete, setPrecioPorPaquete] = useState<number>(
    insumoToEdit?.precio && insumoToEdit?.paquetes
      ? insumoToEdit.precio / insumoToEdit.paquetes
      : 3.6
  );

  // Inicializar estado cuando se edita
  useEffect(() => {
    if (insumoToEdit) {
      setNombre(insumoToEdit.nombre);
      setProveedor(insumoToEdit.proveedor || '');
      setFechaCaducidad(insumoToEdit.fechaCaducidad);
      if (insumoToEdit.paquetes && insumoToEdit.paquetes > 0) {
        setRegistroPorPaquetes(true);
        setNumPaquetes(insumoToEdit.paquetes);
        setPesoPorPaquete(insumoToEdit.pesoPorPaquete || 1);
        setUnidadPaquete(insumoToEdit.unidadPaquete || insumoToEdit.unidad);
        setPrecioPorPaquete(insumoToEdit.precio / insumoToEdit.paquetes);
      } else {
        setRegistroPorPaquetes(false);
      }
      setCantidadDirecta(insumoToEdit.cantidad);
      setUnidadDirecta(insumoToEdit.unidad);
      setPrecioTotal(insumoToEdit.precio);
    } else {
      setNombre('');
      setProveedor('');
      setRegistroPorPaquetes(true);
      setNumPaquetes(10);
      setPesoPorPaquete(1);
      setUnidadPaquete('kg');
      setPrecioTotal(36.0);
      setPrecioPorPaquete(3.6);
      setCantidadDirecta(10);
      setUnidadDirecta('kg');
    }
  }, [insumoToEdit, isOpen]);

  // Actualizar precio total si cambia precio por paquete
  const handlePrecioPorPaqueteChange = (val: number) => {
    setPrecioPorPaquete(val);
    setPrecioTotal(parseFloat((val * numPaquetes).toFixed(2)));
  };

  const handlePrecioTotalChange = (val: number) => {
    setPrecioTotal(val);
    if (numPaquetes > 0) {
      setPrecioPorPaquete(parseFloat((val / numPaquetes).toFixed(2)));
    }
  };

  // Cálculo de totales y equivalencias
  const calculo = React.useMemo(() => {
    if (registroPorPaquetes) {
      const cantidadCalculada = numPaquetes * pesoPorPaquete;
      const unidad = unidadPaquete;
      const dual = formatDualUnit(cantidadCalculada, unidad);
      const costoUnitario = cantidadCalculada > 0 ? precioTotal / cantidadCalculada : 0;

      // Calcular costo por gramo si es peso
      let costoPorGramo = 0;
      let costoPorKg = 0;
      if (unidad === 'kg') {
        costoPorKg = costoUnitario;
        costoPorGramo = costoUnitario / 1000;
      } else if (unidad === 'gr') {
        costoPorGramo = costoUnitario;
        costoPorKg = costoUnitario * 1000;
      }

      return {
        cantidadTotal: cantidadCalculada,
        unidadPrincipal: unidad,
        dual,
        costoUnitario,
        costoPorKg,
        costoPorGramo,
      };
    } else {
      const cantidadCalculada = cantidadDirecta;
      const unidad = unidadDirecta;
      const dual = formatDualUnit(cantidadCalculada, unidad);
      const costoUnitario = cantidadCalculada > 0 ? precioTotal / cantidadCalculada : 0;

      let costoPorGramo = 0;
      let costoPorKg = 0;
      if (unidad === 'kg') {
        costoPorKg = costoUnitario;
        costoPorGramo = costoUnitario / 1000;
      } else if (unidad === 'gr') {
        costoPorGramo = costoUnitario;
        costoPorKg = costoUnitario * 1000;
      }

      return {
        cantidadTotal: cantidadCalculada,
        unidadPrincipal: unidad,
        dual,
        costoUnitario,
        costoPorKg,
        costoPorGramo,
      };
    }
  }, [
    registroPorPaquetes,
    numPaquetes,
    pesoPorPaquete,
    unidadPaquete,
    cantidadDirecta,
    unidadDirecta,
    precioTotal,
  ]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      alert('Por favor ingresa un nombre para el insumo');
      return;
    }

    if (calculo.cantidadTotal <= 0) {
      alert('La cantidad total del insumo debe ser mayor a cero');
      return;
    }

    executeWithAdminAuth(() => {
      if (insumoToEdit) {
        // En edición, preservar gastada y ajustar restante
        const nuevaGastada = insumoToEdit.gastada;
        updateInsumo({
          ...insumoToEdit,
          nombre,
          precio: precioTotal,
          cantidad: calculo.cantidadTotal,
          gastada: nuevaGastada,
          restante: Math.max(0, calculo.cantidadTotal - nuevaGastada),
          unidad: calculo.unidadPrincipal,
          fechaCaducidad,
          proveedor,
          paquetes: registroPorPaquetes ? numPaquetes : undefined,
          pesoPorPaquete: registroPorPaquetes ? pesoPorPaquete : undefined,
          unidadPaquete: registroPorPaquetes ? unidadPaquete : undefined,
          costoPorPaquete: registroPorPaquetes ? precioPorPaquete : undefined,
          costoPorUnidadBase: calculo.costoUnitario,
        });
      } else {
        addInsumo({
          nombre,
          precio: precioTotal,
          cantidad: calculo.cantidadTotal,
          unidad: calculo.unidadPrincipal,
          fechaCaducidad,
          proveedor,
          paquetes: registroPorPaquetes ? numPaquetes : undefined,
          pesoPorPaquete: registroPorPaquetes ? pesoPorPaquete : undefined,
          unidadPaquete: registroPorPaquetes ? unidadPaquete : undefined,
          costoPorPaquete: registroPorPaquetes ? precioPorPaquete : undefined,
          costoPorUnidadBase: calculo.costoUnitario,
        });
      }
      onClose();
    }, insumoToEdit ? `actualizar el insumo "${nombre}"` : `registrar el nuevo insumo "${nombre}" con control de peso`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-lg bg-white dark:bg-[#1E1714] rounded-2xl shadow-2xl border border-[#3E2010]/20 dark:border-[#52301A] overflow-hidden my-6">
        {/* Header */}
        <div className="bg-[#3E2010] text-[#FBF9F6] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Boxes className="w-5 h-5 text-[#E8C39E]" />
            <div>
              <h3 className="font-display font-bold text-base">
                {insumoToEdit ? 'Editar Insumo / Materia Prima' : 'Registrar Insumo en Inventario'}
              </h3>
              <p className="text-[11px] text-[#D8B490]">
                Control exacto de empaques, peso (Kilos/Gramos) y costos
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
          {/* Nombre */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#5C3D2E] dark:text-[#C5A898]">
              Nombre del Insumo / Producto:
            </label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Harina Leudante, Mantequilla, Azúcar Blanca..."
              className="w-full py-2 px-3 bg-[#FBF9F6] dark:bg-[#261C18] border border-[#3E2010]/20 rounded-xl text-xs font-medium text-[#2C1810] dark:text-[#F1EAE4] focus:outline-none focus:border-[#3E2010]"
            />
          </div>

          {/* Selector de modo de ingreso: Paquetes vs Cantidad directa */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#5C3D2E] dark:text-[#C5A898]">
              Modalidad de Registro de Peso / Cantidad:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRegistroPorPaquetes(true)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  registroPorPaquetes
                    ? 'bg-[#F6EFE9] dark:bg-[#2C1F19] border-[#3E2010] dark:border-[#8C522F] shadow-2xs'
                    : 'bg-white dark:bg-[#261C18] border-[#3E2010]/15 hover:bg-[#FAF8F5]'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#3E2010] dark:text-[#E8C39E]">
                  <Package className="w-4 h-4 text-amber-700" />
                  <span>Por Empaques / Paquetes</span>
                </div>
                <p className="text-[10px] text-[#8C6D58] mt-1 leading-tight">
                  Ej: 10 paquetes de 1 kg c/u = 10 kg (10.000 gr)
                </p>
              </button>

              <button
                type="button"
                onClick={() => setRegistroPorPaquetes(false)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  !registroPorPaquetes
                    ? 'bg-[#F6EFE9] dark:bg-[#2C1F19] border-[#3E2010] dark:border-[#8C522F] shadow-2xs'
                    : 'bg-white dark:bg-[#261C18] border-[#3E2010]/15 hover:bg-[#FAF8F5]'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#3E2010] dark:text-[#E8C39E]">
                  <Scale className="w-4 h-4 text-amber-700" />
                  <span>Cantidad Total Directa</span>
                </div>
                <p className="text-[10px] text-[#8C6D58] mt-1 leading-tight">
                  Ej: 25 kg a granel o 500 gr directo
                </p>
              </button>
            </div>
          </div>

          {/* Formulario específico según modalidad */}
          {registroPorPaquetes ? (
            <div className="p-3.5 bg-[#FAF7F2] dark:bg-[#251B17] rounded-xl border border-[#3E2010]/15 space-y-3">
              <div className="grid grid-cols-3 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#5C3D2E] dark:text-[#C5A898]">
                    Nº de Paquetes:
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={numPaquetes}
                    onChange={(e) => {
                      const n = parseInt(e.target.value) || 1;
                      setNumPaquetes(n);
                      if (tipoPrecio === 'por_paquete') {
                        setPrecioTotal(parseFloat((n * precioPorPaquete).toFixed(2)));
                      }
                    }}
                    placeholder="10"
                    className="w-full py-1.5 px-2 bg-white dark:bg-[#1E1714] border border-[#3E2010]/20 rounded-lg text-xs font-mono font-bold text-center"
                  />
                  <span className="text-[9px] text-[#8C6D58] block text-center">bolsas / unidades</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#5C3D2E] dark:text-[#C5A898]">
                    Peso por Paquete:
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    value={pesoPorPaquete}
                    onChange={(e) => setPesoPorPaquete(parseFloat(e.target.value) || 0)}
                    placeholder="1"
                    className="w-full py-1.5 px-2 bg-white dark:bg-[#1E1714] border border-[#3E2010]/20 rounded-lg text-xs font-mono font-bold text-center"
                  />
                  <span className="text-[9px] text-[#8C6D58] block text-center">c/u neto</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#5C3D2E] dark:text-[#C5A898]">
                    Unidad:
                  </label>
                  <select
                    value={unidadPaquete}
                    onChange={(e) => setUnidadPaquete(e.target.value as UnitType)}
                    className="w-full py-1.5 px-2 bg-white dark:bg-[#1E1714] border border-[#3E2010]/20 rounded-lg text-xs font-medium"
                  >
                    <option value="kg">Kilos (kg)</option>
                    <option value="gr">Gramos (gr)</option>
                    <option value="lt">Litros (lt)</option>
                    <option value="ml">Mililitros (ml)</option>
                    <option value="unidades">Unidades</option>
                  </select>
                </div>
              </div>

              {/* Banner de cálculo automático solicitado por el usuario */}
              <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-900/50 flex items-center justify-between text-xs">
                <span className="font-medium text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-amber-700" />
                  Total Agregado:
                </span>
                <span className="font-mono font-bold text-amber-900 dark:text-amber-300">
                  {numPaquetes} paq. × {pesoPorPaquete} {unidadPaquete} = {calculo.dual.combined}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3.5 bg-[#FAF7F2] dark:bg-[#251B17] rounded-xl border border-[#3E2010]/15 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#5C3D2E] dark:text-[#C5A898]">
                    Cantidad Total Comprada:
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={cantidadDirecta}
                    onChange={(e) => setCantidadDirecta(parseFloat(e.target.value) || 0)}
                    className="w-full py-2 px-3 bg-white dark:bg-[#1E1714] border border-[#3E2010]/20 rounded-xl text-xs font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#5C3D2E] dark:text-[#C5A898]">
                    Unidad de Medida:
                  </label>
                  <select
                    value={unidadDirecta}
                    onChange={(e) => setUnidadDirecta(e.target.value as UnitType)}
                    className="w-full py-2 px-3 bg-white dark:bg-[#1E1714] border border-[#3E2010]/20 rounded-xl text-xs font-medium"
                  >
                    <option value="kg">Kilogramos (kg)</option>
                    <option value="gr">Gramos (gr)</option>
                    <option value="lt">Litros (lt)</option>
                    <option value="ml">Mililitros (ml)</option>
                    <option value="unidades">Unidades</option>
                  </select>
                </div>
              </div>

              {/* Banner dual para modo directo */}
              <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-900/50 flex items-center justify-between text-xs">
                <span className="font-medium text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-amber-700" />
                  Equivalencia de Peso:
                </span>
                <span className="font-mono font-bold text-amber-900 dark:text-amber-300">
                  {calculo.dual.combined}
                </span>
              </div>
            </div>
          )}

          {/* Precio y Costos */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#5C3D2E] dark:text-[#C5A898]">
                Precio de Compra ({config.monedaPrincipal}):
              </label>
              {registroPorPaquetes && (
                <div className="flex items-center gap-2 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setTipoPrecio('total')}
                    className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                      tipoPrecio === 'total'
                        ? 'bg-[#3E2010] text-white'
                        : 'bg-[#EAE4DC] text-[#5C3D2E]'
                    }`}
                  >
                    Precio Total
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoPrecio('por_paquete')}
                    className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                      tipoPrecio === 'por_paquete'
                        ? 'bg-[#3E2010] text-white'
                        : 'bg-[#EAE4DC] text-[#5C3D2E]'
                    }`}
                  >
                    Precio c/u Paquete
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] text-[#7A5B49]">
                  {tipoPrecio === 'por_paquete' ? 'Precio por Paquete:' : 'Precio Total Facturado:'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={tipoPrecio === 'por_paquete' ? precioPorPaquete : precioTotal}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    if (tipoPrecio === 'por_paquete') {
                      handlePrecioPorPaqueteChange(val);
                    } else {
                      handlePrecioTotalChange(val);
                    }
                  }}
                  className="w-full py-2 px-3 bg-[#FBF9F6] dark:bg-[#261C18] border border-[#3E2010]/20 rounded-xl text-xs font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-[#7A5B49]">Fecha de Caducidad:</label>
                <input
                  type="date"
                  required
                  value={fechaCaducidad}
                  onChange={(e) => setFechaCaducidad(e.target.value)}
                  className="w-full py-2 px-3 bg-[#FBF9F6] dark:bg-[#261C18] border border-[#3E2010]/20 rounded-xl text-xs font-medium"
                />
              </div>
            </div>
          </div>

          {/* Desglose de Costo Unitario */}
          <div className="p-3 bg-[#F8F6F2] dark:bg-[#261C18] rounded-xl text-xs border border-[#3E2010]/10 space-y-1">
            <div className="flex items-center justify-between text-[#5C3D2E] dark:text-[#C5A898]">
              <span>Costo por {calculo.unidadPrincipal}:</span>
              <span className="font-mono font-bold text-[#2C1810] dark:text-[#F1EAE4]">
                {calculo.costoUnitario.toFixed(2)} {config.monedaPrincipal} / {calculo.unidadPrincipal}
              </span>
            </div>
            {isWeightUnit(calculo.unidadPrincipal) && (
              <div className="flex items-center justify-between text-[11px] text-[#8C6D58]">
                <span>Costo por gramo:</span>
                <span className="font-mono font-medium">
                  {calculo.costoPorGramo.toFixed(4)} {config.monedaPrincipal} / gr
                </span>
              </div>
            )}
          </div>

          {/* Proveedor */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#5C3D2E] dark:text-[#C5A898]">
              Proveedor / Marca / Nota (Opcional):
            </label>
            <input
              type="text"
              value={proveedor}
              onChange={(e) => setProveedor(e.target.value)}
              placeholder="Ej: Distribuidora Panadera Central, Saco sellado, etc."
              className="w-full py-2 px-3 bg-[#FBF9F6] dark:bg-[#261C18] border border-[#3E2010]/20 rounded-xl text-xs font-medium"
            />
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
              <Check className="w-4 h-4" />
              <span>Guardar Insumo</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
