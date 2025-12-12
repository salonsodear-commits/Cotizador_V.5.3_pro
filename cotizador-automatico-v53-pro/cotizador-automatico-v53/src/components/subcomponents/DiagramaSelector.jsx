/**
 * SISTEMA DE COTIZACIÓN V5.3 PRO
 * DiagramaSelector.jsx - Selector de diagrama de trabajo
 * 
 * Selección de diagrama con cálculo automático de días
 * Impacta en: Personal, Clasificación, Horas, Costos
 * Integración con archivo soporte único
 */

import React, { useMemo } from 'react';
import { DIAGRAMAS_TRABAJO, calcularDiasPorDiagrama } from '../core/constants.js';
import { Calendar, Clock, RefreshCw, AlertCircle, CheckCircle, Info, Settings, Sun, Moon } from 'lucide-react';

/**
 * DiagramaSelector
 * 
 * Props:
 * - diagrama: valor actual del diagrama
 * - diasTrabajados: días trabajados (para manual)
 * - diasDescanso: días descanso (para manual)
 * - onUpdate: función (campo, valor) para actualizar
 * - datosImportados: datos del archivo soporte
 * - provinciaSeleccionada: provincia actual (para filtrar)
 * - horasPorDia: horas por día seleccionadas
 * - fmt: función formateo
 * - compact: vista compacta
 * - readOnly: solo lectura
 * - mostrarCalculo: mostrar desglose del cálculo
 */
