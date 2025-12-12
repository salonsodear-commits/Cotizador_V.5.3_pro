/**
 * SISTEMA DE COTIZACIÓN V5.3 PRO
 * ViandasInline.jsx - Componente inline para viandas
 * 
 * NO es categoría independiente - se muestra dentro de Personal (Petrolero)
 * Carga desde archivo soporte, edición manual, integración con cálculos
 */

import React, { useMemo } from 'react';
import { VIANDAS_PETROLERO } from '../core/constants.js';
import { calcularCostoViandas } from '../core/calculations.js';
import { Coffee, AlertCircle, CheckCircle, Info } from 'lucide-react';

/**
 * ViandasInline
 * 
 * Props:
 * - viandas: objeto { desayuno, almuerzo, cena, refrigerio } con boolean o detalles
 * - onUpdate: función (tipoVianda, valor) para actualizar
 * - datosImportados: datos del archivo soporte
 * - provinciaSeleccionada: provincia actual
 * - convenio: convenio de la persona (debe ser Petrolero para mostrar)
 * - diagrama: diagrama actual (para calcular días)
 * - diasMes: días trabajados en el mes
 * - fmt: función formateo moneda
 * - compact: vista compacta
 * - readOnly: solo lectura
 */
const ViandasInline = ({
  viandas = {},
  onUpdate,
  datosImportados = {},
  provinciaSeleccionada = '',
  convenio = '',
  diagrama = '',
  diasMes = 22,
  fmt = (n) => `$${(n||0).toLocaleString('es-AR')}`,
  compact = false,
  readOnly = false
}) => {
  
  // Solo mostrar para convenio Petrolero
  if (convenio !== 'Petrolero') {
    return null;
  }

  // Obtener precios desde archivo soporte o predefinidos
  const preciosViandas = useMemo(() => {
    const precios = { ...VIANDAS_PETROLERO };
    
    // Buscar en archivo soporte por provincia
    if (datosImportados.viandas?.length && provinciaSeleccionada) {
      const viandasProvincia = datosImportados.viandas.find(
        v => v.Provincia === provinciaSeleccionada
      );
      
      if (viandasProvincia) {
        if (viandasProvincia.Desayuno) precios.desayuno = { ...precios.desayuno, precio: viandasProvincia.Desayuno };
        if (viandasProvincia.Almuerzo) precios.almuerzo = { ...precios.almuerzo, precio: viandasProvincia.Almuerzo };
        if (viandasProvincia.Cena) precios.cena = { ...precios.cena, precio: viandasProvincia.Cena };
        if (viandasProvincia.Refrigerio) precios.refrigerio = { ...precios.refrigerio, precio: viandasProvincia.Refrigerio };
      }
    }
    
    return precios;
  }, [datosImportados.viandas, provinciaSeleccionada]);

  // Calcular totales
  const totales = useMemo(() => {
    let totalViandas = 0;
    let itemsIncluidos = 0;
    const desglose = {};
    
    Object.keys(preciosViandas).forEach(tipo => {
      const activo = viandas[tipo] === true || viandas[tipo]?.incluir === true;
      const precio = viandas[tipo]?.precio || preciosViandas[tipo].precio;
      const cantidad = viandas[tipo]?.cantidad || diasMes;
      const subtotal = activo ? precio * cantidad : 0;
      
      desglose[tipo] = {
        activo,
        precio,
        cantidad,
        subtotal
      };
      
      if (activo) {
        totalViandas += subtotal;
        itemsIncluidos++;
      }
    });
    
    return { total: totalViandas, items: itemsIncluidos, desglose };
  }, [viandas, preciosViandas, diasMes]);

  // Handler para toggle de vianda
  const handleToggle = (tipo) => {
    if (readOnly) return;
    
    const valorActual = viandas[tipo];
    if (typeof valorActual === 'boolean') {
      onUpdate(tipo, !valorActual);
    } else if (typeof valorActual === 'object') {
      onUpdate(tipo, { ...valorActual, incluir: !valorActual.incluir });
    } else {
      onUpdate(tipo, true);
    }
  };

  // Handler para cambio de precio manual
  const handlePrecioChange = (tipo, nuevoPrecio) => {
    if (readOnly) return;
    
    const valorActual = viandas[tipo];
    if (typeof valorActual === 'object') {
      onUpdate(tipo, { ...valorActual, precio: Number(nuevoPrecio) });
    } else {
      onUpdate(tipo, { incluir: valorActual === true, precio: Number(nuevoPrecio), cantidad: diasMes });
    }
  };

  // Handler para cambio de cantidad manual
  const handleCantidadChange = (tipo, nuevaCantidad) => {
    if (readOnly) return;
    
    const valorActual = viandas[tipo];
    if (typeof valorActual === 'object') {
      onUpdate(tipo, { ...valorActual, cantidad: Number(nuevaCantidad) });
    } else {
      onUpdate(tipo, { incluir: valorActual === true, precio: preciosViandas[tipo].precio, cantidad: Number(nuevaCantidad) });
    }
  };

  const inp = "px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm focus:border-emerald-500 focus:outline-none";

  // Vista compacta (solo checkboxes y total)
  if (compact) {
    return (
      <div className="p-2 bg-amber-900/20 rounded border border-amber-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Coffee size={14} className="text-amber-400"/>
            <span className="text-xs font-medium text-amber-300">Viandas</span>
            <div className="flex items-center gap-2">
              {Object.keys(preciosViandas).map(tipo => {
                const activo = totales.desglose[tipo].activo;
                return (
                  <label key={tipo} className="flex items-center gap-1 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activo}
                      onChange={() => handleToggle(tipo)}
                      disabled={readOnly}
                      className="rounded w-3 h-3"
                    />
                    <span className={activo ? 'text-amber-300' : 'text-slate-500'}>
                      {preciosViandas[tipo].abrev}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
          <span className={`text-sm font-bold ${totales.total > 0 ? 'text-amber-400' : 'text-slate-500'}`}>
            {fmt(totales.total)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 bg-amber-900/20 rounded-lg border border-amber-500/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h5 className="text-sm font-medium text-amber-300 flex items-center gap-2">
          <Coffee size={16}/>
          Viandas Petrolero
          {totales.items > 0 && (
            <span className="text-xs bg-amber-600/30 px-2 py-0.5 rounded">
              {totales.items} seleccionadas
            </span>
          )}
        </h5>
        <span className={`font-bold ${totales.total > 0 ? 'text-amber-400' : 'text-slate-500'}`}>
          {fmt(totales.total)}
        </span>
      </div>

      {/* Tabla de viandas */}
      <div className="space-y-2">
        {Object.entries(preciosViandas).map(([tipo, config]) => {
          const desglose = totales.desglose[tipo];
          const precioActual = viandas[tipo]?.precio || config.precio;
          const cantidadActual = viandas[tipo]?.cantidad || diasMes;
          
          return (
            <div 
              key={tipo} 
              className={`flex items-center gap-3 p-2 rounded transition-colors ${
                desglose.activo 
                  ? 'bg-amber-600/20 border border-amber-500/30' 
                  : 'bg-slate-700/30 border border-slate-600/30'
              }`}
            >
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={desglose.activo}
                onChange={() => handleToggle(tipo)}
                disabled={readOnly}
                className="rounded"
              />
              
              {/* Icono y nombre */}
              <div className="flex items-center gap-2 w-28">
                <span className="text-lg">{config.icono}</span>
                <span className={`text-sm ${desglose.activo ? 'text-amber-200' : 'text-slate-400'}`}>
                  {config.label}
                </span>
              </div>
              
              {/* Precio (editable) */}
              <div className="flex items-center gap-1">
                <span className="text-xs text-slate-400">P:</span>
                {readOnly ? (
                  <span className="text-sm">{fmt(precioActual)}</span>
                ) : (
                  <input
                    type="number"
                    value={precioActual}
                    onChange={e => handlePrecioChange(tipo, e.target.value)}
                    className={`${inp} w-20 text-right`}
                    min="0"
                    disabled={!desglose.activo}
                  />
                )}
              </div>
              
              {/* Cantidad (editable) */}
              <div className="flex items-center gap-1">
                <span className="text-xs text-slate-400">×</span>
                {readOnly ? (
                  <span className="text-sm">{cantidadActual} días</span>
                ) : (
                  <input
                    type="number"
                    value={cantidadActual}
                    onChange={e => handleCantidadChange(tipo, e.target.value)}
                    className={`${inp} w-14 text-right`}
                    min="0"
                    max="31"
                    disabled={!desglose.activo}
                  />
                )}
                <span className="text-xs text-slate-500">días</span>
              </div>
              
              {/* Subtotal */}
              <div className="ml-auto text-right">
                <span className={`text-sm font-medium ${desglose.activo ? 'text-amber-400' : 'text-slate-500'}`}>
                  {fmt(desglose.subtotal)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Totales */}
      <div className="mt-3 pt-3 border-t border-amber-500/30 flex items-center justify-between">
        <div className="text-xs text-slate-400">
          {totales.items === 0 && (
            <span className="flex items-center gap-1">
              <AlertCircle size={12}/> Sin viandas seleccionadas
            </span>
          )}
          {totales.items > 0 && (
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle size={12}/> {totales.items} vianda{totales.items > 1 ? 's' : ''} incluida{totales.items > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400">Total Viandas: </span>
          <span className="text-lg font-bold text-amber-400">{fmt(totales.total)}</span>
        </div>
      </div>

      {/* Info */}
      {datosImportados.viandas?.length > 0 && provinciaSeleccionada && (
        <div className="mt-2 p-2 bg-slate-700/30 rounded">
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <Info size={12}/>
            Precios cargados desde archivo soporte para {provinciaSeleccionada}
          </p>
        </div>
      )}
      
      {!provinciaSeleccionada && (
        <div className="mt-2 p-2 bg-amber-900/30 rounded border border-amber-500/20">
          <p className="text-xs text-amber-300 flex items-center gap-1">
            <AlertCircle size={12}/>
            Seleccione una provincia para cargar precios del archivo soporte
          </p>
        </div>
      )}
    </div>
  );
};

export default ViandasInline;
