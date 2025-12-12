/**
 * SISTEMA DE COTIZACIÓN V5.3 PRO
 * HorasPorDiaSelector.jsx - Selector de horas por día
 * 
 * V5.3 Punto 4: Nuevo selector obligatorio
 * - Opciones: 8 horas, 12 horas, Manual
 * - Manual → campo editable
 * - Cálculo automático: horasMes = horasPorDia × díasDiagrama
 * - Integración con diagrama, cálculos y validaciones
 */

import React, { useMemo, useEffect } from 'react';
import { HORAS_POR_DIA_OPCIONES, DIAGRAMAS } from '../core/constants.js';
import { calcularHorasMes, calcularDiasPorDiagrama } from '../core/calculations.js';
import { Clock, Calendar, Calculator, AlertCircle, Info, CheckCircle } from 'lucide-react';

/**
 * HorasPorDiaSelector
 * 
 * Props:
 * - persona: objeto con datos del personal
 * - onUpdate: función (campo, valor) para actualizar
 * - mostrarCalculo: boolean para mostrar desglose del cálculo
 * - compact: boolean para vista compacta
 */
const HorasPorDiaSelector = ({ 
  persona, 
  onUpdate,
  mostrarCalculo = true,
  compact = false
}) => {
  
  // Obtener valor actual de horas por día
  const horasPorDiaActual = persona.horasPorDia || 8;
  const esManual = horasPorDiaActual === 'manual';
  const horasManuales = persona.horasManuales || 0;
  
  // Obtener días según diagrama
  const diasDiagrama = useMemo(() => {
    return calcularDiasPorDiagrama(persona.diagrama, persona.diasManuales);
  }, [persona.diagrama, persona.diasManuales]);

  // Calcular horas mes
  const horasMes = useMemo(() => {
    const horasEfectivas = esManual ? horasManuales : horasPorDiaActual;
    return calcularHorasMes(horasEfectivas, diasDiagrama);
  }, [esManual, horasManuales, horasPorDiaActual, diasDiagrama]);

  // Determinar si el diagrama también es manual
  const diagramaEsManual = persona.diagrama === 'Manual';

  // Handler para cambio de horas por día
  const handleHorasPorDiaChange = (valor) => {
    if (valor === 'manual') {
      onUpdate('horasPorDia', 'manual');
      // Inicializar horas manuales si no hay valor
      if (!persona.horasManuales) {
        onUpdate('horasManuales', 8);
      }
    } else {
      onUpdate('horasPorDia', Number(valor));
      // Limpiar horas manuales si ya no es manual
      onUpdate('horasManuales', null);
    }
  };

  // Handler para horas manuales
  const handleHorasManualesChange = (valor) => {
    const numVal = Number(valor);
    // Validar rango (1-24 horas)
    if (numVal >= 0 && numVal <= 24) {
      onUpdate('horasManuales', numVal);
    }
  };

  // Estilos
  const selectClass = "w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm focus:border-emerald-500 focus:outline-none transition-colors";
  const inputClass = "w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm focus:border-emerald-500 focus:outline-none transition-colors";
  const labelClass = "block text-xs text-slate-400 mb-1 flex items-center gap-1";

  // Vista compacta
  if (compact) {
    return (
      <div className="flex items-center gap-3 p-2 bg-slate-700/30 rounded-lg">
        <Clock size={16} className="text-blue-400"/>
        <div className="flex items-center gap-2">
          <select
            value={esManual ? 'manual' : horasPorDiaActual}
            onChange={e => handleHorasPorDiaChange(e.target.value)}
            className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm"
          >
            {HORAS_POR_DIA_OPCIONES.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          
          {esManual && (
            <input
              type="number"
              value={horasManuales}
              onChange={e => handleHorasManualesChange(e.target.value)}
              className="w-16 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm"
              min="1"
              max="24"
            />
          )}
        </div>
        
        <span className="text-xs text-slate-400">×</span>
        <span className="text-sm text-slate-300">{diasDiagrama} días</span>
        <span className="text-xs text-slate-400">=</span>
        <span className="text-sm font-medium text-emerald-400">{horasMes} hs/mes</span>
      </div>
    );
  }

  return (
    <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-blue-300 flex items-center gap-2">
          <Clock size={16}/>
          Horas por Día
        </h4>
        <span className="text-xs text-slate-400">
          V5.3 - Selector obligatorio
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Selector de horas por día */}
        <div>
          <label className={labelClass}>
            <Clock size={12}/> Horas / Día
          </label>
          <select
            value={esManual ? 'manual' : horasPorDiaActual}
            onChange={e => handleHorasPorDiaChange(e.target.value)}
            className={selectClass}
          >
            {HORAS_POR_DIA_OPCIONES.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-500 mt-1">
            {!esManual && `Jornada de ${horasPorDiaActual} horas diarias`}
            {esManual && 'Ingrese las horas manualmente'}
          </p>
        </div>

        {/* Campo manual (visible si es manual) */}
        {esManual && (
          <div>
            <label className={labelClass}>
              <Calculator size={12}/> Horas Manuales
            </label>
            <input
              type="number"
              value={horasManuales}
              onChange={e => handleHorasManualesChange(e.target.value)}
              className={inputClass}
              min="1"
              max="24"
              step="0.5"
            />
            <p className="text-xs text-slate-500 mt-1">
              Rango válido: 1 - 24 horas
            </p>
            {horasManuales > 12 && (
              <p className="text-xs text-amber-400 mt-1 flex items-center gap-1">
                <AlertCircle size={10}/> Jornada extendida ({horasManuales}hs)
              </p>
            )}
          </div>
        )}

        {/* Días del diagrama (readonly) */}
        <div>
          <label className={labelClass}>
            <Calendar size={12}/> Días / Mes (Diagrama)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={`${diasDiagrama} días`}
              readOnly
              className={`${inputClass} bg-slate-600 text-slate-300 flex-1`}
            />
            <span className="text-xs px-2 py-1 bg-slate-700 rounded text-slate-400">
              {persona.diagrama || 'Sin diagrama'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Calculado según diagrama seleccionado
          </p>
        </div>
      </div>

      {/* Cálculo de horas mes */}
      {mostrarCalculo && (
        <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator size={16} className="text-slate-400"/>
              <span className="text-sm text-slate-400">Cálculo de Horas Mensuales:</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="px-2 py-1 bg-blue-600/30 rounded text-blue-300">
                {esManual ? horasManuales : horasPorDiaActual} hs/día
              </span>
              <span className="text-slate-500">×</span>
              <span className="px-2 py-1 bg-purple-600/30 rounded text-purple-300">
                {diasDiagrama} días
              </span>
              <span className="text-slate-500">=</span>
              <span className="px-2 py-1 bg-emerald-600/30 rounded text-emerald-300 font-bold">
                {horasMes} hs/mes
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Información adicional */}
      <div className="mt-3 p-3 bg-slate-700/30 rounded-lg">
        <p className="text-xs text-slate-400 flex items-start gap-2">
          <Info size={14} className="mt-0.5 flex-shrink-0"/>
          <span>
            Las horas mensuales se calculan automáticamente multiplicando las horas por día 
            por los días de trabajo según el diagrama seleccionado. Este valor se utiliza 
            para calcular el costo total del personal.
          </span>
        </p>
      </div>

      {/* Advertencias */}
      {diagramaEsManual && esManual && (
        <div className="mt-3 p-2 bg-amber-900/20 rounded border border-amber-500/30">
          <p className="text-xs text-amber-300 flex items-center gap-1">
            <AlertCircle size={12}/>
            Tanto el diagrama como las horas están en modo manual. Verifique que los valores sean correctos.
          </p>
        </div>
      )}

      {horasMes === 0 && (
        <div className="mt-3 p-2 bg-red-900/20 rounded border border-red-500/30">
          <p className="text-xs text-red-300 flex items-center gap-1">
            <AlertCircle size={12}/>
            Las horas mensuales son 0. Verifique la configuración de horas y diagrama.
          </p>
        </div>
      )}

      {horasMes > 0 && horasMes <= 300 && (
        <div className="mt-3 p-2 bg-emerald-900/20 rounded border border-emerald-500/30">
          <p className="text-xs text-emerald-300 flex items-center gap-1">
            <CheckCircle size={12}/>
            Configuración válida: {horasMes} horas mensuales
          </p>
        </div>
      )}

      {horasMes > 300 && (
        <div className="mt-3 p-2 bg-amber-900/20 rounded border border-amber-500/30">
          <p className="text-xs text-amber-300 flex items-center gap-1">
            <AlertCircle size={12}/>
            Advertencia: {horasMes} horas mensuales parece un valor alto. Verifique la configuración.
          </p>
        </div>
      )}

      {/* Resumen de configuración */}
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="p-2 bg-slate-700/30 rounded">
          <p className="text-xs text-slate-400">Tipo Jornada</p>
          <p className="text-sm font-medium text-slate-200">
            {esManual ? 'Manual' : `${horasPorDiaActual}hs estándar`}
          </p>
        </div>
        <div className="p-2 bg-slate-700/30 rounded">
          <p className="text-xs text-slate-400">Diagrama</p>
          <p className="text-sm font-medium text-slate-200">
            {persona.diagrama || 'No definido'}
          </p>
        </div>
        <div className="p-2 bg-emerald-600/20 rounded border border-emerald-500/30">
          <p className="text-xs text-emerald-300">Total Mes</p>
          <p className="text-lg font-bold text-emerald-400">
            {horasMes} hs
          </p>
        </div>
      </div>
    </div>
  );
};

export default HorasPorDiaSelector;
