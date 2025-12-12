/**
 * SISTEMA DE COTIZACIÓN V5.3 PRO
 * constants.js - Constantes del sistema
 * Basado en V5.2 PRO con correcciones V5.3
 */

// ═══════════════════════════════════════════════════════════════════════════
// PROVINCIAS
// ═══════════════════════════════════════════════════════════════════════════
export const PROVINCIAS = [
  'Buenos Aires',
  'CABA',
  'Chubut',
  'Córdoba',
  'Mendoza',
  'Neuquén',
  'Río Negro',
  'Santa Cruz',
  'Santa Fe',
  'Tierra del Fuego'
];

// ═══════════════════════════════════════════════════════════════════════════
// CONVENIOS (Solo para Relación de Dependencia)
// V5.3 Punto 2: MT y FUCO no muestran convenio
// ═══════════════════════════════════════════════════════════════════════════
export const CONVENIOS = ['FATSA', 'Petrolero'];

// ═══════════════════════════════════════════════════════════════════════════
// TIPOS DE CONTRATO
// V5.3 Punto 2: Clasificación automática
// ═══════════════════════════════════════════════════════════════════════════
export const TIPOS_CONTRATO = [
  { value: 'RD', label: 'Rel. Dependencia', clasificacion: 'Relación de Dependencia', muestraConvenio: true },
  { value: 'MT', label: 'Monotributista', clasificacion: 'Monotributista', muestraConvenio: false },
  { value: 'FUCO', label: 'Fuera de Convenio', clasificacion: 'Fuera de Convenio', muestraConvenio: false }
];

// ═══════════════════════════════════════════════════════════════════════════
// DIAGRAMAS HORARIOS
// ═══════════════════════════════════════════════════════════════════════════
export const DIAGRAMAS = [
  { value: '7x7', label: '7×7', diasMes: 15 },
  { value: '14x14', label: '14×14', diasMes: 15 },
  { value: 'LunesViernes', label: 'L-V', diasMes: 22 },
  { value: 'Manual', label: 'Manual', diasMes: 0 }
];

// ═══════════════════════════════════════════════════════════════════════════
// HORAS POR DÍA (V5.3 Punto 4 - Nuevo selector obligatorio)
// ═══════════════════════════════════════════════════════════════════════════
export const HORAS_POR_DIA_OPCIONES = [
  { value: 8, label: '8 horas' },
  { value: 12, label: '12 horas' },
  { value: 'manual', label: 'Manual' }
];

// ═══════════════════════════════════════════════════════════════════════════
// CATEGORÍAS POR CONVENIO
// ═══════════════════════════════════════════════════════════════════════════
export const CATEGORIAS_POR_CONVENIO = {
  'FATSA': ['IA', 'IB', 'III'],
  'Petrolero': ['PP', 'PJ']
};

// ═══════════════════════════════════════════════════════════════════════════
// PUESTOS POR CATEGORÍA
// ═══════════════════════════════════════════════════════════════════════════
export const PUESTOS_POR_CATEGORIA = {
  'IA': ['Enfermero', 'Médico', 'Chofer', 'Chofermero'],
  'IB': ['Enfermero', 'Chofer'],
  'III': ['Chofer'],
  'PP': ['Enfermero', 'Chofer'],
  'PJ': ['Médico']
};

// ═══════════════════════════════════════════════════════════════════════════
// TOPES DE HORAS POR CONVENIO
// ═══════════════════════════════════════════════════════════════════════════
export const TOPES_HORAS_CONVENIO = {
  'Petrolero': 190,
  'FATSA': 192,
  'Monotributista': 999,
  'Fuera de Convenio': 999
};

// ═══════════════════════════════════════════════════════════════════════════
// VIANDAS (V5.3 Punto 11: Solo dentro de secciones, no independiente)
// ═══════════════════════════════════════════════════════════════════════════
export const TIPOS_VIANDA = [
  { value: 'Desayuno', label: 'Desayuno', precioDefault: 20000 },
  { value: 'Almuerzo', label: 'Almuerzo', precioDefault: 20000 },
  { value: 'Cena', label: 'Cena', precioDefault: 20000 }
];

