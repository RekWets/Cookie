export type UnitType = 'kg' | 'gr' | 'lt' | 'ml' | 'unidades';

export type InsumoStatus = 'Disponible' | 'Por agotarse' | 'Agotado';

export interface Insumo {
  id: string;
  nombre: string;
  precio: number; // Costo por la cantidad comprada
  cantidad: number; // Cantidad total comprada
  gastada: number; // Cantidad utilizada en elaboraciones
  restante: number; // cantidad - gastada
  unidad: UnitType;
  status: InsumoStatus;
  fechaCaducidad: string; // YYYY-MM-DD
  paquetes?: number; // e.g. 10 paquetes comprados
  pesoPorPaquete?: number; // e.g. 1 (kg)
  unidadPaquete?: UnitType; // e.g. 'kg' o 'gr'
  costoPorPaquete?: number;
  proveedor?: string;
  costoPorUnidadBase: number; // Costo por unidad base de inventario (kg, gr, lt, ml, unidades)
  createdAt: string;
}

export interface IngredienteReceta {
  insumoId: string;
  nombre: string;
  cantidad: number;
  unidad: UnitType;
}

export interface EscalaReceta {
  id: string;
  etiqueta: string; // e.g. "0.5 Kg", "1 Kg", "2 Kg", "4 Kg"
  multiplicador: number;
  porciones: number;
}

export interface Receta {
  id: string;
  nombre: string;
  categoria: 'Cookie' | 'Cake' | 'Brownie' | 'Tarta' | 'Postre Frío' | 'Panadería';
  tiempo: string; // e.g. "30 min", "1 hr", "20 min"
  imagen: string;
  descripcion?: string;
  porcionesBase: number;
  precioSugeridoVenta: number;
  ingredientes: IngredienteReceta[];
  escalas?: EscalaReceta[];
  createdAt: string;
}

export interface MaterialGastado {
  insumoId: string;
  nombre: string;
  cantidadGastada: number; // en unidad de la receta (e.g. 500 gr)
  unidad: UnitType;
  cantidadDeducidaInsumo?: number; // en unidad del insumo de inventario (e.g. 0.5 kg)
  unidadInsumo?: UnitType;
  costo: number;
}

export interface LoteProducto {
  id: string;
  recetaId: string;
  nombre: string;
  categoria: string;
  imagen: string;
  fechaElaboracion: string;
  fechaTexto: string; // e.g. "23/08/2024 - 06:00 p.m"
  mesCarpeta: string; // e.g. "Agosto", "Junio", "Antiguas"
  unidadesProducidas: number;
  unidadesVendidas: number;
  unidadesRestantes: number;
  precioVenta: number; // en Bs o $ según configuración
  costoTotalMateriales: number;
  costoUnitario: number;
  gananciaEstimada: number;
  status: 'En Venta' | 'Vendidas' | 'En proceso';
  materialesGastados: MaterialGastado[];
  escalaUsada?: string;
}

export type MetodoPago = 'Efectivo' | 'Transferencia' | 'Pago Móvil' | 'Zelle' | 'Dólares Efectivo' | 'Ninguno';
export type TipoVenta = 'Para llevar' | 'Comer aquí' | 'Fiado' | 'Encargo';
export type VentaStatus = 'Pagado' | 'Sin pagar' | 'No Pagado' | 'Debe';

export interface Venta {
  id: string;
  loteId: string;
  productoNombre: string;
  clienteId: string;
  clienteNombre: string;
  cantidadComprada: number;
  unidadesPagadas: number;
  unidadesSinPagar: number;
  precioUnitario: number;
  montoTotal: number;
  montoPagado: number;
  montoPendiente: number;
  metodoPago: MetodoPago;
  referenciaPago: string; // e.g. "9980"
  tipo: TipoVenta;
  status: VentaStatus;
  nota: string;
  fecha: string;
  fechaTexto: string;
}

export interface Cliente {
  id: string;
  nombre: string;
  telefono: string;
  referencia: string; // e.g. "Hermana de Nelson", "Cliente frecuente", "Oficina 4"
  totalComprado: number;
  totalDeuda: number;
  createdAt: string;
}

export interface ConfiguracionApp {
  nombreNegocio: string;
  nombreUsuario: string; // Nombre del Administrador (ej: Yulihanny)
  emailAdmin: string; // Correo de recuperación de PIN
  monedaPrincipal: 'Bs' | '$';
  tasaCambioBsUSD: number; // e.g. 40.00 Bs por 1 USD
  claveAdmin: string; // Clave para registrar/modificar
  avatarUrl: string;
}
