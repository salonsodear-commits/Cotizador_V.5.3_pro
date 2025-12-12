/**
 * SISTEMA DE COTIZACIÓN V5.3 PRO
 * excelBuilder.js - Generador de Excel profesional
 * 
 * Genera archivo Excel multi-hoja con formato corporativo
 * Integración con ExportButtons.jsx y dataNormalizer.js
 */

import ExcelJS from 'exceljs';

// Colores corporativos
const COLORES = {
  headerBg: 'FF2C3E50',      // Gris azulado oscuro
  headerText: 'FFFFFFFF',    // Blanco
  subtotalBg: 'FFE8E8E8',    // Gris claro
  totalBg: 'FFD5E8D4',       // Verde claro
  alternateBg: 'FFF8F9FA',   // Gris muy claro
  borderColor: 'FFD0D0D0',   // Gris borde
  importadoBg: 'FFE3F2FD',   // Azul muy claro
  errorBg: 'FFFCE4EC'        // Rosa claro
};

// Estilos predefinidos
const estiloHeader = {
  font: { bold: true, color: { argb: COLORES.headerText }, size: 11 },
  fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORES.headerBg } },
  alignment: { horizontal: 'center', vertical: 'middle' },
  border: {
    top: { style: 'thin', color: { argb: COLORES.borderColor } },
    bottom: { style: 'thin', color: { argb: COLORES.borderColor } },
    left: { style: 'thin', color: { argb: COLORES.borderColor } },
    right: { style: 'thin', color: { argb: COLORES.borderColor } }
  }
};

const estiloSubtotal = {
  font: { bold: true, size: 11 },
  fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORES.subtotalBg } },
  border: {
    top: { style: 'thin', color: { argb: COLORES.borderColor } },
    bottom: { style: 'thin', color: { argb: COLORES.borderColor } }
  }
};

const estiloTotal = {
  font: { bold: true, size: 12 },
  fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORES.totalBg } },
  border: {
    top: { style: 'medium', color: { argb: COLORES.headerBg } },
    bottom: { style: 'medium', color: { argb: COLORES.headerBg } }
  }
};

/**
 * Formatear valor para mostrar
 */
const fmtValor = (val) => {
  if (val === null || val === undefined || (typeof val === 'number' && isNaN(val))) return '—';
  return val;
};

/**
 * Formatear moneda
 */
const fmtMoneda = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '—';
  return Number(val);
};

/**
 * Aplicar estilo a rango de celdas
 */
const aplicarEstiloFila = (row, estilo) => {
  row.eachCell({ includeEmpty: true }, (cell) => {
    if (estilo.font) cell.font = estilo.font;
    if (estilo.fill) cell.fill = estilo.fill;
    if (estilo.alignment) cell.alignment = estilo.alignment;
    if (estilo.border) cell.border = estilo.border;
  });
};

/**
 * Autoajustar ancho de columnas
 */
const autoFitColumns = (worksheet) => {
  worksheet.columns.forEach(column => {
    let maxLength = 10;
    column.eachCell({ includeEmpty: true }, (cell) => {
      const val = cell.value ? cell.value.toString() : '';
      maxLength = Math.max(maxLength, val.length + 2);
    });
    column.width = Math.min(maxLength, 50);
  });
};

/**
 * Crear hoja de Resumen General
 */
