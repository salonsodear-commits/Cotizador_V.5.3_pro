/**
 * SISTEMA DE COTIZACIÓN V5.3 PRO
 * validators.js - Validaciones combinadas
 * V5.3 Punto 15: Validaciones que funcionan en conjunto
 */

import {
  PROVINCIAS,
  CONVENIOS,
  TIPOS_CONTRATO,
  DIAGRAMAS,
  HORAS_POR_DIA_OPCIONES,
  ARCHIVOS_SOPORTE
} from './constants.js';

import {
  getCategoriasPorConvenio,
  getPuestosPorCategoria,
  getTopeHoras,
  calcularHorasMes,
  debeMostrarConvenio,
  esPuestoLibre
} from './logic.js';

// ═══════════════════════════════════════════════════════════════════════════
// VALIDACIÓN DE CONFIGURACIÓN GENERAL
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Valida la configuración general de la cotización
 */
export const validarConfiguracion = (config) => {
  const errores = [];
  const advertencias = [];
  
  if (!config.nombreCotizacion || config.nombreCotizacion.trim() === '') {
    advertencias.push('Se recomienda asignar un nombre a la cotización');
  }
  
  if (!config.clienteNombre || config.clienteNombre.trim() === '') {
    advertencias.push('Se recomienda especificar el nombre del cliente');
  }
  
  if (!config.provinciaSeleccionada) {
    errores.push('Debe seleccionar una provincia');
  } else if (!PROVINCIAS.includes(config.provinciaSeleccionada)) {
    errores.push('Provincia seleccionada no válida');
  }
  
  if (!config.mesCotizacion) {
    errores.push('Debe especificar el mes de cotización');
  }
  
  return {
    esValido: errores.length === 0,
    errores,
    advertencias
  };
};

// ═══════════════════════════════════════════════════════════════════════════
// VALIDACIÓN DE ARCHIVOS SOPORTE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Valida que todos los archivos requeridos estén cargados
 */
export const validarArchivosSoporte = (archivosCargados) => {
  const errores = [];
  const faltantes = [];
  
  ARCHIVOS_SOPORTE.forEach(archivo => {
    if (archivo.requerido && !archivosCargados[archivo.key]) {
      faltantes.push(archivo.label);
      errores.push(`Falta archivo requerido: ${archivo.label}`);
    }
  });
  
  return {
    esValido: errores.length === 0,
    errores,
    faltantes,
    totalRequeridos: ARCHIVOS_SOPORTE.filter(a => a.requerido).length,
    totalCargados: Object.values(archivosCargados).filter(Boolean).length
  };
};

/**
 * Valida estructura de archivo importado
 */
export const validarEstructuraArchivo = (archivoKey, datos) => {
  const archivoConfig = ARCHIVOS_SOPORTE.find(a => a.key === archivoKey);
  
  if (!archivoConfig) {
    return { esValido: false, errores: ['Tipo de archivo no reconocido'] };
  }
  
  if (!datos || datos.length === 0) {
    return { esValido: false, errores: ['El archivo está vacío'] };
  }
  
  // Validar columnas si están definidas
  if (archivoConfig.columnas && archivoConfig.columnas.length > 0) {
    const columnasArchivo = Object.keys(datos[0]);
    const columnasFaltantes = archivoConfig.columnas.filter(
      col => !columnasArchivo.some(c => c.toLowerCase() === col.toLowerCase())
    );
    
    if (columnasFaltantes.length > 0) {
      return {
        esValido: false,
        errores: [`Columnas faltantes: ${columnasFaltantes.join(', ')}`]
      };
    }
  }
  
  return { esValido: true, errores: [] };
};

// ═══════════════════════════════════════════════════════════════════════════
// VALIDACIÓN DE PERSONAL (V5.3 Punto 15)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Valida un registro de personal completo
 * V5.3: Validaciones combinadas de todos los campos
 */
