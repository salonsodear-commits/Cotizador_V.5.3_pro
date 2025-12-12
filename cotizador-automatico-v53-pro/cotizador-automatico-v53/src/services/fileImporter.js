/**
 * SISTEMA DE COTIZACIÓN V5.3 PRO
 * fileImporter.js - Importador de archivo soporte único
 * 
 * Lee archivo Excel y extrae datos para el sistema
 * Integración con Personal.jsx, Moviles.jsx, Trailers.jsx
 */

import * as XLSX from 'xlsx';

/**
 * Convertir a número seguro
 */
const safeNumber = (val, fallback = 0) => {
  if (val === null || val === undefined || val === '' || val === '—') return fallback;
  const num = Number(val);
  if (isNaN(num) || !isFinite(num)) return fallback;
  return num;
};

/**
 * Convertir a string seguro
 */
const safeString = (val) => {
  if (val === null || val === undefined) return null;
  return String(val).trim();
};

/**
 * Convertir a entero positivo (para Q)
 */
const safePositiveInt = (val, fallback = 1) => {
  const num = safeNumber(val, fallback);
  if (num < 1 || !Number.isInteger(num)) {
    console.warn(`fileImporter: Valor Q inválido (${val}), usando ${fallback}`);
    return fallback;
  }
  return num;
};

/**
 * Validar P >= 0
 */
const validarPrecio = (val, campo = 'Precio') => {
  const num = safeNumber(val);
  if (num < 0) {
    console.warn(`fileImporter: ${campo} negativo (${val}), usando 0`);
    return 0;
  }
  return num;
};

/**
 * Obtener nombres de hojas disponibles en el workbook
 */
const obtenerHojasDisponibles = (workbook) => {
  return workbook.SheetNames || [];
};

/**
 * Buscar hoja por nombre (case-insensitive, parcial)
 */
const buscarHoja = (workbook, ...posiblesNombres) => {
  const hojas = obtenerHojasDisponibles(workbook);
  
  for (const nombre of posiblesNombres) {
    // Búsqueda exacta
    if (hojas.includes(nombre)) return nombre;
    
    // Búsqueda case-insensitive
    const found = hojas.find(h => h.toLowerCase() === nombre.toLowerCase());
    if (found) return found;
    
    // Búsqueda parcial
    const partial = hojas.find(h => h.toLowerCase().includes(nombre.toLowerCase()));
    if (partial) return partial;
  }
  
  return null;
};

/**
 * Leer hoja como JSON
 */
const leerHoja = (workbook, nombreHoja) => {
  if (!nombreHoja || !workbook.Sheets[nombreHoja]) {
    return [];
  }
  
  try {
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[nombreHoja], {
      defval: null,
      raw: false
    });
    return data || [];
  } catch (error) {
    console.warn(`fileImporter: Error leyendo hoja ${nombreHoja}:`, error.message);
    return [];
  }
};

/**
 * Normalizar fila de personal
 */
const normalizarPersonal = (row) => {
  return {
    Codigo: safeString(row.Codigo || row.ID || row.Identificador),
    Nombre: safeString(row.Nombre || row.NombreCompleto),
    TipoContrato: safeString(row.TipoContrato || row.TipoContratacion || row.Tipo),
    Convenio: safeString(row.Convenio),
    Categoria: safeString(row.Categoria || row.Clasificacion || row.Puesto),
    Provincia: safeString(row.Provincia),
    Diagrama: safeString(row.Diagrama),
    HorasPorDia: safeNumber(row.HorasPorDia || row.Horas, 8),
    ValorHora: validarPrecio(row.ValorHora || row.Honorarios || row.Precio, 'ValorHora'),
    CostoConvalidado: validarPrecio(row.CostoConvalidado || row.Convalidado, 'CostoConvalidado'),
    Observaciones: safeString(row.Observaciones || row.Notas),
    _fila: row.__rowNum__
  };
};

/**
 * Normalizar móvil disponible
 */
const normalizarMovilDisponible = (row) => {
  return {
    Codigo: safeString(row.Codigo || row.ID),
    Tipo: safeString(row.Tipo || row.TipoMovil),
    Dominio: safeString(row.Dominio || row.Patente),
    Descripcion: safeString(row.Descripcion || row.Modelo),
    Antiguedad: safeNumber(row.Antiguedad || row.Años),
    Provincia: safeString(row.Provincia),
    Observaciones: safeString(row.Observaciones),
    _fila: row.__rowNum__
  };
};

