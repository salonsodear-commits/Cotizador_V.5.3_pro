/**
 * SISTEMA DE COTIZACIÓN V5.3 PRO
 * TrailersCompra.jsx - Subcomponente para trailers en compra
 * 
 * Trailers Compra: costoBase = amortización mensual
 * Amortización = Inversión Inicial / Meses de Amortización
 * Costo visual = Amortización + Σ(Mantenimiento P×Q) - SIN SERVICE (V5.3 Punto 10.6)
 * 
 * NO mezcla con Móviles - separación estricta V5.3
 */

import React, { useMemo } from 'react';
import { TIPOS_TRAILER } from '../core/constants.js';
import { Home, CheckCircle, AlertCircle, DollarSign, Calendar, Hash, FileText, TrendingDown, Calculator, Users, Bath, Info } from 'lucide-react';

/**
 * TrailersCompra
 * 
 * Props:
 * - trailer: objeto del trailer (debe tener adquisicion === 'Compra')
 * - onUpdate: función (campo, valor) para actualizar
 * - costoMantenimiento: costo mensual de mantenimiento (viene de MantenimientoTrailers)
 * - datosImportados: datos del archivo soporte
 * - provinciaSeleccionada: provincia actual
 * - markup: markup de trailers
 * - fmt: función formateo moneda
 * - compact: vista compacta
 * - readOnly: solo lectura
 */
