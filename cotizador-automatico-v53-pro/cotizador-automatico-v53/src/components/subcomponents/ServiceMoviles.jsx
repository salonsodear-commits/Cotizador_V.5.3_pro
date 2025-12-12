/**
 * SISTEMA DE COTIZACIÓN V5.3 PRO
 * ServiceMoviles.jsx - Sub-sección Service para Móviles
 * 
 * SOLO para Móviles - Trailers NO tienen Service (V5.3 Punto 10.6)
 * Carga desde hoja "Service móviles" del archivo soporte único
 * Total = Σ(P × Q / 12) de ítems incluidos (mensualizado)
 */

import React, { useState, useMemo } from 'react';
import { SERVICE_ITEMS_PREDEFINIDOS } from '../core/constants.js';
import { Wrench, Plus, Trash2, Edit2, Save, FileSpreadsheet, AlertCircle, CheckCircle, Info } from 'lucide-react';

/**
 * ServiceMoviles
 * 
 * Props:
 * - items: array de ítems de service del móvil
 * - onAdd: función (item) para agregar
 * - onUpdate: función (itemId, campo, valor) para actualizar
 * - onDelete: función (itemId) para eliminar
 * - datosImportados: datos del archivo soporte
 * - provinciaSeleccionada: provincia actual
 * - tipoMovil: tipo de móvil (para filtrar items)
 * - fmt: función formateo moneda
 * - compact: vista compacta
 * - readOnly: solo lectura
 * - onTotalChange: callback para notificar cambio de total
 */
