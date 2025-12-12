/**
 * SISTEMA DE COTIZACIÓN V5.3 PRO
 * ClasificacionRules.jsx - Visualización y aplicación de reglas de clasificación
 * 
 * V5.3 Reglas de clasificación:
 * - Monotributista → Clasificación: Monotributista / Categoría: Monotributista / Puesto: Libre
 * - Fuera de Convenio → Clasificación: Fuera de Convenio / Categoría: Fuera de Convenio / Puesto: Libre
 * - Relación Dependencia → Clasificación: Convenio / Categoría: Según convenio / Puesto: Según categoría
 * 
 * Este componente:
 * - Muestra visualmente la clasificación actual
 * - Indica qué campos aplican según el tipo de contratación
 * - Muestra advertencias y validaciones
 * - NO modifica provincia ni valores no solicitados
 */

import React, { useMemo } from 'react';
import { TIPOS_CONTRATO, CONVENIOS } from '../core/constants.js';
import { getClasificacion, debeMostrarConvenio, esPuestoLibre, debeMostrarCostoConvalidado } from '../core/logic.js';
import { Tag, Briefcase, User, Building, CheckCircle, XCircle, AlertTriangle, Info, ArrowRight } from 'lucide-react';

/**
 * ClasificacionRules
 * 
 * Props:
 * - persona: objeto con datos del personal
 * - mostrarDetalle: boolean para mostrar información expandida
 * - compact: boolean para vista compacta
 */
