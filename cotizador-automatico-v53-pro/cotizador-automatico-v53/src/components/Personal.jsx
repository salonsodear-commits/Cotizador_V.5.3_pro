/**
 * SISTEMA DE COTIZACIÓN V5.3 PRO
 * Personal.jsx - Sección Personal
 * V5.3: Puntos 1,2,3,4,5,6,7
 */

import React, { useState } from 'react';
import { TIPOS_CONTRATO, CONVENIOS, DIAGRAMAS, HORAS_POR_DIA_OPCIONES, CATEGORIAS_POR_CONVENIO, PUESTOS_POR_CATEGORIA, TIPOS_HORA_EXTRA, ITEMS_ADICIONALES_PREDEFINIDOS, CAPACITACIONES_PREDEFINIDAS, TEXTOS } from '../core/constants.js';
import { debeMostrarConvenio, esPuestoLibre, debeMostrarCostoConvalidado } from '../core/logic.js';
import { calcularPersonal } from '../core/calculations.js';
import { Users, Plus, Trash2, ChevronDown, ChevronUp, Clock, Briefcase, Coffee, BookOpen, Info } from 'lucide-react';

const Personal = ({ personal, agregarPersonal, actualizarPersonal, eliminarPersonal, config, datosImportados, fmt }) => {
  const [exp, setExp] = useState({});
  const toggle = (id) => setExp(p => ({...p, [id]: !p[id]}));

  const upd = (id, c, v) => {
    const p = personal.find(x => x.id === id);
    if (!p) return;
    if (c === 'tipoContrato') {
      if (v === 'MT' || v === 'FUCO') { actualizarPersonal(id, 'convenio', ''); actualizarPersonal(id, 'categoria', ''); actualizarPersonal(id, 'puesto', ''); actualizarPersonal(id, 'diagrama', 'Manual'); }
      else actualizarPersonal(id, 'convenio', 'FATSA');
    }
    if (c === 'convenio') { actualizarPersonal(id, 'categoria', ''); actualizarPersonal(id, 'puesto', ''); }
    if (c === 'categoria') actualizarPersonal(id, 'puesto', '');
    if ((c === 'puesto' || c === 'tipoContrato') && (p.tipoContrato === 'MT' || p.tipoContrato === 'FUCO' || v === 'MT' || v === 'FUCO')) {
      const prov = config.provinciaSeleccionada, puesto = c === 'puesto' ? v : p.puesto;
      if (prov && puesto && datosImportados.monotributistas?.length > 0) {
        const f = datosImportados.monotributistas.find(m => m.Provincia === prov && m.Puesto === puesto);
        if (f?.Valor_Sugerido) setTimeout(() => actualizarPersonal(id, 'valorHora', f.Valor_Sugerido), 0);
      }
    }
    actualizarPersonal(id, c, v);
  };

  const addItem = (pid, it) => { const p = personal.find(x => x.id === pid); if(p) actualizarPersonal(pid, 'itemsAdicionales', [...(p.itemsAdicionales||[]), {id:Date.now(), descripcion:it.descripcion||it.Descripcion, precio:it.precioDefault||it.P||0, cantidad:1, mkInd:0, incluirCTC:true}]); };
  const updItem = (pid, iid, c, v) => { const p = personal.find(x => x.id === pid); if(p) actualizarPersonal(pid, 'itemsAdicionales', p.itemsAdicionales.map(i => i.id===iid ? {...i,[c]:v} : i)); };
  const delItem = (pid, iid) => { const p = personal.find(x => x.id === pid); if(p) actualizarPersonal(pid, 'itemsAdicionales', p.itemsAdicionales.filter(i => i.id!==iid)); };

  const addCap = (pid, cp) => { const p = personal.find(x => x.id === pid); if(p) actualizarPersonal(pid, 'capacitaciones', [...(p.capacitaciones||[]), {id:Date.now(), descripcion:cp.descripcion||cp.Descripcion, precio:cp.precioDefault||cp.P||0, cantidad:1, duracionHoras:cp.duracionHoras||0, mkInd:0, incluirCTC:true}]); };
  const updCap = (pid, cid, c, v) => { const p = personal.find(x => x.id === pid); if(p) actualizarPersonal(pid, 'capacitaciones', p.capacitaciones.map(x => x.id===cid ? {...x,[c]:v} : x)); };
  const delCap = (pid, cid) => { const p = personal.find(x => x.id === pid); if(p) actualizarPersonal(pid, 'capacitaciones', p.capacitaciones.filter(x => x.id!==cid)); };

  const addHE = (pid) => { const p = personal.find(x => x.id === pid); if(p) actualizarPersonal(pid, 'horasExtra', [...(p.horasExtra||[]), {id:Date.now(), tipo:'HE50', cantidad:0, mkInd:0, incluirCTC:true}]); };
  const updHE = (pid, hid, c, v) => { const p = personal.find(x => x.id === pid); if(p) actualizarPersonal(pid, 'horasExtra', p.horasExtra.map(h => h.id===hid ? {...h,[c]:v} : h)); };
  const delHE = (pid, hid) => { const p = personal.find(x => x.id === pid); if(p) actualizarPersonal(pid, 'horasExtra', p.horasExtra.filter(h => h.id!==hid)); };

  const updVianda = (pid, tipo, inc) => { const p = personal.find(x => x.id === pid); if(p) actualizarPersonal(pid, 'viandasPetrolero', p.viandasPetrolero.map(v => v.tipo===tipo ? {...v,incluir:inc} : v)); };

  const Inp = ({v,onChange,type='text',className='',placeholder='',min,max,disabled,readOnly}) => <input type={type} value={v} onChange={onChange} className={`px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-sm ${className}`} placeholder={placeholder} min={min} max={max} disabled={disabled} readOnly={readOnly}/>;
  const Sel = ({v,onChange,children,disabled,className=''}) => <select value={v} onChange={onChange} disabled={disabled} className={`px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-sm ${className}`}>{children}</select>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center gap-2"><Users size={20} className="text-blue-400"/> Personal</h2>
        <button onClick={agregarPersonal} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg flex items-center gap-2 text-sm"><Plus size={16}/> Agregar</button>
      </div>

      {personal.length === 0 && (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-8 text-center">
          <Users size={48} className="mx-auto text-slate-600 mb-4"/><p className="text-slate-400 mb-4">No hay personal</p>
          <button onClick={agregarPersonal} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm">Agregar</button>
        </div>
      )}

      {personal.map(p => {
        const calc = calcularPersonal(p, datosImportados.sueldos, config.mkPersonal||0);
        const isExp = exp[p.id], mConv = debeMostrarConvenio(p.tipoContrato), pLibre = esPuestoLibre(p.tipoContrato), mConv2 = debeMostrarCostoConvalidado(p.tipoContrato);
        return (
          <div key={p.id} className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
            <div className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-700/30" onClick={() => toggle(p.id)}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center"><Users size={18} className="text-blue-400"/></div>
                <div>
                  <p className="font-medium">{TIPOS_CONTRATO.find(t => t.value===p.tipoContrato)?.label}{mConv && p.convenio && ` - ${p.convenio}`}{p.categoria && ` / ${p.categoria}`}{p.puesto && ` / ${p.puesto}`}</p>
                  <p className="text-xs text-slate-400">{DIAGRAMAS.find(d => d.value===p.diagrama)?.label} • {p.horasPorDia==='manual'?p.horasManuales:p.horasPorDia}h/día • {calc.horasMes}h/mes</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right"><p className="text-xs text-slate-400">Total</p><p className="font-bold text-emerald-400">{fmt(calc.total)}</p></div>
                {isExp ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
              </div>
            </div>

            {isExp && (
              <div className="border-t border-slate-700 p-4 space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div><label className="block text-xs text-slate-400 mb-1">Tipo Contrato</label><Sel v={p.tipoContrato} onChange={e => upd(p.id,'tipoContrato',e.target.value)} className="w-full">{TIPOS_CONTRATO.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</Sel></div>
                  {mConv && (<>
                    <div><label className="block text-xs text-slate-400 mb-1">Convenio</label><Sel v={p.convenio||''} onChange={e => upd(p.id,'convenio',e.target.value)} className="w-full"><option value="">Seleccionar</option>{CONVENIOS.map(c => <option key={c} value={c}>{c}</option>)}</Sel></div>
                    <div><label className="block text-xs text-slate-400 mb-1">Categoría</label><Sel v={p.categoria||''} onChange={e => upd(p.id,'categoria',e.target.value)} disabled={!p.convenio} className="w-full"><option value="">Seleccionar</option>{(CATEGORIAS_POR_CONVENIO[p.convenio]||[]).map(c => <option key={c} value={c}>{c}</option>)}</Sel></div>
                    <div><label className="block text-xs text-slate-400 mb-1">Puesto</label><Sel v={p.puesto||''} onChange={e => upd(p.id,'puesto',e.target.value)} disabled={!p.categoria} className="w-full"><option value="">Seleccionar</option>{(PUESTOS_POR_CATEGORIA[p.categoria]||[]).map(pu => <option key={pu} value={pu}>{pu}</option>)}</Sel></div>
                  </>)}
                  {pLibre && (<>
                    <div><label className="block text-xs text-slate-400 mb-1">Puesto</label><Inp v={p.puesto||''} onChange={e => upd(p.id,'puesto',e.target.value)} className="w-full" placeholder="Ej: Enfermero"/></div>
                    <div><label className="block text-xs text-slate-400 mb-1">Valor Hora</label><Inp type="number" v={p.valorHora||0} onChange={e => upd(p.id,'valorHora',Number(e.target.value))} className="w-full"/></div>
                  </>)}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div><label className="block text-xs text-slate-400 mb-1">Diagrama</label><Sel v={p.diagrama} onChange={e => upd(p.id,'diagrama',e.target.value)} className="w-full">{DIAGRAMAS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}</Sel></div>
                  <div><label className="block text-xs text-slate-400 mb-1">Horas/Día</label><Sel v={p.horasPorDia} onChange={e => upd(p.id,'horasPorDia',e.target.value==='manual'?'manual':Number(e.target.value))} className="w-full">{HORAS_POR_DIA_OPCIONES.map(h => <option key={h.value} value={h.value}>{h.label}</option>)}</Sel></div>
                  {(p.diagrama==='Manual'||p.horasPorDia==='manual') && <div><label className="block text-xs text-slate-400 mb-1">Horas Manual</label><Inp type="number" v={p.horasManuales||0} onChange={e => upd(p.id,'horasManuales',Number(e.target.value))} className="w-full"/></div>}
                  <div><label className="block text-xs text-slate-400 mb-1">Horas/Mes</label><Inp v={calc.horasMes} readOnly className="w-full bg-slate-600"/></div>
                </div>

                {p.tipoContrato==='FUCO' && mConv2 && (
                  <div className="flex items-center gap-4 p-3 bg-purple-900/20 rounded-lg border border-purple-500/30">
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={p.incluyeConvalidado||false} onChange={e => upd(p.id,'incluyeConvalidado',e.target.checked)} className="rounded"/> Incluye Convalidado</label>
                    {p.incluyeConvalidado && <><span className="text-sm text-slate-400">Costo:</span><Inp type="number" v={p.costoConvalidado||0} onChange={e => upd(p.id,'costoConvalidado',Number(e.target.value))} className="w-32"/></>}
                  </div>
                )}

                {p.tipoContrato==='RD' && p.convenio==='FATSA' && (
                  <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-500/30">
                    <h4 className="text-sm font-medium mb-2">Adicionales FATSA</h4>
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={p.adicionalEnfermeria||false} onChange={e => upd(p.id,'adicionalEnfermeria',e.target.checked)} className="rounded"/> Adicional Enfermería (+10%)</label>
                      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={p.plusNocturno||false} onChange={e => upd(p.id,'plusNocturno',e.target.checked)} className="rounded"/> Plus Nocturno (+15%) <span className="text-xs text-slate-400 flex items-center gap-1"><Info size={12}/>{TEXTOS.plusNocturno}</span></label>
                      <div className="flex items-center gap-2"><span className="text-sm">Antigüedad:</span><Inp type="number" v={p.antiguedadAnios||0} onChange={e => upd(p.id,'antiguedadAnios',Number(e.target.value))} className="w-16"/><span className="text-xs text-slate-400">años</span></div>
                    </div>
                  </div>
                )}

                {p.tipoContrato==='RD' && p.convenio==='Petrolero' && (
                  <div className="p-3 bg-amber-900/20 rounded-lg border border-amber-500/30">
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2"><Coffee size={16}/> Viandas Petrolero</h4>
                    <div className="flex gap-4">{(p.viandasPetrolero||[]).map(v => <label key={v.tipo} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={v.incluir} onChange={e => updVianda(p.id,v.tipo,e.target.checked)} className="rounded"/> {v.tipo}</label>)}</div>
                  </div>
                )}

                <div className="p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium flex items-center gap-2"><Briefcase size={16}/> Ítems Adicionales</h4>
                    <Sel v="" onChange={e => { if(e.target.value) { const it = ITEMS_ADICIONALES_PREDEFINIDOS.find(i => i.descripcion===e.target.value) || datosImportados.itemsAdicionales?.find(i => i.Descripcion===e.target.value); if(it) addItem(p.id, it); e.target.value=''; }}} className="text-xs"><option value="">+ Agregar</option>{ITEMS_ADICIONALES_PREDEFINIDOS.map(i => <option key={i.descripcion} value={i.descripcion}>{i.descripcion}</option>)}{datosImportados.itemsAdicionales?.map((i,x) => <option key={x} value={i.Descripcion}>{i.Descripcion}</option>)}</Sel>
                  </div>
                  {(p.itemsAdicionales||[]).map(i => <div key={i.id} className="flex items-center gap-2 p-2 bg-slate-700/50 rounded mb-1"><span className="text-sm flex-1">{i.descripcion}</span><Inp type="number" v={i.precio} onChange={e => updItem(p.id,i.id,'precio',Number(e.target.value))} className="w-24 text-xs"/><Inp type="number" v={i.cantidad} onChange={e => updItem(p.id,i.id,'cantidad',Number(e.target.value))} className="w-16 text-xs"/><label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={i.incluirCTC} onChange={e => updItem(p.id,i.id,'incluirCTC',e.target.checked)} className="rounded"/>CTC</label><button onClick={() => delItem(p.id,i.id)} className="p-1 text-red-400"><Trash2 size={14}/></button></div>)}
                </div>

                <div className="p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium flex items-center gap-2"><BookOpen size={16}/> Capacitaciones</h4>
                    <Sel v="" onChange={e => { if(e.target.value) { const cp = CAPACITACIONES_PREDEFINIDAS.find(c => c.descripcion===e.target.value) || datosImportados.capacitaciones?.find(c => c.Descripcion===e.target.value); if(cp) addCap(p.id, cp); e.target.value=''; }}} className="text-xs"><option value="">+ Agregar</option>{CAPACITACIONES_PREDEFINIDAS.map(c => <option key={c.descripcion} value={c.descripcion}>{c.descripcion}</option>)}{datosImportados.capacitaciones?.map((c,x) => <option key={x} value={c.Descripcion}>{c.Descripcion}</option>)}</Sel>
                  </div>
                  {(p.capacitaciones||[]).map(c => <div key={c.id} className="flex items-center gap-2 p-2 bg-slate-700/50 rounded mb-1"><span className="text-sm flex-1">{c.descripcion}</span><Inp type="number" v={c.precio} onChange={e => updCap(p.id,c.id,'precio',Number(e.target.value))} className="w-24 text-xs"/><Inp type="number" v={c.cantidad} onChange={e => updCap(p.id,c.id,'cantidad',Number(e.target.value))} className="w-16 text-xs"/><label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={c.incluirCTC} onChange={e => updCap(p.id,c.id,'incluirCTC',e.target.checked)} className="rounded"/>CTC</label><button onClick={() => delCap(p.id,c.id)} className="p-1 text-red-400"><Trash2 size={14}/></button></div>)}
                </div>

                <div className="p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2"><h4 className="text-sm font-medium flex items-center gap-2"><Clock size={16}/> Horas Extra</h4><button onClick={() => addHE(p.id)} className="px-2 py-1 bg-slate-600 hover:bg-slate-500 rounded text-xs flex items-center gap-1"><Plus size={12}/> Agregar</button></div>
                  {(p.horasExtra||[]).map(h => <div key={h.id} className="flex items-center gap-2 p-2 bg-slate-700/50 rounded mb-1"><Sel v={h.tipo} onChange={e => updHE(p.id,h.id,'tipo',e.target.value)} className="text-xs">{TIPOS_HORA_EXTRA.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</Sel><Inp type="number" v={h.cantidad} onChange={e => updHE(p.id,h.id,'cantidad',Number(e.target.value))} className="w-20 text-xs"/><label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={h.incluirCTC} onChange={e => updHE(p.id,h.id,'incluirCTC',e.target.checked)} className="rounded"/>CTC</label><button onClick={() => delHE(p.id,h.id)} className="p-1 text-red-400"><Trash2 size={14}/></button></div>)}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                  <div className="flex items-center gap-2"><span className="text-sm text-slate-400">Markup:</span><Inp type="number" v={p.mkLinea||0} onChange={e => upd(p.id,'mkLinea',Number(e.target.value))} className="w-20"/><span className="text-sm text-slate-400">%</span></div>
                  <button onClick={() => eliminarPersonal(p.id)} className="px-3 py-1 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded text-sm flex items-center gap-1"><Trash2 size={14}/> Eliminar</button>
                </div>

                <div className="grid grid-cols-4 gap-3 pt-3 border-t border-slate-700 text-sm">
                  <div className="text-center p-2 bg-slate-700/30 rounded"><p className="text-slate-400 text-xs">Base</p><p className="font-medium">{fmt(calc.costoBase)}</p></div>
                  <div className="text-center p-2 bg-slate-700/30 rounded"><p className="text-slate-400 text-xs">Viandas</p><p className="font-medium">{fmt(calc.costoViandas)}</p></div>
                  <div className="text-center p-2 bg-slate-700/30 rounded"><p className="text-slate-400 text-xs">Items+Caps</p><p className="font-medium">{fmt(calc.costoItemsAdicionales+calc.costoCapacitaciones)}</p></div>
                  <div className="text-center p-2 bg-emerald-600/20 rounded"><p className="text-emerald-300 text-xs">Total</p><p className="font-bold text-emerald-400">{fmt(calc.total)}</p></div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Personal;
