/**
 * SISTEMA DE COTIZACIÓN V5.3 PRO
 * reportGenerator.js - Generador de PDF ejecutivo
 * 
 * Genera reporte PDF profesional para gerencia
 * Integración con ExportButtons.jsx y dataNormalizer.js
 */

import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Colores corporativos (RGB)
const COLORES = {
  headerBg: [44, 62, 80],        // Azul grisáceo oscuro
  headerText: [255, 255, 255],   // Blanco
  subtotalBg: [236, 240, 241],   // Gris claro
  totalBg: [212, 230, 214],      // Verde claro
  alternateBg: [248, 249, 250],  // Gris muy claro
  textPrimary: [33, 37, 41],     // Negro suave
  textSecondary: [108, 117, 125], // Gris
  accent: [41, 128, 185],        // Azul accent
  success: [39, 174, 96],        // Verde
  warning: [243, 156, 18]        // Amarillo
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
  return `$${Number(val).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Agregar encabezado al documento
 */
const agregarEncabezado = (doc, payload, yPos) => {
  const { metadata } = payload;
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Título principal
  doc.setFontSize(20);
  doc.setTextColor(...COLORES.headerBg);
  doc.setFont('helvetica', 'bold');
  doc.text('Reporte Ejecutivo de Cotización', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 8;
  
  // Nombre del proyecto
  doc.setFontSize(14);
  doc.setTextColor(...COLORES.accent);
  doc.text(metadata.nombreProyecto || 'Sin Nombre', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 6;
  
  // Fecha y versión
  doc.setFontSize(9);
  doc.setTextColor(...COLORES.textSecondary);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generado: ${metadata.fechaFormateada || new Date().toLocaleDateString('es-AR')} | ${metadata.version || 'V5.3 PRO'}`, pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 4;
  
  // Línea separadora
  doc.setDrawColor(...COLORES.headerBg);
  doc.setLineWidth(0.5);
  doc.line(20, yPos, pageWidth - 20, yPos);
  
  return yPos + 8;
};

/**
 * Agregar sección de metadata del proyecto
 */
const agregarMetadata = (doc, payload, yPos) => {
  const { configuracion, personal, moviles, trailers } = payload;
  
  doc.setFontSize(12);
  doc.setTextColor(...COLORES.headerBg);
  doc.setFont('helvetica', 'bold');
  doc.text('Configuración del Proyecto', 20, yPos);
  
  yPos += 4;
  
  // Calcular cantidades
  const cantPersonal = personal?.length || 0;
  const cantMoviles = (moviles?.disponibles?.length || 0) + (moviles?.alquiler?.length || 0) + (moviles?.compra?.length || 0);
  const cantTrailers = (trailers?.disponibles?.length || 0) + (trailers?.alquiler?.length || 0) + (trailers?.compra?.length || 0);
  
  const metadataData = [
    ['Provincia', fmtValor(configuracion.provincia)],
    ['Diagrama', fmtValor(configuracion.diagrama)],
    ['Horas por Día', fmtValor(configuracion.horasPorDia)],
    ['Convenio', fmtValor(configuracion.convenio)],
    ['Overhead', `${configuracion.overhead || 0}%`],
    ['Markup', `${configuracion.markup || 0}%`],
    ['Personal', `${cantPersonal} persona(s)`],
    ['Móviles', `${cantMoviles} unidad(es)`],
    ['Trailers', `${cantTrailers} unidad(es)`]
  ];
  
  doc.autoTable({
    startY: yPos,
    head: [],
    body: metadataData,
    theme: 'plain',
    styles: {
      fontSize: 9,
      cellPadding: 2
    },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: COLORES.textSecondary, cellWidth: 40 },
      1: { textColor: COLORES.textPrimary }
    },
    margin: { left: 20, right: 20 }
  });
  
  return doc.lastAutoTable.finalY + 8;
};

/**
 * Agregar resumen por categoría
 */