/**
 * Normalizar móvil alquiler
 */
const normalizarMovilAlquiler = (row) => {
  return {
    Codigo: safeString(row.Codigo || row.ID),
    Tipo: safeString(row.Tipo || row.TipoMovil),
    Dominio: safeString(row.Dominio || row.Patente),
    Descripcion: safeString(row.Descripcion || row.Modelo),
    Proveedor: safeString(row.Proveedor),
    CostoAlquiler: validarPrecio(row.CostoAlquiler || row.Alquiler || row.CostoMensual, 'CostoAlquiler'),
    Provincia: safeString(row.Provincia),
    Observaciones: safeString(row.Observaciones),
    _fila: row.__rowNum__
  };
};

/**
 * Normalizar móvil compra
 */
const normalizarMovilCompra = (row) => {
  return {
    Codigo: safeString(row.Codigo || row.ID),
    Tipo: safeString(row.Tipo || row.TipoMovil),
    Dominio: safeString(row.Dominio || row.Patente),
    Descripcion: safeString(row.Descripcion || row.Modelo),
    InversionInicial: validarPrecio(row.InversionInicial || row.Inversion || row.ValorCompra, 'InversionInicial'),
    MesesAmortizacion: safePositiveInt(row.MesesAmortizacion || row.Meses, 12),
    Provincia: safeString(row.Provincia),
    Observaciones: safeString(row.Observaciones),
    _fila: row.__rowNum__
  };
};

/**
 * Normalizar service móviles
 */
const normalizarServiceMovil = (row) => {
  return {
    Codigo: safeString(row.Codigo || row.ID),
    Descripcion: safeString(row.Descripcion || row.Item || row.Concepto),
    Precio: validarPrecio(row.Precio || row.P || row.Costo, 'Precio'),
    FrecuenciaAnual: safePositiveInt(row.FrecuenciaAnual || row.Frecuencia || row.Q, 1),
    TipoMovil: safeString(row.TipoMovil || row.Tipo),
    Provincia: safeString(row.Provincia),
    Observaciones: safeString(row.Observaciones),
    _fila: row.__rowNum__
  };
};

/**
 * Normalizar mantenimiento móviles
 */
const normalizarMantenimientoMovil = (row) => {
  return {
    Codigo: safeString(row.Codigo || row.ID),
    Descripcion: safeString(row.Descripcion || row.Item || row.Concepto),
    Precio: validarPrecio(row.Precio || row.P || row.Costo, 'Precio'),
    FrecuenciaAnual: safePositiveInt(row.FrecuenciaAnual || row.Frecuencia || row.Q, 1),
    TipoMovil: safeString(row.TipoMovil || row.Tipo),
    Clasificacion: safeString(row.Clasificacion),
    Provincia: safeString(row.Provincia),
    Observaciones: safeString(row.Observaciones),
    _fila: row.__rowNum__
  };
};

/**
 * Normalizar trailer disponible
 */
const normalizarTrailerDisponible = (row) => {
  return {
    Codigo: safeString(row.Codigo || row.ID),
    Tipo: safeString(row.Tipo || row.TipoTrailer),
    Identificacion: safeString(row.Identificacion || row.ID || row.Codigo),
    Descripcion: safeString(row.Descripcion || row.Modelo),
    Antiguedad: safeNumber(row.Antiguedad || row.Años),
    Capacidad: safeNumber(row.Capacidad),
    Provincia: safeString(row.Provincia),
    Observaciones: safeString(row.Observaciones),
    _fila: row.__rowNum__
  };
};

/**
 * Normalizar trailer alquiler
 */
const normalizarTrailerAlquiler = (row) => {
  return {
    Codigo: safeString(row.Codigo || row.ID),
    Tipo: safeString(row.Tipo || row.TipoTrailer),
    Identificacion: safeString(row.Identificacion || row.ID),
    Descripcion: safeString(row.Descripcion || row.Modelo),
    Proveedor: safeString(row.Proveedor),
    CostoAlquiler: validarPrecio(row.CostoAlquiler || row.Alquiler, 'CostoAlquiler'),
    Capacidad: safeNumber(row.Capacidad),
    Provincia: safeString(row.Provincia),
    Observaciones: safeString(row.Observaciones),
    _fila: row.__rowNum__
  };
};

