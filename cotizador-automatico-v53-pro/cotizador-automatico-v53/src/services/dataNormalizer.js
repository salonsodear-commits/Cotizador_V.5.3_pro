/**
 * SISTEMA DE COTIZACIÓN V5.3 PRO
 * dataNormalizer.js - Normalizador de datos para exportación
 * 
 * Convierte el estado del cotizador en un payload estandarizado
 * Compatible con excelBuilder.js, reportGenerator.js, ExportButtons.jsx
 */

/**
 * Convertir a número seguro
 * @param {any} val - Valor a convertir
 * @param {number} fallback - Valor por defecto
 * @returns {number}
 */
const safeNumber = (val, fallback = 0) => {
  if (val === null || val === undefined || val === '' || val === '—') return fallback;
  const num = Number(val);
  if (isNaN(num) || !isFinite(num)) return fallback;
  return num;
};

/**
 * Convertir a string seguro
 * @param {any} val - Valor a convertir
 * @param {string} fallback - Valor por defecto
 * @returns {string}
 */
const safeString = (val, fallback = '—') => {
  if (val === null || val === undefined || val === '') return fallback;
  return String(val);
};

/**
 * Convertir a booleano seguro
 * @param {any} val - Valor a convertir
 * @param {boolean} fallback - Valor por defecto
 * @returns {boolean}
 */
const safeBool = (val, fallback = false) => {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'boolean') return val;
  if (typeof val === 'string') {
    return val.toLowerCase() === 'true' || val.toLowerCase() === 'si' || val === '1';
  }
  return Boolean(val);
};

/**
 * Normalizar array de forma segura
 * @param {any} arr - Array a normalizar
 * @returns {Array}
 */
const safeArray = (arr) => {
  if (!arr) return [];
  if (!Array.isArray(arr)) return [];
  return arr;
};

/**
 * Calcular subtotal de items
 * @param {Array} items - Lista de items
 * @param {string} campoTotal - Campo que contiene el total
 * @returns {number}
 */
const calcularSubtotal = (items, campoTotal = 'total') => {
  return safeArray(items)
    .filter(i => i.incluir !== false && i.incluirCTC !== false)
    .reduce((sum, item) => sum + safeNumber(item[campoTotal]), 0);
};

/**
 * Normalizar persona
 * @param {Object} p - Datos de persona
 * @returns {Object}
 */
const normalizarPersona = (p) => {
  if (!p) return null;
  
  const adicionalesIncluidos = safeArray(p.itemsAdicionales).filter(i => i.incluir !== false);
  const capsIncluidas = safeArray(p.capacitaciones).filter(i => i.incluir !== false);
  
  const subtotalAdicionales = adicionalesIncluidos.reduce((s, i) => 
    s + (safeNumber(i.precio) * safeNumber(i.cantidad, 1)), 0);
  const subtotalCapacitaciones = capsIncluidas.reduce((s, i) => 
    s + (safeNumber(i.precio) * safeNumber(i.cantidad, 1)), 0);
  
  const costoBase = safeNumber(p.costoBase) || safeNumber(p.valorHora) * safeNumber(p.horasPorDia, 8) * safeNumber(p.diasMes, 22);
  const total = costoBase + subtotalAdicionales + subtotalCapacitaciones + safeNumber(p.costoConvalidado);
  
  return {
    id: p.id || Date.now(),
    nombre: safeString(p.nombre, 'Sin nombre'),
    tipoContrato: safeString(p.tipoContrato || p.tipoContratacion),
    convenio: safeString(p.convenio),
    categoria: safeString(p.categoria || p.puesto),
    clasificacion: safeString(p.clasificacion),
    provincia: safeString(p.provincia),
    diagrama: safeString(p.diagrama),
    horasPorDia: safeNumber(p.horasPorDia, 8),
    diasMes: safeNumber(p.diasMes, 22),
    valorHora: safeNumber(p.valorHora),
    costoBase: safeNumber(costoBase),
    costoConvalidado: safeNumber(p.costoConvalidado),
    incluyeConvalidado: safeBool(p.incluyeConvalidado),
    itemsAdicionales: adicionalesIncluidos.map(i => ({
      id: i.id,
      codigo: safeString(i.codigo),
      descripcion: safeString(i.descripcion),
      precio: safeNumber(i.precio),
      cantidad: safeNumber(i.cantidad, 1),
      total: safeNumber(i.precio) * safeNumber(i.cantidad, 1),
      enCTC: safeBool(i.enCTC)
    })),
    capacitaciones: capsIncluidas.map(c => ({
      id: c.id,
      codigo: safeString(c.codigo),
      descripcion: safeString(c.descripcion),
      precio: safeNumber(c.precio),
      cantidad: safeNumber(c.cantidad, 1),
      duracionHoras: safeNumber(c.duracionHoras),
      total: safeNumber(c.precio) * safeNumber(c.cantidad, 1)
    })),
    subtotalAdicionales,
    subtotalCapacitaciones,
    total: safeNumber(p.total) || total,
    incluirCTC: safeBool(p.incluirCTC, true),
    importado: safeBool(p.importado),
    origenImportacion: safeString(p.origenImportacion, ''),
    observaciones: safeString(p.observaciones, '')
  };
};