export const VIANDAS_PETROLERO_DEFAULT = [
  { tipo: 'Desayuno', incluir: true, precio: 20000 },
  { tipo: 'Almuerzo', incluir: true, precio: 20000 },
  { tipo: 'Cena', incluir: true, precio: 20000 }
];

// ═══════════════════════════════════════════════════════════════════════════
// HORAS EXTRA
// ═══════════════════════════════════════════════════════════════════════════
export const TIPOS_HORA_EXTRA = [
  { value: 'HE50', label: 'Hora Extra 50%', factor: 1.5 },
  { value: 'HE100', label: 'Hora Extra 100%', factor: 2.0 },
  { value: 'HEFeriado', label: 'Hora Feriado', factor: 2.0 }
];

// ═══════════════════════════════════════════════════════════════════════════
// MÓVILES (V5.3 Punto 10)
// ═══════════════════════════════════════════════════════════════════════════
export const TIPOS_MOVIL = [
  { value: 'TS', label: 'Traslado Simple' },
  { value: 'TA', label: 'Traslado Asistido' },
  { value: 'UTI', label: 'UTI Móvil' }
];

export const OPCIONES_ADQUISICION = [
  { value: 'Disponible', label: 'Disponible' },
  { value: 'Alquiler', label: 'Alquiler' },
  { value: 'Compra', label: 'Compra' }
];

// V5.3 Punto 10.6: Service móviles predefinidos
export const SERVICE_MOVILES_PREDEFINIDOS = [
  { descripcion: 'Service motor', precioDefault: 150000, frecuenciaAnual: 2 },
  { descripcion: 'Service frenos', precioDefault: 80000, frecuenciaAnual: 2 },
  { descripcion: 'Service A/C', precioDefault: 60000, frecuenciaAnual: 1 },
  { descripcion: 'Service caja', precioDefault: 120000, frecuenciaAnual: 1 },
  { descripcion: 'Service suspensión', precioDefault: 90000, frecuenciaAnual: 1 },
  { descripcion: 'Service equipo médico', precioDefault: 100000, frecuenciaAnual: 2 }
];

// V5.3 Punto 10.6: Mantenimiento móviles predefinidos
export const MANTENIMIENTO_MOVILES_PREDEFINIDOS = [
  { descripcion: 'Aceite y filtros', precioDefault: 45000, frecuenciaAnual: 4 },
  { descripcion: 'Neumáticos', precioDefault: 200000, frecuenciaAnual: 1 },
  { descripcion: 'Batería', precioDefault: 80000, frecuenciaAnual: 1 },
  { descripcion: 'Limpieza integral', precioDefault: 15000, frecuenciaAnual: 12 },
  { descripcion: 'VTV', precioDefault: 25000, frecuenciaAnual: 1 }
];

// ═══════════════════════════════════════════════════════════════════════════
// TRAILERS (V5.3 Punto 10.1)
// ═══════════════════════════════════════════════════════════════════════════
export const TIPOS_TRAILER = [
  { value: 'Habitacional', label: 'Habitacional' },
  { value: 'Sanitario', label: 'Sanitario' }
];

// V5.3 Punto 10.6: Mantenimiento trailers predefinidos (sin service)
export const MANTENIMIENTO_TRAILERS_PREDEFINIDOS = [
  { descripcion: 'Ejes y frenos', precioDefault: 100000, frecuenciaAnual: 1 },
  { descripcion: 'Sistema eléctrico', precioDefault: 60000, frecuenciaAnual: 1 },
  { descripcion: 'A/C trailer', precioDefault: 80000, frecuenciaAnual: 1 },
  { descripcion: 'Limpieza', precioDefault: 20000, frecuenciaAnual: 12 },
  { descripcion: 'Impermeabilización', precioDefault: 70000, frecuenciaAnual: 1 }
];

