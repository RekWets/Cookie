import { UnitType } from '../types';

export const isWeightUnit = (unit: UnitType): boolean => {
  return unit === 'kg' || unit === 'gr';
};

export const isVolumeUnit = (unit: UnitType): boolean => {
  return unit === 'lt' || unit === 'ml';
};

/**
 * Convierte cantidades entre unidades compatibles (kg <-> gr, lt <-> ml, unidades <-> unidades).
 * Si no son compatibles devuelve la cantidad original.
 */
export const convertUnit = (
  amount: number,
  fromUnit: UnitType,
  toUnit: UnitType
): number => {
  if (fromUnit === toUnit) return amount;

  // Peso: 1 kg = 1000 gr
  if (fromUnit === 'kg' && toUnit === 'gr') {
    return amount * 1000;
  }
  if (fromUnit === 'gr' && toUnit === 'kg') {
    return amount / 1000;
  }

  // Volumen: 1 lt = 1000 ml
  if (fromUnit === 'lt' && toUnit === 'ml') {
    return amount * 1000;
  }
  if (fromUnit === 'ml' && toUnit === 'lt') {
    return amount / 1000;
  }

  return amount;
};

/**
 * Retorna texto formateado con ambas unidades (gramos y kilos, o litros y mililitros)
 * Ej: 10 kg -> "10 kg (10.000 gr)"
 * Ej: 500 gr -> "500 gr (0,5 kg)"
 */
export const formatDualUnit = (
  amount: number,
  unit: UnitType
): {
  primary: string;
  secondary: string;
  combined: string;
} => {
  if (unit === 'kg') {
    const gr = amount * 1000;
    const grStr = gr.toLocaleString('es-VE', { maximumFractionDigits: 1 });
    const kgStr = amount.toLocaleString('es-VE', { maximumFractionDigits: 2 });
    return {
      primary: `${kgStr} kg`,
      secondary: `${grStr} gr`,
      combined: `${kgStr} kg (${grStr} gr)`,
    };
  }

  if (unit === 'gr') {
    const kg = amount / 1000;
    const kgStr = kg.toLocaleString('es-VE', { maximumFractionDigits: 3 });
    const grStr = amount.toLocaleString('es-VE', { maximumFractionDigits: 1 });
    return {
      primary: `${grStr} gr`,
      secondary: `${kgStr} kg`,
      combined: `${grStr} gr (${kgStr} kg)`,
    };
  }

  if (unit === 'lt') {
    const ml = amount * 1000;
    const mlStr = ml.toLocaleString('es-VE', { maximumFractionDigits: 1 });
    const ltStr = amount.toLocaleString('es-VE', { maximumFractionDigits: 2 });
    return {
      primary: `${ltStr} lt`,
      secondary: `${mlStr} ml`,
      combined: `${ltStr} lt (${mlStr} ml)`,
    };
  }

  if (unit === 'ml') {
    const lt = amount / 1000;
    const ltStr = lt.toLocaleString('es-VE', { maximumFractionDigits: 3 });
    const mlStr = amount.toLocaleString('es-VE', { maximumFractionDigits: 1 });
    return {
      primary: `${mlStr} ml`,
      secondary: `${ltStr} lt`,
      combined: `${mlStr} ml (${ltStr} lt)`,
    };
  }

  const unids = amount.toLocaleString('es-VE', { maximumFractionDigits: 0 });
  return {
    primary: `${unids} unids`,
    secondary: '',
    combined: `${unids} unidades`,
  };
};

/**
 * Calcula cantidad total en la unidad del insumo a partir de empaques o paquetes
 * Ej: 10 paquetes de 1 kg c/u = 10 kg
 * Ej: 10 paquetes de 500 gr c/u en unidad kg = 5 kg
 */
export const calculateTotalFromPackages = (
  paquetes: number,
  pesoPorPaquete: number,
  unidadPaquete: UnitType,
  unidadObjetivo: UnitType
): number => {
  const totalEnUnidadPaquete = paquetes * pesoPorPaquete;
  return convertUnit(totalEnUnidadPaquete, unidadPaquete, unidadObjetivo);
};
