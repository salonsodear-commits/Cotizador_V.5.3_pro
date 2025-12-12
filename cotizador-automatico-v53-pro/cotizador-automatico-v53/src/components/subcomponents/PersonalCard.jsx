/**
 * SISTEMA DE COTIZACIÓN V5.3 PRO
 * PersonalCard.jsx - Tarjeta/fila de registro de personal
 * 
 * Unidad visual para Personal.jsx y Results.jsx
 * Muestra todos los campos, permite edición inline, dispara recálculos
 */

import React, { useState, useMemo } from 'react';
import { getClasificacion, debeMostrarConvenio, debeMostrarCostoConvalidado, esPuestoLibre } from '../core/logic.js';
import { calcularCostoPersona } from '../core/calculations.js';
import { validarPersona } from '../core/validators.js';
import { User, Edit2, Copy, Trash2, ChevronDown, ChevronUp, CheckCircle, AlertCircle, FileSpreadsheet, MapPin, Calendar, Clock, DollarSign, Briefcase, Tag, Package, BookOpen } from 'lucide-react';

/**
 * PersonalCard
 * 
 * Props:
 * - persona: objeto completo de la persona
 * - onUpdate: función (campo, valor) para actualizar
 * - onDuplicate: función () para duplicar
 * - onDelete: función () para eliminar
 * - datosImportados: datos del archivo soporte
 * - provinciaSeleccionada: provincia global
 * - fmt: función formateo moneda
 * - compact: vista compacta (solo resumen)
 * - readOnly: solo lectura
 * - showActions: mostrar botones de acción
 */
