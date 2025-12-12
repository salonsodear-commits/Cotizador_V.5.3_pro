/**
 * SISTEMA DE COTIZACIÓN V5.3 PRO
 * MovilesAlquiler.jsx - Subcomponente para móviles en alquiler
 * 
 * Móviles Alquiler: costoBase = costoAlquiler mensual
 * Costo visual = Alquiler + Σ(Service P×Q) + Σ(Mantenimiento P×Q)
 * 
 * NO mezcla con Trailers - separación estricta V5.3
 */

import React, { useMemo } from 'react';
import { TIPOS_MOVIL } from '../core/constants.js';
import { Truck, CheckCircle, AlertCircle, DollarSign, Calendar, Hash, FileText, Building } from 'lucide-react';

/**
 * MovilesAlquiler
 * 
 * Props:
 * - movil: objeto del móvil (debe tener adquisicion === 'Alquiler')
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
const MovilesAlquiler = ({
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
  
  // Validar que sea móvil en alquiler
  if (!movil || movil.adquisicion !== 'Alquiler') {
    return null;
  }

  // Buscar datos desde archivo soporte
  const datosMovil = useMemo(() => {
    if (!datosImportados.movilesAlquiler?.length) return null;
    
    return datosImportados.movilesAlquiler.find(m => 
      (m.Dominio && movil.dominio && m.Dominio === movil.dominio) ||
      (m.Codigo && movil.codigo && m.Codigo === movil.codigo) ||
      (m.ID && movil.id && m.ID === movil.id.toString())
    );
  }, [datosImportados.movilesAlquiler, movil]);

  // Proveedores disponibles desde soporte
  const proveedoresDisponibles = useMemo(() => {
    if (!datosImportados.movilesAlquiler?.length) return [];
    const provs = datosImportados.movilesAlquiler
      .map(m => m.Proveedor)
      .filter(Boolean);
    return [...new Set(provs)].sort();
  }, [datosImportados.movilesAlquiler]);

  // Cálculo del costo visual V5.3
  // Para Alquiler: costoBase = costoAlquiler
  const costoVisual = useMemo(() => {
    const costoBase = movil.costoAlquiler || 0;
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
  }, [movil.costoAlquiler, costoService, costoMantenimiento, movil.mkLinea, movil.incluirCTC, markup]);

  // Handler para actualización
  const handleUpdate = (campo, valor) => {
    if (readOnly) return;
    onUpdate(campo, valor);
  };

  // Aplicar costo desde archivo soporte
  const aplicarCostoSoporte = () => {
    if (datosMovil?.CostoAlquiler) {
      handleUpdate('costoAlquiler', datosMovil.CostoAlquiler);
    }
  };

  const inp = "px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm focus:border-emerald-500 focus:outline-none";

  // Vista compacta
  if (compact) {
    return (
      <div className={`p-3 rounded-lg border ${
        costoVisual.enCTC 
          ? 'bg-cyan-900/20 border-cyan-500/30' 
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
            <Truck size={16} className="text-cyan-400"/>
            <div>
              <span className="text-sm font-medium">{movil.tipo || 'Móvil'}</span>
              {movil.dominio && <span className="text-xs text-slate-400 ml-2">{movil.dominio}</span>}
            </div>
            <span className="text-xs bg-cyan-600/30 text-cyan-300 px-2 py-0.5 rounded">Alquiler</span>
            <span className="text-xs text-slate-400">{fmt(movil.costoAlquiler || 0)}/mes</span>
          </div>
          <div className="text-right">
            <span className={`font-bold ${costoVisual.enCTC ? 'text-cyan-400' : 'text-slate-500'}`}>
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
        ? 'bg-cyan-900/20 border-cyan-500/30' 
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
          <div className="w-10 h-10 rounded-lg bg-cyan-600/30 flex items-center justify-center">
            <Truck size={20} className="text-cyan-400"/>
          </div>
          <div>
            <p className="font-medium flex items-center gap-2">
              {movil.tipo || 'Móvil'}
              <span className="text-xs bg-cyan-600/30 text-cyan-300 px-2 py-0.5 rounded">
                Alquiler
              </span>
            </p>
            <p className="text-xs text-slate-400">
              {movil.descripcion || 'Sin descripción'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Total mensual</p>
          <p className={`text-xl font-bold ${costoVisual.enCTC ? 'text-cyan-400' : 'text-slate-500'}`}>
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

        {/* Proveedor */}
        <div>
          <label className="block text-xs text-slate-400 mb-1 flex items-center gap-1">
            <Building size={10}/> Proveedor
          </label>
          {readOnly ? (
            <span className="text-sm">{movil.proveedorAlquiler || '-'}</span>
          ) : proveedoresDisponibles.length > 0 ? (
            <select
              value={movil.proveedorAlquiler || ''}
              onChange={e => handleUpdate('proveedorAlquiler', e.target.value)}
              className={`${inp} w-full`}
            >
              <option value="">Seleccionar...</option>
              {proveedoresDisponibles.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          ) : (
            <input
              type="text"
              value={movil.proveedorAlquiler || ''}
              onChange={e => handleUpdate('proveedorAlquiler', e.target.value)}
              className={`${inp} w-full`}
              placeholder="Nombre proveedor"
            />
          )}
        </div>
      </div>

      {/* Costo de Alquiler - Campo destacado */}
      <div className="p-4 bg-cyan-900/30 rounded-lg border border-cyan-500/40 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign size={18} className="text-cyan-400"/>
            <div>
              <p className="text-sm font-medium text-cyan-200">Costo de Alquiler Mensual</p>
              <p className="text-xs text-slate-400">Valor fijo mensual del contrato</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {readOnly ? (
              <span className="text-xl font-bold text-cyan-400">{fmt(movil.costoAlquiler || 0)}</span>
            ) : (
              <>
                <input
                  type="number"
                  value={movil.costoAlquiler || 0}
                  onChange={e => handleUpdate('costoAlquiler', Number(e.target.value))}
                  className={`${inp} w-32 text-right text-lg`}
                  min="0"
                  step="1000"
                />
                {datosMovil?.CostoAlquiler && movil.costoAlquiler !== datosMovil.CostoAlquiler && (
                  <button
                    onClick={aplicarCostoSoporte}
                    className="px-2 py-1 bg-emerald-600/30 hover:bg-emerald-600/50 rounded text-xs text-emerald-300"
                    title={`Aplicar ${fmt(datosMovil.CostoAlquiler)} del soporte`}
                  >
                    Soporte
                  </button>
                )}
              </>
            )}
          </div>
        </div>
        {datosMovil?.CostoAlquiler && (
          <p className="text-xs text-slate-400 mt-2">
            Valor soporte: {fmt(datosMovil.CostoAlquiler)}
          </p>
        )}
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
        <p className="text-xs text-slate-400 mb-2 font-medium">Desglose de costos (Alquiler):</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="p-2 bg-cyan-600/20 rounded text-center border border-cyan-500/30">
            <p className="text-xs text-cyan-300">Alquiler</p>
            <p className="font-bold text-cyan-400">{fmt(costoVisual.costoBase)}</p>
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

export default MovilesAlquiler;
