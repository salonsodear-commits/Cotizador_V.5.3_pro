/**
 * SISTEMA DE COTIZACIÓN V5.3 PRO
 * ExportButtons.jsx - Panel de exportación
 * 
 * Exportar a Excel, PDF y JSON
 * Integración con excelBuilder.js, reportGenerator.js
 * No recalcula - recibe datos listos desde el padre
 */

import React, { useState, useCallback } from 'react';
import { FileSpreadsheet, FileText, Code, Download, Loader2, CheckCircle, AlertCircle, Info } from 'lucide-react';

/**
 * ExportButtons
 * 
 * Props:
 * - personal: array de personas con costos
 * - moviles: objeto { disponibles, alquiler, compra, service, mantenimiento }
 * - trailers: objeto { disponibles, alquiler, compra, mantenimiento }
 * - capacitaciones: array de capacitaciones
 * - itemsAdicionales: array de items adicionales
 * - totales: objeto con subtotales y total final
 * - metadata: objeto { nombreProyecto, cliente, fecha, version }
 * - configuracion: objeto { provincia, diagrama, horasPorDia, convenio, overhead, markup }
 * - datosImportados: objeto con datos del archivo soporte
 * - onExcelGenerated: callback (blob, filename)
 * - onPdfGenerated: callback (blob, filename)
 * - onJsonGenerated: callback (json, filename)
 * - disabled: deshabilitar botones
 * - compact: vista compacta
 */