const DiagramaSelector = ({
  diagrama = '',
  diasTrabajados = 0,
  diasDescanso = 0,
  onUpdate,
  datosImportados = {},
  provinciaSeleccionada = '',
  horasPorDia = 8,
  fmt = (n) => n.toLocaleString('es-AR'),
  compact = false,
  readOnly = false,
  mostrarCalculo = true
}) => {

  // Diagramas importados filtrados por provincia
  const diagramasImp = useMemo(() => {
    if (!datosImportados.diagramas?.length) return [];
    return datosImportados.diagramas.filter(d => {
      if (d.Provincia && provinciaSeleccionada && d.Provincia !== provinciaSeleccionada) return false;
      return true;
    });
  }, [datosImportados.diagramas, provinciaSeleccionada]);

  // Combinar diagramas predefinidos + importados
  const diagramasDisponibles = useMemo(() => {
    const predefinidos = DIAGRAMAS_TRABAJO.map(d => ({
      ...d,
      origen: 'predefinido'
    }));
    
    const importados = diagramasImp.map(d => ({
      value: d.Codigo || d.Descripcion,
      label: d.Descripcion || d.Codigo,
      diasTrabajo: d.DiasTrabajo || 0,
      diasDescanso: d.DiasDescanso || 0,
      frecuencia: d.Frecuencia || 'mensual',
      factor: d.Factor || 1,
      rotacion: d.Rotacion || '',
      origen: 'importado'
    }));
    
    return [...predefinidos, ...importados];
  }, [diagramasImp]);

  // Obtener configuración del diagrama seleccionado
  const configDiagrama = useMemo(() => {
    if (!diagrama) return null;
    
    // Buscar en disponibles
    const encontrado = diagramasDisponibles.find(d => d.value === diagrama);
    if (encontrado) return encontrado;
    
    // Si es manual, crear config desde props
    if (diagrama === 'Manual') {
      return {
        value: 'Manual',
        label: 'Manual',
        diasTrabajo: diasTrabajados,
        diasDescanso: diasDescanso,
        frecuencia: 'mensual',
        factor: 1,
        origen: 'manual'
      };
    }
    
    return null;
  }, [diagrama, diagramasDisponibles, diasTrabajados, diasDescanso]);

  // Calcular días mensuales según diagrama
  const diasMensuales = useMemo(() => {
    if (!configDiagrama) return { trabajados: 0, descanso: 0, total: 0 };
    
    // Usar función del core si está disponible
    if (typeof calcularDiasPorDiagrama === 'function') {
      const dias = calcularDiasPorDiagrama(diagrama, diasTrabajados, diasDescanso);
      return {
        trabajados: dias,
        descanso: Math.round(30 - dias),
        total: 30
      };
    }
    
    // Cálculo manual
    const dt = configDiagrama.diasTrabajo || diasTrabajados || 0;
    const dd = configDiagrama.diasDescanso || diasDescanso || 0;
    const ciclo = dt + dd;
    
    if (ciclo <= 0) return { trabajados: 0, descanso: 0, total: 0 };
    
    const ciclosPorMes = 30 / ciclo;
    const trabajadosMes = Math.round(dt * ciclosPorMes);
    
    return {
      trabajados: trabajadosMes,
      descanso: 30 - trabajadosMes,
      total: 30
    };
  }, [configDiagrama, diagrama, diasTrabajados, diasDescanso]);

  // Calcular horas mensuales
  const horasMensuales = diasMensuales.trabajados * horasPorDia;

  // Handler para cambio de diagrama
  const handleDiagramaChange = (nuevoDiagrama) => {
    if (readOnly) return;
    
    onUpdate('diagrama', nuevoDiagrama);
    
    // Si no es manual, actualizar días desde config
    if (nuevoDiagrama !== 'Manual') {
      const config = diagramasDisponibles.find(d => d.value === nuevoDiagrama);
      if (config) {
        onUpdate('diasTrabajados', config.diasTrabajo);
        onUpdate('diasDescanso', config.diasDescanso);
      }
    }
  };

  // Handler para cambio de días (solo en manual)
  const handleDiasChange = (campo, valor) => {
    if (readOnly) return;
    const num = Number(valor);
    if (num < 0) return;
    onUpdate(campo, num);
  };

  // Validaciones
  const validaciones = useMemo(() => {
    const errores = [];
    const advertencias = [];
    
    if (!diagrama) {
      errores.push('Seleccione un diagrama');
    }
    
    if (diagrama === 'Manual') {
      if (diasTrabajados <= 0) errores.push('Días trabajados debe ser > 0');
      if (diasTrabajados + diasDescanso <= 0) errores.push('El ciclo debe ser > 0');
    }
    
    if (diasMensuales.trabajados > 30) {
      advertencias.push('Días trabajados exceden el mes');
    }
    
    if (horasMensuales > 300) {
      advertencias.push('Horas mensuales muy altas (>300)');
    }
    
    if (horasMensuales === 0 && diagrama) {
      errores.push('Horas mensuales = 0');
    }
    
    return { errores, advertencias, valido: errores.length === 0 };
  }, [diagrama, diasTrabajados, diasDescanso, diasMensuales, horasMensuales]);

  const inp = "px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm focus:border-emerald-500 focus:outline-none";
  const esManual = diagrama === 'Manual';

  // Vista compacta
  if (compact) {
    return (
      <div className="p-2 bg-blue-900/20 rounded border border-blue-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-blue-400"/>
            <span className="text-xs font-medium text-blue-300">Diagrama</span>
            <span className="text-xs bg-blue-600/30 px-1.5 py-0.5 rounded">
              {configDiagrama?.label || diagrama || 'Sin selección'}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-400">{diasMensuales.trabajados} días</span>
            <span className="text-blue-400 font-medium">{horasMensuales} hs/mes</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h5 className="text-sm font-medium text-blue-300 flex items-center gap-2">
          <Calendar size={16}/>
          Diagrama de Trabajo
        </h5>
        {validaciones.valido ? (
          <span className="text-xs text-emerald-400 flex items-center gap-1">
            <CheckCircle size={12}/> Configurado
          </span>
        ) : (
          <span className="text-xs text-amber-400 flex items-center gap-1">
            <AlertCircle size={12}/> Pendiente
          </span>
        )}
      </div>

      {/* Selector principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Diagrama */}
        <div>
          <label className="block text-xs text-slate-400 mb-1">Tipo de Diagrama</label>
          {readOnly ? (
            <span className="text-sm font-medium">{configDiagrama?.label || diagrama}</span>
          ) : (
            <select
              value={diagrama}
              onChange={e => handleDiagramaChange(e.target.value)}
              className={`${inp} w-full`}
            >
              <option value="">Seleccionar diagrama...</option>
              <optgroup label="Predefinidos">
                {DIAGRAMAS_TRABAJO.map(d => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </optgroup>
              {diagramasImp.length > 0 && (
                <optgroup label="Importados">
                  {diagramasImp.map((d, i) => (
                    <option key={i} value={d.Codigo || d.Descripcion}>
                      {d.Descripcion || d.Codigo}
                    </option>
                  ))}
                </optgroup>
              )}
              <optgroup label="Personalizado">
                <option value="Manual">Manual (definir días)</option>
              </optgroup>
            </select>
          )}
        </div>

        {/* Rotación / Info */}
        <div>
          <label className="block text-xs text-slate-400 mb-1">Información</label>
          <div className="p-2 bg-slate-700/50 rounded text-sm">
            {configDiagrama ? (
              <div className="flex items-center gap-2">
                <RefreshCw size={14} className="text-blue-400"/>
                <span>
                  {configDiagrama.diasTrabajo || diasTrabajados}x{configDiagrama.diasDescanso || diasDescanso}
                  {configDiagrama.rotacion && ` (${configDiagrama.rotacion})`}
                </span>
              </div>
            ) : (
              <span className="text-slate-500">Seleccione un diagrama</span>
            )}
          </div>
        </div>
      </div>

      {/* Campos manuales (solo si es Manual) */}
      {esManual && (
        <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-slate-700/30 rounded-lg border border-slate-600/50">
          <div>
            <label className="block text-xs text-slate-400 mb-1 flex items-center gap-1">
              <Sun size={10}/> Días Trabajados (por ciclo)
            </label>
            {readOnly ? (
              <span className="text-sm">{diasTrabajados}</span>
            ) : (
              <input
                type="number"
                value={diasTrabajados}
                onChange={e => handleDiasChange('diasTrabajados', e.target.value)}
                className={`${inp} w-full`}
                min="0"
                max="30"
              />
            )}
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1 flex items-center gap-1">
              <Moon size={10}/> Días Descanso (por ciclo)
            </label>
            {readOnly ? (
              <span className="text-sm">{diasDescanso}</span>
            ) : (
              <input
                type="number"
                value={diasDescanso}
                onChange={e => handleDiasChange('diasDescanso', e.target.value)}
                className={`${inp} w-full`}
                min="0"
                max="30"
              />
            )}
          </div>
        </div>
      )}

      {/* Cálculo de días y horas */}
      {mostrarCalculo && configDiagrama && (
        <div className="p-3 bg-slate-800/50 rounded-lg">
          <p className="text-xs text-slate-400 mb-2 font-medium">Cálculo mensual:</p>
          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="p-2 bg-blue-600/20 rounded border border-blue-500/30">
              <p className="text-xs text-blue-300">Ciclo</p>
              <p className="font-medium text-blue-400">
                {configDiagrama.diasTrabajo || diasTrabajados}x{configDiagrama.diasDescanso || diasDescanso}
              </p>
            </div>
            <div className="p-2 bg-emerald-600/20 rounded border border-emerald-500/30">
              <p className="text-xs text-emerald-300">Días/Mes</p>
              <p className="font-bold text-emerald-400">{diasMensuales.trabajados}</p>
            </div>
            <div className="p-2 bg-amber-600/20 rounded border border-amber-500/30">
              <p className="text-xs text-amber-300">Hs/Día</p>
              <p className="font-medium text-amber-400">{horasPorDia}</p>
            </div>
            <div className="p-2 bg-purple-600/20 rounded border border-purple-500/30">
              <p className="text-xs text-purple-300">Hs/Mes</p>
              <p className="font-bold text-purple-400">{horasMensuales}</p>
            </div>
          </div>
          
          {/* Fórmula visual */}
          <div className="mt-2 p-2 bg-slate-700/50 rounded text-center text-sm">
            <span className="text-emerald-400">{diasMensuales.trabajados} días</span>
            <span className="text-slate-400 mx-2">×</span>
            <span className="text-amber-400">{horasPorDia} hs/día</span>
            <span className="text-slate-400 mx-2">=</span>
            <span className="text-purple-400 font-bold">{horasMensuales} hs/mes</span>
          </div>
        </div>
      )}

      {/* Validaciones */}
      {(validaciones.errores.length > 0 || validaciones.advertencias.length > 0) && (
        <div className="mt-3 space-y-1">
          {validaciones.errores.map((e, i) => (
            <p key={i} className="text-xs text-red-400 flex items-center gap-1">
              <AlertCircle size={12}/> {e}
            </p>
          ))}
          {validaciones.advertencias.map((a, i) => (
            <p key={i} className="text-xs text-amber-400 flex items-center gap-1">
              <AlertCircle size={12}/> {a}
            </p>
          ))}
        </div>
      )}

      {/* Info archivo soporte */}
      {diagramasImp.length > 0 && (
        <div className="mt-3 p-2 bg-emerald-900/20 rounded border border-emerald-500/30">
          <p className="text-xs text-emerald-300 flex items-center gap-1">
            <Info size={12}/> {diagramasImp.length} diagramas del archivo soporte
            {provinciaSeleccionada && ` (${provinciaSeleccionada})`}
          </p>
        </div>
      )}
    </div>
  );
};

export default DiagramaSelector;
