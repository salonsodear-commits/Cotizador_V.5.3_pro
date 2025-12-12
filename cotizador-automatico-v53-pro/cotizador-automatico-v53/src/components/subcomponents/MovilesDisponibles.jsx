/**
 * SISTEMA DE COTIZACIÓN V5.3 PRO
 * MovilesDisponibles.jsx - Subcomponente para móviles disponibles
 * 
 * Móviles Disponibles: Sin costo de adquisición
 * Costo visual = Σ(Service P×Q) + Σ(Mantenimiento P×Q)
 * 
 * NO mezcla con Trailers - separación estricta V5.3
 */

import React, { useMemo } from 'react';
import { TIPOS_MOVIL } from '../core/constants.js';
import { calcularMovil } from '../core/calculations.js';
import { Truck, CheckCircle, AlertCircle, Info, Calendar, Hash, FileText } from 'lucide-react';

/**
 * MovilesDisponibles
 * 
 * Props:
 * - movil: objeto del móvil (debe tener adquisicion === 'Disponible')
 * - onUpdate: función (campo, valor) para actualizar
 * - costoService: costo mensual de service (viene de ServiceMoviles)
 * - costoMantenimiento: costo mensual de mantenimiento (viene de MantenimientoMoviles)
 * - datosImportados: datos del archivo soporte
 * - provinciaSeleccionada: provincia actual
 * - markup: markup de móviles
 * - fmt: función formateo moneda
 * - compact: vista compacta
 * - readOnly: solo lectura
 */