// ═══════════════════════════════════════════════════════════════════════════
// SEGUROS
// ═══════════════════════════════════════════════════════════════════════════
export const TIPOS_SEGURO = [
  { value: 'ART', label: 'ART' },
  { value: 'RespCivil', label: 'Responsabilidad Civil' },
  { value: 'Vida', label: 'Seguro de Vida' },
  { value: 'Vehicular', label: 'Seguro Vehicular' },
  { value: 'Otro', label: 'Otro' }
];

// ═══════════════════════════════════════════════════════════════════════════
// ITEMS ADICIONALES PREDEFINIDOS (V5.3 Punto 7)
// ═══════════════════════════════════════════════════════════════════════════
export const ITEMS_ADICIONALES_PREDEFINIDOS = [
  { descripcion: 'Uniforme', precioDefault: 50000, categoria: 'Vestimenta' },
  { descripcion: 'Calzado', precioDefault: 80000, categoria: 'Vestimenta' },
  { descripcion: 'EPP', precioDefault: 30000, categoria: 'Seguridad' },
  { descripcion: 'Seguro de vida', precioDefault: 15000, categoria: 'Seguro' },
  { descripcion: 'Bonificación zona', precioDefault: 25000, categoria: 'Bonificación' },
  { descripcion: 'Viático', precioDefault: 20000, categoria: 'Viático' }
];

// ═══════════════════════════════════════════════════════════════════════════
// CAPACITACIONES PREDEFINIDAS (V5.3 Punto 7)
// ═══════════════════════════════════════════════════════════════════════════
export const CAPACITACIONES_PREDEFINIDAS = [
  { descripcion: 'RCP', precioDefault: 45000, duracionHoras: 8, certificacion: true },
  { descripcion: 'Manejo defensivo', precioDefault: 35000, duracionHoras: 4, certificacion: true },
  { descripcion: 'Primeros auxilios', precioDefault: 40000, duracionHoras: 8, certificacion: true },
  { descripcion: 'MATPEL', precioDefault: 60000, duracionHoras: 16, certificacion: true },
  { descripcion: 'Inducción petrolera', precioDefault: 55000, duracionHoras: 8, certificacion: true }
];

