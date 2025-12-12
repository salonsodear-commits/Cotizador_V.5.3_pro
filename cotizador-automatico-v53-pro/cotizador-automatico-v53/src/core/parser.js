/**
 * SISTEMA DE COTIZACIÓN V5.3 PRO
 * parser.js - Parseo de archivos importados
 * V5.3 Punto 10.10: Archivo soporte único multi-hoja
 */

import { ARCHIVOS_SOPORTE } from './constants.js';

// Normalización
export const normalizarNombreColumna = (nombre) => {
  if (!nombre) return '';
  return nombre.toString().toLowerCase().trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[_\s]+/g, '_');
};

export const normalizarNombreHoja = (nombre) => {
  if (!nombre) return '';
  return nombre.toString().toLowerCase().trim().replace(/[_\s-]+/g, '');
};

export const parsearNumero = (valor) => {
  if (valor === null || valor === undefined || valor === '') return 0;
  if (typeof valor === 'number') return valor;
  const limpio = valor.toString().replace(/[$€£¥]/g, '').replace(/\./g, '').replace(/,/g, '.').trim();
  const numero = parseFloat(limpio);
  return isNaN(numero) ? 0 : numero;
};

export const parsearBooleano = (valor) => {
  if (valor === null || valor === undefined) return false;
  if (typeof valor === 'boolean') return valor;
  const str = valor.toString().toLowerCase().trim();
  return ['si', 'sí', 'yes', 'true', '1', 'x', 'v'].includes(str);
};

// Mapeo de columnas
export const mapearColumnas = (fila, mapeo) => {
  const resultado = {};
  Object.entries(mapeo).forEach(([campoDestino, posiblesFuentes]) => {
    const fuentes = Array.isArray(posiblesFuentes) ? posiblesFuentes : [posiblesFuentes];
    for (const fuente of fuentes) {
      const fuenteNorm = normalizarNombreColumna(fuente);
      const columnaEncontrada = Object.keys(fila).find(col => normalizarNombreColumna(col) === fuenteNorm);
      if (columnaEncontrada && fila[columnaEncontrada] !== undefined) {
        resultado[campoDestino] = fila[columnaEncontrada];
        break;
      }
    }
  });
  return resultado;
};

// Parsers específicos
export const parsearSueldos = (datos) => {
  const mapeo = { Convenio: ['convenio'], Categoria: ['categoria'], Puesto: ['puesto'], Sueldo_Bruto: ['sueldo_bruto', 'sueldo'], Costo_Total_Cia: ['costo_total_cia', 'ctc'] };
  return datos.map(fila => {
    const m = mapearColumnas(fila, mapeo);
    return { Convenio: m.Convenio || '', Categoria: m.Categoria || '', Puesto: m.Puesto || '', Sueldo_Bruto: parsearNumero(m.Sueldo_Bruto), Costo_Total_Cia: parsearNumero(m.Costo_Total_Cia) };
  });
};

export const parsearMonotributistas = (datos) => {
  const mapeo = { Provincia: ['provincia'], Puesto: ['puesto'], Tipo_Honorario: ['tipo_honorario'], Valor_Sugerido: ['valor_sugerido', 'valor'], Categoria: ['categoria'] };
  return datos.map(fila => {
    const m = mapearColumnas(fila, mapeo);
    return { Provincia: m.Provincia || '', Puesto: m.Puesto || '', Tipo_Honorario: m.Tipo_Honorario || '', Valor_Sugerido: parsearNumero(m.Valor_Sugerido), Categoria: m.Categoria || '' };
  });
};

export const parsearItemsAdicionales = (datos) => {
  const mapeo = { Descripcion: ['descripcion'], P: ['p', 'precio'], Q: ['q', 'cantidad'], Categoria: ['categoria'] };
  return datos.map(fila => {
    const m = mapearColumnas(fila, mapeo);
    return { Descripcion: m.Descripcion || '', P: parsearNumero(m.P), Q: parsearNumero(m.Q) || 1, Categoria: m.Categoria || '' };
  });
};

export const parsearCapacitaciones = (datos) => {
  const mapeo = { Descripcion: ['descripcion'], P: ['p', 'precio'], Q: ['q', 'cantidad'], Duracion_Horas: ['duracion_horas', 'duracion'], Certificacion: ['certificacion'] };
  return datos.map(fila => {
    const m = mapearColumnas(fila, mapeo);
    return { Descripcion: m.Descripcion || '', P: parsearNumero(m.P), Q: parsearNumero(m.Q) || 1, Duracion_Horas: parsearNumero(m.Duracion_Horas), Certificacion: parsearBooleano(m.Certificacion) };
  });
};

export const parsearOtrosCostos = (datos) => {
  const mapeo = { Descripcion: ['descripcion'], Precio: ['precio', 'p'], Cantidad: ['cantidad', 'q'], Categoria: ['categoria'] };
  return datos.map(fila => {
    const m = mapearColumnas(fila, mapeo);
    return { Descripcion: m.Descripcion || '', Precio: parsearNumero(m.Precio), Cantidad: parsearNumero(m.Cantidad) || 1, Categoria: m.Categoria || '' };
  });
};

export const parsearGastosEstructura = (datos) => parsearOtrosCostos(datos);