/**
 * Normalizar móvil disponible
 * @param {Object} m - Datos del móvil
 * @returns {Object}
 */
const normalizarMovilDisponible = (m) => {
  if (!m) return null;
  
  const service = safeNumber(m.costoService);
  const mantenimiento = safeNumber(m.costoMantenimiento);
  const total = service + mantenimiento;
  
  return {
    id: m.id || Date.now(),
    tipo: safeString(m.tipo),
    dominio: safeString(m.dominio),
    descripcion: safeString(m.descripcion || m.modelo),
    antiguedad: safeNumber(m.antiguedad),
    adquisicion: 'Disponible',
    costoBase: 0,
    service,
    mantenimiento,
    total: safeNumber(m.total) || total,
    mkLinea: safeNumber(m.mkLinea),
    incluirCTC: safeBool(m.incluirCTC, true),
    observaciones: safeString(m.observaciones, '')
  };
};

/**
 * Normalizar móvil en alquiler
 * @param {Object} m - Datos del móvil
 * @returns {Object}
 */
const normalizarMovilAlquiler = (m) => {
  if (!m) return null;
  
  const costoAlquiler = safeNumber(m.costoAlquiler);
  const service = safeNumber(m.costoService);
  const mantenimiento = safeNumber(m.costoMantenimiento);
  const total = costoAlquiler + service + mantenimiento;
  
  return {
    id: m.id || Date.now(),
    tipo: safeString(m.tipo),
    dominio: safeString(m.dominio),
    descripcion: safeString(m.descripcion || m.modelo),
    antiguedad: safeNumber(m.antiguedad),
    adquisicion: 'Alquiler',
    proveedor: safeString(m.proveedorAlquiler || m.proveedor),
    costoAlquiler,
    service,
    mantenimiento,
    total: safeNumber(m.total) || total,
    mkLinea: safeNumber(m.mkLinea),
    incluirCTC: safeBool(m.incluirCTC, true),
    observaciones: safeString(m.observaciones, '')
  };
};

/**
 * Normalizar móvil en compra
 * @param {Object} m - Datos del móvil
 * @returns {Object}
 */
const normalizarMovilCompra = (m) => {
  if (!m) return null;
  
  const inversionInicial = safeNumber(m.inversionInicial);
  const mesesAmortizacion = safeNumber(m.mesesAmortizacion, 1);
  const amortizacionMensual = safeNumber(m.amortizacionMensual) || (mesesAmortizacion > 0 ? inversionInicial / mesesAmortizacion : 0);
  const service = safeNumber(m.costoService);
  const mantenimiento = safeNumber(m.costoMantenimiento);
  const total = amortizacionMensual + service + mantenimiento;
  
  return {
    id: m.id || Date.now(),
    tipo: safeString(m.tipo),
    dominio: safeString(m.dominio),
    descripcion: safeString(m.descripcion || m.modelo),
    antiguedad: safeNumber(m.antiguedad),
    adquisicion: 'Compra',
    inversionInicial,
    mesesAmortizacion,
    amortizacionMensual,
    service,
    mantenimiento,
    total: safeNumber(m.total) || total,
    mkLinea: safeNumber(m.mkLinea),
    incluirCTC: safeBool(m.incluirCTC, true),
    observaciones: safeString(m.observaciones, '')
  };
};

/**
 * Normalizar trailer disponible (SIN SERVICE - V5.3)
 * @param {Object} t - Datos del trailer
 * @returns {Object}
 */
