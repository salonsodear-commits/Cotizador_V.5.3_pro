/**
 * SISTEMA DE COTIZACIÓN V5.3 PRO
 * Trailers.jsx - V5.3 Punto 10.6: Solo Mantenimiento (NO Service)
 */

import React, { useState } from 'react';
import { TIPOS_TRAILER, TIPOS_ADQUISICION, MANTENIMIENTO_ITEMS_PREDEFINIDOS } from '../core/constants.js';
import { calcularTrailer } from '../core/calculations.js';
import { Home, Plus, Trash2, ChevronDown, ChevronUp, Settings, DollarSign, Calendar } from 'lucide-react';

const Trailers = ({ trailers, agregarTrailer, actualizarTrailer, eliminarTrailer, config, datosImportados, fmt }) => {
  const [exp, setExp] = useState({});
  const [modal, setModal] = useState(false);
  const [nuevoTipo, setNuevoTipo] = useState('Habitacional');
  const [nuevoAdq, setNuevoAdq] = useState('Disponible');

  const toggle = id => setExp(p => ({...p,[id]:!p[id]}));
  const upd = (id,c,v) => {
    actualizarTrailer(id,c,v);
    if(c==='inversionInicial'||c==='mesesAmortizacion') {
      const t = trailers.find(x => x.id===id);
      if(t) actualizarTrailer(id,'amortizacionMensual',((c==='inversionInicial'?v:t.inversionInicial)||0)/((c==='mesesAmortizacion'?v:t.mesesAmortizacion)||1));
    }
  };

  // V5.3 Punto 10.6: Trailers solo tienen Mantenimiento (NO Service)
  const addMant = (tid,it) => { 
    const t = trailers.find(x => x.id===tid); 
    if(t) actualizarTrailer(tid,'mantenimientoItems',[...(t.mantenimientoItems||[]),{id:Date.now(),descripcion:it.descripcion||it.Descripcion,precio:it.precioDefault||it.Precio||0,frecuenciaAnual:it.frecuenciaAnual||it.FrecuenciaAnual||1,incluir:true}]); 
  };
  const updMant = (tid,mantId,c,v) => { 
    const t = trailers.find(x => x.id===tid); 
    if(t) actualizarTrailer(tid,'mantenimientoItems',t.mantenimientoItems.map(mt => mt.id===mantId?{...mt,[c]:v}:mt)); 
  };
  const delMant = (tid,mantId) => { 
    const t = trailers.find(x => x.id===tid); 
    if(t) actualizarTrailer(tid,'mantenimientoItems',t.mantenimientoItems.filter(mt => mt.id!==mantId)); 
  };

  const handleAgregar = () => { agregarTrailer(nuevoTipo,nuevoAdq); setModal(false); };
  
  // Items importados para trailers
  const mantImp = datosImportados.mantenimientoTrailers || [];

  const Inp = ({v,onChange,type='text',className='',placeholder='',min,readOnly}) => (
    <input type={type} value={v} onChange={onChange} className={`px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-sm ${className}`} placeholder={placeholder} min={min} readOnly={readOnly}/>
  );
  const Sel = ({v,onChange,children,className=''}) => (
    <select value={v} onChange={onChange} className={`px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-sm ${className}`}>{children}</select>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Home size={20} className="text-purple-400"/> Trailers
        </h2>
        <button onClick={() => setModal(true)} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg flex items-center gap-2 text-sm">
          <Plus size={16}/> Agregar Trailer
        </button>
      </div>

      {/* Lista vacía */}
      {trailers.length === 0 && (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-8 text-center">
          <Home size={48} className="mx-auto text-slate-600 mb-4"/>
          <p className="text-slate-400 mb-4">No hay trailers agregados</p>
          <button onClick={() => setModal(true)} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm">
            Agregar Primer Trailer
          </button>
        </div>
      )}

      {/* Lista de trailers */}
      {trailers.map(t => {
        const calc = calcularTrailer(t, config.mkTrailers || 0);
        const isExp = exp[t.id];
        const tipoLabel = TIPOS_TRAILER.find(x => x.value === t.tipo)?.label || t.tipo;
        const adqLabel = TIPOS_ADQUISICION.find(a => a.value === t.adquisicion)?.label || t.adquisicion;

        return (
          <div key={t.id} className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
            {/* Header colapsable */}
            <div className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-700/30" onClick={() => toggle(t.id)}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center">
                  <Home size={18} className="text-purple-400"/>
                </div>
                <div>
                  <p className="font-medium">{tipoLabel} - {adqLabel}</p>
                  <p className="text-xs text-slate-400">
                    {t.descripcion || 'Sin descripción'}
                    {t.identificacion && ` • ID: ${t.identificacion}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-slate-400">Total</p>
                  <p className="font-bold text-emerald-400">{fmt(calc.total)}</p>
                </div>
                {isExp ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
              </div>
            </div>

            {/* Contenido expandido */}
            {isExp && (
              <div className="border-t border-slate-700 p-4 space-y-4">
                {/* Datos básicos */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Tipo</label>
                    <Sel v={t.tipo} onChange={e => upd(t.id, 'tipo', e.target.value)} className="w-full">
                      {TIPOS_TRAILER.map(x => <option key={x.value} value={x.value}>{x.label}</option>)}
                    </Sel>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Adquisición</label>
                    <Sel v={t.adquisicion} onChange={e => upd(t.id, 'adquisicion', e.target.value)} className="w-full">
                      {TIPOS_ADQUISICION.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                    </Sel>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Descripción</label>
                    <Inp v={t.descripcion || ''} onChange={e => upd(t.id, 'descripcion', e.target.value)} className="w-full" placeholder="Ej: Trailer 40 pies"/>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Identificación</label>
                    <Inp v={t.identificacion || ''} onChange={e => upd(t.id, 'identificacion', e.target.value)} className="w-full" placeholder="ID o código"/>
                  </div>
                </div>

                {/* Capacidad (para habitacionales/sanitarios) */}
                {(t.tipo === 'Habitacional' || t.tipo === 'Sanitario') && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Capacidad (personas)</label>
                      <Inp type="number" v={t.capacidad || 0} onChange={e => upd(t.id, 'capacidad', Number(e.target.value))} className="w-full" min="0"/>
                    </div>
                    {t.tipo === 'Habitacional' && (
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Camas</label>
                        <Inp type="number" v={t.camas || 0} onChange={e => upd(t.id, 'camas', Number(e.target.value))} className="w-full" min="0"/>
                      </div>
                    )}
                    {t.tipo === 'Sanitario' && (
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Baños</label>
                        <Inp type="number" v={t.banios || 0} onChange={e => upd(t.id, 'banios', Number(e.target.value))} className="w-full" min="0"/>
                      </div>
                    )}
                  </div>
                )}

                {/* Alquiler */}
                {t.adquisicion === 'Alquiler' && (
                  <div className="p-3 bg-cyan-900/20 rounded-lg border border-cyan-500/30">
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <DollarSign size={16}/> Datos de Alquiler
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Costo Alquiler Mensual</label>
                        <Inp type="number" v={t.costoAlquiler || 0} onChange={e => upd(t.id, 'costoAlquiler', Number(e.target.value))} className="w-full"/>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Proveedor</label>
                        <Inp v={t.proveedorAlquiler || ''} onChange={e => upd(t.id, 'proveedorAlquiler', e.target.value)} className="w-full" placeholder="Nombre proveedor"/>
                      </div>
                    </div>
                  </div>
                )}

                {/* Compra */}
                {t.adquisicion === 'Compra' && (
                  <div className="p-3 bg-purple-900/20 rounded-lg border border-purple-500/30">
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Calendar size={16}/> Datos de Compra / Amortización
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Inversión Inicial</label>
                        <Inp type="number" v={t.inversionInicial || 0} onChange={e => upd(t.id, 'inversionInicial', Number(e.target.value))} className="w-full"/>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Meses Amortización</label>
                        <Inp type="number" v={t.mesesAmortizacion || 12} onChange={e => upd(t.id, 'mesesAmortizacion', Number(e.target.value))} className="w-full" min="1"/>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Amortización Mensual</label>
                        <Inp v={fmt(t.amortizacionMensual || 0)} readOnly className="w-full bg-slate-600"/>
                      </div>
                    </div>
                  </div>
                )}

                {/* V5.3 Punto 10.6: Solo Mantenimiento (NO Service para Trailers) */}
                <div className="p-3 bg-amber-900/20 rounded-lg border border-amber-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Settings size={16}/> Mantenimiento 
                      <span className="text-xs text-slate-400">(ΣP×Q/12 = mensual)</span>
                    </h4>
                    <Sel v="" onChange={e => { 
                      if(e.target.value) { 
                        const it = MANTENIMIENTO_ITEMS_PREDEFINIDOS.find(i => i.descripcion === e.target.value) || mantImp.find(i => i.Descripcion === e.target.value); 
                        if(it) addMant(t.id, it); 
                        e.target.value = ''; 
                      }
                    }} className="text-xs">
                      <option value="">+ Agregar ítem</option>
                      <optgroup label="Predefinidos">
                        {MANTENIMIENTO_ITEMS_PREDEFINIDOS.map(i => <option key={i.descripcion} value={i.descripcion}>{i.descripcion}</option>)}
                      </optgroup>
                      {mantImp.length > 0 && (
                        <optgroup label="Importados">
                          {mantImp.map((i, idx) => <option key={idx} value={i.Descripcion}>{i.Descripcion}</option>)}
                        </optgroup>
                      )}
                    </Sel>
                  </div>

                  {(t.mantenimientoItems || []).length === 0 && (
                    <p className="text-xs text-slate-500 italic">Sin ítems de mantenimiento agregados</p>
                  )}

                  {(t.mantenimientoItems || []).map(mt => (
                    <div key={mt.id} className="flex items-center gap-2 p-2 bg-slate-700/50 rounded mb-1">
                      <input type="checkbox" checked={mt.incluir} onChange={e => updMant(t.id, mt.id, 'incluir', e.target.checked)} className="rounded"/>
                      <span className="text-sm flex-1">{mt.descripcion}</span>
                      <span className="text-xs text-slate-400">P:</span>
                      <Inp type="number" v={mt.precio} onChange={e => updMant(t.id, mt.id, 'precio', Number(e.target.value))} className="w-20 text-xs"/>
                      <span className="text-xs text-slate-400">Q:</span>
                      <Inp type="number" v={mt.frecuenciaAnual} onChange={e => updMant(t.id, mt.id, 'frecuenciaAnual', Number(e.target.value))} className="w-14 text-xs"/>
                      <span className="text-xs text-slate-400 w-16">{fmt((mt.precio * mt.frecuenciaAnual) / 12)}</span>
                      <button onClick={() => delMant(t.id, mt.id)} className="p-1 text-red-400 hover:text-red-300">
                        <Trash2 size={14}/>
                      </button>
                    </div>
                  ))}

                  <div className="mt-2 text-right text-sm">
                    <span className="text-slate-400">Costo Mantenimiento Mensual: </span>
                    <span className="text-amber-400 font-medium">{fmt(calc.costoMantenimiento)}</span>
                  </div>
                </div>

                {/* Incluir en CTC y Markup */}
                <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={t.incluirCTC !== false} onChange={e => upd(t.id, 'incluirCTC', e.target.checked)} className="rounded"/>
                    Incluir en Costo Total Compañía
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">Markup:</span>
                    <Inp type="number" v={t.mkLinea || 0} onChange={e => upd(t.id, 'mkLinea', Number(e.target.value))} className="w-20"/>
                    <span className="text-sm text-slate-400">%</span>
                  </div>
                </div>

                {/* Eliminar */}
                <div className="flex justify-end">
                  <button onClick={() => eliminarTrailer(t.id)} className="px-3 py-1 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded text-sm flex items-center gap-1">
                    <Trash2 size={14}/> Eliminar Trailer
                  </button>
                </div>

                {/* Resumen Costos - V5.3: Trailers solo Base + Mantenimiento (sin Service) */}
                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-700 text-sm">
                  <div className="text-center p-2 bg-slate-700/30 rounded">
                    <p className="text-slate-400 text-xs">Base</p>
                    <p className="font-medium">{fmt(calc.costoBase)}</p>
                  </div>
                  <div className="text-center p-2 bg-amber-600/20 rounded">
                    <p className="text-amber-300 text-xs">Mantenimiento</p>
                    <p className="font-medium">{fmt(calc.costoMantenimiento)}</p>
                  </div>
                  <div className="text-center p-2 bg-emerald-600/20 rounded">
                    <p className="text-emerald-300 text-xs">Total</p>
                    <p className="font-bold text-emerald-400">{fmt(calc.total)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Modal Agregar */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md">
            <div className="p-4 border-b border-slate-700">
              <h3 className="font-bold">Agregar Trailer</h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Tipo de Trailer</label>
                <Sel v={nuevoTipo} onChange={e => setNuevoTipo(e.target.value)} className="w-full">
                  {TIPOS_TRAILER.map(x => <option key={x.value} value={x.value}>{x.label}</option>)}
                </Sel>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Tipo de Adquisición</label>
                <Sel v={nuevoAdq} onChange={e => setNuevoAdq(e.target.value)} className="w-full">
                  {TIPOS_ADQUISICION.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                </Sel>
              </div>
            </div>
            <div className="p-4 border-t border-slate-700 flex justify-end gap-2">
              <button onClick={() => setModal(false)} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg text-sm">Cancelar</button>
              <button onClick={handleAgregar} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm">Agregar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trailers;
