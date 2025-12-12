/**
 * SISTEMA DE COTIZACIÓN V5.3 PRO
 * Results.jsx - Resumen ejecutivo y resultados consolidados
 */

import React, { useMemo } from 'react';
import { PieChart, TrendingUp, Users, Truck, Home, Package, Briefcase, Shield, DollarSign, Clock, FileText, Download, Printer, BarChart3 } from 'lucide-react';

const Results = ({ config, personal, moviles, trailers, otrosCostos, gastosEstructura, seguros, totales, markup, fmt }) => {
  
  const resumen = useMemo(() => {
    const personalPorTipo = { RD: personal.filter(p => p.tipoContrato==='RD'), MT: personal.filter(p => p.tipoContrato==='MT'), FUCO: personal.filter(p => p.tipoContrato==='FUCO') };
    const movilesPorAdq = { Disponible: moviles.filter(m => m.adquisicion==='Disponible'), Alquiler: moviles.filter(m => m.adquisicion==='Alquiler'), Compra: moviles.filter(m => m.adquisicion==='Compra') };
    const trailersPorAdq = { Disponible: trailers.filter(t => t.adquisicion==='Disponible'), Alquiler: trailers.filter(t => t.adquisicion==='Alquiler'), Compra: trailers.filter(t => t.adquisicion==='Compra') };
    const horasTotales = personal.reduce((sum,p) => {
      const hpm = p.horasPorDia==='manual' ? (p.horasManuales||0) : (p.horasPorDia||8);
      const dias = p.diagrama==='7x7'?15 : p.diagrama==='14x14'?15 : p.diagrama==='L-V'?22 : (p.diasManuales||22);
      return sum + (hpm*dias);
    }, 0);
    return { personalPorTipo, movilesPorAdq, trailersPorAdq, horasTotales, movilesEnCTC: moviles.filter(m => m.incluirCTC!==false).length, trailersEnCTC: trailers.filter(t => t.incluirCTC!==false).length, totalItems: personal.length+moviles.length+trailers.length+otrosCostos.length+gastosEstructura.length+seguros.length };
  }, [personal, moviles, trailers, otrosCostos, gastosEstructura, seguros]);

  const inc = v => (!totales.total||totales.total===0) ? '0' : ((v/totales.total)*100).toFixed(1);
  const distribucion = [
    {l:'Personal',v:totales.personal,c:'bg-blue-500'}, {l:'Móviles',v:totales.moviles,c:'bg-orange-500'},
    {l:'Trailers',v:totales.trailers,c:'bg-purple-500'}, {l:'Otros',v:totales.otrosCostos,c:'bg-pink-500'},
    {l:'Estructura',v:totales.estructura,c:'bg-cyan-500'}, {l:'Seguros',v:totales.seguros,c:'bg-amber-500'}
  ].filter(d => d.v>0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600/20 to-cyan-600/20 rounded-xl border border-emerald-500/30 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2"><PieChart size={24} className="text-emerald-400"/> Resumen Ejecutivo</h2>
            <p className="text-slate-400 text-sm mt-1">{config.nombreCotizacion||'Cotización'}{config.clienteNombre && ` • ${config.clienteNombre}`}</p>
          </div>
          <div className="text-right text-sm">
            <p className="text-slate-400">Provincia: <span className="text-white">{config.provinciaSeleccionada||'-'}</span></p>
            <p className="text-slate-400">Mes: <span className="text-white">{config.mesCotizacion||'-'}</span></p>
          </div>
        </div>
        <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-emerald-600/30 flex items-center justify-center"><DollarSign size={28} className="text-emerald-400"/></div>
            <div><p className="text-sm text-slate-400">Total Mensual</p><p className="text-3xl font-bold text-emerald-400">{fmt(totales.total)}</p></div>
          </div>
          <div className="text-right"><p className="text-xs text-slate-400">Items</p><p className="text-2xl font-bold">{resumen.totalItems}</p></div>
        </div>
      </div>

      {/* Distribución */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2"><BarChart3 size={18} className="text-cyan-400"/> Distribución</h3>
        <div className="h-6 rounded-lg overflow-hidden flex mb-4">{distribucion.map((d,i) => <div key={i} className={`${d.c}`} style={{width:`${inc(d.v)}%`}} title={`${d.l}: ${inc(d.v)}%`}/>)}</div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {distribucion.map((d,i) => <div key={i} className="p-2 bg-slate-700/30 rounded text-center"><div className={`w-2 h-2 rounded ${d.c} mx-auto mb-1`}/><p className="text-xs text-slate-400">{d.l}</p><p className="font-bold text-sm">{fmt(d.v)}</p><p className="text-xs text-slate-500">{inc(d.v)}%</p></div>)}
        </div>
      </div>

      {/* Desglose */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Personal */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
          <h3 className="font-bold mb-3 flex items-center gap-2"><Users size={16} className="text-blue-400"/> Personal</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between p-2 bg-slate-700/30 rounded"><span>Rel. Dependencia</span><span>{resumen.personalPorTipo.RD.length}</span></div>
            <div className="flex justify-between p-2 bg-slate-700/30 rounded"><span>Monotributistas</span><span>{resumen.personalPorTipo.MT.length}</span></div>
            <div className="flex justify-between p-2 bg-slate-700/30 rounded"><span>Fuera Convenio</span><span>{resumen.personalPorTipo.FUCO.length}</span></div>
            <div className="flex justify-between p-2 bg-blue-600/20 rounded"><span className="flex items-center gap-1"><Clock size={12}/>Horas/mes</span><span className="font-bold text-blue-400">{resumen.horasTotales.toLocaleString('es-AR')}</span></div>
            <div className="flex justify-between p-2 bg-blue-600/30 rounded border border-blue-500/30"><span>Total</span><span className="font-bold text-blue-400">{fmt(totales.personal)}</span></div>
          </div>
        </div>

        {/* Móviles/Trailers */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
          <h3 className="font-bold mb-3 flex items-center gap-2"><Truck size={16} className="text-orange-400"/> Móviles & Trailers</h3>
          <div className="space-y-2 text-sm">
            <div className="p-2 bg-orange-900/20 rounded border border-orange-500/30">
              <div className="flex justify-between mb-1"><span>Móviles ({moviles.length})</span><span className="font-bold text-orange-400">{fmt(totales.moviles)}</span></div>
              <div className="text-xs text-slate-400">Disp:{resumen.movilesPorAdq.Disponible.length} Alq:{resumen.movilesPorAdq.Alquiler.length} Compra:{resumen.movilesPorAdq.Compra.length} • CTC:{resumen.movilesEnCTC}</div>
            </div>
            <div className="p-2 bg-purple-900/20 rounded border border-purple-500/30">
              <div className="flex justify-between mb-1"><span>Trailers ({trailers.length})</span><span className="font-bold text-purple-400">{fmt(totales.trailers)}</span></div>
              <div className="text-xs text-slate-400">Disp:{resumen.trailersPorAdq.Disponible.length} Alq:{resumen.trailersPorAdq.Alquiler.length} Compra:{resumen.trailersPorAdq.Compra.length} • CTC:{resumen.trailersEnCTC}</div>
            </div>
          </div>
        </div>

        {/* Otros */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
          <h3 className="font-bold mb-3 flex items-center gap-2"><Package size={16} className="text-pink-400"/> Otros & Estructura</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between p-2 bg-pink-900/20 rounded border border-pink-500/30"><span>Otros Costos ({otrosCostos.length})</span><span className="font-bold text-pink-400">{fmt(totales.otrosCostos)}</span></div>
            <div className="flex justify-between p-2 bg-cyan-900/20 rounded border border-cyan-500/30"><span>Estructura ({gastosEstructura.length})</span><span className="font-bold text-cyan-400">{fmt(totales.estructura)}</span></div>
          </div>
        </div>

        {/* Seguros */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
          <h3 className="font-bold mb-3 flex items-center gap-2"><Shield size={16} className="text-amber-400"/> Seguros</h3>
          <div className="flex justify-between p-2 bg-amber-900/20 rounded border border-amber-500/30 text-sm"><span>Total ({seguros.length})</span><span className="font-bold text-amber-400">{fmt(totales.seguros)}</span></div>
        </div>
      </div>

      {/* Tabla resumen */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-3 border-b border-slate-700"><h3 className="font-bold flex items-center gap-2"><FileText size={16} className="text-emerald-400"/> Resumen Final</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-700/50"><tr><th className="text-left p-2">Categoría</th><th className="text-right p-2">Items</th><th className="text-right p-2">Mk%</th><th className="text-right p-2">Total</th><th className="text-right p-2">Inc%</th></tr></thead>
            <tbody>
              <tr className="border-t border-slate-700"><td className="p-2 flex items-center gap-1"><Users size={12} className="text-blue-400"/>Personal</td><td className="p-2 text-right">{personal.length}</td><td className="p-2 text-right text-emerald-400">{markup.personal}%</td><td className="p-2 text-right font-medium">{fmt(totales.personal)}</td><td className="p-2 text-right">{inc(totales.personal)}%</td></tr>
              <tr className="border-t border-slate-700"><td className="p-2 flex items-center gap-1"><Truck size={12} className="text-orange-400"/>Móviles</td><td className="p-2 text-right">{moviles.length}</td><td className="p-2 text-right text-emerald-400">{markup.moviles}%</td><td className="p-2 text-right font-medium">{fmt(totales.moviles)}</td><td className="p-2 text-right">{inc(totales.moviles)}%</td></tr>
              <tr className="border-t border-slate-700"><td className="p-2 flex items-center gap-1"><Home size={12} className="text-purple-400"/>Trailers</td><td className="p-2 text-right">{trailers.length}</td><td className="p-2 text-right text-emerald-400">{markup.trailers}%</td><td className="p-2 text-right font-medium">{fmt(totales.trailers)}</td><td className="p-2 text-right">{inc(totales.trailers)}%</td></tr>
              <tr className="border-t border-slate-700"><td className="p-2 flex items-center gap-1"><Package size={12} className="text-pink-400"/>Otros</td><td className="p-2 text-right">{otrosCostos.length}</td><td className="p-2 text-right text-emerald-400">{markup.otrosCostos}%</td><td className="p-2 text-right font-medium">{fmt(totales.otrosCostos)}</td><td className="p-2 text-right">{inc(totales.otrosCostos)}%</td></tr>
              <tr className="border-t border-slate-700"><td className="p-2 flex items-center gap-1"><Briefcase size={12} className="text-cyan-400"/>Estructura</td><td className="p-2 text-right">{gastosEstructura.length}</td><td className="p-2 text-right text-emerald-400">{markup.estructura}%</td><td className="p-2 text-right font-medium">{fmt(totales.estructura)}</td><td className="p-2 text-right">{inc(totales.estructura)}%</td></tr>
              <tr className="border-t border-slate-700"><td className="p-2 flex items-center gap-1"><Shield size={12} className="text-amber-400"/>Seguros</td><td className="p-2 text-right">{seguros.length}</td><td className="p-2 text-right text-emerald-400">{markup.seguros}%</td><td className="p-2 text-right font-medium">{fmt(totales.seguros)}</td><td className="p-2 text-right">{inc(totales.seguros)}%</td></tr>
            </tbody>
            <tfoot className="bg-emerald-600/20"><tr className="border-t-2 border-emerald-500/50"><td className="p-3 font-bold">TOTAL</td><td className="p-3 text-right font-bold">{resumen.totalItems}</td><td className="p-3">-</td><td className="p-3 text-right font-bold text-lg text-emerald-400">{fmt(totales.total)}</td><td className="p-3 text-right font-bold">100%</td></tr></tfoot>
          </table>
        </div>
      </div>

      {/* Exportar */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
        <h3 className="font-bold mb-3 flex items-center gap-2"><Download size={16} className="text-emerald-400"/> Exportar</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button className="p-3 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-lg flex flex-col items-center gap-1" data-export="pdf"><FileText size={20} className="text-red-400"/><span className="text-xs">PDF</span></button>
          <button className="p-3 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded-lg flex flex-col items-center gap-1" data-export="excel"><BarChart3 size={20} className="text-green-400"/><span className="text-xs">Excel</span></button>
          <button className="p-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg flex flex-col items-center gap-1" data-export="print"><Printer size={20} className="text-blue-400"/><span className="text-xs">Imprimir</span></button>
          <button className="p-3 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg flex flex-col items-center gap-1" data-export="json"><TrendingUp size={20} className="text-purple-400"/><span className="text-xs">Guardar</span></button>
        </div>
      </div>
    </div>
  );
};

export default Results;
