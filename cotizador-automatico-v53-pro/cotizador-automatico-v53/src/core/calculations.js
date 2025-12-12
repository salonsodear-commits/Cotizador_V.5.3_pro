/**
 * SISTEMA DE COTIZACIÓN V5.3 PRO
 * calculations.js - Funciones de cálculo
 * Basado en V5.2 PRO con correcciones V5.3
 */

import { TIPOS_HORA_EXTRA, TIPOS_VIANDA } from './constants.js';
import { calcularHorasMes } from './logic.js';

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS DE BÚSQUEDA EN DATOS IMPORTADOS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Busca sueldo en datos importados
 */
export const buscarSueldo = (dataSueldos, convenio, categoria, puesto) => {
  if (!dataSueldos || dataSueldos.length === 0) {
    return { sueldoBruto: 0, costoCia: 0 };
  }
  
  const found = dataSueldos.find(s => 
    s.Convenio === convenio && 
    s.Categoria === categoria && 
    s.Puesto === puesto
  );
  
  return found 
    ? { sueldoBruto: found.Sueldo_Bruto || 0, costoCia: found.Costo_Total_Cia || 0 }
    : { sueldoBruto: 0, costoCia: 0 };
};

/**
 * Busca valor hora para MT/FUCO en datos importados
 * V5.3 Punto 5
 */
export const buscarValorHoraMT = (dataMonotributistas, provincia, puesto) => {
  if (!dataMonotributistas || dataMonotributistas.length === 0) {
    return 0;
  }
  
  const found = dataMonotributistas.find(m => 
    m.Provincia === provincia && 
    m.Puesto === puesto
  );
  
  return found ? (found.Valor_Sugerido || 0) : 0;
};

/**
 * Obtiene precio de vianda
 */
export const getPrecioVianda = (tipo) => {
  const vianda = TIPOS_VIANDA.find(v => v.value === tipo);
  return vianda ? vianda.precioDefault : 20000;
};

// ═══════════════════════════════════════════════════════════════════════════
// CÁLCULO DE PERSONAL
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calcula costos de un registro de personal
 * Retorna objeto con desglose completo
 */
export const calcularPersonal = (personal, dataSueldos, mkCategoria = 0) => {
  let costoBase = 0;
  let costoViandas = 0;
  let costoItemsAdicionales = 0;
  let costoCapacitaciones = 0;
  let costoHorasExtra = 0;
  
  // V5.3 Punto 4: Calcular horas del mes
  const horasMes = calcularHorasMes(
    personal.diagrama, 
    personal.horasPorDia, 
    personal.horasManuales
  );
  
  // Cálculo según tipo de contrato
  if (personal.tipoContrato === 'RD') {
    // Relación de dependencia: usar sueldo importado
    const { costoCia } = buscarSueldo(
      dataSueldos, 
      personal.convenio, 
      personal.categoria, 
      personal.puesto
    );
    costoBase = costoCia;
    
    // Adicionales FATSA
    if (personal.convenio === 'FATSA') {
      if (personal.adicionalEnfermeria) {
        costoBase *= 1.10; // +10%
      }
      if (personal.plusNocturno) {
        costoBase *= 1.15; // +15%
      }
      if (personal.antiguedadAnios > 0) {
        costoBase += personal.antiguedadAnios * (personal.antiguedadImporte || 5000);
      }
    }
    
    // Viandas Petrolero (incluidas automáticamente)
    if (personal.convenio === 'Petrolero' && personal.viandasPetrolero) {
      personal.viandasPetrolero.forEach(v => {
        if (v.incluir) {
          costoViandas += getPrecioVianda(v.tipo);
        }
      });
    }
    
  } else if (personal.tipoContrato === 'MT') {
    // V5.3 Punto 1: Monotributista - SIN costo convalidado
    costoBase = (personal.valorHora || 0) * horasMes;
    
  } else if (personal.tipoContrato === 'FUCO') {
    // V5.3 Punto 1: FUCO - con convalidado opcional
    costoBase = (personal.valorHora || 0) * horasMes;
    if (personal.incluyeConvalidado) {
      costoBase += (personal.costoConvalidado || 0);
    }
  }
  
  // V5.3 Punto 7: Items adicionales
  if (personal.itemsAdicionales && personal.itemsAdicionales.length > 0) {
    personal.itemsAdicionales.forEach(item => {
      if (item.incluirCTC) {
        const costoItem = (item.precio || 0) * (item.cantidad || 1);
        const mkItem = 1 + (item.mkInd || 0) / 100;
        costoItemsAdicionales += costoItem * mkItem;
      }
    });
  }
  
  // V5.3 Punto 7: Capacitaciones
  if (personal.capacitaciones && personal.capacitaciones.length > 0) {
    personal.capacitaciones.forEach(cap => {
      if (cap.incluirCTC) {
        const costoCap = (cap.precio || 0) * (cap.cantidad || 1);
        const mkCap = 1 + (cap.mkInd || 0) / 100;
        costoCapacitaciones += costoCap * mkCap;
      }
    });
  }
  
  // Horas extra
  if (personal.horasExtra && personal.horasExtra.length > 0) {
    const sueldoHora = costoBase / (horasMes || 1);
    personal.horasExtra.forEach(he => {
      if (he.incluirCTC) {
        const tipoHE = TIPOS_HORA_EXTRA.find(t => t.value === he.tipo);
        const factor = tipoHE ? tipoHE.factor : 1.5;
        costoHorasExtra += sueldoHora * factor * (he.cantidad || 0);
      }
    });
  }
  
  // Subtotal antes de markup
  const subtotal = costoBase + costoViandas + costoItemsAdicionales + costoCapacitaciones + costoHorasExtra;
  
  // Aplicar markups
  const mkLinea = 1 + (personal.mkLinea || 0) / 100;
  const mkCat = 1 + (mkCategoria || 0) / 100;
  const total = subtotal * mkLinea * mkCat;
  
  return {
    costoBase,
    costoViandas,
    costoItemsAdicionales,
    costoCapacitaciones,
    costoHorasExtra,
    subtotal,
    mkLinea: personal.mkLinea || 0,
    mkCategoria,
    total,
    horasMes
  };
};