const crearHojaResumen = (workbook, payload) => {
  const ws = workbook.addWorksheet('Resumen General', {
    properties: { tabColor: { argb: 'FF2E7D32' } }
  });

  const { metadata, totales, configuracion } = payload;

  // Título
  ws.mergeCells('A1:E1');
  ws.getCell('A1').value = metadata.nombreProyecto || 'Cotización';
  ws.getCell('A1').font = { bold: true, size: 18, color: { argb: COLORES.headerBg } };
  ws.getCell('A1').alignment = { horizontal: 'center' };

  // Subtítulo
  ws.mergeCells('A2:E2');
  ws.getCell('A2').value = `Generado: ${metadata.fechaFormateada || new Date().toLocaleDateString('es-AR')} | ${metadata.version || 'V5.3 PRO'}`;
  ws.getCell('A2').font = { size: 10, color: { argb: 'FF666666' } };
  ws.getCell('A2').alignment = { horizontal: 'center' };

  // Espacio
  ws.getRow(3).height = 10;

  // Configuración
  ws.getCell('A4').value = 'CONFIGURACIÓN';
  ws.getCell('A4').font = { bold: true, size: 12 };
  
  const configData = [
    ['Provincia', configuracion.provincia || '—'],
    ['Diagrama', configuracion.diagrama || '—'],
    ['Horas por Día', configuracion.horasPorDia || 8],
    ['Convenio', configuracion.convenio || '—'],
    ['Overhead', `${configuracion.overhead || 0}%`],
    ['Markup', `${configuracion.markup || 0}%`]
  ];

  let row = 5;
  configData.forEach(([label, valor]) => {
    ws.getCell(`A${row}`).value = label;
    ws.getCell(`A${row}`).font = { color: { argb: 'FF666666' } };
    ws.getCell(`B${row}`).value = valor;
    ws.getCell(`B${row}`).font = { bold: true };
    row++;
  });

  // Espacio
  row += 1;

  // Totales por categoría
  ws.getCell(`A${row}`).value = 'TOTALES POR CATEGORÍA';
  ws.getCell(`A${row}`).font = { bold: true, size: 12 };
  row++;

  // Headers
  ws.getRow(row).values = ['Categoría', 'Cantidad', 'Subtotal'];
  aplicarEstiloFila(ws.getRow(row), estiloHeader);
  row++;

  const categorias = [
    ['Personal', payload.personal?.length || 0, totales.personal],
    ['Móviles', (payload.moviles?.disponibles?.length || 0) + (payload.moviles?.alquiler?.length || 0) + (payload.moviles?.compra?.length || 0), totales.moviles],
    ['Trailers', (payload.trailers?.disponibles?.length || 0) + (payload.trailers?.alquiler?.length || 0) + (payload.trailers?.compra?.length || 0), totales.trailers],
    ['Capacitaciones', payload.capacitaciones?.length || 0, totales.capacitaciones],
    ['Ítems Adicionales', payload.itemsAdicionales?.length || 0, totales.itemsAdicionales]
  ];

  categorias.forEach(([cat, cant, sub], i) => {
    ws.getRow(row).values = [cat, cant, fmtMoneda(sub)];
    ws.getCell(`C${row}`).numFmt = '"$"#,##0.00';
    if (i % 2 === 1) {
      ws.getRow(row).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORES.alternateBg } };
    }
    row++;
  });

  // Subtotal
  row++;
  ws.getRow(row).values = ['Subtotal Neto', '', fmtMoneda(totales.subtotalNeto)];
  aplicarEstiloFila(ws.getRow(row), estiloSubtotal);
  ws.getCell(`C${row}`).numFmt = '"$"#,##0.00';
  row++;

  // Overhead
  if (configuracion.overhead > 0) {
    ws.getRow(row).values = [`Overhead (${configuracion.overhead}%)`, '', fmtMoneda(totales.overheadMonto)];
    ws.getCell(`C${row}`).numFmt = '"$"#,##0.00';
    row++;
  }

  // Markup
  if (configuracion.markup > 0) {
    ws.getRow(row).values = [`Markup (${configuracion.markup}%)`, '', fmtMoneda(totales.markupMonto)];
    ws.getCell(`C${row}`).numFmt = '"$"#,##0.00';
    row++;
  }

  // Total Final
  row++;
  ws.getRow(row).values = ['TOTAL FINAL', '', fmtMoneda(totales.totalFinal)];
  aplicarEstiloFila(ws.getRow(row), estiloTotal);
  ws.getCell(`C${row}`).numFmt = '"$"#,##0.00';

  autoFitColumns(ws);
};

/**
 * Crear hoja de Personal
 */
const crearHojaPersonal = (workbook, payload) => {
  const ws = workbook.addWorksheet('Personal', {
    properties: { tabColor: { argb: 'FF1976D2' } }
  });

  const headers = ['Nombre', 'Tipo', 'Clasificación', 'Provincia', 'Diagrama', 'Hs/Día', 'Valor Hora', 'Adicionales', 'Capacitaciones', 'Total', 'Importado', 'Observaciones'];
  
  ws.getRow(1).values = headers;
  aplicarEstiloFila(ws.getRow(1), estiloHeader);

  const personal = payload.personal || [];
  
  if (personal.length === 0) {
    ws.getCell('A2').value = 'Sin registros de personal';
    ws.getCell('A2').font = { italic: true, color: { argb: 'FF666666' } };
  } else {
    personal.forEach((p, i) => {
      const row = i + 2;
      ws.getRow(row).values = [
        fmtValor(p.nombre),
        fmtValor(p.tipoContrato),
        fmtValor(p.categoria),
        fmtValor(p.provincia),
        fmtValor(p.diagrama),
        fmtValor(p.horasPorDia),
        fmtMoneda(p.valorHora),
        fmtMoneda(p.subtotalAdicionales),
        fmtMoneda(p.subtotalCapacitaciones),
        fmtMoneda(p.total),
        p.importado ? 'Sí' : 'No',
        fmtValor(p.observaciones || '')
      ];

      // Formato moneda
      ['G', 'H', 'I', 'J'].forEach(col => {
        ws.getCell(`${col}${row}`).numFmt = '"$"#,##0.00';
      });

      // Fila alternada o importada
      if (p.importado) {
        ws.getRow(row).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORES.importadoBg } };
      } else if (i % 2 === 1) {
        ws.getRow(row).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORES.alternateBg } };
      }
    });

    // Fila de totales
    const totalRow = personal.length + 2;
    ws.getRow(totalRow).values = ['TOTAL', '', '', '', '', '', '', '', '', fmtMoneda(payload.totales?.personal || 0), '', ''];
    aplicarEstiloFila(ws.getRow(totalRow), estiloTotal);
    ws.getCell(`J${totalRow}`).numFmt = '"$"#,##0.00';
  }

  autoFitColumns(ws);
};