const MovilesDisponibles = ({
  movil,
  onUpdate,
  costoService = 0,
  costoMantenimiento = 0,
  datosImportados = {},
  provinciaSeleccionada = '',
  markup = 0,
  fmt = (n) => `$${(n||0).toLocaleString('es-AR')}`,
  compact = false,
  readOnly = false
}) => {
  
  // Validar que sea móvil disponible
  if (!movil || movil.adquisicion !== 'Disponible') {
    return null;
  }

  // Buscar datos adicionales desde archivo soporte
  const datosMovil = useMemo(() => {
    if (!datosImportados.movilesDisponibles?.length) return null;
    
    // Buscar por dominio o código
    return datosImportados.movilesDisponibles.find(m => 
      (m.Dominio && movil.dominio && m.Dominio === movil.dominio) ||
      (m.Codigo && movil.codigo && m.Codigo === movil.codigo) ||
      (m.ID && movil.id && m.ID === movil.id.toString())
    );
  }, [datosImportados.movilesDisponibles, movil]);

  // Cálculo del costo visual V5.3
  // Para Disponible: costoBase = 0, total = service + mantenimiento
  const costoVisual = useMemo(() => {
    const costoBase = 0; // Disponible no tiene costo de adquisición
    const totalSinMk = costoBase + costoService + costoMantenimiento;
    const mkLinea = movil.mkLinea || 0;
    const mkEfectivo = mkLinea > 0 ? mkLinea : markup;
    const totalConMk = totalSinMk * (1 + mkEfectivo / 100);
    const incluidoEnCTC = movil.incluirCTC !== false;
    
    return {
      costoBase,
      service: costoService,
      mantenimiento: costoMantenimiento,
      subtotal: totalSinMk,
      markup: mkEfectivo,
      total: totalConMk,
      enCTC: incluidoEnCTC,
      totalCTC: incluidoEnCTC ? totalConMk : 0
    };
  }, [costoService, costoMantenimiento, movil.mkLinea, movil.incluirCTC, markup]);

  // Handler para actualización
  const handleUpdate = (campo, valor) => {
    if (readOnly) return;
    onUpdate(campo, valor);
  };

  const inp = "px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm focus:border-emerald-500 focus:outline-none";

  // Vista compacta
  if (compact) {
    return (
      <div className={`p-3 rounded-lg border ${
        costoVisual.enCTC 
          ? 'bg-orange-900/20 border-orange-500/30' 
          : 'bg-slate-700/30 border-slate-600/30 opacity-60'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={costoVisual.enCTC}
              onChange={e => handleUpdate('incluirCTC', e.target.checked)}
              disabled={readOnly}
              className="rounded"
            />
            <Truck size={16} className="text-orange-400"/>
            <div>
              <span className="text-sm font-medium">{movil.tipo || 'Móvil'}</span>
              {movil.dominio && <span className="text-xs text-slate-400 ml-2">{movil.dominio}</span>}
            </div>
            <span className="text-xs bg-green-600/30 text-green-300 px-2 py-0.5 rounded">Disponible</span>
          </div>
          <div className="text-right">
            <span className={`font-bold ${costoVisual.enCTC ? 'text-orange-400' : 'text-slate-500'}`}>
              {fmt(costoVisual.total)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-lg border ${
      costoVisual.enCTC 
        ? 'bg-orange-900/20 border-orange-500/30' 
        : 'bg-slate-700/30 border-slate-600/30 opacity-70'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={costoVisual.enCTC}
            onChange={e => handleUpdate('incluirCTC', e.target.checked)}
            disabled={readOnly}
            className="rounded w-5 h-5"
          />
          <div className="w-10 h-10 rounded-lg bg-orange-600/30 flex items-center justify-center">
            <Truck size={20} className="text-orange-400"/>
          </div>
          <div>
            <p className="font-medium flex items-center gap-2">
              {movil.tipo || 'Móvil'}
              <span className="text-xs bg-green-600/30 text-green-300 px-2 py-0.5 rounded">
                Disponible
              </span>
            </p>
            <p className="text-xs text-slate-400">
              {movil.descripcion || 'Sin descripción'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Total mensual</p>
          <p className={`text-xl font-bold ${costoVisual.enCTC ? 'text-orange-400' : 'text-slate-500'}`}>
            {fmt(costoVisual.total)}
          </p>
        </div>
      </div>

      {/* Datos del móvil */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {/* Tipo */}
        <div>
          <label className="block text-xs text-slate-400 mb-1">Tipo</label>
          {readOnly ? (
            <span className="text-sm">{movil.tipo}</span>
          ) : (
            <select
              value={movil.tipo || ''}
              onChange={e => handleUpdate('tipo', e.target.value)}
              className={`${inp} w-full`}
            >
              {TIPOS_MOVIL.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          )}
        </div>

        {/* Dominio */}
        <div>
          <label className="block text-xs text-slate-400 mb-1 flex items-center gap-1">
            <Hash size={10}/> Dominio
          </label>
          {readOnly ? (
            <span className="text-sm">{movil.dominio || '-'}</span>
          ) : (
            <input
              type="text"
              value={movil.dominio || ''}
              onChange={e => handleUpdate('dominio', e.target.value)}
              className={`${inp} w-full`}
              placeholder="ABC123"
            />
          )}
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-xs text-slate-400 mb-1 flex items-center gap-1">
            <FileText size={10}/> Modelo/Descripción
          </label>
          {readOnly ? (
            <span className="text-sm">{movil.descripcion || '-'}</span>
          ) : (
            <input
              type="text"
              value={movil.descripcion || ''}
              onChange={e => handleUpdate('descripcion', e.target.value)}
              className={`${inp} w-full`}
              placeholder="Toyota Hilux 2022"
            />
          )}
        </div>

        {/* Antigüedad */}
        <div>
          <label className="block text-xs text-slate-400 mb-1 flex items-center gap-1">
            <Calendar size={10}/> Antigüedad (años)
          </label>
          {readOnly ? (
            <span className="text-sm">{movil.antiguedad || 0} años</span>
          ) : (
            <input
              type="number"
              value={movil.antiguedad || 0}
              onChange={e => handleUpdate('antiguedad', Number(e.target.value))}
              className={`${inp} w-full`}
              min="0"
              max="50"
            />
          )}
        </div>
      </div>

      {/* Observaciones */}
      <div className="mb-4">
        <label className="block text-xs text-slate-400 mb-1">Observaciones</label>
        {readOnly ? (
          <p className="text-sm text-slate-300">{movil.observaciones || 'Sin observaciones'}</p>
        ) : (
          <input
            type="text"
            value={movil.observaciones || ''}
            onChange={e => handleUpdate('observaciones', e.target.value)}
            className={`${inp} w-full`}
            placeholder="Notas adicionales..."
          />
        )}
      </div>

      {/* Desglose de costos */}
      <div className="p-3 bg-slate-800/50 rounded-lg">
        <p className="text-xs text-slate-400 mb-2 font-medium">Desglose de costos (Disponible):</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="p-2 bg-slate-700/50 rounded text-center">
            <p className="text-xs text-slate-400">Base</p>
            <p className="font-medium text-slate-500">$0</p>
            <p className="text-xs text-green-400">Sin costo adq.</p>
          </div>
          <div className="p-2 bg-blue-600/20 rounded text-center border border-blue-500/30">
            <p className="text-xs text-blue-300">Service</p>
            <p className="font-medium text-blue-400">{fmt(costoVisual.service)}</p>
          </div>
          <div className="p-2 bg-amber-600/20 rounded text-center border border-amber-500/30">
            <p className="text-xs text-amber-300">Mantenimiento</p>
            <p className="font-medium text-amber-400">{fmt(costoVisual.mantenimiento)}</p>
          </div>
          <div className="p-2 bg-emerald-600/20 rounded text-center border border-emerald-500/30">
            <p className="text-xs text-emerald-300">Total</p>
            <p className="font-bold text-emerald-400">{fmt(costoVisual.total)}</p>
            {costoVisual.markup > 0 && (
              <p className="text-xs text-slate-400">+{costoVisual.markup}% mk</p>
            )}
          </div>
        </div>
      </div>

      {/* Markup por línea */}
      {!readOnly && (
        <div className="mt-3 flex items-center justify-between p-2 bg-slate-700/30 rounded">
          <span className="text-xs text-slate-400">Markup individual (0 = usar general):</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={movil.mkLinea || 0}
              onChange={e => handleUpdate('mkLinea', Number(e.target.value))}
              className={`${inp} w-20 text-right`}
              min="0"
              max="100"
            />
            <span className="text-xs text-slate-400">%</span>
          </div>
        </div>
      )}

      {/* Info archivo soporte */}
      {datosMovil && (
        <div className="mt-3 p-2 bg-emerald-900/20 rounded border border-emerald-500/30">
          <p className="text-xs text-emerald-300 flex items-center gap-1">
            <CheckCircle size={12}/> Datos cargados desde archivo soporte
          </p>
        </div>
      )}

      {/* Estado CTC */}
      <div className="mt-3 flex items-center justify-between">
        <span className={`text-xs flex items-center gap-1 ${
          costoVisual.enCTC ? 'text-emerald-400' : 'text-amber-400'
        }`}>
          {costoVisual.enCTC ? (
            <><CheckCircle size={12}/> Incluido en Costo Total Compañía</>
          ) : (
            <><AlertCircle size={12}/> Excluido del Costo Total Compañía</>
          )}
        </span>
        {costoVisual.enCTC && (
          <span className="text-xs text-slate-400">
            Aporte al CTC: {fmt(costoVisual.totalCTC)}
          </span>
        )}
      </div>
    </div>
  );
};

export default MovilesDisponibles;
