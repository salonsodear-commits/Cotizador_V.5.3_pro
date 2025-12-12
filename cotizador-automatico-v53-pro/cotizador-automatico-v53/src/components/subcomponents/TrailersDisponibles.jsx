/**
 * SISTEMA DE COTIZACIÓN V5.3 PRO
 * TrailersDisponibles.jsx - Subcomponente para trailers disponibles
 * 
 * Trailers Disponibles: Sin costo de adquisición
 * Costo visual = Σ(Mantenimiento P×Q) - SIN SERVICE (V5.3 Punto 10.6)
 * 
 * NO mezcla con Móviles - separación estricta V5.3
 */

import React, { useMemo } from 'react';
import { TIPOS_TRAILER } from '../core/constants.js';
import { Home, CheckCircle, AlertCircle, Info, Calendar, Hash, FileText, Users, Bath } from 'lucide-react';

/**
 * TrailersDisponibles
 * 
 * Props:
 * - trailer: objeto del trailer (debe tener adquisicion === 'Disponible')
 * - onUpdate: función (campo, valor) para actualizar
 * - costoMantenimiento: costo mensual de mantenimiento (viene de MantenimientoTrailers)
 * - datosImportados: datos del archivo soporte
 * - provinciaSeleccionada: provincia actual
 * - markup: markup de trailers
 * - fmt: función formateo moneda
 * - compact: vista compacta
 * - readOnly: solo lectura
 */