const normalizarTrailerDisponible = (t) => {
  if (!t) return null;
  
  const mantenimiento = safeNumber(t.costoMantenimiento);
  const total = mantenimiento; // Sin service
  
  return {
    id: t.id || Date.now(),
    tipo: safeString(t.tipo),
    identificacion: safeString(t.identificacion),
    descripcion: safeString(t.descripcion || t.modelo),
    antiguedad: safeNumber(t.antiguedad),
    capacidad: safeNumber(t.capacidad),
    adquisicion: 'Disponible',
    costoBase: 0,
    mantenimiento,
    total: safeNumber(t.total) || total,
    mkLinea: safeNumber(t.mkLinea),
    incluirCTC: safeBool(t.incluirCTC, true),
    observaciones: safeString(t.observaciones, ''),
    _nota: 'Sin Service (V5.3)'
  };
};

/**
 * Normalizar trailer en alquiler (SIN SERVICE - V5.3)
 * @param {Object} t - Datos del trailer
 * @returns {Object}
 */
const normalizarTrailerAlquiler = (t) => {
  if (!t) return null;
  
  const costoAlquiler = safeNumber(t.costoAlquiler);
  const mantenimiento = safeNumber(t.costoMantenimiento);
  const total = costoAlquiler + mantenimiento; // Sin service
  
  return {
    id: t.id || Date.now(),
    tipo: safeString(t.tipo),
    identificacion: safeString(t.identificacion),
    descripcion: safeString(t.descripcion || t.modelo),
    antiguedad: safeNumber(t.antiguedad),
    capacidad: safeNumber(t.capacidad),
    adquisicion: 'Alquiler',
    proveedor: safeString(t.proveedorAlquiler || t.proveedor),
    costoAlquiler,
    mantenimiento,
    total: safeNumber(t.total) || total,
    mkLinea: safeNumber(t.mkLinea),
    incluirCTC: safeBool(t.incluirCTC, true),
    observaciones: safeString(t.observaciones, ''),
    _nota: 'Sin Service (V5.3)'
  };
};

/**
 * Normalizar trailer en compra (SIN SERVICE - V5.3)
 * @param {Object} t - Datos del trailer
 * @returns {Object}
 */
const normalizarTrailerCompra = (t) => {
  if (!t) return null;
  
  const inversionInicial = safeNumber(t.inversionInicial);
  const mesesAmortizacion = safeNumber(t.mesesAmortizacion, 1);
  const amortizacionMensual = safeNumber(t.amortizacionMensual) || (mesesAmortizacion > 0 ? inversionInicial / mesesAmortizacion : 0);
  const mantenimiento = safeNumber(t.costoMantenimiento);
  const total = amortizacionMensual + mantenimiento; // Sin service
  
  return {
    id: t.id || Date.now(),
    tipo: safeString(t.tipo),
    identificacion: safeString(t.identificacion),
    descripcion: safeString(t.descripcion || t.modelo),
    antiguedad: safeNumber(t.antiguedad),
    capacidad: safeNumber(t.capacidad),
    adquisicion: 'Compra',
    inversionInicial,
    mesesAmortizacion,
    amortizacionMensual,
    mantenimiento,
    total: safeNumber(t.total) || total,
    mkLinea: safeNumber(t.mkLinea),
    incluirCTC: safeBool(t.incluirCTC, true),
    observaciones: safeString(t.observaciones, ''),
    _nota: 'Sin Service (V5.3)'
  };
};

/**
 * Normalizar item adicional
 * @param {Object} i - Datos del item
 * @returns {Object}
 */
const normalizarItemAdicional = (i) => {
  if (!i) return null;
  
  return {
    id: i.id || Date.now(),
    codigo: safeString(i.codigo),
    descripcion: safeString(i.descripcion),
    precio: safeNumber(i.precio),
    cantidad: safeNumber(i.cantidad, 1),
    total: safeNumber(i.precio) * safeNumber(i.cantidad, 1),
    enCTC: safeBool(i.enCTC),
    incluir: safeBool(i.incluir, true),
    observaciones: safeString(i.observaciones, '')
  };
};

/**
 * Normalizar capacitación
 * @param {Object} c - Datos de capacitación
 * @returns {Object}
 */