const agregarResumenCategorias = (doc, payload, yPos) => {
  const { totales, moviles, trailers, personal, capacitaciones, itemsAdicionales } = payload;
  
  doc.setFontSize(12);
  doc.setTextColor(...COLORES.headerBg);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumen por Categoría', 20, yPos);
  
  yPos += 4;
  
  // Datos de categorías
  const categoriasData = [
    ['Personal', personal?.length || 0, fmtMoneda(totales.personal), ''],
    ['Móviles - Disponibles', moviles?.disponibles?.length || 0, fmtMoneda(moviles?.subtotales?.disponibles), ''],
    ['Móviles - Alquiler', moviles?.alquiler?.length || 0, fmtMoneda(moviles?.subtotales?.alquiler), ''],
    ['Móviles - Compra', moviles?.compra?.length || 0, fmtMoneda(moviles?.subtotales?.compra), ''],
    ['Trailers - Disponibles', trailers?.disponibles?.length || 0, fmtMoneda(trailers?.subtotales?.disponibles), 'Sin Service (V5.3)'],
    ['Trailers - Alquiler', trailers?.alquiler?.length || 0, fmtMoneda(trailers?.subtotales?.alquiler), 'Sin Service (V5.3)'],
    ['Trailers - Compra', trailers?.compra?.length || 0, fmtMoneda(trailers?.subtotales?.compra), 'Sin Service (V5.3)'],
    ['Capacitaciones', capacitaciones?.length || 0, fmtMoneda(totales.capacitaciones), ''],
    ['Ítems Adicionales', itemsAdicionales?.length || 0, fmtMoneda(totales.itemsAdicionales), '']
  ];
  
  doc.autoTable({
    startY: yPos,
    head: [['Categoría', 'Cantidad', 'Subtotal', 'Notas']],
    body: categoriasData,
    theme: 'striped',
    headStyles: {
      fillColor: COLORES.headerBg,
      textColor: COLORES.headerText,
      fontStyle: 'bold',
      fontSize: 10
    },
    styles: {
      fontSize: 9,
      cellPadding: 3
    },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 25, halign: 'center' },
      2: { cellWidth: 40, halign: 'right' },
      3: { cellWidth: 45, fontStyle: 'italic', textColor: COLORES.textSecondary, fontSize: 8 }
    },
    alternateRowStyles: {
      fillColor: COLORES.alternateBg
    },
    margin: { left: 20, right: 20 }
  });
  
  return doc.lastAutoTable.finalY + 8;
};

/**
 * Agregar totales globales
 */
const agregarTotalesGlobales = (doc, payload, yPos) => {
  const { totales, configuracion } = payload;
  
  doc.setFontSize(12);
  doc.setTextColor(...COLORES.headerBg);
  doc.setFont('helvetica', 'bold');
  doc.text('Totales del Proyecto', 20, yPos);
  
  yPos += 4;
  
  const totalesData = [
    ['Subtotal Neto', fmtMoneda(totales.subtotalNeto)],
  ];
  
  if (configuracion.overhead > 0) {
    totalesData.push([`Overhead (${configuracion.overhead}%)`, `+ ${fmtMoneda(totales.overheadMonto)}`]);
    totalesData.push(['Total con Overhead', fmtMoneda(totales.totalConOverhead)]);
  }
  
  if (configuracion.markup > 0) {
    totalesData.push([`Markup (${configuracion.markup}%)`, `+ ${fmtMoneda(totales.markupMonto)}`]);
  }
  
  totalesData.push(['TOTAL FINAL', fmtMoneda(totales.totalFinal)]);
  
  doc.autoTable({
    startY: yPos,
    head: [],
    body: totalesData,
    theme: 'plain',
    styles: {
      fontSize: 10,
      cellPadding: 4
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60 },
      1: { halign: 'right', cellWidth: 50 }
    },
    didParseCell: (data) => {
      // Estilo especial para total final
      if (data.row.index === totalesData.length - 1) {
        data.cell.styles.fillColor = COLORES.totalBg;
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fontSize = 12;
      }
    },
    margin: { left: 20, right: 20 }
  });
  
  return doc.lastAutoTable.finalY + 10;
};

/**
 * Agregar detalle de personal (resumido)
 */
const agregarDetallePersonal = (doc, payload, yPos) => {
  const { personal } = payload;
  
  if (!personal || personal.length === 0) return yPos;
  
  // Verificar espacio en página
  if (yPos > 220) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.setFontSize(12);
  doc.setTextColor(...COLORES.headerBg);
  doc.setFont('helvetica', 'bold');
  doc.text('Detalle de Personal', 20, yPos);
  
  yPos += 4;
  
  // Resumen por tipo de contratación
  const porTipo = {};
  personal.forEach(p => {
    const tipo = p.tipoContrato || 'Sin tipo';
    if (!porTipo[tipo]) porTipo[tipo] = { cantidad: 0, total: 0 };
    porTipo[tipo].cantidad++;
    porTipo[tipo].total += p.total || 0;
  });
  
  const detalleData = Object.entries(porTipo).map(([tipo, data]) => [
    tipo,
    data.cantidad,
    fmtMoneda(data.total)
  ]);
  
  doc.autoTable({
    startY: yPos,
    head: [['Tipo Contratación', 'Cantidad', 'Total']],
    body: detalleData,
    theme: 'striped',
    headStyles: {
      fillColor: COLORES.accent,
      textColor: COLORES.headerText,
      fontStyle: 'bold',
      fontSize: 9
    },
    styles: {
      fontSize: 9,
      cellPadding: 3
    },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 25, halign: 'center' },
      2: { cellWidth: 40, halign: 'right' }
    },
    margin: { left: 20, right: 20 }
  });
  
  return doc.lastAutoTable.finalY + 8;
};

