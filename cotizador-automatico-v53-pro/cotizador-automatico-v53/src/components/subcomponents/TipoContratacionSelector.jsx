/**
 * SISTEMA DE COTIZACIÓN V5.3 PRO
 * TipoContratacionSelector.jsx - Selector de tipo de contratación
 * 
 * V5.3 Reglas implementadas:
 * - Punto 1: MT sin convalidado, FUCO con convalidado opcional
 * - Punto 2: Clasificación automática según tipo
 *   - MT → Monotributista / Monotributista / Libre (sin convenio)
 *   - FUCO → Fuera de Convenio / Fuera de Convenio / Libre (sin convenio)
 *   - RD → muestra convenio/categoría/puesto normal
 * - Punto 3: MT y FUCO tienen puesto libre editable
 */

import React from 'react';
import { TIPOS_CONTRATO, CONVENIOS, CATEGORIAS_POR_CONVENIO, PUESTOS_POR_CATEGORIA } from '../core/constants.js';
import { debeMostrarConvenio, esPuestoLibre, getClasificacion, debeMostrarCostoConvalidado } from '../core/logic.js';
import { Briefcase, Building, Tag, User, AlertCircle, Info } from 'lucide-react';

/**
 * TipoContratacionSelector
 * 
 * Props:
 * - persona: objeto con datos del personal
 * - onUpdate: función (campo, valor) para actualizar
 * - datosImportados: datos de archivos soporte (para autocompletar MT)
 * - provinciaSeleccionada: provincia actual de la cotización
 */