const normalizarCapacitacion = (c) => {
  if (!c) return null;
  
  return {
    id: c.id || Date.now(),
    codigo: safeString(c.codigo),
    descripcion: safeString(c.descripcion),
    modalidad: safeString(c.modalidad),
    duracionHoras: safeNumber(c.duracionHoras),
    precio: safeNumber(c.precio),
    cantidad: safeNumber(c.cantidad, 1),
    total: safeNumber(c.precio) * safeNumber(c.cantidad, 1),
    enCTC: safeBool(c.enCTC),
    incluir: safeBool(c.incluir, true),
    observaciones: safeString(c.observaciones, '')
  };
};

/**
 * Normalizar items de service
 * @param {Array} items - Lista de items de service
 * @returns {Array}
 */
const normalizarServiceItems = (items) => {
  return safeArray(items).map(i => ({
    id: i.id,
    codigo: safeString(i.codigo),
    descripcion: safeString(i.descripcion),
    precio: safeNumber(i.precio),
    frecuenciaAnual: safeNumber(i.frecuenciaAnual, 1),
    totalAnual: safeNumber(i.precio) * safeNumber(i.frecuenciaAnual, 1),
    totalMensual: (safeNumber(i.precio) * safeNumber(i.frecuenciaAnual, 1)) / 12,
    incluir: safeBool(i.incluir, true)
  }));
};

/**
 * Normalizar items de mantenimiento
 * @param {Array} items - Lista de items de mantenimiento
 * @returns {Array}
 */
const normalizarMantenimientoItems = (items) => {
  return safeArray(items).map(i => ({
    id: i.id,
    codigo: safeString(i.codigo),
    descripcion: safeString(i.descripcion),
    precio: safeNumber(i.precio),
    frecuenciaAnual: safeNumber(i.frecuenciaAnual, 1),
    totalAnual: safeNumber(i.precio) * safeNumber(i.frecuenciaAnual, 1),
    totalMensual: (safeNumber(i.precio) * safeNumber(i.frecuenciaAnual, 1)) / 12,
    incluir: safeBool(i.incluir, true)
  }));
};

/**
 * Función principal - Normalizar datos para exportación
 * @param {Object} state - Estado completo del cotizador
 * @returns {Object} - Payload normalizado
 */
