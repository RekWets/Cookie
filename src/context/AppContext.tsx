import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Insumo,
  Receta,
  LoteProducto,
  Venta,
  Cliente,
  ConfiguracionApp,
  MaterialGastado,
  VentaStatus,
  MetodoPago,
} from '../types';
import {
  initialConfig,
  initialInsumos,
  initialRecetas,
  initialClientes,
  initialLotes,
  initialVentas,
} from '../data/initialData';
import { convertUnit, formatDualUnit } from '../utils/units';

interface AppContextType {
  // Estado
  config: ConfiguracionApp;
  insumos: Insumo[];
  recetas: Receta[];
  lotes: LoteProducto[];
  ventas: Venta[];
  clientes: Cliente[];
  isAdminUnlocked: boolean;
  selectedLoteId: string | null;
  activeNavTab: string;
  isDarkMode: boolean;

  // Acciones de Navegación y UI
  setActiveNavTab: (tab: string) => void;
  setSelectedLoteId: (id: string | null) => void;
  toggleDarkMode: () => void;

  // Formato monetario
  formatMoney: (amount: number, forceCurrency?: 'Bs' | '$') => string;
  convertCurrency: (amount: number, from: 'Bs' | '$', to: 'Bs' | '$') => number;

  // Seguridad / Clave Admin
  verifyAdminPin: (pin: string) => boolean;
  lockAdmin: () => void;
  unlockAdmin: (pin: string) => boolean;
  executeWithAdminAuth: (action: () => void, actionDescription?: string) => void;

  // Operaciones Insumos
  addInsumo: (insumo: Omit<Insumo, 'id' | 'gastada' | 'restante' | 'status' | 'createdAt'>) => void;
  updateInsumo: (insumo: Insumo) => void;
  deleteInsumo: (id: string) => void;
  restockInsumo: (id: string, additionalAmount: number, additionalCost: number) => void;

  // Operaciones Recetas
  addReceta: (receta: Omit<Receta, 'id' | 'createdAt'>) => void;
  updateReceta: (receta: Receta) => void;
  deleteReceta: (id: string) => void;

  // Elaboración / Producción
  elaborarReceta: (
    recetaId: string,
    unidadesReales: number,
    escalaEtiqueta: string,
    multiplicador: number
  ) => { success: boolean; error?: string; lote?: LoteProducto };

  // Operaciones Lotes
  updateLote: (lote: LoteProducto) => void;
  deleteLote: (id: string) => void;

  // Operaciones Ventas
  addVenta: (venta: Omit<Venta, 'id' | 'fecha' | 'fechaTexto'>) => void;
  updateVentaStatus: (ventaId: string, newStatus: VentaStatus, pagadasCount?: number) => void;
  editVentaPayment: (
    ventaId: string,
    updates: {
      unidadesPagadas: number;
      metodoPago?: MetodoPago;
      referenciaPago?: string;
      nota?: string;
    }
  ) => void;
  deleteVenta: (id: string) => void;

  // Operaciones Clientes
  addCliente: (cliente: Omit<Cliente, 'id' | 'totalComprado' | 'totalDeuda' | 'createdAt'>) => Cliente;
  updateCliente: (cliente: Cliente) => void;
  deleteCliente: (id: string) => void;

  // Configuración & Backup
  updateConfig: (newConfig: Partial<ConfiguracionApp>) => void;
  resetToDefaults: () => void;
  exportDatabaseJson: () => string;
  importDatabaseJson: (jsonString: string) => boolean;

  // Modal Auth Admin
  adminAuthModalOpen: boolean;
  adminAuthDescription: string;
  closeAdminAuthModal: () => void;