const TipoContratacionSelector = ({ 
  persona, 
  onUpdate, 
  datosImportados = {}, 
  provinciaSeleccionada = '' 
}) => {
  
  // Obtener clasificación V5.3
  const clasificacion = getClasificacion(persona.tipoContrato);
  const mostrarConvenio = debeMostrarConvenio(persona.tipoContrato);
  const puestoLibre = esPuestoLibre(persona.tipoContrato);
  const mostrarConvalidado = debeMostrarCostoConvalidado(persona.tipoContrato);

  // Handler para cambio de tipo contrato con lógica de cascada
  const handleTipoContratoChange = (nuevoTipo) => {
    onUpdate('tipoContrato', nuevoTipo);
    
    // V5.3 Punto 2: Aplicar clasificación automática
    if (nuevoTipo === 'MT' || nuevoTipo === 'FUCO') {
      // Limpiar campos de convenio (no aplican)
      onUpdate('convenio', '');
      onUpdate('categoria', '');
      onUpdate('puesto', '');
      // Diagrama manual por defecto para MT/FUCO
      onUpdate('diagrama', 'Manual');
      // Resetear convalidado
      onUpdate('incluyeConvalidado', false);
      onUpdate('costoConvalidado', 0);
    } else {
      // RD: Convenio por defecto FATSA
      onUpdate('convenio', 'FATSA');
    }
  };

  // Handler para cambio de convenio
  const handleConvenioChange = (nuevoConvenio) => {
    onUpdate('convenio', nuevoConvenio);
    // Limpiar categoría y puesto al cambiar convenio
    onUpdate('categoria', '');
    onUpdate('puesto', '');
  };

  // Handler para cambio de categoría
  const handleCategoriaChange = (nuevaCategoria) => {
    onUpdate('categoria', nuevaCategoria);
    // Limpiar puesto al cambiar categoría
    onUpdate('puesto', '');
  };

  // Handler para cambio de puesto (libre o seleccionado)
  const handlePuestoChange = (nuevoPuesto) => {
    onUpdate('puesto', nuevoPuesto);
    
    // V5.3 Punto 5: Autocompletar valor hora para MT/FUCO desde archivo soporte
    if (puestoLibre && provinciaSeleccionada && datosImportados.monotributistas?.length > 0) {
      const encontrado = datosImportados.monotributistas.find(
        m => m.Provincia === provinciaSeleccionada && m.Puesto === nuevoPuesto
      );
      if (encontrado?.Valor_Sugerido) {
        onUpdate('valorHora', encontrado.Valor_Sugerido);
      }
    }
  };

  // Obtener opciones disponibles
  const categoriasDisponibles = persona.convenio ? (CATEGORIAS_POR_CONVENIO[persona.convenio] || []) : [];
  const puestosDisponibles = persona.categoria ? (PUESTOS_POR_CATEGORIA[persona.categoria] || []) : [];

  // Estilos comunes
  const selectClass = "w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm focus:border-emerald-500 focus:outline-none transition-colors";
  const inputClass = "w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm focus:border-emerald-500 focus:outline-none transition-colors";
  const labelClass = "block text-xs text-slate-400 mb-1 flex items-center gap-1";

  return (
    <div className="space-y-4">
      {/* Clasificación Visual V5.3 */}
      <div className={`p-3 rounded-lg border ${
        clasificacion.tipo === 'Monotributista' 
          ? 'bg-cyan-900/20 border-cyan-500/30' 
          : clasificacion.tipo === 'Fuera de Convenio'
            ? 'bg-purple-900/20 border-purple-500/30'
            : 'bg-blue-900/20 border-blue-500/30'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info size={14} className={
              clasificacion.tipo === 'Monotributista' 
                ? 'text-cyan-400' 
                : clasificacion.tipo === 'Fuera de Convenio'
                  ? 'text-purple-400'
                  : 'text-blue-400'
            }/>
            <span className="text-sm font-medium">Clasificación:</span>
          </div>
          <div className="text-right text-sm">
            <span className="text-slate-300">{clasificacion.tipo}</span>
            <span className="text-slate-500 mx-1">/</span>
            <span className="text-slate-300">{clasificacion.subtipo}</span>
            <span className="text-slate-500 mx-1">/</span>
            <span className="text-slate-400">{clasificacion.puesto}</span>
          </div>
        </div>
      </div>

      {/* Tipo de Contrato */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className={labelClass}>
            <Briefcase size={12}/> Tipo de Contratación
          </label>
          <select 
            value={persona.tipoContrato} 
            onChange={e => handleTipoContratoChange(e.target.value)}
            className={selectClass}
          >
            {TIPOS_CONTRATO.map(tipo => (
              <option key={tipo.value} value={tipo.value}>
                {tipo.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-500 mt-1">
            {persona.tipoContrato === 'RD' && 'Empleado con convenio colectivo'}
            {persona.tipoContrato === 'MT' && 'Factura como independiente'}
            {persona.tipoContrato === 'FUCO' && 'Empleado sin convenio aplicable'}
          </p>
        </div>

        {/* V5.3 Punto 2: Solo mostrar convenio para RD */}
        {mostrarConvenio && (
          <>
            <div>
              <label className={labelClass}>
                <Building size={12}/> Convenio
              </label>
              <select 
                value={persona.convenio || ''} 
                onChange={e => handleConvenioChange(e.target.value)}
                className={selectClass}
              >
                <option value="">Seleccionar convenio</option>
                {CONVENIOS.map(conv => (
                  <option key={conv} value={conv}>{conv}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>
                <Tag size={12}/> Categoría
              </label>
              <select 
                value={persona.categoria || ''} 
                onChange={e => handleCategoriaChange(e.target.value)}
                className={selectClass}
                disabled={!persona.convenio}
              >
                <option value="">Seleccionar categoría</option>
                {categoriasDisponibles.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {!persona.convenio && (
                <p className="text-xs text-amber-400 mt-1 flex items-center gap-1">
                  <AlertCircle size={10}/> Seleccione convenio primero
                </p>
              )}
            </div>

            <div>
              <label className={labelClass}>
                <User size={12}/> Puesto
              </label>
              <select 
                value={persona.puesto || ''} 
                onChange={e => handlePuestoChange(e.target.value)}
                className={selectClass}
                disabled={!persona.categoria}
              >
                <option value="">Seleccionar puesto</option>
                {puestosDisponibles.map(puesto => (
                  <option key={puesto} value={puesto}>{puesto}</option>
                ))}
              </select>
              {!persona.categoria && (
                <p className="text-xs text-amber-400 mt-1 flex items-center gap-1">
                  <AlertCircle size={10}/> Seleccione categoría primero
                </p>
              )}
            </div>
          </>
        )}

        {/* V5.3 Punto 2,3: Puesto libre para MT y FUCO */}
        {puestoLibre && (
          <>
            <div>
              <label className={labelClass}>
                <User size={12}/> Puesto (texto libre)
              </label>
              <input 
                type="text"
                value={persona.puesto || ''} 
                onChange={e => handlePuestoChange(e.target.value)}
                className={inputClass}
                placeholder="Ej: Enfermero, Médico, Técnico..."
                list="puestos-sugeridos"
              />
              {/* Datalist con puestos del archivo soporte */}
              {datosImportados.monotributistas?.length > 0 && (
                <datalist id="puestos-sugeridos">
                  {[...new Set(datosImportados.monotributistas.map(m => m.Puesto))].map(puesto => (
                    <option key={puesto} value={puesto}/>
                  ))}
                </datalist>
              )}
              <p className="text-xs text-slate-500 mt-1">
                Ingrese el puesto o seleccione de sugerencias
              </p>
            </div>

            <div>
              <label className={labelClass}>
                <Briefcase size={12}/> Valor Hora
              </label>
              <input 
                type="number"
                value={persona.valorHora || 0} 
                onChange={e => onUpdate('valorHora', Number(e.target.value))}
                className={inputClass}
                min="0"
                step="100"
              />
              {provinciaSeleccionada && datosImportados.monotributistas?.length > 0 && (
                <p className="text-xs text-emerald-400 mt-1">
                  Se autocompleta desde archivo soporte
                </p>
              )}
              {!provinciaSeleccionada && (
                <p className="text-xs text-amber-400 mt-1 flex items-center gap-1">
                  <AlertCircle size={10}/> Seleccione provincia para autocompletar
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* V5.3 Punto 1: Costo Convalidado - Solo FUCO (NO para MT) */}
      {persona.tipoContrato === 'FUCO' && mostrarConvalidado && (
        <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-500/30">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input 
                type="checkbox" 
                checked={persona.incluyeConvalidado || false} 
                onChange={e => onUpdate('incluyeConvalidado', e.target.checked)}
                className="rounded border-slate-500 bg-slate-700 text-emerald-500 focus:ring-emerald-500"
              />
              <span>Incluye Costo Convalidado</span>
            </label>
            
            {persona.incluyeConvalidado && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400">Costo:</span>
                <input 
                  type="number"
                  value={persona.costoConvalidado || 0} 
                  onChange={e => onUpdate('costoConvalidado', Number(e.target.value))}
                  className="w-32 px-3 py-1 bg-slate-700 border border-slate-600 rounded text-sm focus:border-emerald-500 focus:outline-none"
                  min="0"
                  step="1000"
                />
              </div>
            )}
          </div>
          
          <p className="text-xs text-slate-400 mt-2">
            El costo de convalidación de título se suma al costo total del personal.
          </p>
        </div>
      )}

      {/* Mensaje informativo para MT */}
      {persona.tipoContrato === 'MT' && (
        <div className="p-3 bg-cyan-900/20 rounded-lg border border-cyan-500/30">
          <p className="text-xs text-cyan-300 flex items-center gap-2">
            <Info size={14}/>
            Monotributista: No aplica costo convalidado. El valor se calcula en base a horas × valor hora.
          </p>
        </div>
      )}
    </div>
  );
};

export default TipoContratacionSelector;