const TrailersDisponibles = ({
  trailer,
  onUpdate,
  costoMantenimiento = 0,
  datosImportados = {},
  provinciaSeleccionada = '',
  markup = 0,
  fmt = (n) => `$${(n||0).toLocaleString('es-AR')}`,
  compact = false,
  readOnly = false
}) => {
  
  // Validar que sea trailer disponible
  if (!trailer || trailer.adquisicion !== 'Disponible') {
    return null;
  }

  // Buscar datos adicionales desde archivo soporte
  const datosTrailer = useMemo(() => {
    if (!datosImportados.trailersDisponibles?.length) return null;
    
    return datosImportados.trailersDisponibles.find(t => 
      (t.Identificacion && trailer.identificacion && t.Identificacion === trailer.identificacion) ||
      (t.Codigo && trailer.codigo && t.Codigo === trailer.codigo) ||
      (t.ID && trailer.id && t.ID === trailer.id.toString())
    );
  }, [datosImportados.trailersDisponibles, trailer]);

  // Cálculo del costo visual V5.3
  // Para Disponible: costoBase = 0, total = SOLO mantenimiento (SIN service)
  const costoVisual = useMemo(() => {
    const costoBase = 0; // Disponible no tiene costo de adquisición
    const totalSinMk = costoBase + costoMantenimiento; // SIN service para trailers
    const mkLinea = trailer.mkLinea || 0;
    const mkEfectivo = mkLinea > 0 ? mkLinea : markup;
    const totalConMk = totalSinMk * (1 + mkEfectivo / 100);
    const incluidoEnCTC = trailer.incluirCTC !== false;
    
    return {
      costoBase,
      mantenimiento: costoMantenimiento,
      subtotal: totalSinMk,
      markup: mkEfectivo,
      total: totalConMk,
      enCTC: incluidoEnCTC,
      totalCTC: incluidoEnCTC ? totalConMk : 0
    };
  }, [costoMantenimiento, trailer.mkLinea, trailer.incluirCTC, markup]);

  // Handler para actualización
  const handleUpdate = (campo, valor) => {
    if (readOnly) return;
    onUpdate(campo, valor);
  };

  // Obtener label del tipo
  const tipoLabel = TIPOS_TRAILER.find(t => t.value === trailer.tipo)?.label || trailer.tipo;
  const esHabitacional = trailer.tipo === 'Habitacional';
  const esSanitario = trailer.tipo === 'Sanitario';

  const inp = "px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm focus:border-emerald-500 focus:outline-none";

  // Vista compacta
  if (compact) {
    return (
      <div className={`p-3 rounded-lg border ${
        costoVisual.enCTC 
          ? 'bg-purple-900/20 border-purple-500/30' 
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
            <Home size={16} className="text-purple-400"/>
            <div>
              <span className="text-sm font-medium">{tipoLabel}</span>
              {trailer.identificacion && <span className="text-xs text-slate-400 ml-2">{trailer.identificacion}</span>}
            </div>
            <span className="text-xs bg-green-600/30 text-green-300 px-2 py-0.5 rounded">Disponible</span>
          </div>
          <div className="text-right">
            <span className={`font-bold ${costoVisual.enCTC ? 'text-purple-400' : 'text-slate-500'}`}>
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
        ? 'bg-purple-900/20 border-purple-500/30' 
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
          <div className="w-10 h-10 rounded-lg bg-purple-600/30 flex items-center justify-center">
            <Home size={20} className="text-purple-400"/>
          </div>
          <div>
            <p className="font-medium flex items-center gap-2">
              {tipoLabel}
              <span className="text-xs bg-green-600/30 text-green-300 px-2 py-0.5 rounded">
                Disponible
              </span>
            </p>
            <p className="text-xs text-slate-400">
              {trailer.descripcion || 'Sin descripción'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Total mensual</p>
          <p className={`text-xl font-bold ${costoVisual.enCTC ? 'text-purple-400' : 'text-slate-500'}`}>
            {fmt(costoVisual.total)}
          </p>
        </div>
      </div>

      {/* Datos del trailer */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {/* Tipo */}
        <div>
          <label className="block text-xs text-slate-400 mb-1">Tipo</label>
          {readOnly ? (
            <span className="text-sm">{tipoLabel}</span>
          ) : (
            <select
              value={trailer.tipo || ''}
              onChange={e => handleUpdate('tipo', e.target.value)}
              className={`${inp} w-full`}
            >
              {TIPOS_TRAILER.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          )}
        </div>

        {/* Identificación */}
        <div>
          <label className="block text-xs text-slate-400 mb-1 flex items-center gap-1">
            <Hash size={10}/> Identificación
          </label>
          {readOnly ? (
            <span className="text-sm">{trailer.identificacion || '-'}</span>
          ) : (
            <input
              type="text"
              value={trailer.identificacion || ''}
              onChange={e => handleUpdate('identificacion', e.target.value)}
              className={`${inp} w-full`}
              placeholder="ID o código"
            />
          )}
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-xs text-slate-400 mb-1 flex items-center gap-1">
            <FileText size={10}/> Modelo/Descripción
          </label>
          {readOnly ? (
            <span className="text-sm">{trailer.descripcion || '-'}</span>
          ) : (
            <input
              type="text"
              value={trailer.descripcion || ''}
              onChange={e => handleUpdate('descripcion', e.target.value)}
              className={`${inp} w-full`}
              placeholder="Trailer 40 pies"
            />
          )}
        </div>

        {/* Antigüedad */}
        <div>
          <label className="block text-xs text-slate-400 mb-1 flex items-center gap-1">
            <Calendar size={10}/> Antigüedad (años)
          </label>
          {readOnly ? (
            <span className="text-sm">{trailer.antiguedad || 0} años</span>
          ) : (
            <input
              type="number"
              value={trailer.antiguedad || 0}
              onChange={e => handleUpdate('antiguedad', Number(e.target.value))}
              className={`${inp} w-full`}
              min="0"
              max="50"
            />
          )}
        </div>
      </div>

      {/* Campos específicos por tipo */}
      {(esHabitacional || esSanitario) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {/* Capacidad */}
          <div>
            <label className="block text-xs text-slate-400 mb-1 flex items-center gap-1">
              <Users size={10}/> Capacidad (personas)
            </label>
            {readOnly ? (
              <span className="text-sm">{trailer.capacidad || 0}</span>
            ) : (
              <input
                type="number"
                value={trailer.capacidad || 0}
                onChange={e => handleUpdate('capacidad', Number(e.target.value))}
                className={`${inp} w-full`}
                min="0"
              />
            )}
          </div>

          {/* Camas (solo habitacional) */}
          {esHabitacional && (
            <div>
              <label className="block text-xs text-slate-400 mb-1">Camas</label>
              {readOnly ? (
                <span className="text-sm">{trailer.camas || 0}</span>
              ) : (
                <input
                  type="number"
                  value={trailer.camas || 0}
                  onChange={e => handleUpdate('camas', Number(e.target.value))}
                  className={`${inp} w-full`}
                  min="0"
                />
              )}
            </div>
          )}

          {/* Baños (solo sanitario) */}
          {esSanitario && (
            <div>
              <label className="block text-xs text-slate-400 mb-1 flex items-center gap-1">
                <Bath size={10}/> Baños
              </label>
              {readOnly ? (
                <span className="text-sm">{trailer.banios || 0}</span>
              ) : (
                <input
                  type="number"
                  value={trailer.banios || 0}
                  onChange={e => handleUpdate('banios', Number(e.target.value))}
                  className={`${inp} w-full`}
                  min="0"
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* Observaciones */}
      <div className="mb-4">
        <label className="block text-xs text-slate-400 mb-1">Observaciones</label>
        {readOnly ? (
          <p className="text-sm text-slate-300">{trailer.observaciones || 'Sin observaciones'}</p>
        ) : (
          <input
            type="text"
            value={trailer.observaciones || ''}
            onChange={e => handleUpdate('observaciones', e.target.value)}
            className={`${inp} w-full`}
            placeholder="Notas adicionales..."
          />
        )}
      </div>

      {/* Desglose de costos - SIN SERVICE */}
      <div className="p-3 bg-slate-800/50 rounded-lg">
        <p className="text-xs text-slate-400 mb-2 font-medium">Desglose de costos (Disponible - Sin Service):</p>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="p-2 bg-slate-700/50 rounded text-center">
            <p className="text-xs text-slate-400">Base</p>
            <p className="font-medium text-slate-500">$0</p>
            <p className="text-xs text-green-400">Sin costo adq.</p>
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
        {/* Nota V5.3 */}
        <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
          <Info size={10}/> Trailers no tienen Service (V5.3)
        </p>
      </div>

      {/* Markup por línea */}
      {!readOnly && (
        <div className="mt-3 flex items-center justify-between p-2 bg-slate-700/30 rounded">
          <span className="text-xs text-slate-400">Markup individual (0 = usar general):</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={trailer.mkLinea || 0}
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
      {datosTrailer && (
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

export default TrailersDisponibles;