/**
 * Normalizar trailer compra
 */
const normalizarTrailerCompra = (row) => {
  return {
    Codigo: safeString(row.Codigo || row.ID),
    Tipo: safeString(row.Tipo || row.TipoTrailer),
    Identificacion: safeString(row.Identificacion || row.ID),
    Descripcion: safeString(row.Descripcion || row.Modelo),
    InversionInicial: validarPrecio(row.InversionInicial || row.Inversion, 'InversionInicial'),
    MesesAmortizacion: safePositiveInt(row.MesesAmortizacion || row.Meses, 12),
    Capacidad: safeNumber(row.Capacidad),
    Provincia: safeString(row.Provincia),
    Observaciones: safeString(row.Observaciones),
    _fila: row.__rowNum__
  };
};

/**
 * Normalizar mantenimiento trailers (SIN SERVICE - V5.3)
 */
const normalizarMantenimientoTrailer = (row) => {
  return {
    Codigo: safeString(row.Codigo || row.ID),
    Descripcion: safeString(row.Descripcion || row.Item || row.Concepto),
    Precio: validarPrecio(row.Precio || row.P || row.Costo, 'Precio'),
    FrecuenciaAnual: safePositiveInt(row.FrecuenciaAnual || row.Frecuencia || row.Q, 1),
    TipoTrailer: safeString(row.TipoTrailer || row.Tipo),
    Clasificacion: safeString(row.Clasificacion),
    Provincia: safeString(row.Provincia),
    Observaciones: safeString(row.Observaciones),
    _fila: row.__rowNum__
  };
};

/**
 * Normalizar item adicional
 */
const normalizarItemAdicional = (row) => {
  return {
    Codigo: safeString(row.Codigo || row.ID),
    Descripcion: safeString(row.Descripcion || row.Item || row.Concepto),
    Precio: validarPrecio(row.Precio || row.P, 'Precio'),
    Cantidad: safePositiveInt(row.Cantidad || row.Q, 1),
    Provincia: safeString(row.Provincia),
    Categoria: safeString(row.Categoria),
    Convenio: safeString(row.Convenio),
    Observaciones: safeString(row.Observaciones),
    _fila: row.__rowNum__
  };
};

/**
 * Normalizar capacitación
 */
const normalizarCapacitacion = (row) => {
  return {
    Codigo: safeString(row.Codigo || row.ID),
    Descripcion: safeString(row.Descripcion || row.Nombre || row.Curso),
    Modalidad: safeString(row.Modalidad),
    DuracionHoras: safeNumber(row.DuracionHoras || row.Duracion || row.Horas),
    Precio: validarPrecio(row.Precio || row.P || row.Costo, 'Precio'),
    Cantidad: safePositiveInt(row.Cantidad || row.Q, 1),
    Provincia: safeString(row.Provincia),
    Categoria: safeString(row.Categoria),
    TipoContrato: safeString(row.TipoContrato),
    Convenio: safeString(row.Convenio),
    Observaciones: safeString(row.Observaciones),
    _fila: row.__rowNum__
  };
};

/**
 * Normalizar diagrama
 */
const normalizarDiagrama = (row) => {
  return {
    Codigo: safeString(row.Codigo || row.ID),
    Descripcion: safeString(row.Descripcion || row.Nombre),
    DiasTrabajo: safeNumber(row.DiasTrabajo || row.DiasOn),
    DiasDescanso: safeNumber(row.DiasDescanso || row.DiasOff),
    Frecuencia: safeString(row.Frecuencia),
    Factor: safeNumber(row.Factor, 1),
    Rotacion: safeString(row.Rotacion),
    Provincia: safeString(row.Provincia),
    _fila: row.__rowNum__
  };
};

/**
 * Normalizar vianda (Petrolero)
 */
const normalizarVianda = (row) => {
  return {
    Codigo: safeString(row.Codigo || row.ID),
    Tipo: safeString(row.Tipo || row.TipoVianda),
    Descripcion: safeString(row.Descripcion),
    Precio: validarPrecio(row.Precio || row.P, 'Precio'),
    Provincia: safeString(row.Provincia),
    _fila: row.__rowNum__
  };
};

/**
 * Extraer metadata del archivo
 */