export const normalizeDataForExport = (state) => {
  if (!state) {
    throw new Error('Estado requerido para normalizar datos');
  }

  try {
    const ahora = new Date();
    
    // Normalizar personal
    const personal = safeArray(state.personal).map(normalizarPersona).filter(Boolean);
    
    // Normalizar móviles
    const movilesDisponibles = safeArray(state.moviles?.disponibles).map(normalizarMovilDisponible).filter(Boolean);
    const movilesAlquiler = safeArray(state.moviles?.alquiler).map(normalizarMovilAlquiler).filter(Boolean);
    const movilesCompra = safeArray(state.moviles?.compra).map(normalizarMovilCompra).filter(Boolean);
    
    // Normalizar trailers (SIN SERVICE)
    const trailersDisponibles = safeArray(state.trailers?.disponibles).map(normalizarTrailerDisponible).filter(Boolean);
    const trailersAlquiler = safeArray(state.trailers?.alquiler).map(normalizarTrailerAlquiler).filter(Boolean);
    const trailersCompra = safeArray(state.trailers?.compra).map(normalizarTrailerCompra).filter(Boolean);
    
    // Normalizar adicionales y capacitaciones
    const itemsAdicionales = safeArray(state.itemsAdicionales || state.adicionales).map(normalizarItemAdicional).filter(Boolean);
    const capacitaciones = safeArray(state.capacitaciones).map(normalizarCapacitacion).filter(Boolean);
    
    // Normalizar service y mantenimiento items
    const serviceItems = normalizarServiceItems(state.moviles?.serviceItems);
    const mantenimientoMovilesItems = normalizarMantenimientoItems(state.moviles?.mantenimientoItems);
    const mantenimientoTrailersItems = normalizarMantenimientoItems(state.trailers?.mantenimientoItems);
    
    // Calcular subtotales
    const subtotalPersonal = calcularSubtotal(personal);
    const subtotalMovilesDisp = calcularSubtotal(movilesDisponibles);
    const subtotalMovilesAlq = calcularSubtotal(movilesAlquiler);
    const subtotalMovilesComp = calcularSubtotal(movilesCompra);
    const subtotalMoviles = subtotalMovilesDisp + subtotalMovilesAlq + subtotalMovilesComp;
    
    const subtotalTrailersDisp = calcularSubtotal(trailersDisponibles);
    const subtotalTrailersAlq = calcularSubtotal(trailersAlquiler);
    const subtotalTrailersComp = calcularSubtotal(trailersCompra);
    const subtotalTrailers = subtotalTrailersDisp + subtotalTrailersAlq + subtotalTrailersComp;
    
    const subtotalAdicionales = calcularSubtotal(itemsAdicionales.filter(i => i.incluir));
    const subtotalCapacitaciones = calcularSubtotal(capacitaciones.filter(c => c.incluir));
    
    // Totales service/mantenimiento
    const totalServiceMoviles = serviceItems.filter(i => i.incluir).reduce((s, i) => s + i.totalMensual, 0);
    const totalMantMoviles = mantenimientoMovilesItems.filter(i => i.incluir).reduce((s, i) => s + i.totalMensual, 0);
    const totalMantTrailers = mantenimientoTrailersItems.filter(i => i.incluir).reduce((s, i) => s + i.totalMensual, 0);
    
    // Calcular totales globales
    const subtotalNeto = subtotalPersonal + subtotalMoviles + subtotalTrailers + subtotalAdicionales + subtotalCapacitaciones;
    const overhead = safeNumber(state.configuracion?.overhead || state.overhead);
    const markup = safeNumber(state.configuracion?.markup || state.markup);
    const overheadMonto = subtotalNeto * (overhead / 100);
    const totalConOverhead = subtotalNeto + overheadMonto;
    const markupMonto = totalConOverhead * (markup / 100);
    const totalFinal = totalConOverhead + markupMonto;
    
    // Construir payload normalizado
    return {
      metadata: {
        nombreProyecto: safeString(state.metadata?.nombreProyecto, 'Cotización'),
        cliente: safeString(state.metadata?.cliente, ''),
        fecha: ahora.toISOString(),
        fechaFormateada: ahora.toLocaleDateString('es-AR'),
        version: 'V5.3 PRO',
        generadoPor: 'Sistema de Cotización',
        ...state.metadata
      },
      
      configuracion: {
        provincia: safeString(state.configuracion?.provincia),
        diagrama: safeString(state.configuracion?.diagrama),
        horasPorDia: safeNumber(state.configuracion?.horasPorDia, 8),
        convenio: safeString(state.configuracion?.convenio),
        tipoContratacion: safeString(state.configuracion?.tipoContratacion),
        overhead,
        markup
      },
      
      personal,
      
      moviles: {
        disponibles: movilesDisponibles,
        alquiler: movilesAlquiler,
        compra: movilesCompra,
        serviceItems,
        mantenimientoItems: mantenimientoMovilesItems,
        subtotales: {
          disponibles: subtotalMovilesDisp,
          alquiler: subtotalMovilesAlq,
          compra: subtotalMovilesComp,
          service: totalServiceMoviles,
          mantenimiento: totalMantMoviles,
          total: subtotalMoviles
        }
      },
      
      trailers: {
        disponibles: trailersDisponibles,
        alquiler: trailersAlquiler,
        compra: trailersCompra,
        mantenimientoItems: mantenimientoTrailersItems,
        subtotales: {
          disponibles: subtotalTrailersDisp,
          alquiler: subtotalTrailersAlq,
          compra: subtotalTrailersComp,
          mantenimiento: totalMantTrailers,
          total: subtotalTrailers
        },
        nota: 'Trailers sin Service (V5.3)'
      },
      
      itemsAdicionales,
      capacitaciones,
      
      totales: {
        personal: subtotalPersonal,
        moviles: subtotalMoviles,
        trailers: subtotalTrailers,
        capacitaciones: subtotalCapacitaciones,
        itemsAdicionales: subtotalAdicionales,
        subtotalNeto,
        overhead,
        overheadMonto,
        totalConOverhead,
        markup,
        markupMonto,
        totalFinal
      },
      
      importacion: {
        tieneArchivo: safeBool(state.datosImportados && Object.keys(state.datosImportados).length > 0),
        hojas: state.datosImportados ? Object.keys(state.datosImportados) : []
      }
    };
    
  } catch (error) {
    console.error('Error normalizando datos:', error);
    throw new Error(`Error al normalizar datos: ${error.message}`);
  }
};

// Exportar funciones auxiliares para uso externo
export const utils = {
  safeNumber,
  safeString,
  safeBool,
  safeArray,
  calcularSubtotal
};

export default { normalizeDataForExport, utils };