export const parsearSeguros = (datos) => {
  const mapeo = { Tipo: ['tipo'], Descripcion: ['descripcion'], Prima: ['prima', 'precio'], Aplica_Sobre: ['aplica_sobre', 'aplica'] };
  return datos.map(fila => {
    const m = mapearColumnas(fila, mapeo);
    return { Tipo: m.Tipo || 'Otro', Descripcion: m.Descripcion || '', Prima: parsearNumero(m.Prima), Aplica_Sobre: m.Aplica_Sobre || '' };
  });
};

// Parsers Móviles/Trailers
export const parsearServiceMantenimiento = (datos) => {
  const mapeo = { Descripcion: ['descripcion', 'item'], P: ['p', 'precio'], Q: ['q', 'frecuencia', 'frecuencia_anual'], Observaciones: ['observaciones'] };
  return datos.map(fila => {
    const m = mapearColumnas(fila, mapeo);
    return { Descripcion: m.Descripcion || '', Precio: parsearNumero(m.P), FrecuenciaAnual: parsearNumero(m.Q) || 1, Observaciones: m.Observaciones || '' };
  });
};

export const parsearAlquiler = (datos) => {
  const mapeo = { Descripcion: ['descripcion'], CostoMensual: ['costo_mensual', 'costo', 'alquiler'], Observaciones: ['observaciones'] };
  return datos.map(fila => {
    const m = mapearColumnas(fila, mapeo);
    return { Descripcion: m.Descripcion || '', CostoMensual: parsearNumero(m.CostoMensual), Observaciones: m.Observaciones || '' };
  });
};

export const parsearCompra = (datos) => {
  const mapeo = { Descripcion: ['descripcion'], Inversion: ['inversion', 'inversion_inicial', 'costo'], MesesAmortizacion: ['meses_amortizacion', 'meses'], Observaciones: ['observaciones'] };
  return datos.map(fila => {
    const m = mapearColumnas(fila, mapeo);
    const inv = parsearNumero(m.Inversion);
    const meses = parsearNumero(m.MesesAmortizacion) || 12;
    return { Descripcion: m.Descripcion || '', Inversion: inv, MesesAmortizacion: meses, AmortizacionMensual: inv / meses, Observaciones: m.Observaciones || '' };
  });
};

export const identificarTipoHoja = (nombreHoja) => {
  const n = normalizarNombreHoja(nombreHoja);
  if (n.includes('movilesdisponibles')) return 'movilesDisponibles';
  if (n.includes('trailersdisponibles')) return 'trailersDisponibles';
  if (n.includes('servicemoviles')) return 'serviceMoviles';
  if (n.includes('mantenimientomoviles')) return 'mantenimientoMoviles';
  if (n.includes('mantenimientotrailers')) return 'mantenimientoTrailers';
  if (n.includes('alquilermoviles')) return 'alquilerMoviles';
  if (n.includes('alquilertrailers')) return 'alquilerTrailers';
  if (n.includes('compramoviles')) return 'compraMoviles';
  if (n.includes('compratrailers')) return 'compraTrailers';
  return null;
};

export const parsearHojaPorTipo = (tipo, datos) => {
  if (tipo.includes('service') || tipo.includes('mantenimiento')) return parsearServiceMantenimiento(datos);
  if (tipo.includes('alquiler')) return parsearAlquiler(datos);
  if (tipo.includes('compra')) return parsearCompra(datos);
  return datos;
};

export const parsearArchivoMovilesTrailers = (workbook, XLSX) => {
  const resultado = { movilesDisponibles: [], trailersDisponibles: [], serviceMoviles: [], mantenimientoMoviles: [], mantenimientoTrailers: [], alquilerMoviles: [], alquilerTrailers: [], compraMoviles: [], compraTrailers: [] };
  workbook.SheetNames.forEach(nombreHoja => {
    const tipo = identificarTipoHoja(nombreHoja);
    if (tipo && resultado.hasOwnProperty(tipo)) {
      const datos = XLSX.utils.sheet_to_json(workbook.Sheets[nombreHoja]);
      resultado[tipo] = parsearHojaPorTipo(tipo, datos);
    }
  });
  return resultado;
};

export const parsearArchivo = (archivoKey, datos) => {
  switch (archivoKey) {
    case 'sueldos': return parsearSueldos(datos);
    case 'monotributistas': return parsearMonotributistas(datos);
    case 'itemsAdicionales': return parsearItemsAdicionales(datos);
    case 'capacitaciones': return parsearCapacitaciones(datos);
    case 'otrosCostos': return parsearOtrosCostos(datos);
    case 'estructura': return parsearGastosEstructura(datos);
    case 'seguros': return parsearSeguros(datos);
    default: return datos;
  }
};

export default { normalizarNombreColumna, normalizarNombreHoja, parsearNumero, parsearBooleano, mapearColumnas, parsearSueldos, parsearMonotributistas, parsearItemsAdicionales, parsearCapacitaciones, parsearOtrosCostos, parsearGastosEstructura, parsearSeguros, parsearServiceMantenimiento, parsearAlquiler, parsearCompra, identificarTipoHoja, parsearHojaPorTipo, parsearArchivoMovilesTrailers, parsearArchivo };