// ═══════════════════════════════════════════════════════════════════════════
// ARCHIVOS SOPORTE REQUERIDOS (V5.3 Punto 16)
// ═══════════════════════════════════════════════════════════════════════════
export const ARCHIVOS_SOPORTE = [
  { 
    key: 'sueldos', 
    label: 'SUELDOS_V53.xlsx', 
    descripcion: 'Convenio, Categoria, Puesto, Sueldo_Bruto, Costo_Total_Cia',
    requerido: true,
    columnas: ['Convenio', 'Categoria', 'Puesto', 'Sueldo_Bruto', 'Costo_Total_Cia']
  },
  { 
    key: 'monotributistas', 
    label: 'MONOTRIBUTISTAS_FUCO.xlsx', 
    descripcion: 'Provincia, Puesto, Tipo_Honorario, Valor_Sugerido',
    requerido: true,
    columnas: ['Provincia', 'Puesto', 'Tipo_Honorario', 'Valor_Sugerido', 'Categoria']
  },
  { 
    key: 'itemsAdicionales', 
    label: 'ITEMS_ADICIONALES.xlsx', 
    descripcion: 'Descripcion, P, Q, Categoria',
    requerido: true,
    columnas: ['Descripcion', 'P', 'Q', 'Categoria']
  },
  { 
    key: 'capacitaciones', 
    label: 'CAPACITACIONES.xlsx', 
    descripcion: 'Descripcion, P, Q, Duracion_Horas, Certificacion',
    requerido: true,
    columnas: ['Descripcion', 'P', 'Q', 'Duracion_Horas', 'Certificacion']
  },
  { 
    key: 'movilesTrailers', 
    label: 'MOVILES_TRAILERS_V53.xlsx', 
    descripcion: '9 hojas: Móviles/Trailers Disponibles, Service, Mantenimiento, Alquiler, Compra',
    requerido: true,
    esMultiHoja: true,
    hojas: [
      'Moviles_Disponibles',
      'Trailers_Disponibles', 
      'Service_Moviles',
      'Mantenimiento_Moviles',
      'Mantenimiento_Trailers',
      'Alquiler_Moviles',
      'Alquiler_Trailers',
      'Compra_Moviles',
      'Compra_Trailers'
    ]
  },
  { 
    key: 'otrosCostos', 
    label: 'OTROS_COSTOS.csv', 
    descripcion: 'Costos adicionales',
    requerido: false,
    columnas: ['Descripcion', 'Precio', 'Cantidad', 'Categoria']
  },
  { 
    key: 'estructura', 
    label: 'GASTOS_DE_ESTRUCTURA.csv', 
    descripcion: 'Gastos de estructura operativa',
    requerido: false,
    columnas: ['Descripcion', 'Precio', 'Cantidad', 'Categoria']
  },
  { 
    key: 'seguros', 
    label: 'SEGUROS.csv', 
    descripcion: 'Seguros y coberturas',
    requerido: false,
    columnas: ['Tipo', 'Descripcion', 'Prima', 'Aplica_Sobre']
  }
];

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN DEFAULT
// ═══════════════════════════════════════════════════════════════════════════
export const CONFIG_DEFAULT = {
  costoCiaModo: 'importar',
  costoCiaPct: 35,
  mkPersonal: 0,
  mkMoviles: 0,
  mkTrailers: 0,
  mkOtrosCostos: 0,
  mkEstructura: 0,
  mkSeguros: 0
};

// ═══════════════════════════════════════════════════════════════════════════
// TEXTOS DEL SISTEMA
// ═══════════════════════════════════════════════════════════════════════════
export const TEXTOS = {
  // V5.3 Punto 6: Plus Nocturno texto actualizado
  plusNocturno: 'Corresponde si trabaja de 22 horas a 06 horas',
  
  // Mensajes de validación
  archivoRequerido: 'Este archivo es requerido para continuar',
  provinciaRequerida: 'Debe seleccionar una provincia',
  convenioRequerido: 'Debe seleccionar un convenio',
  categoriaRequerida: 'Debe seleccionar una categoría',
  puestoRequerido: 'Debe seleccionar o ingresar un puesto',
  
  // Títulos de secciones
  tituloPersonal: 'Personal',
  tituloMoviles: 'Móviles',
  tituloTrailers: 'Trailers',
  tituloOtrosCostos: 'Otros Costos',
  tituloEstructura: 'Gastos de Estructura',
  tituloSeguros: 'Seguros',
  tituloResumen: 'Resumen Comercial'
};

export default {
  PROVINCIAS,
  CONVENIOS,
  TIPOS_CONTRATO,
  DIAGRAMAS,
  HORAS_POR_DIA_OPCIONES,
  CATEGORIAS_POR_CONVENIO,
  PUESTOS_POR_CATEGORIA,
  TOPES_HORAS_CONVENIO,
  TIPOS_VIANDA,
  VIANDAS_PETROLERO_DEFAULT,
  TIPOS_HORA_EXTRA,
  TIPOS_MOVIL,
  OPCIONES_ADQUISICION,
  SERVICE_MOVILES_PREDEFINIDOS,
  MANTENIMIENTO_MOVILES_PREDEFINIDOS,
  TIPOS_TRAILER,
  MANTENIMIENTO_TRAILERS_PREDEFINIDOS,
  TIPOS_SEGURO,
  ITEMS_ADICIONALES_PREDEFINIDOS,
  CAPACITACIONES_PREDEFINIDAS,
  ARCHIVOS_SOPORTE,
  CONFIG_DEFAULT,
  TEXTOS
};