// ═══════════════════════════════════════════════════════════════════════════
// CÁLCULO DE MÓVILES (V5.3 Punto 10)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calcula costo de service mensualizado
 * V5.3 Punto 10.7: Q = frecuencia anual
 */
const calcularCostoServiceMensual = (itemsService) => {
  if (!itemsService || itemsService.length === 0) return 0;
  
  return itemsService.reduce((acc, item) => {
    if (!item.incluir) return acc;
    // Costo anual / 12 = costo mensual
    const costoAnual = (item.precio || 0) * (item.frecuenciaAnual || 1);
    return acc + (costoAnual / 12);
  }, 0);
};

/**
 * Calcula costo de mantenimiento mensualizado
 * V5.3 Punto 10.7: Q = frecuencia anual
 */
const calcularCostoMantenimientoMensual = (itemsMantenimiento) => {
  if (!itemsMantenimiento || itemsMantenimiento.length === 0) return 0;
  
  return itemsMantenimiento.reduce((acc, item) => {
    if (!item.incluir) return acc;
    // Costo anual / 12 = costo mensual
    const costoAnual = (item.precio || 0) * (item.frecuenciaAnual || 1);
    return acc + (costoAnual / 12);
  }, 0);
};

/**
 * Calcula costos de un móvil
 * V5.3 Punto 10.3, 10.4, 10.5, 10.8
 */