export const validarPersonal = (personal, provinciaSeleccionada) => {
  const errores = [];
  const advertencias = [];
  
  // Validar tipo de contrato
  const tipoValido = TIPOS_CONTRATO.find(t => t.value === personal.tipoContrato);
  if (!tipoValido) {
    errores.push('Tipo de contratación no válido');
  }
  
  // Validaciones según tipo de contrato
  if (personal.tipoContrato === 'RD') {
    // Relación de dependencia requiere convenio, categoría y puesto
    if (!personal.convenio || !CONVENIOS.includes(personal.convenio)) {
      errores.push('Debe seleccionar un convenio válido');
    }
    
    if (personal.convenio) {
      const categorias = getCategoriasPorConvenio(personal.convenio);
      if (!personal.categoria || !categorias.includes(personal.categoria)) {
        errores.push('Debe seleccionar una categoría válida para el convenio');
      }
      
      if (personal.categoria) {
        const puestos = getPuestosPorCategoria(personal.categoria);
        if (!personal.puesto || !puestos.includes(personal.puesto)) {
          errores.push('Debe seleccionar un puesto válido para la categoría');
        }
      }
    }
    
  } else if (personal.tipoContrato === 'MT' || personal.tipoContrato === 'FUCO') {
    // MT y FUCO requieren puesto libre y valor hora
    if (!personal.puesto || personal.puesto.trim() === '') {
      errores.push('Debe especificar el puesto');
    }
    
    if (!personal.valorHora || personal.valorHora <= 0) {
      errores.push('Debe especificar el valor hora');
    }
    
    // V5.3 Punto 5: Advertencia si no hay provincia seleccionada
    if (!provinciaSeleccionada) {
      advertencias.push('Seleccione una provincia para autocompletar valores');
    }
  }
  
  // Validar diagrama
  const diagramaValido = DIAGRAMAS.find(d => d.value === personal.diagrama);
  if (!diagramaValido) {
    errores.push('Diagrama no válido');
  }
  
  // V5.3 Punto 4: Validar horas por día
  if (personal.horasPorDia !== 'manual') {
    const horasValidas = HORAS_POR_DIA_OPCIONES.find(h => h.value === personal.horasPorDia);
    if (!horasValidas) {
      errores.push('Horas por día no válidas');
    }
  }
  
  // Validar horas manuales si aplica
  if (personal.diagrama === 'Manual' || personal.horasPorDia === 'manual') {
    if (!personal.horasManuales || personal.horasManuales <= 0) {
      errores.push('Debe especificar las horas manuales');
    }
  }
  
  // Validar tope de horas
  const horasMes = calcularHorasMes(
    personal.diagrama,
    personal.horasPorDia,
    personal.horasManuales
  );
  const tope = getTopeHoras(personal.tipoContrato, personal.convenio);
  
  if (horasMes > tope) {
    advertencias.push(`Las horas mensuales (${horasMes}) superan el tope del convenio (${tope})`);
  }
  
  // Validar items adicionales
  if (personal.itemsAdicionales && personal.itemsAdicionales.length > 0) {
    personal.itemsAdicionales.forEach((item, idx) => {
      if (!item.descripcion || item.descripcion.trim() === '') {
        advertencias.push(`Item adicional ${idx + 1} sin descripción`);
      }
      if (item.precio < 0) {
        errores.push(`Item adicional ${idx + 1} con precio negativo`);
      }
    });
  }
  
  // Validar capacitaciones
  if (personal.capacitaciones && personal.capacitaciones.length > 0) {
    personal.capacitaciones.forEach((cap, idx) => {
      if (!cap.descripcion || cap.descripcion.trim() === '') {
        advertencias.push(`Capacitación ${idx + 1} sin descripción`);
      }
      if (cap.precio < 0) {
        errores.push(`Capacitación ${idx + 1} con precio negativo`);
      }
    });
  }
  
  return {
    esValido: errores.length === 0,
    errores,
    advertencias,
    horasMes,
    topeHoras: tope
  };
};

// ═══════════════════════════════════════════════════════════════════════════
// VALIDACIÓN DE MÓVILES (V5.3 Punto 10)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Valida un móvil
 */