const ServiceMoviles = ({
  items = [],
  onAdd,
  onUpdate,
  onDelete,
  datosImportados = {},
  provinciaSeleccionada = '',
  tipoMovil = '',
  fmt = (n) => `$${(n||0).toLocaleString('es-AR')}`,
  compact = false,
  readOnly = false,
  onTotalChange
}) => {
  const [editId, setEditId] = useState(null);

  // Items importados filtrados
  const itemsImp = useMemo(() => {
    if (!datosImportados.serviceMoviles?.length) return [];
    return datosImportados.serviceMoviles.filter(i => {
      if (i.Provincia && provinciaSeleccionada && i.Provincia !== provinciaSeleccionada) return false;
      if (i.TipoMovil && tipoMovil && i.TipoMovil !== tipoMovil) return false;
      return true;
    });
  }, [datosImportados.serviceMoviles, provinciaSeleccionada, tipoMovil]);

  // Calcular totales - Mensualizado (P × Q / 12)
  const totales = useMemo(() => {
    const inc = items.filter(i => i.incluir !== false);
    // Service: P × frecuenciaAnual / 12 = costo mensual
    const totalAnual = inc.reduce((s, i) => s + ((i.precio || 0) * (i.frecuenciaAnual || 1)), 0);
    const totalMensual = totalAnual / 12;
    
    return {
      cantidad: items.length,
      incluidos: inc.length,
      totalAnual,
      totalMensual
    };
  }, [items]);

  // Notificar cambio de total al padre
  useMemo(() => {
    if (onTotalChange) {
      onTotalChange(totales.totalMensual);
    }
  }, [totales.totalMensual, onTotalChange]);

  // Agregar desde selector
  const agregarDesdeSelector = (sel) => {
    if (!sel) return;
    let d = SERVICE_ITEMS_PREDEFINIDOS.find(i => i.descripcion === sel) || itemsImp.find(i => i.Descripcion === sel);
    if (d) {
      onAdd({
        id: Date.now(),
        codigo: d.codigo || d.Codigo || `SVC-${Date.now()}`,
        descripcion: d.descripcion || d.Descripcion,
        precio: d.precioDefault || d.Precio || 0,
        frecuenciaAnual: d.frecuenciaAnual || d.FrecuenciaAnual || 1,
        observaciones: d.observaciones || d.Observaciones || '',
        clasificacion: d.clasificacion || d.Clasificacion || '',
        incluir: true
      });
    }
  };

  // Actualizar campo
  const upd = (id, c, v) => {
    const valor = (c === 'precio' || c === 'frecuenciaAnual') ? Number(v) : v;
    // Validaciones
    if (c === 'precio' && valor < 0) return;
    if (c === 'frecuenciaAnual' && (valor < 0 || !Number.isInteger(valor))) return;
    onUpdate(id, c, valor);
  };

  // Preparar para export
  const prepararExport = () => items.map(i => ({
    Codigo: i.codigo,
    Descripcion: i.descripcion,
    Precio: i.precio,
    FrecuenciaAnual: i.frecuenciaAnual,
    TotalAnual: (i.precio || 0) * (i.frecuenciaAnual || 1),
    TotalMensual: ((i.precio || 0) * (i.frecuenciaAnual || 1)) / 12,
    Observaciones: i.observaciones,
    Incluir: i.incluir ? 'SI' : 'NO',
    Provincia: provinciaSeleccionada,
    TipoMovil: tipoMovil
  }));

  const inp = "px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm focus:border-emerald-500 focus:outline-none";

  // Vista compacta
  if (compact) {
    return (
      <div className="p-2 bg-blue-900/20 rounded border border-blue-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench size={14} className="text-blue-400"/>
            <span className="text-xs font-medium text-blue-300">Service</span>
            <span className="text-xs bg-blue-600/30 px-1.5 py-0.5 rounded">{totales.incluidos}/{totales.cantidad}</span>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400">{fmt(totales.totalMensual)}/mes</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-500/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h5 className="text-sm font-medium text-blue-300 flex items-center gap-2">
          <Wrench size={16}/>
          Service
          <span className="text-xs bg-blue-600/30 px-2 py-0.5 rounded">{totales.cantidad}</span>
          <span className="text-xs text-slate-400">(ΣP×Q/12 = mensual)</span>
        </h5>
        {!readOnly && (
          <select
            className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-xs"
            value=""
            onChange={e => { agregarDesdeSelector(e.target.value); e.target.value = ''; }}
          >
            <option value="">+ Agregar</option>
            <optgroup label="Predefinidos">
              {SERVICE_ITEMS_PREDEFINIDOS.map(i => (
                <option key={i.descripcion} value={i.descripcion}>{i.descripcion}</option>
              ))}
            </optgroup>
            {itemsImp.length > 0 && (
              <optgroup label="Importados">
                {itemsImp.map((i, x) => (
                  <option key={x} value={i.Descripcion}>{i.Descripcion}</option>
                ))}
              </optgroup>
            )}
          </select>
        )}
      </div>

      {/* Tabla de items */}
      {items.length > 0 ? (
        <div className="space-y-1">
          {items.map(i => {
            const totalAnual = (i.precio || 0) * (i.frecuenciaAnual || 1);
            const totalMensual = totalAnual / 12;
            
            return (
              <div 
                key={i.id} 
                className={`flex items-center gap-2 p-2 rounded transition-colors ${
                  i.incluir !== false 
                    ? 'bg-slate-700/50' 
                    : 'bg-slate-800/30 opacity-50'
                }`}
              >
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={i.incluir !== false}
                  onChange={e => upd(i.id, 'incluir', e.target.checked)}
                  disabled={readOnly}
                  className="rounded"
                />
                
                {/* Descripción */}
                <div className="flex-1 min-w-0">
                  {editId === i.id && !readOnly ? (
                    <input
                      type="text"
                      value={i.descripcion}
                      onChange={e => upd(i.id, 'descripcion', e.target.value)}
                      className={`${inp} w-full`}
                    />
                  ) : (
                    <div>
                      <span className="text-sm">{i.descripcion}</span>
                      {i.observaciones && (
                        <span className="text-xs text-slate-500 ml-2">({i.observaciones})</span>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Precio */}
                <div className="flex items-center gap-1">
                  <span className="text-xs text-slate-400">P:</span>
                  {readOnly ? (
                    <span className="text-sm w-20 text-right">{fmt(i.precio)}</span>
                  ) : (
                    <input
                      type="number"
                      value={i.precio || 0}
                      onChange={e => upd(i.id, 'precio', e.target.value)}
                      className={`${inp} w-20 text-right`}
                      min="0"
                    />
                  )}
                </div>
                
                {/* Frecuencia Anual */}
                <div className="flex items-center gap-1">
                  <span className="text-xs text-slate-400">Q/año:</span>
                  {readOnly ? (
                    <span className="text-sm w-12 text-right">{i.frecuenciaAnual}</span>
                  ) : (
                    <input
                      type="number"
                      value={i.frecuenciaAnual || 1}
                      onChange={e => upd(i.id, 'frecuenciaAnual', e.target.value)}
                      className={`${inp} w-12 text-right`}
                      min="1"
                      step="1"
                    />
                  )}
                </div>
                
                {/* Total mensual */}
                <div className="w-20 text-right">
                  <span className={`text-sm font-medium ${i.incluir !== false ? 'text-blue-400' : 'text-slate-500'}`}>
                    {fmt(totalMensual)}
                  </span>
                  <span className="text-xs text-slate-500 block">/mes</span>
                </div>
                
                {/* Acciones */}
                {!readOnly && (
                  <div className="flex gap-1">
                    {editId === i.id ? (
                      <button onClick={() => setEditId(null)} className="p-1 text-emerald-400">
                        <Save size={14}/>
                      </button>
                    ) : (
                      <button onClick={() => setEditId(i.id)} className="p-1 text-slate-400 hover:text-slate-300">
                        <Edit2 size={14}/>
                      </button>
                    )}
                    <button onClick={() => onDelete(i.id)} className="p-1 text-red-400 hover:text-red-300">
                      <Trash2 size={14}/>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-3 text-slate-500">
          <Wrench size={20} className="mx-auto mb-1 opacity-50"/>
          <p className="text-xs">Sin ítems de service</p>
        </div>
      )}

      {/* Totales */}
      {items.length > 0 && (
        <div className="mt-3 p-2 bg-slate-800/50 rounded flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs">
            <span className="text-slate-400">
              Incluidos: <span className="text-white">{totales.incluidos}/{totales.cantidad}</span>
            </span>
            <span className="text-slate-400">
              Anual: <span className="text-slate-300">{fmt(totales.totalAnual)}</span>
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400">Total mensual: </span>
            <span className="text-sm font-bold text-blue-400">{fmt(totales.totalMensual)}</span>
          </div>
        </div>
      )}

      {/* Info archivo soporte */}
      {itemsImp.length > 0 && (
        <div className="mt-2 p-2 bg-emerald-900/20 rounded border border-emerald-500/30">
          <p className="text-xs text-emerald-300 flex items-center gap-1">
            <FileSpreadsheet size={12}/> {itemsImp.length} ítems del archivo soporte
          </p>
        </div>
      )}

      {/* Info */}
      <div className="mt-2 p-2 bg-slate-700/30 rounded">
        <p className="text-xs text-slate-400 flex items-center gap-1">
          <Info size={12}/>
          El costo de service se calcula: (Precio × Frecuencia anual) / 12 = costo mensual
        </p>
      </div>
    </div>
  );
};

export default ServiceMoviles;