export const calcularMovil = (movil, mkCategoria = 0) => {
  let costoBase = 0;
  
  // V5.3 Punto 10.6: Calcular service (solo móviles tienen)
  const costoService = calcularCostoServiceMensual(movil.itemsService);
  
  // V5.3 Punto 10.6: Calcular mantenimiento
  const costoMantenimiento = calcularCostoMantenimientoMensual(movil.itemsMantenimiento);
  
  // V5.3 Punto 10.8: Cálculo según tipo de adquisición
  if (movil.adquisicion === 'Disponible') {
    // V5.3 Punto 10.3: Sin costo base, solo service + mantenimiento
    costoBase = 0;
  } else if (movil.adquisicion === 'Alquiler') {
    // V5.3 Punto 10.4: Costo alquiler
    costoBase = movil.costoAlquiler || 0;
  } else if (movil.adquisicion === 'Compra') {
    // V5.3 Punto 10.5: Amortización mensual
    costoBase = movil.amortizacionMensual || 0;
  }
  
  // V5.3 Punto 10.8: Costo visual
  const costoVisual = costoBase + costoService + costoMantenimiento;
  
  // Aplicar markups
  const mkLinea = 1 + (movil.mkLinea || 0) / 100;
  const mkCat = 1 + (mkCategoria || 0) / 100;
  
  // V5.3 Punto 10.9: Solo incluir si checkbox activo
  const total = movil.incluirCTC ? (costoVisual * mkLinea * mkCat) : 0;
  
  return {
    costoBase,
    costoService,
    costoMantenimiento,
    costoVisual,
    mkLinea: movil.mkLinea || 0,
    mkCategoria,
    total,
    incluidoEnCTC: movil.incluirCTC
  };
};

// ═══════════════════════════════════════════════════════════════════════════
// CÁLCULO DE TRAILERS (V5.3 Punto 10)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calcula costos de un trailer
 * V5.3 Punto 10.6: Solo mantenimiento, sin service
 */
export const calcularTrailer = (trailer, mkCategoria = 0) => {
  let costoBase = 0;
  
  // V5.3 Punto 10.6: Solo mantenimiento para trailers
  const costoMantenimiento = calcularCostoMantenimientoMensual(trailer.itemsMantenimiento);
  
  // V5.3 Punto 10.8: Cálculo según tipo de adquisición
  if (trailer.adquisicion === 'Disponible') {
    costoBase = 0;
  } else if (trailer.adquisicion === 'Alquiler') {
    costoBase = trailer.costoAlquiler || 0;
  } else if (trailer.adquisicion === 'Compra') {
    costoBase = trailer.amortizacionMensual || 0;
  }
  
  // Costo visual
  const costoVisual = costoBase + costoMantenimiento;
  
  // Aplicar markups
  const mkLinea = 1 + (trailer.mkLinea || 0) / 100;
  const mkCat = 1 + (mkCategoria || 0) / 100;
  
  // V5.3 Punto 10.9
  const total = trailer.incluirCTC ? (costoVisual * mkLinea * mkCat) : 0;
  
  return {
    costoBase,
    costoMantenimiento,
    costoVisual,
    mkLinea: trailer.mkLinea || 0,
    mkCategoria,
    total,
    incluidoEnCTC: trailer.incluirCTC
  };
};

// ═══════════════════════════════════════════════════════════════════════════
// CÁLCULO DE OTROS COSTOS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calcula un item de otros costos
 */
export const calcularOtroCosto = (otroCosto, mkCategoria = 0) => {
  const costoBase = (otroCosto.precio || 0) * (otroCosto.cantidad || 1);
  
  const mkLinea = 1 + (otroCosto.mkLinea || 0) / 100;
  const mkCat = 1 + (mkCategoria || 0) / 100;
  
  const total = otroCosto.incluirCTC ? (costoBase * mkLinea * mkCat) : 0;
  
  return {
    costoBase,
    mkLinea: otroCosto.mkLinea || 0,
    mkCategoria,
    total,
    incluidoEnCTC: otroCosto.incluirCTC
  };
};

// ═══════════════════════════════════════════════════════════════════════════
// CÁLCULO DE GASTOS DE ESTRUCTURA
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calcula un gasto de estructura
 */
export const calcularGastoEstructura = (gasto, mkCategoria = 0) => {
  const costoBase = (gasto.precio || 0) * (gasto.cantidad || 1);
  
  const mkLinea = 1 + (gasto.mkLinea || 0) / 100;
  const mkCat = 1 + (mkCategoria || 0) / 100;
  
  const total = gasto.incluirCTC ? (costoBase * mkLinea * mkCat) : 0;
  
  return {
    costoBase,
    mkLinea: gasto.mkLinea || 0,
    mkCategoria,
    total,
    incluidoEnCTC: gasto.incluirCTC
  };
};

// ═══════════════════════════════════════════════════════════════════════════
// CÁLCULO DE SEGUROS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calcula un seguro
 */