  // Recuperación de PIN por Correo
  recoveryEmailNotification: {
    to: string;
    pin: string;
    timestamp: string;
    subject: string;
  } | null;
  sendRecoveryEmail: (customEmail?: string) => { success: boolean; pin: string; email: string };
  dismissRecoveryNotification: () => void;
  assignedRecoveryPin: string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CONFIG: 'dg_config_v1',
  INSUMOS: 'dg_insumos_v1',
  RECETAS: 'dg_recetas_v1',
  LOTES: 'dg_lotes_v1',
  VENTAS: 'dg_ventas_v1',
  CLIENTES: 'dg_clientes_v1',
  DARK_MODE: 'dg_dark_mode_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Configuración
  const [config, setConfig] = useState<ConfiguracionApp>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
    return saved ? JSON.parse(saved) : initialConfig;
  });

  // Insumos
  const [insumos, setInsumos] = useState<Insumo[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INSUMOS);
    return saved ? JSON.parse(saved) : initialInsumos;
  });

  // Recetas
  const [recetas, setRecetas] = useState<Receta[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RECETAS);
    return saved ? JSON.parse(saved) : initialRecetas;
  });

  // Lotes en Venta
  const [lotes, setLotes] = useState<LoteProducto[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOTES);
    return saved ? JSON.parse(saved) : initialLotes;
  });

  // Ventas
  const [ventas, setVentas] = useState<Venta[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.VENTAS);
    return saved ? JSON.parse(saved) : initialVentas;
  });

  // Clientes
  const [clientes, setClientes] = useState<Cliente[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CLIENTES);
    return saved ? JSON.parse(saved) : initialClientes;
  });

  // UI State
  const [activeNavTab, setActiveNavTab] = useState<string>('ventas');
  const [selectedLoteId, setSelectedLoteId] = useState<string | null>('lote-1');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
    return saved ? JSON.parse(saved) : false;
  });

  // Admin PIN Auth State
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(false);
  const [adminAuthModalOpen, setAdminAuthModalOpen] = useState<boolean>(false);
  const [adminAuthDescription, setAdminAuthDescription] = useState<string>('');
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // Recuperación de PIN por Correo
  const [assignedRecoveryPin, setAssignedRecoveryPin] = useState<string | null>(null);
  const [recoveryEmailNotification, setRecoveryEmailNotification] = useState<{
    to: string;
    pin: string;
    timestamp: string;
    subject: string;
  } | null>(null);

  // Guardar en localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INSUMOS, JSON.stringify(insumos));
  }, [insumos]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RECETAS, JSON.stringify(recetas));
  }, [recetas]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOTES, JSON.stringify(lotes));
  }, [lotes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VENTAS, JSON.stringify(ventas));
  }, [ventas]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLIENTES, JSON.stringify(clientes));
  }, [clientes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DARK_MODE, JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  // Formato monetario
  const formatMoney = useCallback(
    (amount: number, forceCurrency?: 'Bs' | '$'): string => {
      const curr = forceCurrency || config.monedaPrincipal;
      const numStr = amount.toLocaleString('es-VE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      if (curr === '$') {
        return `$ ${numStr}`;
      }
      return `${numStr} Bs`;
    },
    [config.monedaPrincipal]
  );

  const convertCurrency = useCallback(
    (amount: number, from: 'Bs' | '$', to: 'Bs' | '$'): number => {
      if (from === to) return amount;
      const rate = config.tasaCambioBsUSD || 40.0;
      if (from === 'Bs' && to === '$') return amount / rate;
      return amount * rate;
    },
    [config.tasaCambioBsUSD]
  );

  // Enviar PIN asignado al correo electrónico del Administrador
  const sendRecoveryEmail = useCallback(
    (customEmail?: string) => {
      const targetEmail = (customEmail || config.emailAdmin || 'thewest201013@gmail.com').trim();
      // Generar PIN asignado de 6 dígitos
      const generatedPin = Math.floor(100000 + Math.random() * 900000).toString();
      setAssignedRecoveryPin(generatedPin);

      const now = new Date();
      const timeStr = now.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' });
      const notif = {
        to: targetEmail,
        pin: generatedPin,
        timestamp: timeStr,
        subject: 'Clave / PIN Asignado de Administrador - DulceGestión',
      };
      setRecoveryEmailNotification(notif);

      return {
        success: true,
        pin: generatedPin,
        email: targetEmail,
      };
    },
    [config.emailAdmin]
  );

  const dismissRecoveryNotification = useCallback(() => {
    setRecoveryEmailNotification(null);
  }, []);

  // Seguridad Admin
  const verifyAdminPin = useCallback(
    (pin: string): boolean => {
      const cleanInput = pin.trim();
      const isMasterPin = cleanInput === config.claveAdmin.trim();
      const isAssignedPin = Boolean(assignedRecoveryPin && cleanInput === assignedRecoveryPin.trim());
      return isMasterPin || isAssignedPin;
    },
    [config.claveAdmin, assignedRecoveryPin]
  );

  const unlockAdmin = useCallback(
    (pin: string): boolean => {
      if (verifyAdminPin(pin)) {
        setIsAdminUnlocked(true);
        if (pendingAction) {
          pendingAction();
          setPendingAction(null);
        }
        setAdminAuthModalOpen(false);
        return true;
      }
      return false;
    },
    [verifyAdminPin, pendingAction]
  );

  const lockAdmin = () => {
    setIsAdminUnlocked(false);
  };

  const executeWithAdminAuth = useCallback(
    (action: () => void, actionDescription?: string) => {
      if (isAdminUnlocked) {
        action();
      } else {
        setPendingAction(() => action);
        setAdminAuthDescription(actionDescription || 'autorizar esta operación en el sistema');
        setAdminAuthModalOpen(true);
      }
    },
    [isAdminUnlocked]
  );

  const closeAdminAuthModal = () => {
    setAdminAuthModalOpen(false);
    setPendingAction(null);
  };

  // Helper para recalcular status de insumo
  const calculateInsumoStatus = (restante: number, cantidad: number) => {
    if (restante <= 0) return 'Agotado';
    if (restante <= cantidad * 0.25 || restante <= 2) return 'Por agotarse';
    return 'Disponible';
  };

  // Insumos CRUD
  const addInsumo = (
    newInsumoData: Omit<Insumo, 'id' | 'gastada' | 'restante' | 'status' | 'createdAt'>
  ) => {
    const restante = newInsumoData.cantidad;
    const status = calculateInsumoStatus(restante, newInsumoData.cantidad);
    const costoUnit =
      newInsumoData.cantidad > 0 ? newInsumoData.precio / newInsumoData.cantidad : newInsumoData.precio;

    const newInsumo: Insumo = {
      ...newInsumoData,
      id: `ins-${Date.now()}`,
      gastada: 0,
      restante,
      status,
      costoPorUnidadBase: costoUnit,
      createdAt: new Date().toISOString(),
    };

    setInsumos((prev) => [newInsumo, ...prev]);
  };

  const updateInsumo = (updated: Insumo) => {
    const restante = Math.max(0, updated.cantidad - updated.gastada);
    const status = calculateInsumoStatus(restante, updated.cantidad);
    setInsumos((prev) =>
      prev.map((item) =>
        item.id === updated.id
          ? {
              ...updated,
              restante,
              status,
              costoPorUnidadBase:
                updated.cantidad > 0 ? updated.precio / updated.cantidad : updated.costoPorUnidadBase,
            }
          : item
      )
    );
  };

  const deleteInsumo = (id: string) => {
    setInsumos((prev) => prev.filter((item) => item.id !== id));
  };

  const restockInsumo = (id: string, additionalAmount: number, additionalCost: number) => {
    setInsumos((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const newCantidad = item.cantidad + additionalAmount;
        const newPrecio = item.precio + additionalCost;
        const newRestante = item.restante + additionalAmount;
        const newStatus = calculateInsumoStatus(newRestante, newCantidad);
        const newCostoBase = newCantidad > 0 ? newPrecio / newCantidad : item.costoPorUnidadBase;
        return {
          ...item,
          cantidad: newCantidad,
          precio: newPrecio,
          restante: newRestante,
          status: newStatus,
          costoPorUnidadBase: newCostoBase,
        };
      })
    );
  };

  // Recetas CRUD
  const addReceta = (newRecetaData: Omit<Receta, 'id' | 'createdAt'>) => {
    const newReceta: Receta = {
      ...newRecetaData,
      id: `rec-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setRecetas((prev) => [newReceta, ...prev]);
  };

  const updateReceta = (updated: Receta) => {
    setRecetas((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  const deleteReceta = (id: string) => {
    setRecetas((prev) => prev.filter((r) => r.id !== id));
  };

  // Elaboración / Hornear Receta
  const elaborarReceta = (
    recetaId: string,
    unidadesReales: number,
    escalaEtiqueta: string,
    multiplicador: number
  ) => {
    const receta = recetas.find((r) => r.id === recetaId);
    if (!receta) return { success: false, error: 'Receta no encontrada' };

    // Validar existencias de insumos
    const faltantes: string[] = [];
    const materialesGastados: MaterialGastado[] = [];
    let costoTotalMateriales = 0;

    for (const ing of receta.ingredientes) {
      const insumo = insumos.find((i) => i.id === ing.insumoId);
      const cantidadNecesaria = ing.cantidad * multiplicador;

      if (!insumo) {
        faltantes.push(`${ing.nombre} (No existe en inventario)`);
        continue;
      }

      // Convertir la cantidad requerida en la receta a la unidad base del insumo
      const cantidadEnUnidadInsumo = convertUnit(cantidadNecesaria, ing.unidad, insumo.unidad);

      if (insumo.restante < cantidadEnUnidadInsumo) {
        const dualNecesaria = formatDualUnit(cantidadEnUnidadInsumo, insumo.unidad).combined;
        const dualDisponible = formatDualUnit(insumo.restante, insumo.unidad).combined;
        faltantes.push(
          `${insumo.nombre}: Requiere ${dualNecesaria}, disponible ${dualDisponible}`
        );
      }

      // Costo por unidad base de inventario
      const costoItem = cantidadEnUnidadInsumo * insumo.costoPorUnidadBase;
      costoTotalMateriales += costoItem;
      materialesGastados.push({
        insumoId: insumo.id,
        nombre: insumo.nombre,
        cantidadGastada: cantidadNecesaria,
        unidad: ing.unidad,
        cantidadDeducidaInsumo: cantidadEnUnidadInsumo,
        unidadInsumo: insumo.unidad,
        costo: costoItem,
      });
    }

    if (faltantes.length > 0) {
      return {
        success: false,
        error: `Insumos insuficientes:\n• ${faltantes.join('\n• ')}`,
      };
    }

    // Deducir insumos en tiempo real usando la cantidad convertida
    setInsumos((prevInsumos) =>
      prevInsumos.map((ins) => {
        const match = materialesGastados.find((m) => m.insumoId === ins.id);
        if (!match) return ins;

        const deduccion =
          match.cantidadDeducidaInsumo !== undefined
            ? match.cantidadDeducidaInsumo
            : match.cantidadGastada;
        const newGastada = ins.gastada + deduccion;
        const newRestante = Math.max(0, ins.cantidad - newGastada);
        const newStatus = calculateInsumoStatus(newRestante, ins.cantidad);
        return {
          ...ins,
          gastada: newGastada,
          restante: newRestante,
          status: newStatus,
        };
      })
    );

    // Calcular finanzas
    const now = new Date();
    const fechaTexto = `${now.toLocaleDateString('es-VE')} - ${now.toLocaleTimeString('es-VE', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
    const meses = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];
    const mesCarpeta = meses[now.getMonth()];

    const precioVenta = receta.precioSugeridoVenta;
    const costoUnitario = unidadesReales > 0 ? costoTotalMateriales / unidadesReales : 0;
    const ingresoEsperado = unidadesReales * precioVenta;
    const gananciaEstimada = ingresoEsperado - costoTotalMateriales;

    const newLote: LoteProducto = {
      id: `lote-${Date.now()}`,
      recetaId: receta.id,
      nombre: receta.nombre,
      categoria: receta.categoria,
      imagen: receta.imagen,
      fechaElaboracion: now.toISOString(),
      fechaTexto,
      mesCarpeta,
      unidadesProducidas: unidadesReales,
      unidadesVendidas: 0,
      unidadesRestantes: unidadesReales,
      precioVenta,
      costoTotalMateriales,
      costoUnitario,
      gananciaEstimada,
      status: 'En Venta',
      materialesGastados,
      escalaUsada: escalaEtiqueta,
    };

    setLotes((prev) => [newLote, ...prev]);
    setSelectedLoteId(newLote.id);
    setActiveNavTab('ventas');

    return { success: true, lote: newLote };
  };

  // Operaciones Lotes
  const updateLote = (updated: LoteProducto) => {
    setLotes((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
  };

  const deleteLote = (id: string) => {
    setLotes((prev) => prev.filter((l) => l.id !== id));
    setVentas((prev) => prev.filter((v) => v.loteId !== id));
    if (selectedLoteId === id) {
      setSelectedLoteId(null);
    }
  };

  // Operaciones Clientes
  const addCliente = (
    data: Omit<Cliente, 'id' | 'totalComprado' | 'totalDeuda' | 'createdAt'>
  ): Cliente => {
    const newCliente: Cliente = {
      ...data,
      id: `cli-${Date.now()}`,
      totalComprado: 0,
      totalDeuda: 0,
      createdAt: new Date().toISOString(),
    };
    setClientes((prev) => [...prev, newCliente]);
    return newCliente;
  };

  const updateCliente = (updated: Cliente) => {
    setClientes((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const deleteCliente = (id: string) => {
    setClientes((prev) => prev.filter((c) => c.id !== id));
  };

  // Operaciones Ventas
  const addVenta = (newVentaData: Omit<Venta, 'id' | 'fecha' | 'fechaTexto'>) => {
    const now = new Date();
    const fechaTexto = `${now.toLocaleDateString('es-VE')} - ${now.toLocaleTimeString('es-VE', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;

    const newVenta: Venta = {
      ...newVentaData,
      id: `ven-${Date.now()}`,
      fecha: now.toISOString(),
      fechaTexto,
    };

    setVentas((prev) => [newVenta, ...prev]);

    // Actualizar unidades vendidas y restantes del lote
    setLotes((prevLotes) =>
      prevLotes.map((lote) => {
        if (lote.id !== newVentaData.loteId) return lote;
        const newVendidas = lote.unidadesVendidas + newVentaData.cantidadComprada;
        const newRestantes = Math.max(0, lote.unidadesProducidas - newVendidas);
        const newStatus = newRestantes === 0 ? 'Vendidas' : 'En Venta';
        return {
          ...lote,
          unidadesVendidas: newVendidas,
          unidadesRestantes: newRestantes,
          status: newStatus,
        };
      })
    );

    // Actualizar totales y deuda del cliente
    setClientes((prevClientes) =>
      prevClientes.map((cli) => {
        if (cli.id !== newVentaData.clienteId) return cli;
        const newComprado = cli.totalComprado + newVentaData.montoTotal;
        const newDeuda = cli.totalDeuda + newVentaData.montoPendiente;
        return {
          ...cli,
          totalComprado: newComprado,
          totalDeuda: Math.max(0, newDeuda),
        };
      })
    );
  };

  const updateVentaStatus = (ventaId: string, newStatus: VentaStatus, pagadasCount?: number) => {
    setVentas((prevVentas) =>
      prevVentas.map((v) => {
        if (v.id !== ventaId) return v;

        const totalUnidades = v.cantidadComprada;
        let unidadesPagadas = pagadasCount !== undefined ? pagadasCount : v.unidadesPagadas;

        if (newStatus === 'Pagado') {
          unidadesPagadas = totalUnidades;
        } else if (newStatus === 'No Pagado' || newStatus === 'Sin pagar') {
          unidadesPagadas = 0;
        }

        const unidadesSinPagar = Math.max(0, totalUnidades - unidadesPagadas);
        const montoPagado = unidadesPagadas * v.precioUnitario;
        const montoPendiente = unidadesSinPagar * v.precioUnitario;

        // Actualizar deuda en el cliente
        const diferenciaDeuda = montoPendiente - v.montoPendiente;
        setClientes((prevCli) =>
          prevCli.map((c) =>
            c.id === v.clienteId
              ? {
                  ...c,
                  totalDeuda: Math.max(0, c.totalDeuda + diferenciaDeuda),
                }
              : c
          )
        );

        return {
          ...v,
          status: newStatus,
          unidadesPagadas,
          unidadesSinPagar,
          montoPagado,
          montoPendiente,
        };
      })
    );
  };

  const editVentaPayment = (
    ventaId: string,
    updates: {
      unidadesPagadas: number;
      metodoPago?: MetodoPago;
      referenciaPago?: string;
      nota?: string;
    }
  ) => {
    setVentas((prevVentas) =>
      prevVentas.map((v) => {
        if (v.id !== ventaId) return v;

        const totalUnidades = v.cantidadComprada;
        const validPagadas = Math.max(0, Math.min(totalUnidades, updates.unidadesPagadas));
        const validSinPagar = Math.max(0, totalUnidades - validPagadas);

        const newMontoPagado = validPagadas * v.precioUnitario;
        const newMontoPendiente = validSinPagar * v.precioUnitario;

        let newStatus: VentaStatus = 'Pagado';
        if (validSinPagar === totalUnidades) {
          newStatus = 'Sin pagar';
        } else if (validSinPagar > 0) {
          newStatus = 'Debe';
        }

        // Actualizar deuda del cliente en base a la diferencia
        const diferenciaDeuda = newMontoPendiente - v.montoPendiente;
        setClientes((prevCli) =>
          prevCli.map((c) =>
            c.id === v.clienteId
              ? {
                  ...c,
                  totalDeuda: Math.max(0, c.totalDeuda + diferenciaDeuda),
                }
              : c
          )
        );

        return {
          ...v,
          unidadesPagadas: validPagadas,
          unidadesSinPagar: validSinPagar,
          montoPagado: newMontoPagado,
          montoPendiente: newMontoPendiente,
          status: newStatus,
          metodoPago: updates.metodoPago !== undefined ? updates.metodoPago : v.metodoPago,
          referenciaPago:
            updates.referenciaPago !== undefined ? updates.referenciaPago : v.referenciaPago,
          nota: updates.nota !== undefined ? updates.nota : v.nota,
        };
      })
    );
  };

  const deleteVenta = (id: string) => {
    const ventaToDelete = ventas.find((v) => v.id === id);
    if (!ventaToDelete) return;

    // Restaurar unidades al lote
    setLotes((prevLotes) =>
      prevLotes.map((lote) => {
        if (lote.id !== ventaToDelete.loteId) return lote;
        const newVendidas = Math.max(0, lote.unidadesVendidas - ventaToDelete.cantidadComprada);
        const newRestantes = lote.unidadesProducidas - newVendidas;
        return {
          ...lote,
          unidadesVendidas: newVendidas,
          unidadesRestantes: newRestantes,
          status: newRestantes > 0 ? 'En Venta' : 'Vendidas',
        };
      })
    );

    // Ajustar cliente
    setClientes((prevCli) =>
      prevCli.map((c) =>
        c.id === ventaToDelete.clienteId
          ? {
              ...c,
              totalComprado: Math.max(0, c.totalComprado - ventaToDelete.montoTotal),
              totalDeuda: Math.max(0, c.totalDeuda - ventaToDelete.montoPendiente),
            }
          : c
      )
    );

    setVentas((prev) => prev.filter((v) => v.id !== id));
  };

  // Configuraciones & Backup
  const updateConfig = (newConfig: Partial<ConfiguracionApp>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  };

  const resetToDefaults = () => {
    setConfig(initialConfig);
    setInsumos(initialInsumos);
    setRecetas(initialRecetas);
    setLotes(initialLotes);
    setVentas(initialVentas);
    setClientes(initialClientes);
    setSelectedLoteId('lote-1');
  };

  const exportDatabaseJson = (): string => {
    const data = {
      exportDate: new Date().toISOString(),
      config,
      insumos,
      recetas,
      lotes,
      ventas,
      clientes,
    };
    return JSON.stringify(data, null, 2);
  };

  const importDatabaseJson = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.insumos && parsed.recetas && parsed.lotes) {
        if (parsed.config) setConfig(parsed.config);
        if (parsed.insumos) setInsumos(parsed.insumos);
        if (parsed.recetas) setRecetas(parsed.recetas);
        if (parsed.lotes) setLotes(parsed.lotes);
        if (parsed.ventas) setVentas(parsed.ventas);
        if (parsed.clientes) setClientes(parsed.clientes);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        config,
        insumos,
        recetas,
        lotes,
        ventas,
        clientes,
        isAdminUnlocked,
        selectedLoteId,
        activeNavTab,
        isDarkMode,
        setActiveNavTab,
        setSelectedLoteId,
        toggleDarkMode,
        formatMoney,
        convertCurrency,
        verifyAdminPin,
        lockAdmin,
        unlockAdmin,
        executeWithAdminAuth,
        addInsumo,
        updateInsumo,
        deleteInsumo,
        restockInsumo,
        addReceta,
        updateReceta,
        deleteReceta,
        elaborarReceta,
        updateLote,
        deleteLote,
        addVenta,
        updateVentaStatus,
        editVentaPayment,
        deleteVenta,
        addCliente,
        updateCliente,
        deleteCliente,
        updateConfig,
        resetToDefaults,
        exportDatabaseJson,
        importDatabaseJson,
        adminAuthModalOpen,
        adminAuthDescription,
        closeAdminAuthModal,
        recoveryEmailNotification,
        sendRecoveryEmail,
        dismissRecoveryNotification,
        assignedRecoveryPin,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe ser usado dentro de un AppProvider');
  }
  return context;
};