const TrailersCompra = ({
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
  
  // Validar que sea trailer en compra
  if (!trailer || trailer.adquisicion !== 'Compra') {
    return null;
  }

  // Buscar datos desde archivo soporte
  const datosTrailer = useMemo(() => {
    if (!datosImportados.trailersCompra?.length) return null;
    
    return datosImportados.trailersCompra.find(t => 
      (t.Identificacion && trailer.identificacion && t.Identificacion === trailer.identificacion) ||
      (t.Codigo && trailer.codigo && t.Codigo === trailer.codigo) ||
      (t.ID && trailer.id && t.ID === trailer.id.toString())
    );
  }, [datosImportados.trailersCompra, trailer]);

  // Cálculo de amortización mensual
  const amortizacionCalculada = useMemo(() => {
    const inversion = trailer.inversionInicial || 0;
    const meses = trailer.mesesAmortizacion || 1;
    return meses > 0 ? inversion / meses : 0;
  }, [trailer.inversionInicial, trailer.mesesAmortizacion]);

  // Usar amortización manual si está definida, sino la calculada
  const amortizacionEfectiva = trailer.amortizacionMensual !== undefined && trailer.amortizacionMensual !== null
    ? trailer.amortizacionMensual
    : amortizacionCalculada;

  // Cálculo del costo visual V5.3
  // Para Compra: costoBase = amortización, SIN service
  const costoVisual = useMemo(() => {
    const costoBase = amortizacionEfectiva;
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
  }, [amortizacionEfectiva, costoMantenimiento, trailer.mkLinea, trailer.incluirCTC, markup]);

  // Handler para actualización con auto-cálculo
  const handleUpdate = (campo, valor) => {
    if (readOnly) return;
    onUpdate(campo, valor);
    
    // Auto-calcular amortización si cambian inversión o meses
    if (campo === 'inversionInicial' || campo === 'mesesAmortizacion') {
      const inv = campo === 'inversionInicial' ? valor : (trailer.inversionInicial || 0);
      const mes = campo === 'mesesAmortizacion' ? valor : (trailer.mesesAmortizacion || 1);
      if (mes > 0) {
        onUpdate('amortizacionMensual', inv / mes);
      }
    }
  };

  // Recalcular amortización automáticamente
  const recalcularAmortizacion = () => {
    if (trailer.mesesAmortizacion > 0) {
      handleUpdate('amortizacionMensual', amortizacionCalculada);
    }
  };

  // Aplicar datos desde archivo soporte
  const aplicarDatosSoporte = () => {
    if (datosTrailer) {
      if (datosTrailer.InversionInicial) handleUpdate('inversionInicial', datosTrailer.InversionInicial);
      if (datosTrailer.MesesAmortizacion) handleUpdate('mesesAmortizacion', datosTrailer.MesesAmortizacion);
    }
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
          ? 'bg-violet-900/20 border-violet-500/30' 
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
            <Home size={16} className="text-violet-400"/>
            <div>
              <span className="text-sm font-medium">{tipoLabel}</span>
              {trailer.identificacion && <span className="text-xs text-slate-400 ml-2">{trailer.identificacion}</span>}
            </div>
            <span className="text-xs bg-violet-600/30 text-violet-300 px-2 py-0.5 rounded">Compra</span>
            <span className="text-xs text-slate-400">{fmt(amortizacionEfectiva)}/mes</span>
          </div>
          <div className="text-right">
            <span className={`font-bold ${costoVisual.enCTC ? 'text-violet-400' : 'text-slate-500'}`}>
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
        ? 'bg-violet-900/20 border-violet-500/30' 
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
          <div className="w-10 h-10 rounded-lg bg-violet-600/30 flex items-center justify-center">
            <Home size={20} className="text-violet-400"/>
          </div>
          <div>
            <p className="font-medium flex items-center gap-2">
              {tipoLabel}
              <span className="text-xs bg-violet-600/30 text-violet-300 px-2 py-0.5 rounded">
                Compra
              </span>
            </p>
            <p className="text-xs text-slate-400">
              {trailer.descripcion || 'Sin descripción'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Total mensual</p>
          <p className={`text-xl font-bold ${costoVisual.enCTC ? 'text-violet-400' : 'text-slate-500'}`}>
            {fmt(costoVisual.total)}
          </p>
        </div>
      </div>

      {/* Datos del trailer */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
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
        <div>
          <label className="block text-xs text-slate-400 mb-1 flex items-center gap-1">
            <FileText size={10}/> Modelo
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
        <div>
          <label className="block text-xs text-slate-400 mb-1 flex items-center gap-1">
            <Calendar size={10}/> Antigüedad
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
            />
          )}
        </div>
      </div>

      {/* Campos específicos por tipo */}
      {(esHabitacional || esSanitario) && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1 flex items-center gap-1">
              <Users size={10}/> Capacidad
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

      {/* Sección Amortización - Destacada */}
      <div className="p-4 bg-violet-900/30 rounded-lg border border-violet-500/40 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingDown size={18} className="text-violet-400"/>
            <div>
              <p className="text-sm font-medium text-violet-200">Datos de Compra / Amortización</p>
              <p className="text-xs text-slate-400">La amortización se calcula o puede editarse</p>
            </div>
          </div>
          {datosTrailer && (
            <button
              onClick={aplicarDatosSoporte}
              className="px-2 py-1 bg-emerald-600/30 hover:bg-emerald-600/50 rounded text-xs text-emerald-300"
            >
              Aplicar Soporte
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Inversión Inicial */}
          <div>
            <label className="block text-xs text-slate-400 mb-1 flex items-center gap-1">
              <DollarSign size={10}/> Inversión Inicial
            </label>
            {readOnly ? (
              <span className="text-lg font-bold text-violet-300">{fmt(trailer.inversionInicial || 0)}</span>
            ) : (
              <input
                type="number"
                value={trailer.inversionInicial || 0}
                onChange={e => handleUpdate('inversionInicial', Number(e.target.value))}
                className={`${inp} w-full text-lg`}
                min="0"
                step="10000"
              />
            )}
            {datosTrailer?.InversionInicial && (
              <p className="text-xs text-slate-500 mt-1">Soporte: {fmt(datosTrailer.InversionInicial)}</p>
            )}
          </div>

          {/* Meses de Amortización */}
          <div>
            <label className="block text-xs text-slate-400 mb-1 flex items-center gap-1">
              <Calendar size={10}/> Meses Amortización
            </label>
            {readOnly ? (
              <span className="text-lg font-bold text-violet-300">{trailer.mesesAmortizacion || 0} meses</span>
            ) : (
              <input
                type="number"
                value={trailer.mesesAmortizacion || 12}
                onChange={e => handleUpdate('mesesAmortizacion', Number(e.target.value))}
                className={`${inp} w-full text-lg`}
                min="1"
                max="120"
              />
            )}
            {datosTrailer?.MesesAmortizacion && (
              <p className="text-xs text-slate-500 mt-1">Soporte: {datosTrailer.MesesAmortizacion} meses</p>
            )}
          </div>

          {/* Amortización Mensual */}
          <div>
            <label className="block text-xs text-slate-400 mb-1 flex items-center gap-1">
              <Calculator size={10}/> Amortización Mensual
            </label>
            <div className="flex items-center gap-2">
              {readOnly ? (
                <span className="text-lg font-bold text-violet-400">{fmt(amortizacionEfectiva)}</span>
              ) : (
                <>
                  <input
                    type="number"
                    value={Math.round(amortizacionEfectiva)}
                    onChange={e => handleUpdate('amortizacionMensual', Number(e.target.value))}
                    className={`${inp} w-full text-lg`}
                    min="0"
                  />
                  {Math.round(amortizacionEfectiva) !== Math.round(amortizacionCalculada) && (
                    <button
                      onClick={recalcularAmortizacion}
                      className="px-2 py-1 bg-slate-600 hover:bg-slate-500 rounded text-xs"
                      title="Recalcular"
                    >
                      Auto
                    </button>
                  )}
                </>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">Calculado: {fmt(amortizacionCalculada)}</p>
          </div>
        </div>
      </div>

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
        <p className="text-xs text-slate-400 mb-2 font-medium">Desglose de costos (Compra - Sin Service):</p>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="p-2 bg-violet-600/20 rounded text-center border border-violet-500/30">
            <p className="text-xs text-violet-300">Amortización</p>
            <p className="font-bold text-violet-400">{fmt(costoVisual.costoBase)}</p>
            <p className="text-xs text-slate-500">{trailer.mesesAmortizacion || 0}m</p>
          </div>
          <div className="p-2 bg-amber-600/20 rounded text-center border border-amber-500/30">
            <p className="text-xs text-amber-300">Mantenimiento</p>
            <p className="font-medium text-amber-400">{fmt(costoVisual.mantenimiento)}</p>
          </div>
          <div className="p-2 bg-emerald-600/20 rounded text-center border border-emerald-500/30">
            <p className="text-xs text-emerald-300">Total</p>
            <p className="font-bold text-emerald-400">{fmt(costoVisual.total)}</p>
            {costoVisual.markup > 0 && <p className="text-xs text-slate-400">+{costoVisual.markup}%</p>}
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
          <Info size={10}/> Trailers no tienen Service (V5.3)
        </p>
      </div>

      {/* Markup */}
      {!readOnly && (
        <div className="mt-3 flex items-center justify-between p-2 bg-slate-700/30 rounded">
          <span className="text-xs text-slate-400">Markup individual:</span>
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

      {/* Estado CTC */}
      <div className="mt-3 flex items-center justify-between">
        <span className={`text-xs flex items-center gap-1 ${costoVisual.enCTC ? 'text-emerald-400' : 'text-amber-400'}`}>
          {costoVisual.enCTC ? <><CheckCircle size={12}/> Incluido en CTC</> : <><AlertCircle size={12}/> Excluido del CTC</>}
        </span>
        {costoVisual.enCTC && <span className="text-xs text-slate-400">Aporte: {fmt(costoVisual.totalCTC)}</span>}
      </div>
    </div>
  );
};

export default TrailersCompra;