const ExportButtons = ({
  personal = [],
  moviles = {},
  trailers = {},
  capacitaciones = [],
  itemsAdicionales = [],
  totales = {},
  metadata = {},
  configuracion = {},
  datosImportados = {},
  onExcelGenerated,
  onPdfGenerated,
  onJsonGenerated,
  disabled = false,
  compact = false
}) => {
  const [estados, setEstados] = useState({
    excel: 'idle', // idle, loading, success, error
    pdf: 'idle',
    json: 'idle'
  });
  const [errores, setErrores] = useState({});

  // Preparar payload unificado para exportación
  const prepararPayload = useCallback(() => {
    const ahora = new Date();
    
    return {
      // Metadata del proyecto
      metadata: {
        nombreProyecto: metadata.nombreProyecto || 'Cotización Sin Nombre',
        cliente: metadata.cliente || '',
        fecha: ahora.toISOString(),
        fechaFormateada: ahora.toLocaleDateString('es-AR'),
        version: metadata.version || 'V5.3 PRO',
        generadoPor: 'Sistema de Cotización V5.3',
        ...metadata
      },
      
      // Configuración general
      configuracion: {
        provincia: configuracion.provincia || '',
        diagrama: configuracion.diagrama || '',
        horasPorDia: configuracion.horasPorDia || 8,
        convenio: configuracion.convenio || '',
        tipoContratacion: configuracion.tipoContratacion || '',
        overhead: configuracion.overhead || 0,
        markup: configuracion.markup || 0,
        ...configuracion
      },
      
      // Personal
      personal: personal.map(p => ({
        id: p.id,
        nombre: p.nombre,
        tipoContrato: p.tipoContrato,
        convenio: p.convenio,
        categoria: p.categoria || p.puesto,
        provincia: p.provincia,
        diagrama: p.diagrama,
        horasPorDia: p.horasPorDia,
        valorHora: p.valorHora,
        costoBase: p.costoBase,
        itemsAdicionales: p.itemsAdicionales?.filter(i => i.incluir !== false).length || 0,
        capacitaciones: p.capacitaciones?.filter(i => i.incluir !== false).length || 0,
        subtotalAdicionales: p.subtotalAdicionales || 0,
        subtotalCapacitaciones: p.subtotalCapacitaciones || 0,
        total: p.total || p.costoTotal || 0,
        incluirCTC: p.incluirCTC !== false,
        importado: p.importado || false
      })),
      
      // Móviles
      moviles: {
        disponibles: (moviles.disponibles || []).map(m => ({
          id: m.id,
          tipo: m.tipo,
          dominio: m.dominio,
          descripcion: m.descripcion,
          costoBase: 0,
          service: m.costoService || 0,
          mantenimiento: m.costoMantenimiento || 0,
          total: m.total || 0,
          incluirCTC: m.incluirCTC !== false
        })),
        alquiler: (moviles.alquiler || []).map(m => ({
          id: m.id,
          tipo: m.tipo,
          dominio: m.dominio,
          descripcion: m.descripcion,
          proveedor: m.proveedorAlquiler,
          costoAlquiler: m.costoAlquiler || 0,
          service: m.costoService || 0,
          mantenimiento: m.costoMantenimiento || 0,
          total: m.total || 0,
          incluirCTC: m.incluirCTC !== false
        })),
        compra: (moviles.compra || []).map(m => ({
          id: m.id,
          tipo: m.tipo,
          dominio: m.dominio,
          descripcion: m.descripcion,
          inversionInicial: m.inversionInicial || 0,
          mesesAmortizacion: m.mesesAmortizacion || 0,
          amortizacionMensual: m.amortizacionMensual || 0,
          service: m.costoService || 0,
          mantenimiento: m.costoMantenimiento || 0,
          total: m.total || 0,
          incluirCTC: m.incluirCTC !== false
        })),
        serviceItems: moviles.serviceItems || [],
        mantenimientoItems: moviles.mantenimientoItems || [],
        subtotales: {
          disponibles: moviles.subtotalDisponibles || 0,
          alquiler: moviles.subtotalAlquiler || 0,
          compra: moviles.subtotalCompra || 0,
          service: moviles.totalService || 0,
          mantenimiento: moviles.totalMantenimiento || 0,
          total: moviles.total || 0
        }
      },
      
      // Trailers (sin Service - V5.3)
      trailers: {
        disponibles: (trailers.disponibles || []).map(t => ({
          id: t.id,
          tipo: t.tipo,
          identificacion: t.identificacion,
          descripcion: t.descripcion,
          costoBase: 0,
          mantenimiento: t.costoMantenimiento || 0,
          total: t.total || 0,
          incluirCTC: t.incluirCTC !== false
        })),
        alquiler: (trailers.alquiler || []).map(t => ({
          id: t.id,
          tipo: t.tipo,
          identificacion: t.identificacion,
          descripcion: t.descripcion,
          proveedor: t.proveedorAlquiler,
          costoAlquiler: t.costoAlquiler || 0,
          mantenimiento: t.costoMantenimiento || 0,
          total: t.total || 0,
          incluirCTC: t.incluirCTC !== false
        })),
        compra: (trailers.compra || []).map(t => ({
          id: t.id,
          tipo: t.tipo,
          identificacion: t.identificacion,
          descripcion: t.descripcion,
          inversionInicial: t.inversionInicial || 0,
          mesesAmortizacion: t.mesesAmortizacion || 0,
          amortizacionMensual: t.amortizacionMensual || 0,
          mantenimiento: t.costoMantenimiento || 0,
          total: t.total || 0,
          incluirCTC: t.incluirCTC !== false
        })),
        mantenimientoItems: trailers.mantenimientoItems || [],
        subtotales: {
          disponibles: trailers.subtotalDisponibles || 0,
          alquiler: trailers.subtotalAlquiler || 0,
          compra: trailers.subtotalCompra || 0,
          mantenimiento: trailers.totalMantenimiento || 0,
          total: trailers.total || 0
        },
        nota: 'Trailers sin Service (V5.3)'
      },
      
      // Capacitaciones globales
      capacitaciones: capacitaciones.map(c => ({
        id: c.id,
        codigo: c.codigo,
        descripcion: c.descripcion,
        precio: c.precio,
        cantidad: c.cantidad,
        duracionHoras: c.duracionHoras,
        total: (c.precio || 0) * (c.cantidad || 1),
        incluir: c.incluir !== false
      })),
      
      // Items adicionales globales
      itemsAdicionales: itemsAdicionales.map(i => ({
        id: i.id,
        codigo: i.codigo,
        descripcion: i.descripcion,
        precio: i.precio,
        cantidad: i.cantidad,
        total: (i.precio || 0) * (i.cantidad || 1),
        incluir: i.incluir !== false,
        enCTC: i.enCTC || false
      })),
      
      // Totales
      totales: {
        personal: totales.personal || 0,
        moviles: totales.moviles || 0,
        trailers: totales.trailers || 0,
        capacitaciones: totales.capacitaciones || 0,
        itemsAdicionales: totales.itemsAdicionales || 0,
        subtotalNeto: totales.subtotalNeto || 0,
        overhead: configuracion.overhead || 0,
        overheadMonto: totales.overheadMonto || 0,
        totalConOverhead: totales.totalConOverhead || 0,
        markup: configuracion.markup || 0,
        markupMonto: totales.markupMonto || 0,
        totalFinal: totales.totalFinal || 0
      },
      
      // Info de importación
      importacion: {
        tieneArchivo: Object.keys(datosImportados).length > 0,
        hojas: Object.keys(datosImportados)
      }
    };
  }, [personal, moviles, trailers, capacitaciones, itemsAdicionales, totales, metadata, configuracion, datosImportados]);

  // Exportar Excel
  const exportarExcel = async () => {
    if (disabled || estados.excel === 'loading') return;
    
    setEstados(prev => ({ ...prev, excel: 'loading' }));
    setErrores(prev => ({ ...prev, excel: null }));
    
    try {
      const payload = prepararPayload();
      
      // Importar dinámicamente el servicio
      const { generarExcel } = await import('../services/excelBuilder.js');
      const { blob, filename } = await generarExcel(payload);
      
      // Descargar
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `Cotizacion_${Date.now()}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      
      setEstados(prev => ({ ...prev, excel: 'success' }));
      onExcelGenerated?.(blob, filename);
      
      setTimeout(() => setEstados(prev => ({ ...prev, excel: 'idle' })), 3000);
    } catch (error) {
      console.error('Error exportando Excel:', error);
      setEstados(prev => ({ ...prev, excel: 'error' }));
      setErrores(prev => ({ ...prev, excel: error.message }));
    }
  };

  // Exportar PDF
  const exportarPdf = async () => {
    if (disabled || estados.pdf === 'loading') return;
    
    setEstados(prev => ({ ...prev, pdf: 'loading' }));
    setErrores(prev => ({ ...prev, pdf: null }));
    
    try {
      const payload = prepararPayload();
      
      const { generarPdf } = await import('../services/reportGenerator.js');
      const { blob, filename } = await generarPdf(payload);
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `Cotizacion_${Date.now()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      
      setEstados(prev => ({ ...prev, pdf: 'success' }));
      onPdfGenerated?.(blob, filename);
      
      setTimeout(() => setEstados(prev => ({ ...prev, pdf: 'idle' })), 3000);
    } catch (error) {
      console.error('Error exportando PDF:', error);
      setEstados(prev => ({ ...prev, pdf: 'error' }));
      setErrores(prev => ({ ...prev, pdf: error.message }));
    }
  };

  // Exportar JSON
  const exportarJson = async () => {
    if (disabled || estados.json === 'loading') return;
    
    setEstados(prev => ({ ...prev, json: 'loading' }));
    setErrores(prev => ({ ...prev, json: null }));
    
    try {
      const payload = prepararPayload();
      const jsonStr = JSON.stringify(payload, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const filename = `Cotizacion_${payload.metadata.nombreProyecto.replace(/\s+/g, '_')}_${Date.now()}.json`;
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      
      setEstados(prev => ({ ...prev, json: 'success' }));
      onJsonGenerated?.(payload, filename);
      
      setTimeout(() => setEstados(prev => ({ ...prev, json: 'idle' })), 3000);
    } catch (error) {
      console.error('Error exportando JSON:', error);
      setEstados(prev => ({ ...prev, json: 'error' }));
      setErrores(prev => ({ ...prev, json: error.message }));
    }
  };

  // Render del botón con estados
  const renderBoton = (tipo, icono, label, tooltip, onClick, colorClass) => {
    const estado = estados[tipo];
    const error = errores[tipo];
    const Icono = icono;
    
    const baseClass = `flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
      disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90 cursor-pointer'
    }`;
    
    return (
      <div className="relative">
        <button
          onClick={onClick}
          disabled={disabled || estado === 'loading'}
          className={`${baseClass} ${colorClass}`}
          aria-label={tooltip}
          title={tooltip}
        >
          {estado === 'loading' ? (
            <Loader2 size={18} className="animate-spin"/>
          ) : estado === 'success' ? (
            <CheckCircle size={18}/>
          ) : estado === 'error' ? (
            <AlertCircle size={18}/>
          ) : (
            <Icono size={18}/>
          )}
          {!compact && (
            <span>
              {estado === 'loading' ? 'Preparando...' : 
               estado === 'success' ? '¡Listo!' :
               estado === 'error' ? 'Error' : label}
            </span>
          )}
        </button>
        {error && (
          <p className="absolute top-full left-0 mt-1 text-xs text-red-400 whitespace-nowrap">
            {error}
          </p>
        )}
      </div>
    );
  };

  // Vista compacta
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {renderBoton('excel', FileSpreadsheet, '', 'Exportar Excel', exportarExcel, 'bg-emerald-600 hover:bg-emerald-700 text-white')}
        {renderBoton('pdf', FileText, '', 'Exportar PDF', exportarPdf, 'bg-red-600 hover:bg-red-700 text-white')}
        {renderBoton('json', Code, '', 'Exportar JSON', exportarJson, 'bg-slate-600 hover:bg-slate-700 text-white')}
      </div>
    );
  }

  return (
    <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-slate-300 flex items-center gap-2">
          <Download size={16}/> Exportar Cotización
        </h4>
        <span className="text-xs text-slate-500">V5.3 PRO</span>
      </div>

      {/* Botones */}
      <div className="flex flex-wrap gap-3">
        {renderBoton(
          'excel', 
          FileSpreadsheet, 
          'Excel', 
          'Exportar reporte Excel completo con todas las hojas', 
          exportarExcel, 
          'bg-emerald-600 hover:bg-emerald-700 text-white'
        )}
        {renderBoton(
          'pdf', 
          FileText, 
          'PDF', 
          'Generar PDF ejecutivo con resumen', 
          exportarPdf, 
          'bg-red-600 hover:bg-red-700 text-white'
        )}
        {renderBoton(
          'json', 
          Code, 
          'JSON', 
          'Exportar estructura JSON completa para análisis', 
          exportarJson, 
          'bg-slate-600 hover:bg-slate-700 text-white'
        )}
      </div>

      {/* Info */}
      <div className="mt-4 p-2 bg-slate-700/30 rounded text-xs text-slate-500 flex items-start gap-2">
        <Info size={14} className="mt-0.5 flex-shrink-0"/>
        <div>
          <p><strong>Excel:</strong> Incluye hojas detalladas de Personal, Móviles, Trailers y Resumen.</p>
          <p><strong>PDF:</strong> Reporte ejecutivo con totales y desglose por categoría.</p>
          <p><strong>JSON:</strong> Estructura completa para auditoría o integración externa.</p>
        </div>
      </div>
    </div>
  );
};

export default ExportButtons;
