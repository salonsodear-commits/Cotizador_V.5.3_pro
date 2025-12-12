/**
 * SISTEMA DE COTIZACIÓN V5.3 PRO
 * ResumenCategoria.jsx - Resumen consolidado por categoría
 * 
 * Muestra totales parciales por sección, subtotales y totales finales
 * Integración con Personal, Móviles, Trailers, Results
 * Solo lectura + acciones de navegación
 */

import React, { useMemo, useState } from 'react';
import { Users, Truck, Home, Package, BookOpen, Settings, ChevronDown, ChevronUp, AlertCircle, CheckCircle, Info, TrendingUp, DollarSign, Percent, FileSpreadsheet } from 'lucide-react';

/**
 * ResumenCategoria
 * 
 * Props:
 * - personal: { items: [], subtotal, incluidos }
 * - moviles: { items: [], subtotal, incluidos, service, mantenimiento }
 * - trailers: { items: [], subtotal, incluidos, mantenimiento }
 * - capacitaciones: { items: [], subtotal, incluidos }
 * - itemsAdicionales: { items: [], subtotal, incluidos }
 * - overhead: número (porcentaje)
 * - markup: número (porcentaje)
 * - datosImportados: objeto con flags de importación
 * - onSelectCategoria: función (categoria) callback
 * - onVerDetalle: función (categoria) callback
 * - fmt: función formateo moneda
 * - compact: vista compacta
 */
