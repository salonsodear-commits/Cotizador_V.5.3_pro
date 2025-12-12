/**
 * SISTEMA DE COTIZACIÓN V5.3 PRO
 * HonorariosMonotributo.jsx - Gestión de honorarios para MT y FUCO
 * 
 * V5.3 Reglas implementadas:
 * - Punto 3: Selector adicional obligatorio para Monotributistas
 * - Punto 5: Importación desde archivo soporte, autocompletado por provincia+puesto
 * - Campo editable manual con posibilidad de override
 * - Integración directa con cálculos (valorHora × horasMes)
 * - Validaciones combinadas
 */

import React, { useMemo, useEffect } from 'react';
import { DollarSign, Clock, Calculator, FileSpreadsheet, AlertCircle, CheckCircle, RefreshCw, Info } from 'lucide-react';

/**
 * HonorariosMonotributo
 * 
 * Props:
 * - persona: objeto con datos del personal (tipoContrato, puesto, valorHora, etc.)
 * - onUpdate: función (campo, valor) para actualizar
 * - datosImportados: datos de archivos soporte
 * - provinciaSeleccionada: provincia actual de la cotización
 * - horasMesCalculadas: horas/mes calculadas desde diagrama
 * - fmt: función de formateo de moneda
 */
const HonorariosMonotributo = ({ 
  persona, 
  onUpdate, 
  datosImportados = {}, 
  provinciaSeleccionada = '',
  horasMesCalculadas = 0,
  fmt = (n) => `$${(n || 0).toLocaleString('es-AR')}`
}) => {
  
  // Solo mostrar para MT y FUCO
  if (persona.tipoContrato !== 'MT' && persona.tipoContrato !== 'FUCO') {
    return null;
  }

  const esMT = persona.tipoContrato === 'MT';
  const esFUCO = persona.tipoContrato === 'FUCO';

  // Buscar valor sugerido desde archivo soporte
  const valorSugerido = useMemo(() => {
    if (!provinciaSeleccionada || !persona.puesto) return null;
    if (!datosImportados.monotributistas?.length) return null;
    
    const encontrado = datosImportados.monotributistas.find(
      m => m.Provincia === provinciaSeleccionada && 
           m.Puesto?.toLowerCase() === persona.puesto?.toLowerCase()
    );
    
    return encontrado || null;
  }, [provinciaSeleccionada, persona.puesto, datosImportados.monotributistas]);

  // Puestos disponibles para la provincia seleccionada
  const puestosDisponibles = useMemo(() => {
    if (!datosImportados.monotributistas?.length) return [];
    
    const puestos = datosImportados.monotributistas
      .filter(m => !provinciaSeleccionada || m.Provincia === provinciaSeleccionada)
      .map(m => m.Puesto)
      .filter(Boolean);
    
    return [...new Set(puestos)].sort();
  }, [provinciaSeleccionada, datosImportados.monotributistas]);

  // Tipos de honorario disponibles
  const tiposHonorario = useMemo(() => {
    if (!datosImportados.monotributistas?.length) return [];
    
    const tipos = datosImportados.monotributistas
      .map(m => m.Tipo_Honorario)
      .filter(Boolean);
    
    return [...new Set(tipos)].sort();
  }, [datosImportados.monotributistas]);

  // Cálculo del costo estimado
  const costoEstimado = useMemo(() => {
    const valorHora = persona.valorHora || 0;
    const horas = horasMesCalculadas || 0;
    return valorHora * horas;
  }, [persona.valorHora, horasMesCalculadas]);

  // Handler para aplicar valor sugerido
  const aplicarValorSugerido = () => {
    if (valorSugerido?.Valor_Sugerido) {
      onUpdate('valorHora', valorSugerido.Valor_Sugerido);
    }
  };

  // Handler para seleccionar puesto desde lista
  const handlePuestoSelect = (puesto) => {
    onUpdate('puesto', puesto);
    
    // Buscar y aplicar valor sugerido automáticamente
    if (provinciaSeleccionada && datosImportados.monotributistas?.length) {
      const encontrado = datosImportados.monotributistas.find(
        m => m.Provincia === provinciaSeleccionada && m.Puesto === puesto
      );
      if (encontrado?.Valor_Sugerido) {
        onUpdate('valorHora', encontrado.Valor_Sugerido);
      }
    }
  };

  // Estilos
  const inputClass = "w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm focus:border-emerald-500 focus:outline-none transition-colors";
  const selectClass = "w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm focus:border-emerald-500 focus:outline-none transition-colors";
  const labelClass = "block text-xs text-slate-400 mb-1 flex items-center gap-1";

  return (
    <div className={`p-4 rounded-lg border ${esMT ? 'bg-cyan-900/20 border-cyan-500/30' : 'bg-purple-900/20 border-purple-500/30'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h4 className={`text-sm font-medium flex items-center gap-2 ${esMT ? 'text-cyan-300' : 'text-purple-300'}`}>
          <DollarSign size={16}/>
          Honorarios {esMT ? 'Monotributista' : 'Fuera de Convenio'}
        </h4>
        
        {/* Indicador de archivo soporte */}
        {datosImportados.monotributistas?.length > 0 ? (
          <span className="text-xs text-emerald-400 flex items-center gap-1">
            <FileSpreadsheet size={12}/> Archivo soporte cargado
          </span>
        ) : (
          <span className="text-xs text-amber-400 flex items-center gap-1">
            <AlertCircle size={12}/> Sin archivo soporte
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Puesto */}
        <div>
          <label className={labelClass}>
            <Info size={12}/> Puesto / Función
          </label>
          {puestosDisponibles.length > 0 ? (
            <div className="space-y-2">
              <select
                value={persona.puesto || ''}
                onChange={e => handlePuestoSelect(e.target.value)}
                className={selectClass}
              >
                <option value="">Seleccionar puesto</option>
                {puestosDisponibles.map(puesto => (
                  <option key={puesto} value={puesto}>{puesto}</option>
                ))}
              </select>
              <input
                type="text"
                value={persona.puesto || ''}
                onChange={e => onUpdate('puesto', e.target.value)}
                className={`${inputClass} text-xs`}
                placeholder="O escribir manualmente..."
              />
            </div>
          ) : (
            <input
              type="text"
              value={persona.puesto || ''}
              onChange={e => onUpdate('puesto', e.target.value)}
              className={inputClass}
              placeholder="Ej: Enfermero, Médico..."
            />
          )}
        </div>

        {/* Tipo de Honorario (si hay datos) */}
        {tiposHonorario.length > 0 && (
          <div>
            <label className={labelClass}>
              <Info size={12}/> Tipo Honorario
            </label>
            <select
              value={persona.tipoHonorario || ''}
              onChange={e => onUpdate('tipoHonorario', e.target.value)}
              className={selectClass}
            >
              <option value="">Seleccionar tipo</option>
              {tiposHonorario.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>
        )}

        {/* Valor Hora */}
        <div>
          <label className={labelClass}>
            <DollarSign size={12}/> Valor Hora
          </label>
          <div className="relative">
            <input
              type="number"
              value={persona.valorHora || ''}
              onChange={e => onUpdate('valorHora', Number(e.target.value))}
              className={inputClass}
              placeholder="0"
              min="0"
              step="100"
            />
            {valorSugerido && persona.valorHora !== valorSugerido.Valor_Sugerido && (
              <button
                onClick={aplicarValorSugerido}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-emerald-600/30 hover:bg-emerald-600/50 rounded text-emerald-400 transition-colors"
                title={`Aplicar valor sugerido: ${fmt(valorSugerido.Valor_Sugerido)}`}
              >
                <RefreshCw size={14}/>
              </button>
            )}
          </div>
          
          {/* Valor sugerido */}
          {valorSugerido && (
            <div className="mt-1 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Sugerido: {fmt(valorSugerido.Valor_Sugerido)}
              </span>
              {persona.valorHora === valorSugerido.Valor_Sugerido && (
                <CheckCircle size={12} className="text-emerald-400"/>
              )}
            </div>
          )}
          
          {/* Advertencia si no hay provincia */}
          {!provinciaSeleccionada && datosImportados.monotributistas?.length > 0 && (
            <p className="text-xs text-amber-400 mt-1 flex items-center gap-1">
              <AlertCircle size={10}/> Seleccione provincia para sugerencias
            </p>
          )}
        </div>

        {/* Horas Mes (readonly, viene del diagrama) */}
        <div>
          <label className={labelClass}>
            <Clock size={12}/> Horas / Mes
          </label>
          <input
            type="text"
            value={horasMesCalculadas}
            readOnly
            className={`${inputClass} bg-slate-600 text-slate-300`}
          />
          <p className="text-xs text-slate-500 mt-1">
            Calculado según diagrama
          </p>
        </div>
      </div>

      {/* Cálculo estimado */}
      <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Calculator size={16} className="text-slate-400"/>
            <span className="text-slate-400">Costo Estimado Mensual:</span>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-emerald-400">{fmt(costoEstimado)}</p>
            <p className="text-xs text-slate-500">
              {fmt(persona.valorHora || 0)} × {horasMesCalculadas} hs
            </p>
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="mt-3 p-3 bg-slate-700/30 rounded-lg">
        <p className="text-xs text-slate-400">
          <Info size={12} className="inline mr-1"/>
          {esMT 
            ? 'El monotributista factura sus servicios. El costo se calcula multiplicando el valor hora por las horas mensuales según el diagrama seleccionado.'
            : 'El personal fuera de convenio tiene condiciones especiales. El valor hora se define manualmente o desde el archivo soporte.'
          }
        </p>
      </div>

      {/* Datos del archivo soporte (si hay match) */}
      {valorSugerido && (
        <div className="mt-3 p-3 bg-emerald-900/20 rounded-lg border border-emerald-500/30">
          <p className="text-xs font-medium text-emerald-300 mb-2">
            Datos del archivo soporte:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div>
              <span className="text-slate-400">Provincia:</span>
              <span className="ml-1 text-white">{valorSugerido.Provincia}</span>
            </div>
            <div>
              <span className="text-slate-400">Puesto:</span>
              <span className="ml-1 text-white">{valorSugerido.Puesto}</span>
            </div>
            {valorSugerido.Tipo_Honorario && (
              <div>
                <span className="text-slate-400">Tipo:</span>
                <span className="ml-1 text-white">{valorSugerido.Tipo_Honorario}</span>
              </div>
            )}
            <div>
              <span className="text-slate-400">Valor:</span>
              <span className="ml-1 text-emerald-400 font-medium">{fmt(valorSugerido.Valor_Sugerido)}</span>
            </div>
            {valorSugerido.Categoria && (
              <div>
                <span className="text-slate-400">Categoría:</span>
                <span className="ml-1 text-white">{valorSugerido.Categoria}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Validaciones */}
      {(!persona.puesto || !persona.valorHora) && (
        <div className="mt-3 p-2 bg-amber-900/20 rounded border border-amber-500/30">
          <p className="text-xs text-amber-300 flex items-center gap-1">
            <AlertCircle size={12}/>
            Complete los campos obligatorios:
            {!persona.puesto && <span className="bg-amber-600/30 px-1 rounded">Puesto</span>}
            {!persona.valorHora && <span className="bg-amber-600/30 px-1 rounded">Valor Hora</span>}
          </p>
        </div>
      )}
    </div>
  );
};

export default HonorariosMonotributo;