/**
 * Crear hoja de Móviles
 */
const crearHojaMoviles = (workbook, payload) => {
  const ws = workbook.addWorksheet('Móviles', {
    properties: { tabColor: { argb: 'FFF57C00' } }
  });

  const { moviles } = payload;
  let row = 1;

  // Función para agregar sección
  const agregarSeccion = (titulo, items, columnas, mapearFila) => {
    ws.getCell(`A${row}`).value = titulo;
    ws.getCell(`A${row}`).font = { bold: true, size: 12, color: { argb: COLORES.headerBg } };
    row++;

    ws.getRow(row).values = columnas;
    aplicarEstiloFila(ws.getRow(row), estiloHeader);
    row++;

    if (!items || items.length === 0) {
      ws.getCell(`A${row}`).value = 'Sin registros';
      ws.getCell(`A${row}`).font = { italic: true, color: { argb: 'FF666666' } };
      row++;
    } else {
      items.forEach((item, i) => {
        ws.getRow(row).values = mapearFila(item);
        if (i % 2 === 1) {
          ws.getRow(row).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORES.alternateBg } };
        }
        row++;
      });
    }
    row++;
  };

  // Disponibles
  agregarSeccion('MÓVILES DISPONIBLES', moviles?.disponibles, 
    ['Tipo', 'Dominio', 'Descripción', 'Service', 'Mantenimiento', 'Total', 'Incluido'],
    (m) => [m.tipo, m.dominio, m.descripcion, fmtMoneda(m.service), fmtMoneda(m.mantenimiento), fmtMoneda(m.total), m.incluirCTC ? 'Sí' : 'No']
  );

  // Alquiler
  agregarSeccion('MÓVILES EN ALQUILER', moviles?.alquiler,
    ['Tipo', 'Dominio', 'Proveedor', 'Costo Alquiler', 'Service', 'Mantenimiento', 'Total', 'Incluido'],
    (m) => [m.tipo, m.dominio, m.proveedor, fmtMoneda(m.costoAlquiler), fmtMoneda(m.service), fmtMoneda(m.mantenimiento), fmtMoneda(m.total), m.incluirCTC ? 'Sí' : 'No']
  );

  // Compra
  agregarSeccion('MÓVILES EN COMPRA', moviles?.compra,
    ['Tipo', 'Dominio', 'Inversión', 'Meses', 'Amortización', 'Service', 'Mantenimiento', 'Total', 'Incluido'],
    (m) => [m.tipo, m.dominio, fmtMoneda(m.inversionInicial), m.mesesAmortizacion, fmtMoneda(m.amortizacionMensual), fmtMoneda(m.service), fmtMoneda(m.mantenimiento), fmtMoneda(m.total), m.incluirCTC ? 'Sí' : 'No']
  );

  // Total general
  ws.getRow(row).values = ['TOTAL MÓVILES', '', '', '', '', '', fmtMoneda(payload.totales?.moviles || 0)];
  aplicarEstiloFila(ws.getRow(row), estiloTotal);

  autoFitColumns(ws);
};

/**
 * Crear hoja de Trailers (SIN SERVICE - V5.3)
 */
