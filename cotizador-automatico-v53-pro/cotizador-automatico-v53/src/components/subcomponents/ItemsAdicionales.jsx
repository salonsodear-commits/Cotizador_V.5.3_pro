/**
 * SISTEMA DE COTIZACIÓN V5.3 PRO
 * ItemsAdicionales.jsx - Gestión de ítems adicionales
 * Importación desde archivo soporte, edición P/Q, checkbox incluir, cálculos integrados
 */

import React, { useState, useMemo } from 'react';
import { ITEMS_ADICIONALES_PREDEFINIDOS } from '../core/constants.js';
import { Package, Plus, Trash2, Edit2, Save, X, FileSpreadsheet, AlertCircle } from 'lucide-react';

const ItemsAdicionales = ({
  items = [], onAdd, onUpdate, onDelete, datosImportados = {},
  provinciaSeleccionada = '', convenio = '', categoria = '',
  fmt = (n) => `$${(n||0).toLocaleString('es-AR')}`, compact = false
}) => {
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [nuevo, setNuevo] = useState({ codigo:'', descripcion:'', precio:0, cantidad:1, observaciones:'', incluir:true, incluirCTC:true });

  // Items importados filtrados
  const itemsImp = useMemo(() => {
    if (!datosImportados.itemsAdicionales?.length) return [];
    return datosImportados.itemsAdicionales.filter(i => {
      if (i.Provincia && provinciaSeleccionada && i.Provincia !== provinciaSeleccionada) return false;
      if (i.Categoria && categoria && i.Categoria !== categoria) return false;
      if (i.Convenio && convenio && i.Convenio !== convenio) return false;
      return true;
    });
  }, [datosImportados.itemsAdicionales, provinciaSeleccionada, categoria, convenio]);

  // Totales
  const totales = useMemo(() => {
    const inc = items.filter(i => i.incluir !== false);
    const sub = inc.reduce((s, i) => s + ((i.precio||0) * (i.cantidad||1)), 0);
    const ctc = inc.filter(i => i.incluirCTC !== false);
    return { cantidad: items.length, incluidos: inc.length, subtotal: sub, enCTC: ctc.length, totalCTC: ctc.reduce((s,i) => s + ((i.precio||0)*(i.cantidad||1)), 0) };
  }, [items]);

  const agregarDesdeSelector = (sel) => {
    if (!sel) return;
    let d = ITEMS_ADICIONALES_PREDEFINIDOS.find(i => i.descripcion === sel) || itemsImp.find(i => i.Descripcion === sel);
    if (d) onAdd({ id: Date.now(), codigo: d.codigo || d.Codigo || `IA-${Date.now()}`, descripcion: d.descripcion || d.Descripcion, precio: d.precioDefault || d.Precio || 0, cantidad: d.cantidadDefault || d.Cantidad || 1, observaciones: d.observaciones || d.Observaciones || '', clasificacion: d.clasificacion || d.Clasificacion || '', incluir: true, incluirCTC: true });
  };

  const agregarManual = () => {
    if (!nuevo.descripcion.trim()) return;
    onAdd({ id: Date.now(), codigo: nuevo.codigo || `IA-${Date.now()}`, descripcion: nuevo.descripcion.trim(), precio: Number(nuevo.precio) || 0, cantidad: Number(nuevo.cantidad) || 1, observaciones: nuevo.observaciones, clasificacion: 'Manual', incluir: nuevo.incluir, incluirCTC: nuevo.incluirCTC });
    setNuevo({ codigo:'', descripcion:'', precio:0, cantidad:1, observaciones:'', incluir:true, incluirCTC:true });
    setModal(false);
  };

  const upd = (id, c, v) => onUpdate(id, c, c === 'precio' || c === 'cantidad' ? Number(v) : v);

  // Estructura para export
  const prepararExport = () => items.map(i => ({ Codigo: i.codigo, Descripcion: i.descripcion, Precio: i.precio, Cantidad: i.cantidad, Total: (i.precio||0)*(i.cantidad||1), Observaciones: i.observaciones, Incluir: i.incluir?'SI':'NO', IncluirCTC: i.incluirCTC?'SI':'NO', Provincia: provinciaSeleccionada }));

  const inp = "px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm focus:border-emerald-500 focus:outline-none";

  if (compact) {
    return (
      <div className="p-3 bg-pink-900/20 rounded-lg border border-pink-500/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package size={16} className="text-pink-400"/>
          <span className="text-sm font-medium text-pink-300">Ítems Adicionales</span>
          <span className="text-xs bg-pink-600/30 px-2 py-0.5 rounded">{totales.incluidos}/{totales.cantidad}</span>
        </div>
        <span className="font-bold text-pink-400">{fmt(totales.subtotal)}</span>
      </div>
    );
  }

  return (
    <div className="p-4 bg-pink-900/20 rounded-lg border border-pink-500/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-pink-300 flex items-center gap-2">
          <Package size={16}/> Ítems Adicionales
          <span className="text-xs bg-pink-600/30 px-2 py-0.5 rounded">{totales.cantidad}</span>
        </h4>
        <div className="flex items-center gap-2">
          <select className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-xs" value="" onChange={e => { agregarDesdeSelector(e.target.value); e.target.value=''; }}>
            <option value="">+ Agregar</option>
            <optgroup label="Predefinidos">{ITEMS_ADICIONALES_PREDEFINIDOS.map(i => <option key={i.descripcion} value={i.descripcion}>{i.descripcion}</option>)}</optgroup>
            {itemsImp.length > 0 && <optgroup label="Importados">{itemsImp.map((i,x) => <option key={x} value={i.Descripcion}>{i.Descripcion}</option>)}</optgroup>}
          </select>
          <button onClick={() => setModal(true)} className="px-2 py-1 bg-pink-600 hover:bg-pink-500 rounded text-xs flex items-center gap-1"><Plus size={12}/> Manual</button>
        </div>
      </div>

      {/* Tabla */}
      {items.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="text-left p-2 text-xs text-slate-400 w-8">✓</th>
                <th className="text-left p-2 text-xs text-slate-400 w-16">Cód</th>
                <th className="text-left p-2 text-xs text-slate-400">Descripción</th>
                <th className="text-right p-2 text-xs text-slate-400 w-24">P</th>
                <th className="text-right p-2 text-xs text-slate-400 w-14">Q</th>
                <th className="text-right p-2 text-xs text-slate-400 w-24">Total</th>
                <th className="text-center p-2 text-xs text-slate-400 w-10">CTC</th>
                <th className="p-2 w-16"></th>
              </tr>
            </thead>
            <tbody>
              {items.map(i => {
                const t = (i.precio||0) * (i.cantidad||1);
                return (
                  <tr key={i.id} className={`border-t border-slate-700 ${i.incluir===false?'opacity-50':''}`}>
                    <td className="p-2"><input type="checkbox" checked={i.incluir!==false} onChange={e => upd(i.id,'incluir',e.target.checked)} className="rounded"/></td>
                    <td className="p-2 text-xs text-slate-400">{i.codigo}</td>
                    <td className="p-2">
                      {editId===i.id ? <input type="text" value={i.descripcion} onChange={e => upd(i.id,'descripcion',e.target.value)} className={`${inp} w-full`}/> : <span>{i.descripcion}</span>}
                      {i.observaciones && <p className="text-xs text-slate-500">{i.observaciones}</p>}
                    </td>
                    <td className="p-2 text-right"><input type="number" value={i.precio||0} onChange={e => upd(i.id,'precio',e.target.value)} className={`${inp} w-20 text-right`} min="0"/></td>
                    <td className="p-2 text-right"><input type="number" value={i.cantidad||1} onChange={e => upd(i.id,'cantidad',e.target.value)} className={`${inp} w-14 text-right`} min="1"/></td>
                    <td className={`p-2 text-right font-medium ${i.incluir!==false?'text-pink-400':'text-slate-500'}`}>{fmt(t)}</td>
                    <td className="p-2 text-center"><input type="checkbox" checked={i.incluirCTC!==false} onChange={e => upd(i.id,'incluirCTC',e.target.checked)} className="rounded" disabled={i.incluir===false}/></td>
                    <td className="p-2">
                      <div className="flex gap-1">
                        {editId===i.id ? <button onClick={() => setEditId(null)} className="p-1 text-emerald-400"><Save size={14}/></button> : <button onClick={() => setEditId(i.id)} className="p-1 text-slate-400"><Edit2 size={14}/></button>}
                        <button onClick={() => onDelete(i.id)} className="p-1 text-red-400"><Trash2 size={14}/></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-4 text-slate-500">
          <Package size={24} className="mx-auto mb-2 opacity-50"/>
          <p className="text-xs">Sin ítems adicionales</p>
        </div>
      )}

      {/* Totales */}
      {items.length > 0 && (
        <div className="mt-3 p-2 bg-slate-800/50 rounded grid grid-cols-4 gap-2 text-xs">
          <div><span className="text-slate-400">Incluidos:</span> <span className="font-medium">{totales.incluidos}/{totales.cantidad}</span></div>
          <div><span className="text-slate-400">Subtotal:</span> <span className="font-medium text-pink-400">{fmt(totales.subtotal)}</span></div>
          <div><span className="text-slate-400">En CTC:</span> <span className="font-medium">{totales.enCTC}</span></div>
          <div><span className="text-slate-400">Total CTC:</span> <span className="font-bold text-emerald-400">{fmt(totales.totalCTC)}</span></div>
        </div>
      )}

      {itemsImp.length > 0 && (
        <div className="mt-2 p-2 bg-emerald-900/20 rounded border border-emerald-500/30">
          <p className="text-xs text-emerald-300 flex items-center gap-1"><FileSpreadsheet size={12}/> {itemsImp.length} ítems del archivo soporte</p>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md">
            <div className="p-3 border-b border-slate-700 flex justify-between items-center">
              <h3 className="font-bold text-sm">Agregar Ítem Manual</h3>
              <button onClick={() => setModal(false)} className="text-slate-400"><X size={18}/></button>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs text-slate-400 mb-1">Código</label><input type="text" value={nuevo.codigo} onChange={e => setNuevo({...nuevo, codigo:e.target.value})} className={`${inp} w-full`} placeholder="IA-001"/></div>
                <div><label className="block text-xs text-slate-400 mb-1">Cantidad *</label><input type="number" value={nuevo.cantidad} onChange={e => setNuevo({...nuevo, cantidad:e.target.value})} className={`${inp} w-full`} min="1"/></div>
              </div>
              <div><label className="block text-xs text-slate-400 mb-1">Descripción *</label><input type="text" value={nuevo.descripcion} onChange={e => setNuevo({...nuevo, descripcion:e.target.value})} className={`${inp} w-full`} placeholder="Descripción"/></div>
              <div><label className="block text-xs text-slate-400 mb-1">Precio *</label><input type="number" value={nuevo.precio} onChange={e => setNuevo({...nuevo, precio:e.target.value})} className={`${inp} w-full`} min="0"/></div>
              <div><label className="block text-xs text-slate-400 mb-1">Observaciones</label><input type="text" value={nuevo.observaciones} onChange={e => setNuevo({...nuevo, observaciones:e.target.value})} className={`${inp} w-full`}/></div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={nuevo.incluir} onChange={e => setNuevo({...nuevo, incluir:e.target.checked})} className="rounded"/> Incluir</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={nuevo.incluirCTC} onChange={e => setNuevo({...nuevo, incluirCTC:e.target.checked})} className="rounded"/> En CTC</label>
              </div>
              <div className="p-2 bg-slate-700/50 rounded text-sm">
                Preview: {nuevo.descripcion||'...'} - {fmt(nuevo.precio)} × {nuevo.cantidad} = <span className="font-bold text-pink-400">{fmt((nuevo.precio||0)*(nuevo.cantidad||1))}</span>
              </div>
              {!nuevo.descripcion && <p className="text-xs text-amber-400 flex items-center gap-1"><AlertCircle size={12}/> Descripción obligatoria</p>}
            </div>
            <div className="p-3 border-t border-slate-700 flex justify-end gap-2">
              <button onClick={() => setModal(false)} className="px-3 py-1.5 bg-slate-600 hover:bg-slate-500 rounded text-sm">Cancelar</button>
              <button onClick={agregarManual} disabled={!nuevo.descripcion.trim()} className="px-3 py-1.5 bg-pink-600 hover:bg-pink-500 disabled:bg-slate-600 rounded text-sm">Agregar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemsAdicionales;