/**
 * Agregar detalle de móviles y trailers (resumido)
 */
const agregarDetalleFlota = (doc, payload, yPos) => {
  const { moviles, trailers } = payload;
  
  const tieneMoviles = (moviles?.disponibles?.length || 0) + (moviles?.alquiler?.length || 0) + (moviles?.compra?.length || 0) > 0;
  const tieneTrailers = (trailers?.disponibles?.length || 0) + (trailers?.alquiler?.length || 0) + (trailers?.compra?.length || 0) > 0;
  
  if (!tieneMoviles && !tieneTrailers) return yPos;
  
  // Verificar espacio
  if (yPos > 220) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.setFontSize(12);
  doc.setTextColor(...COLORES.headerBg);
  doc.setFont('helvetica', 'bold');
  doc.text('Detalle de Flota', 20, yPos);
  
  yPos += 4;
  
  const flotaData = [];
  
  if (tieneMoviles) {
    flotaData.push(['Móviles - Service', fmtMoneda(moviles?.subtotales?.service || 0)]);
    flotaData.push(['Móviles - Mantenimiento', fmtMoneda(moviles?.subtotales?.mantenimiento || 0)]);
    flotaData.push(['Móviles - Total', fmtMoneda(moviles?.subtotales?.total || 0)]);
  }
  
  if (tieneTrailers) {
    flotaData.push(['Trailers - Mantenimiento', fmtMoneda(trailers?.subtotales?.mantenimiento || 0)]);
    flotaData.push(['Trailers - Total (sin Service)', fmtMoneda(trailers?.subtotales?.total || 0)]);
  }
  
  doc.autoTable({
    startY: yPos,
    head: [['Concepto', 'Monto']],
    body: flotaData,
    theme: 'striped',
    headStyles: {
      fillColor: COLORES.warning,
      textColor: COLORES.textPrimary,
      fontStyle: 'bold',
      fontSize: 9
    },
    styles: {
      fontSize: 9,
      cellPadding: 3
    },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 40, halign: 'right' }
    },
    margin: { left: 20, right: 20 }
  });
  
  return doc.lastAutoTable.finalY + 8;
};

/**
 * Agregar pie de página
 */
const agregarPiePagina = (doc) => {
  const pageCount = doc.internal.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Línea separadora
    doc.setDrawColor(...COLORES.textSecondary);
    doc.setLineWidth(0.2);
    doc.line(20, pageHeight - 15, pageWidth - 20, pageHeight - 15);
    
    // Texto pie
    doc.setFontSize(8);
    doc.setTextColor(...COLORES.textSecondary);
    doc.setFont('helvetica', 'normal');
    doc.text('Sistema de Cotización V5.3 PRO - Documento generado automáticamente', 20, pageHeight - 10);
    doc.text(`Página ${i} de ${pageCount}`, pageWidth - 20, pageHeight - 10, { align: 'right' });
  }
};

/**
 * Función principal - Generar PDF
 * @param {Object} payload - Datos del cotizador
 * @returns {Promise<{blob: Blob, filename: string}>}
 */
export const generarPdf = async (payload) => {
  if (!payload) {
    throw new Error('Payload requerido para generar PDF');
  }
  
  if (!payload.metadata) {
    throw new Error('Metadata del proyecto requerida');
  }
  
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    let yPos = 20;
    
    // Encabezado
    yPos = agregarEncabezado(doc, payload, yPos);
    
    // Metadata del proyecto
    yPos = agregarMetadata(doc, payload, yPos);
    
    // Resumen por categorías
    yPos = agregarResumenCategorias(doc, payload, yPos);
    
    // Totales globales
    yPos = agregarTotalesGlobales(doc, payload, yPos);
    
    // Detalle de personal
    yPos = agregarDetallePersonal(doc, payload, yPos);
    
    // Detalle de flota
    yPos = agregarDetalleFlota(doc, payload, yPos);
    
    // Pie de página
    agregarPiePagina(doc);
    
    // Generar blob
    const blob = doc.output('blob');
    
    // Nombre del archivo
    const nombreProyecto = (payload.metadata?.nombreProyecto || 'Cotizacion').replace(/\s+/g, '_');
    const fecha = new Date().toISOString().split('T')[0];
    const filename = `Reporte_${nombreProyecto}_${fecha}.pdf`;
    
    return { blob, filename };
    
  } catch (error) {
    console.error('Error generando PDF:', error);
    throw new Error(`Error al generar PDF: ${error.message}`);
  }
};

// Alias para compatibilidad
export const generatePdfReport = generarPdf;

export default { generarPdf, generatePdfReport };