export const validarMovil = (movil) => {
  const errores = [];
  const advertencias = [];
  
  if (!movil.tipo) {
    errores.push('Debe especificar el tipo de móvil');
  }
  
  if (!movil.adquisicion) {
    errores.push('Debe especificar el tipo de adquisición');
  }
  
  // Validar según tipo de adquisición
  if (movil.adquisicion === 'Alquiler') {
    if (!movil.costoAlquiler || movil.costoAlquiler <= 0) {
      advertencias.push('No se ha especificado el costo de alquiler');
    }
  }
  
  if (movil.adquisicion === 'Compra') {
    if (!movil.inversionInicial || movil.inversionInicial <= 0) {
      advertencias.push('No se ha especificado la inversión inicial');
    }
    if (!movil.mesesAmortizacion || movil.mesesAmortizacion <= 0) {
      errores.push('Los meses de amortización deben ser mayor a cero');
    }
  }
  
  // Validar items de service
  if (!movil.itemsService || movil.itemsService.length === 0) {
    advertencias.push('No hay items de service configurados');
  } else {
    movil.itemsService.forEach((item, idx) => {
      if (item.precio < 0) {
        errores.push(`Service ${idx + 1} con precio negativo`);
      }
      if (item.frecuenciaAnual <= 0) {
        advertencias.push(`Service ${idx + 1} con frecuencia inválida`);
      }
    });
  }
  
  // Validar items de mantenimiento
  if (!movil.itemsMantenimiento || movil.itemsMantenimiento.length === 0) {
    advertencias.push('No hay items de mantenimiento configurados');
  } else {
    movil.itemsMantenimiento.forEach((item, idx) => {
      if (item.precio < 0) {
        errores.push(`Mantenimiento ${idx + 1} con precio negativo`);
      }
    });
  }
  
  return {
    esValido: errores.length === 0,
    errores,
    advertencias
  };
};

// ═══════════════════════════════════════════════════════════════════════════
// VALIDACIÓN DE TRAILERS (V5.3 Punto 10)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Valida un trailer
 */
export const validarTrailer = (trailer) => {
  const errores = [];
  const advertencias = [];
  
  if (!trailer.tipo) {
    errores.push('Debe especificar el tipo de trailer');
  }
  
  if (!trailer.adquisicion) {
    errores.push('Debe especificar el tipo de adquisición');
  }
  
  // Validar según tipo de adquisición
  if (trailer.adquisicion === 'Alquiler') {
    if (!trailer.costoAlquiler || trailer.costoAlquiler <= 0) {
      advertencias.push('No se ha especificado el costo de alquiler');
    }
  }
  
  if (trailer.adquisicion === 'Compra') {
    if (!trailer.inversionInicial || trailer.inversionInicial <= 0) {
      advertencias.push('No se ha especificado la inversión inicial');
    }
    if (!trailer.mesesAmortizacion || trailer.mesesAmortizacion <= 0) {
      errores.push('Los meses de amortización deben ser mayor a cero');
    }
  }
  
  // V5.3 Punto 10.6: Trailers NO tienen service, solo mantenimiento
  if (!trailer.itemsMantenimiento || trailer.itemsMantenimiento.length === 0) {
    advertencias.push('No hay items de mantenimiento configurados');
  } else {
    trailer.itemsMantenimiento.forEach((item, idx) => {
      if (item.precio < 0) {
        errores.push(`Mantenimiento ${idx + 1} con precio negativo`);
      }
    });
  }
  
  return {
    esValido: errores.length === 0,
    errores,
    advertencias
  };
};

// ═══════════════════════════════════════════════════════════════════════════
// VALIDACIÓN DE OTROS COSTOS Y ESTRUCTURA
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Valida un item de otros costos
 */
export const validarOtroCosto = (otroCosto) => {
  const errores = [];
  const advertencias = [];
  
  if (!otroCosto.descripcion || otroCosto.descripcion.trim() === '') {
    advertencias.push('Item sin descripción');
  }
  
  if (otroCosto.precio < 0) {
    errores.push('Precio no puede ser negativo');
  }
  
  if (otroCosto.cantidad <= 0) {
    errores.push('Cantidad debe ser mayor a cero');
  }
  
  return {
    esValido: errores.length === 0,
    errores,
    advertencias
  };
};

/**
 * Valida un gasto de estructura
 */