const extraerMetadata = (workbook, hojasEncontradas) => {
  // Buscar hoja de configuración
  const hojaConfig = buscarHoja(workbook, 'Configuracion', 'Config', 'Metadata', 'General');
  let config = {};
  
  if (hojaConfig) {
    const data = leerHoja(workbook, hojaConfig);
    // Convertir filas clave-valor a objeto
    data.forEach(row => {
      const clave = safeString(row.Parametro || row.Clave || row.Campo);
      const valor = row.Valor || row.Dato;
      if (clave) {
        config[clave] = valor;
      }
    });
  }
  
  return {
    archivoVersion: safeString(config.Version) || 'Desconocida',
    fechaGeneracion: safeString(config.Fecha) || new Date().toISOString(),
    hojasImportadas: hojasEncontradas,
    totalHojas: workbook.SheetNames.length
  };
};

/**
 * Función principal - Importar archivo soporte
 * @param {File|ArrayBuffer} file - Archivo Excel
 * @returns {Promise<Object>} - Datos importados
 */
export const importSupportFile = async (file) => {
  try {
    // Leer archivo
    let workbook;
    
    if (file instanceof ArrayBuffer) {
      workbook = XLSX.read(file, { type: 'array' });
    } else if (file instanceof File) {
      const buffer = await file.arrayBuffer();
      workbook = XLSX.read(buffer, { type: 'array' });
    } else {
      throw new Error('Formato de archivo no soportado');
    }
    
    if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
      throw new Error('Archivo Excel vacío o corrupto');
    }
    
    const hojasEncontradas = [];
    
    // Personal
    const hojaPersonal = buscarHoja(workbook, 'Personal', 'Empleados', 'RRHH');
    const personal = hojaPersonal ? leerHoja(workbook, hojaPersonal).map(normalizarPersonal) : [];
    if (hojaPersonal) hojasEncontradas.push('personal');
    
    // Diagramas
    const hojaDiagramas = buscarHoja(workbook, 'Diagramas', 'Diagrama');
    const diagramas = hojaDiagramas ? leerHoja(workbook, hojaDiagramas).map(normalizarDiagrama) : [];
    if (hojaDiagramas) hojasEncontradas.push('diagramas');
    
    // Viandas
    const hojaViandas = buscarHoja(workbook, 'Viandas', 'Vianda');
    const viandas = hojaViandas ? leerHoja(workbook, hojaViandas).map(normalizarVianda) : [];
    if (hojaViandas) hojasEncontradas.push('viandas');
    
    // Móviles disponibles
    const hojaMovDisp = buscarHoja(workbook, 'Moviles disponibles', 'MovilesDisponibles', 'Moviles_Disponibles');
    const movilesDisponibles = hojaMovDisp ? leerHoja(workbook, hojaMovDisp).map(normalizarMovilDisponible) : [];
    if (hojaMovDisp) hojasEncontradas.push('movilesDisponibles');
    
    // Móviles alquiler
    const hojaMovAlq = buscarHoja(workbook, 'Moviles alquiler', 'MovilesAlquiler', 'Moviles_Alquiler');
    const movilesAlquiler = hojaMovAlq ? leerHoja(workbook, hojaMovAlq).map(normalizarMovilAlquiler) : [];
    if (hojaMovAlq) hojasEncontradas.push('movilesAlquiler');
    
    // Móviles compra
    const hojaMovComp = buscarHoja(workbook, 'Moviles compra', 'MovilesCompra', 'Moviles_Compra');
    const movilesCompra = hojaMovComp ? leerHoja(workbook, hojaMovComp).map(normalizarMovilCompra) : [];
    if (hojaMovComp) hojasEncontradas.push('movilesCompra');
    
    // Service móviles
    const hojaService = buscarHoja(workbook, 'Service moviles', 'ServiceMoviles', 'Service');
    const serviceMoviles = hojaService ? leerHoja(workbook, hojaService).map(normalizarServiceMovil) : [];
    if (hojaService) hojasEncontradas.push('serviceMoviles');
    
    // Mantenimiento móviles
    const hojaMantMov = buscarHoja(workbook, 'Mantenimiento moviles', 'MantenimientoMoviles', 'Mant_Moviles');
    const mantenimientoMoviles = hojaMantMov ? leerHoja(workbook, hojaMantMov).map(normalizarMantenimientoMovil) : [];
    if (hojaMantMov) hojasEncontradas.push('mantenimientoMoviles');
    
    // Trailers disponibles
    const hojaTrailDisp = buscarHoja(workbook, 'Trailers disponibles', 'TrailersDisponibles');
    const trailersDisponibles = hojaTrailDisp ? leerHoja(workbook, hojaTrailDisp).map(normalizarTrailerDisponible) : [];
    if (hojaTrailDisp) hojasEncontradas.push('trailersDisponibles');
    
    // Trailers alquiler
    const hojaTrailAlq = buscarHoja(workbook, 'Trailers alquiler', 'TrailersAlquiler');
    const trailersAlquiler = hojaTrailAlq ? leerHoja(workbook, hojaTrailAlq).map(normalizarTrailerAlquiler) : [];
    if (hojaTrailAlq) hojasEncontradas.push('trailersAlquiler');
    
    // Trailers compra
    const hojaTrailComp = buscarHoja(workbook, 'Trailers compra', 'TrailersCompra');
    const trailersCompra = hojaTrailComp ? leerHoja(workbook, hojaTrailComp).map(normalizarTrailerCompra) : [];
    if (hojaTrailComp) hojasEncontradas.push('trailersCompra');
    
    // Mantenimiento trailers (SIN SERVICE - V5.3)
    const hojaMantTrail = buscarHoja(workbook, 'Mantenimiento trailers', 'MantenimientoTrailers', 'Mant_Trailers');
    const mantenimientoTrailers = hojaMantTrail ? leerHoja(workbook, hojaMantTrail).map(normalizarMantenimientoTrailer) : [];
    if (hojaMantTrail) hojasEncontradas.push('mantenimientoTrailers');
    
    // Items adicionales
    const hojaAdicionales = buscarHoja(workbook, 'Items adicionales', 'Adicionales', 'ItemsAdicionales');
    const itemsAdicionales = hojaAdicionales ? leerHoja(workbook, hojaAdicionales).map(normalizarItemAdicional) : [];
    if (hojaAdicionales) hojasEncontradas.push('itemsAdicionales');
    
    // Capacitaciones
    const hojaCapacitaciones = buscarHoja(workbook, 'Capacitaciones', 'Cursos', 'Formacion');
    const capacitaciones = hojaCapacitaciones ? leerHoja(workbook, hojaCapacitaciones).map(normalizarCapacitacion) : [];
    if (hojaCapacitaciones) hojasEncontradas.push('capacitaciones');
    
    // Metadata
    const metadata = extraerMetadata(workbook, hojasEncontradas);
    
    // Log resumen
    console.log('fileImporter: Importación completada', {
      hojasEncontradas,
      registros: {
        personal: personal.length,
        diagramas: diagramas.length,
        movilesDisponibles: movilesDisponibles.length,
        movilesAlquiler: movilesAlquiler.length,
        movilesCompra: movilesCompra.length,
        serviceMoviles: serviceMoviles.length,
        mantenimientoMoviles: mantenimientoMoviles.length,
        trailersDisponibles: trailersDisponibles.length,
        trailersAlquiler: trailersAlquiler.length,
        trailersCompra: trailersCompra.length,
        mantenimientoTrailers: mantenimientoTrailers.length,
        itemsAdicionales: itemsAdicionales.length,
        capacitaciones: capacitaciones.length
      }
    });
    
    // Retornar estructura completa
    return {
      error: false,
      personal,
      diagramas,
      viandas,
      movilesDisponibles,
      movilesAlquiler,
      movilesCompra,
      serviceMoviles,
      mantenimientoMoviles,
      trailersDisponibles,
      trailersAlquiler,
      trailersCompra,
      mantenimientoTrailers,
      itemsAdicionales,
      capacitaciones,
      metadata,
      _hojasOriginales: workbook.SheetNames
    };
    
  } catch (error) {
    console.error('fileImporter: Error importando archivo:', error);
    return {
      error: true,
      message: error.message || 'Error desconocido al importar archivo'
    };
  }
};

// Alias para compatibilidad
export const importarArchivoSoporte = importSupportFile;

// Funciones auxiliares exportadas
export const utils = {
  safeNumber,
  safeString,
  safePositiveInt,
  validarPrecio,
  buscarHoja
};

export default { importSupportFile, importarArchivoSoporte, utils };