export const calcularSeguro = (seguro, mkCategoria = 0) => {
  const costoBase = seguro.prima || 0;
  
  const mkLinea = 1 + (seguro.mkLinea || 0) / 100;
  const mkCat = 1 + (mkCategoria || 0) / 100;
  
  const total = seguro.incluirCTC ? (costoBase * mkLinea * mkCat) : 0;
  
  return {
    costoBase,
    mkLinea: seguro.mkLinea || 0,
    mkCategoria,
    total,
    incluidoEnCTC: seguro.incluirCTC
  };
};

// ═══════════════════════════════════════════════════════════════════════════
// CÁLCULO DE TOTALES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calcula totales de todas las categorías
 */
export const calcularTotales = (
  personal,
  moviles,
  trailers,
  otrosCostos,
  gastosEstructura,
  seguros,
  dataSueldos,
  markup
) => {
  // Total Personal
  const totalPersonal = personal.reduce((acc, p) => {
    const calc = calcularPersonal(p, dataSueldos, markup.personal);
    return acc + calc.total;
  }, 0);
  
  // Total Móviles
  const totalMoviles = moviles.reduce((acc, m) => {
    const calc = calcularMovil(m, markup.moviles);
    return acc + calc.total;
  }, 0);
  
  // Total Trailers
  const totalTrailers = trailers.reduce((acc, t) => {
    const calc = calcularTrailer(t, markup.trailers);
    return acc + calc.total;
  }, 0);
  
  // Total Otros Costos
  const totalOtrosCostos = otrosCostos.reduce((acc, oc) => {
    const calc = calcularOtroCosto(oc, markup.otrosCostos);
    return acc + calc.total;
  }, 0);
  
  // Total Gastos Estructura
  const totalEstructura = gastosEstructura.reduce((acc, ge) => {
    const calc = calcularGastoEstructura(ge, markup.estructura);
    return acc + calc.total;
  }, 0);
  
  // Total Seguros
  const totalSeguros = seguros.reduce((acc, s) => {
    const calc = calcularSeguro(s, markup.seguros);
    return acc + calc.total;
  }, 0);
  
  // Total General
  const totalGeneral = totalPersonal + totalMoviles + totalTrailers + 
                       totalOtrosCostos + totalEstructura + totalSeguros;
  
  return {
    personal: totalPersonal,
    moviles: totalMoviles,
    trailers: totalTrailers,
    otrosCostos: totalOtrosCostos,
    estructura: totalEstructura,
    seguros: totalSeguros,
    total: totalGeneral
  };
};

/**
 * Calcula resumen comercial con análisis de márgenes
 */
export const calcularResumenComercial = (totales, markup) => {
  const categorias = [
    { nombre: 'Personal', costo: totales.personal, mk: markup.personal },
    { nombre: 'Móviles', costo: totales.moviles, mk: markup.moviles },
    { nombre: 'Trailers', costo: totales.trailers, mk: markup.trailers },
    { nombre: 'Otros Costos', costo: totales.otrosCostos, mk: markup.otrosCostos },
    { nombre: 'Gastos Estructura', costo: totales.estructura, mk: markup.estructura },
    { nombre: 'Seguros', costo: totales.seguros, mk: markup.seguros }
  ];
  
  const desglose = categorias.map(cat => {
    const costoBase = cat.costo / (1 + cat.mk / 100); // Aproximación inversa
    const margen = cat.costo - costoBase;
    const pctIncidencia = totales.total > 0 ? (cat.costo / totales.total * 100) : 0;
    
    return {
      nombre: cat.nombre,
      costoBase: costoBase,
      markup: cat.mk,
      total: cat.costo,
      margen: margen,
      incidencia: pctIncidencia
    };
  });
  
  return {
    categorias: desglose,
    totalGeneral: totales.total,
    margenTotal: desglose.reduce((acc, c) => acc + c.margen, 0)
  };
};

export default {
  buscarSueldo,
  buscarValorHoraMT,
  getPrecioVianda,
  calcularPersonal,
  calcularMovil,
  calcularTrailer,
  calcularOtroCosto,
  calcularGastoEstructura,
  calcularSeguro,
  calcularTotales,
  calcularResumenComercial
};