export const validarGastoEstructura = (gasto) => {
  const errores = [];
  const advertencias = [];
  
  if (!gasto.descripcion || gasto.descripcion.trim() === '') {
    advertencias.push('Gasto sin descripción');
  }
  
  if (gasto.precio < 0) {
    errores.push('Precio no puede ser negativo');
  }
  
  if (gasto.cantidad <= 0) {
    errores.push('Cantidad debe ser mayor a cero');
  }
  
  return {
    esValido: errores.length === 0,
    errores,
    advertencias
  };
};

// ═══════════════════════════════════════════════════════════════════════════
// VALIDACIÓN DE SEGUROS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Valida un seguro
 */
export const validarSeguro = (seguro) => {
  const errores = [];
  const advertencias = [];
  
  if (!seguro.tipo) {
    errores.push('Debe especificar el tipo de seguro');
  }
  
  if (seguro.prima < 0) {
    errores.push('Prima no puede ser negativa');
  }
  
  if (!seguro.aplicaSobre || seguro.aplicaSobre.trim() === '') {
    advertencias.push('Se recomienda especificar sobre qué aplica el seguro');
  }
  
  return {
    esValido: errores.length === 0,
    errores,
    advertencias
  };
};

// ═══════════════════════════════════════════════════════════════════════════
// VALIDACIÓN COMPLETA DE COTIZACIÓN
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Valida toda la cotización
 * V5.3 Punto 15: Validaciones combinadas completas
 */
export const validarCotizacionCompleta = (
  config,
  archivosCargados,
  personal,
  moviles,
  trailers,
  otrosCostos,
  gastosEstructura,
  seguros
) => {
  const resultados = {
    config: validarConfiguracion(config),
    archivos: validarArchivosSoporte(archivosCargados),
    personal: personal.map(p => ({
      id: p.id,
      ...validarPersonal(p, config.provinciaSeleccionada)
    })),
    moviles: moviles.map(m => ({
      id: m.id,
      ...validarMovil(m)
    })),
    trailers: trailers.map(t => ({
      id: t.id,
      ...validarTrailer(t)
    })),
    otrosCostos: otrosCostos.map(oc => ({
      id: oc.id,
      ...validarOtroCosto(oc)
    })),
    gastosEstructura: gastosEstructura.map(ge => ({
      id: ge.id,
      ...validarGastoEstructura(ge)
    })),
    seguros: seguros.map(s => ({
      id: s.id,
      ...validarSeguro(s)
    }))
  };
  
  // Calcular totales de errores y advertencias
  const totalErrores = 
    resultados.config.errores.length +
    resultados.archivos.errores.length +
    resultados.personal.reduce((acc, p) => acc + p.errores.length, 0) +
    resultados.moviles.reduce((acc, m) => acc + m.errores.length, 0) +
    resultados.trailers.reduce((acc, t) => acc + t.errores.length, 0) +
    resultados.otrosCostos.reduce((acc, oc) => acc + oc.errores.length, 0) +
    resultados.gastosEstructura.reduce((acc, ge) => acc + ge.errores.length, 0) +
    resultados.seguros.reduce((acc, s) => acc + s.errores.length, 0);
  
  const totalAdvertencias =
    resultados.config.advertencias.length +
    resultados.personal.reduce((acc, p) => acc + p.advertencias.length, 0) +
    resultados.moviles.reduce((acc, m) => acc + m.advertencias.length, 0) +
    resultados.trailers.reduce((acc, t) => acc + t.advertencias.length, 0) +
    resultados.otrosCostos.reduce((acc, oc) => acc + oc.advertencias.length, 0) +
    resultados.gastosEstructura.reduce((acc, ge) => acc + ge.advertencias.length, 0) +
    resultados.seguros.reduce((acc, s) => acc + s.advertencias.length, 0);
  
  return {
    esValido: totalErrores === 0,
    totalErrores,
    totalAdvertencias,
    resultados
  };
};

export default {
  validarConfiguracion,
  validarArchivosSoporte,
  validarEstructuraArchivo,
  validarPersonal,
  validarMovil,
  validarTrailer,
  validarOtroCosto,
  validarGastoEstructura,
  validarSeguro,
  validarCotizacionCompleta
};
