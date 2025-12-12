/**
 * SISTEMA DE COTIZACIÓN V5.3 PRO
 * Dashboard.jsx - Panel de configuración general y resumen
 * Basado en V5.2 PRO con correcciones V5.3
 */

import React from 'react';
import { PROVINCIAS } from '../core/constants.js';
import { Settings, MapPin, Calendar, Clock, Percent, Users, Truck, Home, Package, Briefcase, Shield, TrendingUp, DollarSign, Target, PieChart } from 'lucide-react';

const Dashboard = ({ 
  config, 
  actualizarConfig, 
  totales, 
  markup,
  personal,
  moviles,
  trailers,
  otrosCostos,
  gastosEstructura,
  seguros,
  fmt 
}) => {
  
  // Calcular estadísticas
  const stats = {
    totalPersonal: personal?.length || 0,
    totalMoviles: moviles?.length || 0,
    totalTrailers: trailers?.length || 0,
    totalOtrosCostos: otrosCostos?.length || 0,
    totalEstructura: gastosEstructura?.length || 0,
    totalSeguros: seguros?.length || 0
  };

  // Calcular incidencia por categoría
  const calcularIncidencia = (valor) => {
    if (!totales.total || totales.total === 0) return 0;
    return ((valor / totales.total) * 100).toFixed(1);
  };

  const categorias = [
    { key: 'personal', label: 'Personal', icon: Users, color: 'blue', total: totales.personal, items: stats.totalPersonal, mk: markup.personal },
    { key: 'moviles', label: 'Móviles', icon: Truck, color: 'orange', total: totales.moviles, items: stats.totalMoviles, mk: markup.moviles },
    { key: 'trailers', label: 'Trailers', icon: Home, color: 'purple', total: totales.trailers, items: stats.totalTrailers, mk: markup.trailers },
    { key: 'otrosCostos', label: 'Otros Costos', icon: Package, color: 'pink', total: totales.otrosCostos, items: stats.totalOtrosCostos, mk: markup.otrosCostos },
    { key: 'estructura', label: 'Estructura', icon: Briefcase, color: 'cyan', total: totales.estructura, items: stats.totalEstructura, mk: markup.estructura },
    { key: 'seguros', label: 'Seguros', icon: Shield, color: 'amber', total: totales.seguros, items: stats.totalSeguros, mk: markup.seguros }
  ];

  const colorClasses = {
    blue: 'bg-blue-600/20 text-blue-400 border-blue-500/30',
    orange: 'bg-orange-600/20 text-orange-400 border-orange-500/30',
    purple: 'bg-purple-600/20 text-purple-400 border-purple-500/30',
    pink: 'bg-pink-600/20 text-pink-400 border-pink-500/30',
    cyan: 'bg-cyan-600/20 text-cyan-400 border-cyan-500/30',
    amber: 'bg-amber-600/20 text-amber-400 border-amber-500/30'
  };

  return (
    <div className="space-y-6">
      {/* Configuración General */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Settings size={20} className="text-emerald-400" />
          Configuración General
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Nombre Cotización */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">Nombre de la Cotización</label>
            <input
              type="text"
              value={config.nombreCotizacion || ''}
              onChange={e => actualizarConfig('nombreCotizacion', e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm focus:border-emerald-500 focus:outline-none"
              placeholder="Ej: Cotización YPF Neuquén 2024"
            />
          </div>

          {/* Cliente */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">Cliente</label>
            <input
              type="text"
              value={config.clienteNombre || ''}
              onChange={e => actualizarConfig('clienteNombre', e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm focus:border-emerald-500 focus:outline-none"
              placeholder="Nombre del cliente"
            />
          </div>

          {/* Provincia */}
          <div>
            <label className="block text-sm text-slate-400 mb-1 flex items-center gap-1">
              <MapPin size={14} /> Provincia
            </label>
            <select
              value={config.provinciaSeleccionada || ''}
              onChange={e => actualizarConfig('provinciaSeleccionada', e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm focus:border-emerald-500 focus:outline-none"
            >
              <option value="">Seleccionar provincia</option>
              {PROVINCIAS.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Mes Cotización */}
          <div>
            <label className="block text-sm text-slate-400 mb-1 flex items-center gap-1">
              <Calendar size={14} /> Mes de Cotización
            </label>
            <input
              type="month"
              value={config.mesCotizacion || ''}
              onChange={e => actualizarConfig('mesCotizacion', e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Horas Solicitadas */}
          <div>
            <label className="block text-sm text-slate-400 mb-1 flex items-center gap-1">
              <Clock size={14} /> Horas Solicitadas (Cliente)
            </label>
            <input
              type="number"
              value={config.horasSolicitadas || 0}
              onChange={e => actualizarConfig('horasSolicitadas', Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm focus:border-emerald-500 focus:outline-none"
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Markup por Categoría */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Percent size={20} className="text-amber-400" />
          Markup por Categoría
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { key: 'mkPersonal', label: 'Personal' },
            { key: 'mkMoviles', label: 'Móviles' },
            { key: 'mkTrailers', label: 'Trailers' },
            { key: 'mkOtrosCostos', label: 'Otros Costos' },
            { key: 'mkEstructura', label: 'Estructura' },
            { key: 'mkSeguros', label: 'Seguros' }
          ].map(mk => (
            <div key={mk.key}>
              <label className="block text-xs text-slate-400 mb-1">{mk.label} %</label>
              <input
                type="number"
                value={config[mk.key] || 0}
                onChange={e => actualizarConfig(mk.key, Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm focus:border-emerald-500 focus:outline-none text-center"
                min="0"
                max="100"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Resumen por Categoría */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <PieChart size={20} className="text-cyan-400" />
          Resumen por Categoría
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categorias.map(cat => (
            <div key={cat.key} className={`p-4 rounded-lg border ${colorClasses[cat.color]}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <cat.icon size={18} />
                  <span className="font-medium">{cat.label}</span>
                </div>
                <span className="text-xs bg-slate-700 px-2 py-1 rounded">
                  {cat.items} items
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Total:</span>
                  <span className="font-bold">{fmt(cat.total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Markup:</span>
                  <span>{cat.mk}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Incidencia:</span>
                  <span>{calcularIncidencia(cat.total)}%</span>
                </div>
              </div>
              
              {/* Barra de progreso */}
              <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-current opacity-60 transition-all"
                  style={{ width: `${calcularIncidencia(cat.total)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Total General */}
      <div className="bg-gradient-to-r from-emerald-600/20 to-cyan-600/20 rounded-xl border border-emerald-500/30 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-emerald-600/30 flex items-center justify-center">
              <DollarSign size={28} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Total Cotización</p>
              <p className="text-3xl font-bold text-emerald-400">{fmt(totales.total)}</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
              <Target size={14} />
              <span>Desglose</span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <span className="text-slate-400">Personal:</span>
              <span className="text-right">{fmt(totales.personal)}</span>
              <span className="text-slate-400">Móviles:</span>
              <span className="text-right">{fmt(totales.moviles)}</span>
              <span className="text-slate-400">Trailers:</span>
              <span className="text-right">{fmt(totales.trailers)}</span>
              <span className="text-slate-400">Otros:</span>
              <span className="text-right">{fmt(totales.otrosCostos)}</span>
              <span className="text-slate-400">Estructura:</span>
              <span className="text-right">{fmt(totales.estructura)}</span>
              <span className="text-slate-400">Seguros:</span>
              <span className="text-right">{fmt(totales.seguros)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Indicadores Rápidos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4 text-center">
          <TrendingUp size={24} className="mx-auto text-emerald-400 mb-2" />
          <p className="text-2xl font-bold">{stats.totalPersonal + stats.totalMoviles + stats.totalTrailers}</p>
          <p className="text-xs text-slate-400">Items Operativos</p>
        </div>
        
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4 text-center">
          <Users size={24} className="mx-auto text-blue-400 mb-2" />
          <p className="text-2xl font-bold">{stats.totalPersonal}</p>
          <p className="text-xs text-slate-400">Personal</p>
        </div>
        
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4 text-center">
          <Truck size={24} className="mx-auto text-orange-400 mb-2" />
          <p className="text-2xl font-bold">{stats.totalMoviles + stats.totalTrailers}</p>
          <p className="text-xs text-slate-400">Móviles + Trailers</p>
        </div>
        
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4 text-center">
          <Percent size={24} className="mx-auto text-amber-400 mb-2" />
          <p className="text-2xl font-bold">
            {totales.total > 0 ? ((Object.values(markup).reduce((a,b) => a+b, 0) / 6)).toFixed(1) : 0}%
          </p>
          <p className="text-xs text-slate-400">Markup Promedio</p>
        </div>
      </div>

      {/* Info de Configuración */}
      {(!config.provinciaSeleccionada || !config.nombreCotizacion) && (
        <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-4">
          <p className="text-amber-300 text-sm flex items-center gap-2">
            <Settings size={16} />
            Complete la configuración para optimizar los cálculos:
            {!config.provinciaSeleccionada && <span className="bg-amber-600/30 px-2 py-0.5 rounded text-xs">Provincia</span>}
            {!config.nombreCotizacion && <span className="bg-amber-600/30 px-2 py-0.5 rounded text-xs">Nombre</span>}
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
