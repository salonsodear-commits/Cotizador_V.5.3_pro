/**
 * SISTEMA DE COTIZACIÓN V5.3 PRO
 * Moviles.jsx - V5.3 Punto 10: Service + Mantenimiento obligatorios
 */

import React, { useState } from 'react';
import { TIPOS_MOVIL, TIPOS_ADQUISICION, SERVICE_ITEMS_PREDEFINIDOS, MANTENIMIENTO_ITEMS_PREDEFINIDOS } from '../core/constants.js';
import { calcularMovil } from '../core/calculations.js';
import { Truck, Plus, Trash2, ChevronDown, ChevronUp, Wrench, Settings, DollarSign, Calendar } from 'lucide-react';

const Moviles = ({ moviles, agregarMovil, actualizarMovil, eliminarMovil, config, datosImportados, fmt }) => {
  const [exp, setExp] = useState({});
  const [modal, setModal] = useState(false);
  const [nuevoTipo, setNuevoTipo] = useState('Camioneta');
  const [nuevoAdq, setNuevoAdq] = useState('Disponible');

  const toggle = id => setExp(p => ({...p,[id]:!p[id]}));
  const upd = (id,c,v) => {
    actualizarMovil(id,c,v);
    if(c==='inversionInicial'||c==='mesesAmortizacion') {
      const m = moviles.find(x => x.id===id);
      if(m) actualizarMovil(id,'amortizacionMensual',((c==='inversionInicial'?v:m.inversionInicial)||0)/((c==='mesesAmortizacion'?v:m.mesesAmortizacion)||1));
    }
  };

  const addService = (mid,it) => { const m = moviles.find(x => x.id===mid); if(m) actualizarMovil(mid,'serviceItems',[...(m.serviceItems||[]),{id:Date.now(),descripcion:it.descripcion||it.Descripcion,precio:it.precioDefault||it.Precio||0,frecuenciaAnual:it.frecuenciaAnual||it.FrecuenciaAnual||1,incluir:true}]); };
  const updService = (mid,sid,c,v) => { const m = moviles.find(x => x.id===mid); if(m) actualizarMovil(mid,'serviceItems',m.serviceItems.map(s => s.id===sid?{...s,[c]:v}:s)); };
  const delService = (mid,sid) => { const m = moviles.find(x => x.id===mid); if(m) actualizarMovil(mid,'serviceItems',m.serviceItems.filter(s => s.id!==sid)); };

  const addMant = (mid,it) => { const m = moviles.find(x => x.id===mid); if(m) actualizarMovil(mid,'mantenimientoItems',[...(m.mantenimientoItems||[]),{id:Date.now(),descripcion:it.descripcion||it.Descripcion,precio:it.precioDefault||it.Precio||0,frecuenciaAnual:it.frecuenciaAnual||it.FrecuenciaAnual||1,incluir:true}]); };
  const updMant = (mid,mantId,c,v) => { const m = moviles.find(x => x.id===mid); if(m) actualizarMovil(mid,'mantenimientoItems',m.mantenimientoItems.map(mt => mt.id===mantId?{...mt,[c]:v}:mt)); };
  const delMant = (mid,mantId) => { const m = moviles.find(x => x.id===mid); if(m) actualizarMovil(mid,'mantenimientoItems',m.mantenimientoItems.filter(mt => mt.id!==mantId)); };

  const handleAgregar = () => { agregarMovil(nuevoTipo,nuevoAdq); setModal(false); };
  const svcImp = datosImportados.serviceMoviles||[], mantImp = datosImportados.mantenimientoMoviles||[];

  const Inp = ({v,onChange,type='text',className='',placeholder='',min,readOnly}) => <input type={type} value={v} onChange={onChange} className={`px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-sm ${className}`} placeholder={placeholder} min={min} readOnly={readOnly}/>;
  const Sel = ({v,onChange,children,className=''}) => <select value={v} onChange={onChange} className={`px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-sm ${className}`}>{children}</select>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center gap-2"><Truck size={20} className="text-orange-400"/> Móviles</h2>
        <button onClick={() => setModal(true)} className="px-4 py-2 bg-orange-600 hover:bg-orange-500 rounded-lg flex items-center gap-2 text-sm"><Plus size={16}/> Agregar</button>
      </div>

      {moviles.length===0 && (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-8 text-center">
          <Truck size={48} className="mx-auto text-slate-600 mb-4"/><p className="text-slate-400 mb-4">No hay móviles</p>
          <button onClick={() => setModal(true)} className="px-4 py-2 bg-orange-600 hover:bg-orange-500 rounded-lg text-sm">Agregar</button>
        </div>
      )}

      {moviles.map(m => {
        const calc = calcularMovil(m,config.mkMoviles||0), isExp = exp[m.id];
        return (
          <div key={m.id} className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
            <div className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-700/30" onClick={() => toggle(m.id)}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-600/20 flex items-center justify-center"><Truck size={18} className="text-orange-400"/></div>
                <div><p className="font-medium">{m.tipo} - {TIPOS_ADQUISICION.find(a => a.value===m.adquisicion)?.label}</p><p className="text-xs text-slate-400">{m.descripcion||'Sin descripción'}{m.dominio && ` • ${m.dominio}`}</p></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right"><p className="text-xs text-slate-400">Total</p><p className="font-bold text-emerald-400">{fmt(calc.total)}</p></div>
                {isExp?<ChevronUp size={20}/>:<ChevronDown size={20}/>}
              </div>
            </div>

            {isExp && (
              <div className="border-t border-slate-700 p-4 space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div><label className="block text-xs text-slate-400 mb-1">Tipo</label><Sel v={m.tipo} onChange={e => upd(m.id,'tipo',e.target.value)} className="w-full">{TIPOS_MOVIL.map(t => <option key={t} value={t}>{t}</option>)}</Sel></div>
                  <div><label className="block text-xs text-slate-400 mb-1">Adquisición</label><Sel v={m.adquisicion} onChange={e => upd(m.id,'adquisicion',e.target.value)} className="w-full">{TIPOS_ADQUISICION.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}</Sel></div>
                  <div><label className="block text-xs text-slate-400 mb-1">Descripción</label><Inp v={m.descripcion||''} onChange={e => upd(m.id,'descripcion',e.target.value)} className="w-full"/></div>
                  <div><label className="block text-xs text-slate-400 mb-1">Dominio</label><Inp v={m.dominio||''} onChange={e => upd(m.id,'dominio',e.target.value)} className="w-full"/></div>
                </div>

                {m.adquisicion==='Alquiler' && (
                  <div className="p-3 bg-cyan-900/20 rounded-lg border border-cyan-500/30">
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2"><DollarSign size={16}/> Alquiler</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="block text-xs text-slate-400 mb-1">Costo Mensual</label><Inp type="number" v={m.costoAlquiler||0} onChange={e => upd(m.id,'costoAlquiler',Number(e.target.value))} className="w-full"/></div>
                      <div><label className="block text-xs text-slate-400 mb-1">Proveedor</label><Inp v={m.proveedorAlquiler||''} onChange={e => upd(m.id,'proveedorAlquiler',e.target.value)} className="w-full"/></div>
                    </div>
                  </div>
                )}

                {m.adquisicion==='Compra' && (
                  <div className="p-3 bg-purple-900/20 rounded-lg border border-purple-500/30">
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2"><Calendar size={16}/> Compra/Amortización</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div><label className="block text-xs text-slate-400 mb-1">Inversión</label><Inp type="number" v={m.inversionInicial||0} onChange={e => upd(m.id,'inversionInicial',Number(e.target.value))} className="w-full"/></div>
                      <div><label className="block text-xs text-slate-400 mb-1">Meses</label><Inp type="number" v={m.mesesAmortizacion||12} onChange={e => upd(m.id,'mesesAmortizacion',Number(e.target.value))} className="w-full" min="1"/></div>
                      <div><label className="block text-xs text-slate-400 mb-1">Amort/Mes</label><Inp v={fmt(m.amortizacionMensual||0)} readOnly className="w-full bg-slate-600"/></div>
                    </div>
                  </div>
                )}

                {/* Service */}
                <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium flex items-center gap-2"><Wrench size={16}/> Service <span className="text-xs text-slate-400">(ΣP×Q/12)</span></h4>
                    <Sel v="" onChange={e => { if(e.target.value) { const it = SERVICE_ITEMS_PREDEFINIDOS.find(i => i.descripcion===e.target.value) || svcImp.find(i => i.Descripcion===e.target.value); if(it) addService(m.id,it); e.target.value=''; }}} className="text-xs">
                      <option value="">+ Agregar</option>
                      {SERVICE_ITEMS_PREDEFINIDOS.map(i => <option key={i.descripcion} value={i.descripcion}>{i.descripcion}</option>)}
                      {svcImp.map((i,x) => <option key={x} value={i.Descripcion}>{i.Descripcion}</option>)}
                    </Sel>
                  </div>
                  {(m.serviceItems||[]).map(s => (
                    <div key={s.id} className="flex items-center gap-2 p-2 bg-slate-700/50 rounded mb-1">
                      <input type="checkbox" checked={s.incluir} onChange={e => updService(m.id,s.id,'incluir',e.target.checked)} className="rounded"/>
                      <span className="text-sm flex-1">{s.descripcion}</span>
                      <span className="text-xs text-slate-400">P:</span><Inp type="number" v={s.precio} onChange={e => updService(m.id,s.id,'precio',Number(e.target.value))} className="w-20 text-xs"/>
                      <span className="text-xs text-slate-400">Q:</span><Inp type="number" v={s.frecuenciaAnual} onChange={e => updService(m.id,s.id,'frecuenciaAnual',Number(e.target.value))} className="w-14 text-xs"/>
                      <span className="text-xs text-slate-400 w-16">{fmt((s.precio*s.frecuenciaAnual)/12)}</span>
                      <button onClick={() => delService(m.id,s.id)} className="p-1 text-red-400"><Trash2 size={14}/></button>
                    </div>
                  ))}
                  <div className="mt-2 text-right text-sm"><span className="text-slate-400">Total: </span><span className="text-blue-400 font-medium">{fmt(calc.costoService)}</span></div>
                </div>

                {/* Mantenimiento */}
                <div className="p-3 bg-amber-900/20 rounded-lg border border-amber-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium flex items-center gap-2"><Settings size={16}/> Mantenimiento <span className="text-xs text-slate-400">(ΣP×Q/12)</span></h4>
                    <Sel v="" onChange={e => { if(e.target.value) { const it = MANTENIMIENTO_ITEMS_PREDEFINIDOS.find(i => i.descripcion===e.target.value) || mantImp.find(i => i.Descripcion===e.target.value); if(it) addMant(m.id,it); e.target.value=''; }}} className="text-xs">
                      <option value="">+ Agregar</option>
                      {MANTENIMIENTO_ITEMS_PREDEFINIDOS.map(i => <option key={i.descripcion} value={i.descripcion}>{i.descripcion}</option>)}
                      {mantImp.map((i,x) => <option key={x} value={i.Descripcion}>{i.Descripcion}</option>)}
                    </Sel>
                  </div>
                  {(m.mantenimientoItems||[]).map(mt => (
                    <div key={mt.id} className="flex items-center gap-2 p-2 bg-slate-700/50 rounded mb-1">
                      <input type="checkbox" checked={mt.incluir} onChange={e => updMant(m.id,mt.id,'incluir',e.target.checked)} className="rounded"/>
                      <span className="text-sm flex-1">{mt.descripcion}</span>
                      <span className="text-xs text-slate-400">P:</span><Inp type="number" v={mt.precio} onChange={e => updMant(m.id,mt.id,'precio',Number(e.target.value))} className="w-20 text-xs"/>
                      <span className="text-xs text-slate-400">Q:</span><Inp type="number" v={mt.frecuenciaAnual} onChange={e => updMant(m.id,mt.id,'frecuenciaAnual',Number(e.target.value))} className="w-14 text-xs"/>
                      <span className="text-xs text-slate-400 w-16">{fmt((mt.precio*mt.frecuenciaAnual)/12)}</span>
                      <button onClick={() => delMant(m.id,mt.id)} className="p-1 text-red-400"><Trash2 size={14}/></button>
                    </div>
                  ))}
                  <div className="mt-2 text-right text-sm"><span className="text-slate-400">Total: </span><span className="text-amber-400 font-medium">{fmt(calc.costoMantenimiento)}</span></div>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={m.incluirCTC!==false} onChange={e => upd(m.id,'incluirCTC',e.target.checked)} className="rounded"/> Incluir en CTC</label>
                  <div className="flex items-center gap-2"><span className="text-sm text-slate-400">Markup:</span><Inp type="number" v={m.mkLinea||0} onChange={e => upd(m.id,'mkLinea',Number(e.target.value))} className="w-20"/><span className="text-sm text-slate-400">%</span></div>
                </div>

                <div className="flex justify-end"><button onClick={() => eliminarMovil(m.id)} className="px-3 py-1 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded text-sm flex items-center gap-1"><Trash2 size={14}/> Eliminar</button></div>

                <div className="grid grid-cols-4 gap-3 pt-3 border-t border-slate-700 text-sm">
                  <div className="text-center p-2 bg-slate-700/30 rounded"><p className="text-slate-400 text-xs">Base</p><p className="font-medium">{fmt(calc.costoBase)}</p></div>
                  <div className="text-center p-2 bg-blue-600/20 rounded"><p className="text-blue-300 text-xs">Service</p><p className="font-medium">{fmt(calc.costoService)}</p></div>
                  <div className="text-center p-2 bg-amber-600/20 rounded"><p className="text-amber-300 text-xs">Mant.</p><p className="font-medium">{fmt(calc.costoMantenimiento)}</p></div>
                  <div className="text-center p-2 bg-emerald-600/20 rounded"><p className="text-emerald-300 text-xs">Total</p><p className="font-bold text-emerald-400">{fmt(calc.total)}</p></div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md">
            <div className="p-4 border-b border-slate-700"><h3 className="font-bold">Agregar Móvil</h3></div>
            <div className="p-4 space-y-4">
              <div><label className="block text-sm text-slate-400 mb-1">Tipo</label><Sel v={nuevoTipo} onChange={e => setNuevoTipo(e.target.value)} className="w-full">{TIPOS_MOVIL.map(t => <option key={t} value={t}>{t}</option>)}</Sel></div>
              <div><label className="block text-sm text-slate-400 mb-1">Adquisición</label><Sel v={nuevoAdq} onChange={e => setNuevoAdq(e.target.value)} className="w-full">{TIPOS_ADQUISICION.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}</Sel></div>
            </div>
            <div className="p-4 border-t border-slate-700 flex justify-end gap-2">
              <button onClick={() => setModal(false)} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg text-sm">Cancelar</button>
              <button onClick={handleAgregar} className="px-4 py-2 bg-orange-600 hover:bg-orange-500 rounded-lg text-sm">Agregar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Moviles;