const crearHojaTrailers = (workbook, payload) => {
  const ws = workbook.addWorksheet('Trailers', {
    properties: { tabColor: { argb: 'FF7B1FA2' } }
  });

  const { trailers } = payload;
  let row = 1;

  // Nota V5.3
  ws.mergeCells('A1:F1');
  ws.getCell('A1').value = 'TRAILERS - Sin Service (V5.3)';
  ws.getCell('A1').font = { bold: true, size: 12, color: { argb: 'FF7B1FA2' } };
  row = 3;

  const agregarSeccion = (titulo, items, columnas, mapearFila) => {
    ws.getCell(`A${row}`).value = titulo;
    ws.getCell(`A${row}`).font = { bold: true, size: 11, color: { argb: COLORES.headerBg } };
    row++;

    ws.getRow(row).values = columnas;
    aplicarEstiloFila(ws.getRow(row), estiloHeader);
    row++;

    if (!items || items.length === 0) {
      ws.getCell(`A${row}`).value = 'Sin registros';
      ws.getCell(`A${row}`).font = { italic: true, color: { argb: 'FF666666' } };
      row++;
    } else {
      items.forEach((item, i) => {
        ws.getRow(row).values = mapearFila(item);
        if (i % 2 === 1) {
          ws.getRow(row).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORES.alternateBg } };
        }
        row++;
      });
    }
    row++;
  };

  // Disponibles
  agregarSeccion('TRAILERS DISPONIBLES', trailers?.disponibles,
    ['Tipo', 'ID', 'Descripción', 'Mantenimiento', 'Total', 'Incluido'],
    (t) => [t.tipo, t.identificacion, t.descripcion, fmtMoneda(t.mantenimiento), fmtMoneda(t.total), t.incluirCTC ? 'Sí' : 'No']
  );

  // Alquiler
  agregarSeccion('TRAILERS EN ALQUILER', trailers?.alquiler,
    ['Tipo', 'ID', 'Proveedor', 'Costo Alquiler', 'Mantenimiento', 'Total', 'Incluido'],
    (t) => [t.tipo, t.identificacion, t.proveedor, fmtMoneda(t.costoAlquiler), fmtMoneda(t.mantenimiento), fmtMoneda(t.total), t.incluirCTC ? 'Sí' : 'No']
  );

  // Compra
  agregarSeccion('TRAILERS EN COMPRA', trailers?.compra,
    ['Tipo', 'ID', 'Inversión', 'Meses', 'Amortización', 'Mantenimiento', 'Total', 'Incluido'],
    (t) => [t.tipo, t.identificacion, fmtMoneda(t.inversionInicial), t.mesesAmortizacion, fmtMoneda(t.amortizacionMensual), fmtMoneda(t.mantenimiento), fmtMoneda(t.total), t.incluirCTC ? 'Sí' : 'No']
  );

  // Total
  ws.getRow(row).values = ['TOTAL TRAILERS', '', '', '', '', fmtMoneda(payload.totales?.trailers || 0)];
  aplicarEstiloFila(ws.getRow(row), estiloTotal);

  autoFitColumns(ws);
};

/**
 * Crear hoja de Capacitaciones
 */
const crearHojaCapacitaciones = (workbook, payload) => {
  const ws = workbook.addWorksheet('Capacitaciones', {
    properties: { tabColor: { argb: 'FF303F9F' } }
  });

  const headers = ['Código', 'Descripción', 'Duración (hs)', 'Precio', 'Cantidad', 'Total', 'Incluido'];
  ws.getRow(1).values = headers;
  aplicarEstiloFila(ws.getRow(1), estiloHeader);

  const caps = payload.capacitaciones || [];
  
  if (caps.length === 0) {
    ws.getCell('A2').value = 'Sin capacitaciones registradas';
    ws.getCell('A2').font = { italic: true, color: { argb: 'FF666666' } };
  } else {
    caps.forEach((c, i) => {
      const row = i + 2;
      ws.getRow(row).values = [
        fmtValor(c.codigo),
        fmtValor(c.descripcion),
        fmtValor(c.duracionHoras),
        fmtMoneda(c.precio),
        fmtValor(c.cantidad),
        fmtMoneda(c.total),
        c.incluir ? 'Sí' : 'No'
      ];
      if (i % 2 === 1) {
        ws.getRow(row).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORES.alternateBg } };
      }
    });

    const totalRow = caps.length + 2;
    ws.getRow(totalRow).values = ['', 'TOTAL', '', '', '', fmtMoneda(payload.totales?.capacitaciones || 0), ''];
    aplicarEstiloFila(ws.getRow(totalRow), estiloTotal);
  }

  autoFitColumns(ws);
};

/**
 * Crear hoja de Ítems Adicionales
 */