const ResumenCategoria = ({
  personal = { items: [], subtotal: 0, incluidos: 0 },
  moviles = { items: [], subtotal: 0, incluidos: 0, service: 0, mantenimiento: 0 },
  trailers = { items: [], subtotal: 0, incluidos: 0, mantenimiento: 0 },
  capacitaciones = { items: [], subtotal: 0, incluidos: 0 },
  itemsAdicionales = { items: [], subtotal: 0, incluidos: 0 },
  overhead = 0,
  markup = 0,
  datosImportados = {},
  onSelectCategoria,
  onVerDetalle,
  fmt = (n) => `$${(n||0).toLocaleString('es-AR')}`,
  compact = false
}) => {
  const [expandidas, setExpandidas] = useState({});

  // Toggle expandir categoría
  const toggleExpandir = (cat) => {
    setExpandidas(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  // Calcular totales globales
  const totales = useMemo(() => {
    const subtotalNeto = 
      (personal.subtotal || 0) + 
      (moviles.subtotal || 0) + 
      (trailers.subtotal || 0) + 
      (capacitaciones.subtotal || 0) + 
      (itemsAdicionales.subtotal || 0);
    
    const overheadMonto = subtotalNeto * (overhead / 100);
    const totalConOverhead = subtotalNeto + overheadMonto;
    const markupMonto = totalConOverhead * (markup / 100);
    const totalFinal = totalConOverhead + markupMonto;
    
    const itemsTotales = 
      (personal.incluidos || 0) + 
      (moviles.incluidos || 0) + 
      (trailers.incluidos || 0);

    return {
      subtotalNeto,
      overheadMonto,
      totalConOverhead,
      markupMonto,
      totalFinal,
      itemsTotales,
      tieneErrores: false
    };
  }, [personal, moviles, trailers, capacitaciones, itemsAdicionales, overhead, markup]);

  // Configuración de categorías
  const categorias = useMemo(() => [
    {
      key: 'personal',
      label: 'Personal',
      icono: Users,
      color: 'blue',
      data: personal,
      importado: datosImportados.personal?.length > 0,
      detalles: [
        { label: 'RD', valor: personal.rdTotal || 0 },
        { label: 'MT', valor: personal.mtTotal || 0 },
        { label: 'FUCO', valor: personal.fucoTotal || 0 }
      ]
    },
    {
      key: 'moviles',
      label: 'Móviles',
      icono: Truck,
      color: 'orange',
      data: moviles,
      importado: datosImportados.moviles?.length > 0,
      detalles: [
        { label: 'Base', valor: moviles.base || 0 },
        { label: 'Service', valor: moviles.service || 0 },
        { label: 'Mantenimiento', valor: moviles.mantenimiento || 0 }
      ]
    },
    {
      key: 'trailers',
      label: 'Trailers',
      icono: Home,
      color: 'purple',
      data: trailers,
      importado: datosImportados.trailers?.length > 0,
      detalles: [
        { label: 'Base', valor: trailers.base || 0 },
        { label: 'Mantenimiento', valor: trailers.mantenimiento || 0 }
      ],
      nota: 'Sin Service (V5.3)'
    },
    {
      key: 'capacitaciones',
      label: 'Capacitaciones',
      icono: BookOpen,
      color: 'indigo',
      data: capacitaciones,
      importado: datosImportados.capacitaciones?.length > 0
    },
    {
      key: 'itemsAdicionales',
      label: 'Ítems Adicionales',
      icono: Package,
      color: 'pink',
      data: itemsAdicionales,
      importado: datosImportados.itemsAdicionales?.length > 0
    }
  ], [personal, moviles, trailers, capacitaciones, itemsAdicionales, datosImportados]);

  // Obtener clases de color
  const getColorClasses = (color) => {
    const colores = {
      blue: { bg: 'bg-blue-900/20', border: 'border-blue-500/30', text: 'text-blue-400', badge: 'bg-blue-600/30 text-blue-300' },
      orange: { bg: 'bg-orange-900/20', border: 'border-orange-500/30', text: 'text-orange-400', badge: 'bg-orange-600/30 text-orange-300' },
      purple: { bg: 'bg-purple-900/20', border: 'border-purple-500/30', text: 'text-purple-400', badge: 'bg-purple-600/30 text-purple-300' },
      indigo: { bg: 'bg-indigo-900/20', border: 'border-indigo-500/30', text: 'text-indigo-400', badge: 'bg-indigo-600/30 text-indigo-300' },
      pink: { bg: 'bg-pink-900/20', border: 'border-pink-500/30', text: 'text-pink-400', badge: 'bg-pink-600/30 text-pink-300' }
    };
    return colores[color] || colores.blue;
  };

  // Formatear valor o mostrar "—"
  const fmtValor = (val) => {
    if (val === null || val === undefined || isNaN(val)) return '—';
    return fmt(val);
  };

  // Preparar datos para export
  const datosParaExport = useMemo(() => ({
    categorias: categorias.map(c => ({
      nombre: c.label,
      items: c.data.incluidos || 0,
      subtotal: c.data.subtotal || 0,
      importado: c.importado
    })),
    totales: {
      subtotalNeto: totales.subtotalNeto,
      overhead: overhead,
      overheadMonto: totales.overheadMonto,
      totalConOverhead: totales.totalConOverhead,
      markup: markup,
      markupMonto: totales.markupMonto,
      totalFinal: totales.totalFinal
    }
  }), [categorias, totales, overhead, markup]);

  // Vista compacta
  if (compact) {
    return (
      <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <TrendingUp size={16}/> Resumen
          </h4>
          <span className="text-xs text-slate-400">{totales.itemsTotales} ítems</span>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          {categorias.slice(0, 3).map(cat => {
            const colors = getColorClasses(cat.color);
            return (
              <div key={cat.key} className={`p-2 rounded ${colors.bg} border ${colors.border}`}>
                <p className="text-xs text-slate-400">{cat.label}</p>
                <p className={`font-medium ${colors.text}`}>{fmtValor(cat.data.subtotal)}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-3 pt-3 border-t border-slate-700 flex justify-between items-center">
          <span className="text-sm text-slate-400">Total Final</span>
          <span className="text-xl font-bold text-emerald-400">{fmtValor(totales.totalFinal)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
          <TrendingUp size={20} className="text-emerald-400"/>
          Resumen por Categoría
        </h3>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-400">{totales.itemsTotales} ítems totales</span>
          {totales.tieneErrores && (
            <span className="text-amber-400 flex items-center gap-1">
              <AlertCircle size={14}/> Con advertencias
            </span>
          )}
        </div>
      </div>

      {/* Grid de categorías */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categorias.map(cat => {
          const Icono = cat.icono;
          const colors = getColorClasses(cat.color);
          const expandida = expandidas[cat.key];
          const tieneItems = (cat.data.incluidos || 0) > 0;
          const tieneSubtotal = (cat.data.subtotal || 0) > 0;
          
          return (
            <div 
              key={cat.key}
              className={`rounded-lg border ${colors.bg} ${colors.border} overflow-hidden`}
            >
              {/* Header categoría */}
              <div 
                className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-700/20"
                onClick={() => tieneItems && toggleExpandir(cat.key)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center`}>
                    <Icono size={20} className={colors.text}/>
                  </div>
                  <div>
                    <p className="font-medium flex items-center gap-2">
                      {cat.label}
                      {cat.importado && (
                        <span className="text-xs bg-emerald-600/30 text-emerald-300 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <FileSpreadsheet size={10}/>
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-slate-400">
                      {cat.data.incluidos || 0} de {cat.data.items?.length || 0} incluidos
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${tieneSubtotal ? colors.text : 'text-slate-500'}`}>
                    {fmtValor(cat.data.subtotal)}
                  </span>
                  {tieneItems && (
                    expandida ? <ChevronUp size={16} className="text-slate-400"/> : <ChevronDown size={16} className="text-slate-400"/>
                  )}
                </div>
              </div>

              {/* Detalles expandidos */}
              {expandida && tieneItems && (
                <div className="px-3 pb-3 border-t border-slate-700/50">
                  {cat.detalles && cat.detalles.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {cat.detalles.map((d, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-slate-400">{d.label}</span>
                          <span className="text-slate-300">{fmtValor(d.valor)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {cat.nota && (
                    <p className="mt-2 text-xs text-slate-500 flex items-center gap-1">
                      <Info size={10}/> {cat.nota}
                    </p>
                  )}
                  {onVerDetalle && (
                    <button
                      onClick={() => onVerDetalle(cat.key)}
                      className={`mt-2 w-full py-1.5 rounded text-xs ${colors.badge} hover:opacity-80`}
                    >
                      Ver detalle completo
                    </button>
                  )}
                </div>
              )}

              {/* Sin items */}
              {!tieneItems && (
                <div className="px-3 pb-3 text-center">
                  <p className="text-xs text-slate-500">0 ítems incluidos</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Totales */}
      <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
        <h4 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
          <DollarSign size={16}/> Totales del Proyecto
        </h4>
        
        <div className="space-y-2">
          {/* Subtotal Neto */}
          <div className="flex justify-between items-center py-2 border-b border-slate-700">
            <span className="text-slate-400">Subtotal Neto</span>
            <span className="font-medium text-slate-200">{fmtValor(totales.subtotalNeto)}</span>
          </div>

          {/* Overhead */}
          {overhead > 0 && (
            <div className="flex justify-between items-center py-2 border-b border-slate-700">
              <span className="text-slate-400 flex items-center gap-1">
                <Percent size={12}/> Overhead ({overhead}%)
              </span>
              <span className="text-amber-400">+ {fmtValor(totales.overheadMonto)}</span>
            </div>
          )}

          {/* Total con Overhead */}
          {overhead > 0 && (
            <div className="flex justify-between items-center py-2 border-b border-slate-700">
              <span className="text-slate-400">Total con Overhead</span>
              <span className="font-medium text-slate-200">{fmtValor(totales.totalConOverhead)}</span>
            </div>
          )}

          {/* Markup */}
          {markup > 0 && (
            <div className="flex justify-between items-center py-2 border-b border-slate-700">
              <span className="text-slate-400 flex items-center gap-1">
                <TrendingUp size={12}/> Markup ({markup}%)
              </span>
              <span className="text-blue-400">+ {fmtValor(totales.markupMonto)}</span>
            </div>
          )}

          {/* Total Final */}
          <div className="flex justify-between items-center py-3 bg-emerald-900/20 rounded-lg px-3 mt-2">
            <span className="font-medium text-emerald-300">Total Final del Proyecto</span>
            <span className="text-2xl font-bold text-emerald-400">{fmtValor(totales.totalFinal)}</span>
          </div>
        </div>
      </div>

      {/* Info exportación */}
      <div className="p-2 bg-slate-700/30 rounded text-xs text-slate-500 flex items-center gap-2">
        <Info size={12}/>
        Datos listos para exportación. Use el botón "Exportar" para generar reporte.
      </div>
    </div>
  );
};

export default ResumenCategoria;