const ClasificacionRules = ({ 
  persona, 
  mostrarDetalle = true,
  compact = false 
}) => {
  
  // Obtener clasificación desde logic.js
  const clasificacion = useMemo(() => getClasificacion(persona.tipoContrato), [persona.tipoContrato]);
  
  // Flags de comportamiento
  const mostrarConvenio = debeMostrarConvenio(persona.tipoContrato);
  const puestoLibre = esPuestoLibre(persona.tipoContrato);
  const mostrarConvalidado = debeMostrarCostoConvalidado(persona.tipoContrato);

  // Determinar estado de completitud
  const estadoCompletitud = useMemo(() => {
    const estado = {
      tipoContrato: true, // Siempre tiene valor
      convenio: !mostrarConvenio || Boolean(persona.convenio),
      categoria: !mostrarConvenio || Boolean(persona.categoria),
      puesto: Boolean(persona.puesto),
      valorHora: !puestoLibre || (persona.valorHora && persona.valorHora > 0),
      completo: false
    };
    
    estado.completo = estado.tipoContrato && estado.convenio && estado.categoria && estado.puesto && estado.valorHora;
    
    return estado;
  }, [persona, mostrarConvenio, puestoLibre]);

  // Colores según tipo
  const getColorScheme = () => {
    switch (persona.tipoContrato) {
      case 'MT':
        return {
          bg: 'bg-cyan-900/20',
          border: 'border-cyan-500/30',
          text: 'text-cyan-300',
          accent: 'text-cyan-400',
          badge: 'bg-cyan-600/30 text-cyan-300'
        };
      case 'FUCO':
        return {
          bg: 'bg-purple-900/20',
          border: 'border-purple-500/30',
          text: 'text-purple-300',
          accent: 'text-purple-400',
          badge: 'bg-purple-600/30 text-purple-300'
        };
      default: // RD
        return {
          bg: 'bg-blue-900/20',
          border: 'border-blue-500/30',
          text: 'text-blue-300',
          accent: 'text-blue-400',
          badge: 'bg-blue-600/30 text-blue-300'
        };
    }
  };

  const colors = getColorScheme();

  // Vista compacta
  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${colors.bg} ${colors.border} border`}>
        <Tag size={14} className={colors.accent}/>
        <span className={`text-sm font-medium ${colors.text}`}>
          {clasificacion.tipo}
        </span>
        <ArrowRight size={12} className="text-slate-500"/>
        <span className="text-sm text-slate-300">
          {clasificacion.subtipo}
        </span>
        <ArrowRight size={12} className="text-slate-500"/>
        <span className="text-sm text-slate-400">
          {puestoLibre ? (persona.puesto || 'Sin definir') : (persona.puesto || clasificacion.puesto)}
        </span>
        {estadoCompletitud.completo ? (
          <CheckCircle size={14} className="text-emerald-400 ml-1"/>
        ) : (
          <AlertTriangle size={14} className="text-amber-400 ml-1"/>
        )}
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-lg border ${colors.bg} ${colors.border}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h4 className={`text-sm font-medium flex items-center gap-2 ${colors.text}`}>
          <Tag size={16}/>
          Clasificación del Personal
        </h4>
        <span className={`text-xs px-2 py-1 rounded ${colors.badge}`}>
          {TIPOS_CONTRATO.find(t => t.value === persona.tipoContrato)?.label || persona.tipoContrato}
        </span>
      </div>

      {/* Clasificación visual */}
      <div className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-lg mb-4">
        <div className="flex-1 text-center p-2 rounded bg-slate-700/50">
          <p className="text-xs text-slate-400 mb-1">Clasificación</p>
          <p className={`font-medium ${colors.accent}`}>{clasificacion.tipo}</p>
        </div>
        <ArrowRight size={16} className="text-slate-500"/>
        <div className="flex-1 text-center p-2 rounded bg-slate-700/50">
          <p className="text-xs text-slate-400 mb-1">Categoría</p>
          <p className="font-medium text-slate-200">
            {mostrarConvenio ? (persona.categoria || 'Por definir') : clasificacion.subtipo}
          </p>
        </div>
        <ArrowRight size={16} className="text-slate-500"/>
        <div className="flex-1 text-center p-2 rounded bg-slate-700/50">
          <p className="text-xs text-slate-400 mb-1">Puesto</p>
          <p className="font-medium text-slate-200">
            {persona.puesto || (puestoLibre ? 'Libre (editable)' : 'Por definir')}
          </p>
        </div>
      </div>

      {/* Reglas aplicables */}
      {mostrarDetalle && (
        <div className="space-y-3">
          <p className="text-xs text-slate-400 font-medium uppercase">Reglas aplicables:</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {/* Convenio */}
            <div className={`flex items-center gap-2 p-2 rounded text-sm ${
              mostrarConvenio 
                ? 'bg-blue-900/20 border border-blue-500/20' 
                : 'bg-slate-700/30 border border-slate-600/30'
            }`}>
              <Building size={14} className={mostrarConvenio ? 'text-blue-400' : 'text-slate-500'}/>
              <span className={mostrarConvenio ? 'text-blue-300' : 'text-slate-500'}>
                Convenio
              </span>
              <span className="ml-auto">
                {mostrarConvenio ? (
                  persona.convenio ? (
                    <span className="flex items-center gap-1 text-emerald-400">
                      <CheckCircle size={12}/> {persona.convenio}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-amber-400">
                      <AlertTriangle size={12}/> Requerido
                    </span>
                  )
                ) : (
                  <span className="flex items-center gap-1 text-slate-500">
                    <XCircle size={12}/> No aplica
                  </span>
                )}
              </span>
            </div>

            {/* Categoría */}
            <div className={`flex items-center gap-2 p-2 rounded text-sm ${
              mostrarConvenio 
                ? 'bg-blue-900/20 border border-blue-500/20' 
                : 'bg-slate-700/30 border border-slate-600/30'
            }`}>
              <Briefcase size={14} className={mostrarConvenio ? 'text-blue-400' : 'text-slate-500'}/>
              <span className={mostrarConvenio ? 'text-blue-300' : 'text-slate-500'}>
                Categoría
              </span>
              <span className="ml-auto">
                {mostrarConvenio ? (
                  persona.categoria ? (
                    <span className="flex items-center gap-1 text-emerald-400">
                      <CheckCircle size={12}/> {persona.categoria}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-amber-400">
                      <AlertTriangle size={12}/> Requerido
                    </span>
                  )
                ) : (
                  <span className="text-slate-400">{clasificacion.subtipo}</span>
                )}
              </span>
            </div>

            {/* Puesto */}
            <div className={`flex items-center gap-2 p-2 rounded text-sm ${
              puestoLibre 
                ? `${colors.bg} border ${colors.border}` 
                : 'bg-blue-900/20 border border-blue-500/20'
            }`}>
              <User size={14} className={puestoLibre ? colors.accent : 'text-blue-400'}/>
              <span className={puestoLibre ? colors.text : 'text-blue-300'}>
                Puesto
              </span>
              <span className="ml-auto">
                {persona.puesto ? (
                  <span className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle size={12}/> {persona.puesto}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-400">
                    <AlertTriangle size={12}/> {puestoLibre ? 'Editable' : 'Requerido'}
                  </span>
                )}
              </span>
            </div>

            {/* Costo Convalidado */}
            <div className={`flex items-center gap-2 p-2 rounded text-sm ${
              mostrarConvalidado 
                ? 'bg-purple-900/20 border border-purple-500/20' 
                : 'bg-slate-700/30 border border-slate-600/30'
            }`}>
              <Tag size={14} className={mostrarConvalidado ? 'text-purple-400' : 'text-slate-500'}/>
              <span className={mostrarConvalidado ? 'text-purple-300' : 'text-slate-500'}>
                Convalidado
              </span>
              <span className="ml-auto">
                {mostrarConvalidado ? (
                  persona.incluyeConvalidado ? (
                    <span className="flex items-center gap-1 text-purple-400">
                      <CheckCircle size={12}/> Incluido
                    </span>
                  ) : (
                    <span className="text-slate-400">Opcional</span>
                  )
                ) : (
                  <span className="flex items-center gap-1 text-slate-500">
                    <XCircle size={12}/> No aplica
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Información según tipo */}
      <div className="mt-4 p-3 bg-slate-700/30 rounded-lg">
        <p className="text-xs text-slate-400 flex items-start gap-2">
          <Info size={14} className="mt-0.5 flex-shrink-0"/>
          <span>
            {persona.tipoContrato === 'MT' && (
              'Monotributista: No requiere convenio ni categoría. El puesto es de texto libre y el costo se calcula por valor hora × horas mensuales. No aplica costo de convalidación.'
            )}
            {persona.tipoContrato === 'FUCO' && (
              'Fuera de Convenio: No requiere convenio predefinido. El puesto es de texto libre, el costo se calcula por valor hora × horas mensuales, y opcionalmente puede incluir costo de convalidación de título.'
            )}
            {persona.tipoContrato === 'RD' && (
              'Relación de Dependencia: Requiere seleccionar convenio (FATSA o Petrolero), categoría según convenio, y puesto según categoría. El sueldo se importa desde el archivo de sueldos.'
            )}
          </span>
        </p>
      </div>

      {/* Estado de completitud */}
      <div className={`mt-3 p-2 rounded flex items-center justify-between ${
        estadoCompletitud.completo 
          ? 'bg-emerald-900/20 border border-emerald-500/30' 
          : 'bg-amber-900/20 border border-amber-500/30'
      }`}>
        <span className={`text-xs flex items-center gap-1 ${
          estadoCompletitud.completo ? 'text-emerald-300' : 'text-amber-300'
        }`}>
          {estadoCompletitud.completo ? (
            <><CheckCircle size={12}/> Clasificación completa</>
          ) : (
            <><AlertTriangle size={12}/> Campos pendientes</>
          )}
        </span>
        
        {!estadoCompletitud.completo && (
          <div className="flex gap-1">
            {!estadoCompletitud.convenio && <span className="text-xs bg-amber-600/30 px-1 rounded">Convenio</span>}
            {!estadoCompletitud.categoria && <span className="text-xs bg-amber-600/30 px-1 rounded">Categoría</span>}
            {!estadoCompletitud.puesto && <span className="text-xs bg-amber-600/30 px-1 rounded">Puesto</span>}
            {!estadoCompletitud.valorHora && <span className="text-xs bg-amber-600/30 px-1 rounded">Valor Hora</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClasificacionRules;