const crearHojaAdicionales = (workbook, payload) => {
  const ws = workbook.addWorksheet('Ítems Adicionales', {
    properties: { tabColor: { argb: 'FFC2185B' } }
  });

  const headers = ['Código', 'Descripción', 'Precio', 'Cantidad', 'Total', 'En CTC', 'Incluido'];
  ws.getRow(1).values = headers;
  aplicarEstiloFila(ws.getRow(1), estiloHeader);

  const items = payload.itemsAdicionales || [];
  
  if (items.length === 0) {
    ws.getCell('A2').value = 'Sin ítems adicionales';
    ws.getCell('A2').font = { italic: true, color: { argb: 'FF666666' } };
  } else {
    items.forEach((item, i) => {
      const row = i + 2;
      ws.getRow(row).values = [
        fmtValor(item.codigo),
        fmtValor(item.descripcion),
        fmtMoneda(item.precio),
        fmtValor(item.cantidad),
        fmtMoneda(item.total),
        item.enCTC ? 'Sí' : 'No',
        item.incluir ? 'Sí' : 'No'
      ];
      if (i % 2 === 1) {
        ws.getRow(row).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORES.alternateBg } };
      }
    });

    const totalRow = items.length + 2;
    ws.getRow(totalRow).values = ['', 'TOTAL', '', '', fmtMoneda(payload.totales?.itemsAdicionales || 0), '', ''];
    aplicarEstiloFila(ws.getRow(totalRow), estiloTotal);
  }

  autoFitColumns(ws);
};

/**
 * Crear hoja de Metadata
 */
const crearHojaMetadata = (workbook, payload) => {
  const ws = workbook.addWorksheet('Metadata', {
    properties: { tabColor: { argb: 'FF616161' } }
  });

  const { metadata, configuracion, importacion } = payload;

  ws.getCell('A1').value = 'METADATA DEL PROYECTO';
  ws.getCell('A1').font = { bold: true, size: 14 };

  const data = [
    ['Nombre del Proyecto', metadata.nombreProyecto || '—'],
    ['Cliente', metadata.cliente || '—'],
    ['Fecha de Generación', metadata.fechaFormateada || '—'],
    ['Versión', metadata.version || 'V5.3 PRO'],
    [''],
    ['CONFIGURACIÓN'],
    ['Provincia', configuracion.provincia || '—'],
    ['Diagrama', configuracion.diagrama || '—'],
    ['Horas por Día', configuracion.horasPorDia || 8],
    ['Convenio', configuracion.convenio || '—'],
    ['Tipo Contratación', configuracion.tipoContratacion || '—'],
    ['Overhead', `${configuracion.overhead || 0}%`],
    ['Markup', `${configuracion.markup || 0}%`],
    [''],
    ['IMPORTACIÓN'],
    ['Archivo Soporte', importacion?.tieneArchivo ? 'Sí' : 'No'],
    ['Hojas Importadas', importacion?.hojas?.join(', ') || '—']
  ];

  data.forEach((row, i) => {
    if (Array.isArray(row) && row.length === 2) {
      ws.getCell(`A${i + 3}`).value = row[0];
      ws.getCell(`A${i + 3}`).font = { color: { argb: 'FF666666' } };
      ws.getCell(`B${i + 3}`).value = row[1];
      ws.getCell(`B${i + 3}`).font = { bold: true };
    } else if (typeof row === 'string' && row.length > 0) {
      ws.getCell(`A${i + 3}`).value = row;
      ws.getCell(`A${i + 3}`).font = { bold: true, size: 12 };
    }
  });

  autoFitColumns(ws);
};

/**
 * Función principal - Generar Excel
 * @param {Object} payload - Datos del cotizador
 * @returns {Promise<{blob: Blob, filename: string}>}
 */
export const generarExcel = async (payload) => {
  if (!payload) {
    throw new Error('Payload requerido para generar Excel');
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Sistema de Cotización V5.3 PRO';
  workbook.created = new Date();

  // Crear todas las hojas
  crearHojaResumen(workbook, payload);
  crearHojaPersonal(workbook, payload);
  crearHojaMoviles(workbook, payload);
  crearHojaTrailers(workbook, payload);
  crearHojaCapacitaciones(workbook, payload);
  crearHojaAdicionales(workbook, payload);
  crearHojaMetadata(workbook, payload);

  // Generar buffer
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  // Nombre del archivo
  const nombreProyecto = (payload.metadata?.nombreProyecto || 'Cotizacion').replace(/\s+/g, '_');
  const fecha = new Date().toISOString().split('T')[0];
  const filename = `${nombreProyecto}_${fecha}.xlsx`;

  return { blob, filename };
};

// Alias para compatibilidad
export const buildExcel = generarExcel;

export default { generarExcel, buildExcel };
