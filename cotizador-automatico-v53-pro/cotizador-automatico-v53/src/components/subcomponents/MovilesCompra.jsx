/**
 * SISTEMA DE COTIZACIÓN V5.3 PRO
 * MovilesCompra.jsx - Subcomponente para móviles en compra
 * 
 * Móviles Compra: costoBase = amortización mensual
 * Amortización = Inversión Inicial / Meses de Amortización
 * Costo visual = Amortización + Σ(Service P×Q) + Σ(Mantenimiento P×Q)
 * 
 * NO mezcla con Trailers - separación estricta V5.3
 */

import React, { useMemo, useEffect } from 'react';
import { TIPOS_MOVIL } from '../core/constants.js';
import { Truck, CheckCircle, AlertCircle, DollarSign, Calendar, Hash, FileText, TrendingDown, Calculator } from 'lucide-react';

/**
 * MovilesCompra
 * 
 * Props:
 * - movil: objeto del móvil (debe tener adquisicion === 'Compra')
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
const MovilesCompra = ({
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
  
  // Validar que sea móvil en compra
  if (!movil || movil.adquisicion !== 'Compra') {
    return null;
  }

  // Buscar datos desde archivo soporte
  const datosMovil = useMemo(() => {
    if (!datosImportados.movilesCompra?.length) return null;
    
    return datosImportados.movilesCompra.find(m => 
      (m.Dominio && movil.dominio && m.Dominio === movil.dominio) ||
      (m.Codigo && movil.codigo && m.Codigo === movil.codigo) ||
      (m.ID && movil.id && m.ID === movil.id.toString())
    );
  }, [datosImportados.movilesCompra, movil]);

  // Cálculo de amortización mensual
  const amortizacionCalculada = useMemo(() => {
    const inversion = movil.inversionInicial || 0;
    const meses = movil.mesesAmortizacion || 1;
    return meses > 0 ? inversion / meses : 0;
  }, [movil.inversionInicial, movil.mesesAmortizacion]);

  // Usar amortización manual si está definida, sino la calculada
  const amortizacionEfectiva = movil.amortizacionMensual !== undefined && movil.amortizacionMensual !== null
    ? movil.amortizacionMensual
    : amortizacionCalculada;

  // Cálculo del costo visual V5.3
  // Para Compra: costoBase = amortización mensual
  const costoVisual = useMemo(() => {
    const costoBase = amortizacionEfectiva;
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
  }, [amortizacionEfectiva, costoService, costoMantenimiento, movil.mkLinea, movil.incluirCTC, markup]);

  // Handler para actualización
  const handleUpdate = (campo, valor) => {
    if (readOnly) return;
    onUpdate(campo, valor);
    
    // Auto-calcular amortización si cambian inversión o meses
    if (campo === 'inversionInicial' || campo === 'mesesAmortizacion') {
      const inv = campo === 'inversionInicial' ? valor : (movil.inversionInicial || 0);
      const mes = campo === 'mesesAmortizacion' ? valor : (movil.mesesAmortizacion || 1);
      if (mes > 0) {
        onUpdate('amortizacionMensual', inv / mes);
      }
    }
  };

  // Recalcular amortización automáticamente
  const recalcularAmortizacion = () => {
    if (movil.mesesAmortizacion > 0) {
      handleUpdate('amortizacionMensual', amortizacionCalculada);
    }
  };

  // Aplicar datos desde archivo soporte
  const aplicarDatosSoporte = () => {
    if (datosMovil) {
      if (datosMovil.InversionInicial) handleUpdate('inversionInicial', datosMovil.InversionInicial);
      if (datosMovil.MesesAmortizacion) handleUpdate('mesesAmortizacion', datosMovil.MesesAmortizacion);
    }
  };

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
            <Truck size={16} className="text-purple-400"/>
            <div>
              <span className="text-sm font-medium">{movil.tipo || 'Móvil'}</span>
              {movil.dominio && <span className="text-xs text-slate-400 ml-2">{movil.dominio}</span>}
            </div>
            <span className="text-xs bg-purple-600/30 text-purple-300 px-2 py-0.5 rounded">Compra</span>
            <span className="text-xs text-slate-400">{fmt(amortizacionEfectiva)}/mes</span>
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
            <Truck size={20} className="text-purple-400"/>
          </div>
          <div>
            <p className="font-medium flex items-center gap-2">
              {movil.tipo || 'Móvil'}
              <span className="text-xs bg-purple-600/30 text-purple-300 px-2 py-0.5 rounded">
                Compra
              </span>
            </p>
            <p className="text-xs text-slate-400">
              {movil.descripcion || 'Sin descripción'}
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

      {/* Datos del móvil */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
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
        <div>
          <label className="block text-xs text-slate-400 mb-1 flex items-center gap-1">
            <FileText size={10}/> Modelo
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
        <div>
          <label className="block text-xs text-slate-400 mb-1 flex items-center gap-1">
            <Calendar size={10}/> Antigüedad
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
            />
          )}
        </div>
      </div>

      {/* Sección Amortización - Destacada */}
      <div className="p-4 bg-purple-900/30 rounded-lg border border-purple-500/40 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingDown size={18} className="text-purple-400"/>
            <div>
              <p className="text-sm font-medium text-purple-200">Datos de Compra / Amortización</p>
              <p className="text-xs text-slate-400">La amortización se calcula automáticamente o puede editarse</p>
            </div>
          </div>
          {datosMovil && (
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
              <span className="text-lg font-bold text-purple-300">{fmt(movil.inversionInicial || 0)}</span>
            ) : (
              <input
                type="number"
                value={movil.inversionInicial || 0}
                onChange={e => handleUpdate('inversionInicial', Number(e.target.value))}
                className={`${inp} w-full text-lg`}
                min="0"
                step="10000"
              />
            )}
            {datosMovil?.InversionInicial && (
              <p className="text-xs text-slate-500 mt-1">Soporte: {fmt(datosMovil.InversionInicial)}</p>
            )}
          </div>

          {/* Meses de Amortización */}
          <div>
            <label className="block text-xs text-slate-400 mb-1 flex items-center gap-1">
              <Calendar size={10}/> Meses Amortización
            </label>
            {readOnly ? (
              <span className="text-lg font-bold text-purple-300">{movil.mesesAmortizacion || 0} meses</span>
            ) : (
              <input
                type="number"
                value={movil.mesesAmortizacion || 12}
                onChange={e => handleUpdate('mesesAmortizacion', Number(e.target.value))}
                className={`${inp} w-full text-lg`}
                min="1"
                max="120"
              />
            )}
            {datosMovil?.MesesAmortizacion && (
              <p className="text-xs text-slate-500 mt-1">Soporte: {datosMovil.MesesAmortizacion} meses</p>
            )}
          </div>

          {/* Amortización Mensual */}
          <div>
            <label className="block text-xs text-slate-400 mb-1 flex items-center gap-1">
              <Calculator size={10}/> Amortización Mensual
            </label>
            <div className="flex items-center gap-2">
              {readOnly ? (
                <span className="text-lg font-bold text-purple-400">{fmt(amortizacionEfectiva)}</span>
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
                      title="Recalcular automáticamente"
                    >
                      Auto
                    </button>
                  )}
                </>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Calculado: {fmt(amortizacionCalculada)}
            </p>
          </div>
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
        <p className="text-xs text-slate-400 mb-2 font-medium">Desglose de costos (Compra):</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="p-2 bg-purple-600/20 rounded text-center border border-purple-500/30">
            <p className="text-xs text-purple-300">Amortización</p>
            <p className="font-bold text-purple-400">{fmt(costoVisual.costoBase)}</p>
            <p className="text-xs text-slate-500">{movil.mesesAmortizacion || 0}m</p>
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
            {costoVisual.markup > 0 && <p className="text-xs text-slate-400">+{costoVisual.markup}%</p>}
          </div>
        </div>
      </div>

      {/* Markup */}
      {!readOnly && (
        <div className="mt-3 flex items-center justify-between p-2 bg-slate-700/30 rounded">
          <span className="text-xs text-slate-400">Markup individual:</span>
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

export default MovilesCompra;