const PersonalCard = ({
  persona = {},
  onUpdate,
  onDuplicate,
  onDelete,
  datosImportados = {},
  provinciaSeleccionada = '',
  fmt = (n) => `$${(n||0).toLocaleString('es-AR')}`,
  compact = false,
  readOnly = false,
  showActions = true
}) => {
  const [expandido, setExpandido] = useState(false);

  // Clasificación automática
  const clasificacion = useMemo(() => {
    return getClasificacion(persona);
  }, [persona]);

  // Validaciones
  const validacion = useMemo(() => {
    return validarPersona ? validarPersona(persona) : { valido: true, errores: [] };
  }, [persona]);

  // Cálculos
  const costos = useMemo(() => {
    if (typeof calcularCostoPersona === 'function') {
      return calcularCostoPersona(persona);
    }
    // Fallback básico
    const horasMes = (persona.horasPorDia || 8) * (persona.diasMes || 22);
    const costoBase = (persona.valorHora || 0) * horasMes;
    const itemsAdicionales = persona.itemsAdicionales?.filter(i => i.incluir !== false).reduce((s, i) => s + ((i.precio||0)*(i.cantidad||1)), 0) || 0;
    const capacitaciones = persona.capacitaciones?.filter(i => i.incluir !== false).reduce((s, i) => s + ((i.precio||0)*(i.cantidad||1)), 0) || 0;
    const convalidado = persona.incluyeConvalidado && persona.costoConvalidado ? persona.costoConvalidado : 0;
    return {
      costoBase,
      itemsAdicionales,
      capacitaciones,
      convalidado,
      total: costoBase + itemsAdicionales + capacitaciones + convalidado
    };
  }, [persona]);

  // Flags
  const esImportado = persona.importado === true || persona.origenImportacion;
  const esMT = persona.tipoContrato === 'Monotributista' || persona.tipoContrato === 'MT';
  const esFUCO = persona.tipoContrato === 'Fuera de Convenio' || persona.tipoContrato === 'FUCO';
  const esRD = persona.tipoContrato === 'Relación de Dependencia' || persona.tipoContrato === 'RD';
  const mostrarConvenio = debeMostrarConvenio ? debeMostrarConvenio(persona.tipoContrato) : esRD;
  const mostrarConvalidado = debeMostrarCostoConvalidado ? debeMostrarCostoConvalidado(persona.tipoContrato) : esFUCO;
  const incluidoEnCTC = persona.incluirCTC !== false;

  // Handler update
  const handleUpdate = (campo, valor) => {
    if (readOnly) return;
    onUpdate(campo, valor);
  };

  const inp = "px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm focus:border-emerald-500 focus:outline-none";

  // Vista compacta (solo resumen)
  if (compact) {
    return (
      <div className={`p-3 rounded-lg border transition-all ${
        incluidoEnCTC 
          ? 'bg-slate-800/50 border-slate-600' 
          : 'bg-slate-800/30 border-slate-700 opacity-60'
      }`}>
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={incluidoEnCTC}
            onChange={e => handleUpdate('incluirCTC', e.target.checked)}
            disabled={readOnly}
            className="rounded"
          />
          <div className="w-8 h-8 rounded-full bg-blue-600/30 flex items-center justify-center">
            <User size={16} className="text-blue-400"/>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{persona.nombre || 'Sin nombre'}</p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>{clasificacion.tipo}</span>
              {persona.puesto && <span>• {persona.puesto}</span>}
            </div>
          </div>
          {esImportado && (
            <span className="text-xs bg-emerald-600/30 text-emerald-300 px-1.5 py-0.5 rounded flex items-center gap-1">
              <FileSpreadsheet size={10}/> Imp
            </span>
          )}
          <span className={`font-bold ${incluidoEnCTC ? 'text-emerald-400' : 'text-slate-500'}`}>
            {fmt(costos.total)}
          </span>
          <button onClick={() => setExpandido(!expandido)} className="p-1 text-slate-400">
            {expandido ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
          </button>
        </div>
        
        {/* Expandido en compact */}
        {expandido && (
          <div className="mt-3 pt-3 border-t border-slate-700 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div><span className="text-slate-400">Provincia:</span> <span>{persona.provincia || provinciaSeleccionada}</span></div>
            <div><span className="text-slate-400">Diagrama:</span> <span>{persona.diagrama}</span></div>
            <div><span className="text-slate-400">Hs/día:</span> <span>{persona.horasPorDia || 8}</span></div>
            <div><span className="text-slate-400">Total:</span> <span className="text-emerald-400">{fmt(costos.total)}</span></div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`rounded-lg border transition-all ${
      incluidoEnCTC 
        ? 'bg-slate-800/50 border-slate-600' 
        : 'bg-slate-800/30 border-slate-700 opacity-70'
    } ${!validacion.valido ? 'border-red-500/50' : ''}`}>
      {/* Header */}
      <div className="p-3 flex items-center gap-3 border-b border-slate-700">
        <input
          type="checkbox"
          checked={incluidoEnCTC}
          onChange={e => handleUpdate('incluirCTC', e.target.checked)}
          disabled={readOnly}
          className="rounded w-5 h-5"
          aria-label="Incluir en costo total"
        />
        <div className="w-10 h-10 rounded-full bg-blue-600/30 flex items-center justify-center">
          <User size={20} className="text-blue-400"/>
        </div>
        <div className="flex-1">
          {readOnly ? (
            <p className="font-medium">{persona.nombre || 'Sin nombre'}</p>
          ) : (
            <input
              type="text"
              value={persona.nombre || ''}
              onChange={e => handleUpdate('nombre', e.target.value)}
              className={`${inp} w-full font-medium`}
              placeholder="Nombre completo"
              aria-label="Nombre"
            />
          )}
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs px-2 py-0.5 rounded ${
              esRD ? 'bg-blue-600/30 text-blue-300' :
              esMT ? 'bg-cyan-600/30 text-cyan-300' :
              esFUCO ? 'bg-purple-600/30 text-purple-300' : 'bg-slate-600/30 text-slate-300'
            }`}>
              {clasificacion.tipo}
            </span>
            {clasificacion.subtipo && (
              <span className="text-xs text-slate-400">{clasificacion.subtipo}</span>
            )}
            {esImportado && (
              <span className="text-xs bg-emerald-600/30 text-emerald-300 px-1.5 py-0.5 rounded flex items-center gap-1">
                <FileSpreadsheet size={10}/> Importado
              </span>
            )}
            {!validacion.valido && (
              <span className="text-xs text-red-400 flex items-center gap-1">
                <AlertCircle size={12}/> {validacion.errores.length} error(es)
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Total</p>
          <p className={`text-xl font-bold ${incluidoEnCTC ? 'text-emerald-400' : 'text-slate-500'}`}>
            {fmt(costos.total)}
          </p>
        </div>
        {showActions && !readOnly && (
          <div className="flex gap-1">
            <button onClick={onDuplicate} className="p-2 text-slate-400 hover:text-blue-400" aria-label="Duplicar">
              <Copy size={16}/>
            </button>
            <button onClick={onDelete} className="p-2 text-slate-400 hover:text-red-400" aria-label="Eliminar">
              <Trash2 size={16}/>
            </button>
          </div>
        )}
      </div>

      {/* Contenido principal */}
      <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Tipo Contratación */}
        <div>
          <label className="block text-xs text-slate-400 mb-1 flex items-center gap-1">
            <Briefcase size={10}/> Tipo Contratación
          </label>
          {readOnly ? (
            <span className="text-sm">{persona.tipoContrato}</span>
          ) : (
            <select
              value={persona.tipoContrato || ''}
              onChange={e => handleUpdate('tipoContrato', e.target.value)}
              className={`${inp} w-full`}
            >
              <option value="">Seleccionar...</option>
              <option value="RD">Relación de Dependencia</option>
              <option value="MT">Monotributista</option>
              <option value="FUCO">Fuera de Convenio</option>
            </select>
          )}
        </div>

        {/* Convenio (solo RD) */}
        {mostrarConvenio && (
          <div>
            <label className="block text-xs text-slate-400 mb-1">Convenio</label>
            <span className="text-sm">{persona.convenio || '-'}</span>
          </div>
        )}

        {/* Categoría/Puesto */}
        <div>
          <label className="block text-xs text-slate-400 mb-1 flex items-center gap-1">
            <Tag size={10}/> {mostrarConvenio ? 'Categoría' : 'Puesto'}
          </label>
          {readOnly || esRD ? (
            <span className="text-sm">{persona.puesto || persona.categoria || '-'}</span>
          ) : (
            <input
              type="text"
              value={persona.puesto || ''}
              onChange={e => handleUpdate('puesto', e.target.value)}
              className={`${inp} w-full`}
              placeholder="Puesto"
            />
          )}
        </div>

        {/* Provincia */}
        <div>
          <label className="block text-xs text-slate-400 mb-1 flex items-center gap-1">
            <MapPin size={10}/> Provincia
          </label>
          <span className="text-sm flex items-center gap-1">
            {persona.provincia || provinciaSeleccionada || '-'}
            {esImportado && persona.provincia && (
              <span className="text-xs text-amber-400" title="Provincia importada, no modificable">🔒</span>
            )}
          </span>
        </div>

        {/* Diagrama */}
        <div>
          <label className="block text-xs text-slate-400 mb-1 flex items-center gap-1">
            <Calendar size={10}/> Diagrama
          </label>
          <span className="text-sm">{persona.diagrama || '-'}</span>
        </div>

        {/* Horas por día */}
        <div>
          <label className="block text-xs text-slate-400 mb-1 flex items-center gap-1">
            <Clock size={10}/> Hs/Día
          </label>
          <span className="text-sm">{persona.horasPorDia || 8} hs</span>
        </div>

        {/* Valor Hora (MT/FUCO) */}
        {(esMT || esFUCO) && (
          <div>
            <label className="block text-xs text-slate-400 mb-1 flex items-center gap-1">
              <DollarSign size={10}/> Valor Hora
            </label>
            {readOnly ? (
              <span className="text-sm">{fmt(persona.valorHora || 0)}</span>
            ) : (
              <input
                type="number"
                value={persona.valorHora || 0}
                onChange={e => handleUpdate('valorHora', Number(e.target.value))}
                className={`${inp} w-full`}
                min="0"
              />
            )}
          </div>
        )}

        {/* Costo Convalidado (solo FUCO) */}
        {mostrarConvalidado && (
          <div>
            <label className="block text-xs text-slate-400 mb-1">Costo Convalidado</label>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={persona.incluyeConvalidado || false}
                onChange={e => handleUpdate('incluyeConvalidado', e.target.checked)}
                disabled={readOnly}
                className="rounded"
              />
              {persona.incluyeConvalidado && (
                readOnly ? (
                  <span className="text-sm">{fmt(persona.costoConvalidado || 0)}</span>
                ) : (
                  <input
                    type="number"
                    value={persona.costoConvalidado || 0}
                    onChange={e => handleUpdate('costoConvalidado', Number(e.target.value))}
                    className={`${inp} w-20`}
                    min="0"
                  />
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* Subtotales */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-slate-700/30 rounded-lg">
          <div className="text-center">
            <p className="text-xs text-slate-400">Base</p>
            <p className="font-medium text-blue-400">{fmt(costos.costoBase)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
              <Package size={10}/> Adicionales
            </p>
            <p className="font-medium text-pink-400">{fmt(costos.itemsAdicionales)}</p>
            <p className="text-xs text-slate-500">{persona.itemsAdicionales?.filter(i=>i.incluir!==false).length || 0} items</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
              <BookOpen size={10}/> Capacitaciones
            </p>
            <p className="font-medium text-indigo-400">{fmt(costos.capacitaciones)}</p>
            <p className="text-xs text-slate-500">{persona.capacitaciones?.filter(i=>i.incluir!==false).length || 0} items</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-400">Total Persona</p>
            <p className="font-bold text-emerald-400 text-lg">{fmt(costos.total)}</p>
          </div>
        </div>
      </div>

      {/* Errores de validación */}
      {!validacion.valido && validacion.errores.length > 0 && (
        <div className="px-4 pb-4">
          <div className="p-2 bg-red-900/20 rounded border border-red-500/30">
            {validacion.errores.map((e, i) => (
              <p key={i} className="text-xs text-red-400 flex items-center gap-1">
                <AlertCircle size={12}/> {e}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Estado CTC */}
      <div className="px-4 pb-3 flex items-center justify-between text-xs">
        <span className={incluidoEnCTC ? 'text-emerald-400' : 'text-amber-400'}>
          {incluidoEnCTC ? (
            <span className="flex items-center gap-1"><CheckCircle size={12}/> Incluido en CTC</span>
          ) : (
            <span className="flex items-center gap-1"><AlertCircle size={12}/> Excluido del CTC</span>
          )}
        </span>
        {esImportado && persona.origenImportacion && (
          <span className="text-slate-500">Fuente: {persona.origenImportacion}</span>
        )}
      </div>
    </div>
  );
};

export default PersonalCard;
