/**
 * SISTEMA DE COTIZACIÓN V5.3 PRO
 * App.jsx - Componente raíz
 */

import React, { useState, useMemo, useCallback } from 'react';
import { CONFIG_DEFAULT, ARCHIVOS_SOPORTE } from '../core/constants.js';
import { calcularTotales } from '../core/calculations.js';
import { crearPersonalDefault, crearMovilDefault, crearTrailerDefault, crearOtroCostoDefault, crearGastoEstructuraDefault, crearSeguroDefault } from '../core/logic.js';
import { parsearArchivo, parsearArchivoMovilesTrailers } from '../core/parser.js';
import { Calculator, Settings, Users, Truck, Home, Package, Briefcase, Shield, PieChart, Download, Upload, Menu, X, AlertTriangle, CheckCircle } from 'lucide-react';

const App = () => {
  // Config
  const [config, setConfig] = useState({
    nombreCotizacion: '', clienteNombre: '', provinciaSeleccionada: '',
    mesCotizacion: (() => { const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}`; })(),
    horasSolicitadas: 0, ...CONFIG_DEFAULT
  });

  // Datos importados
  const [datosImportados, setDatosImportados] = useState({
    sueldos: [], monotributistas: [], itemsAdicionales: [], capacitaciones: [],
    otrosCostos: [], estructura: [], seguros: [], movilesDisponibles: [],
    trailersDisponibles: [], serviceMoviles: [], mantenimientoMoviles: [],
    mantenimientoTrailers: [], alquilerMoviles: [], alquilerTrailers: [],
    compraMoviles: [], compraTrailers: []
  });
  const [archivosCargados, setArchivosCargados] = useState({});
  const [erroresArchivos, setErroresArchivos] = useState({});

  // Datos cotización
  const [personal, setPersonal] = useState([]);
  const [moviles, setMoviles] = useState([]);
  const [trailers, setTrailers] = useState([]);
  const [otrosCostos, setOtrosCostos] = useState([]);
  const [gastosEstructura, setGastosEstructura] = useState([]);
  const [seguros, setSeguros] = useState([]);

  // UI
  const [seccionActiva, setSeccionActiva] = useState('config');
  const [menuAbierto, setMenuAbierto] = useState(true);
  const [mostrarImportador, setMostrarImportador] = useState(false);

  // Cálculos
  const markup = useMemo(() => ({
    personal: config.mkPersonal||0, moviles: config.mkMoviles||0, trailers: config.mkTrailers||0,
    otrosCostos: config.mkOtrosCostos||0, estructura: config.mkEstructura||0, seguros: config.mkSeguros||0
  }), [config]);

  const totales = useMemo(() => calcularTotales(
    personal, moviles, trailers, otrosCostos, gastosEstructura, seguros, datosImportados.sueldos, markup
  ), [personal, moviles, trailers, otrosCostos, gastosEstructura, seguros, datosImportados.sueldos, markup]);

  // Handlers
  const actualizarConfig = useCallback((c,v) => setConfig(p => ({...p,[c]:v})), []);

  const handleFileUpload = useCallback(async (file, key) => {
    try {
      const XLSX = await import('xlsx');
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const wb = XLSX.read(new Uint8Array(e.target.result), {type:'array'});
          if (key === 'movilesTrailers') {
            setDatosImportados(p => ({...p, ...parsearArchivoMovilesTrailers(wb, XLSX)}));
          } else {
            const json = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
            setDatosImportados(p => ({...p, [key]: parsearArchivo(key, json)}));
          }
          setArchivosCargados(p => ({...p,[key]:true}));
          setErroresArchivos(p => ({...p,[key]:null}));
        } catch(err) {
          setErroresArchivos(p => ({...p,[key]:err.message}));
          setArchivosCargados(p => ({...p,[key]:false}));
        }
      };
      reader.readAsArrayBuffer(file);
    } catch(err) { setErroresArchivos(p => ({...p,[key]:err.message})); }
  }, []);

  // CRUD Personal
  const agregarPersonal = useCallback(() => setPersonal(p => [...p, crearPersonalDefault()]), []);
  const actualizarPersonal = useCallback((id,c,v) => setPersonal(p => p.map(x => x.id===id ? {...x,[c]:v} : x)), []);
  const eliminarPersonal = useCallback((id) => setPersonal(p => p.filter(x => x.id!==id)), []);

  // CRUD Móviles
  const agregarMovil = useCallback((t,a) => setMoviles(p => [...p, crearMovilDefault(t,a)]), []);
  const actualizarMovil = useCallback((id,c,v) => setMoviles(p => p.map(x => {
    if(x.id!==id) return x;
    const u = {...x,[c]:v};
    if(c==='inversionInicial'||c==='mesesAmortizacion') u.amortizacionMensual = (u.inversionInicial||0)/(u.mesesAmortizacion||1);
    return u;
  })), []);
  const eliminarMovil = useCallback((id) => setMoviles(p => p.filter(x => x.id!==id)), []);

  // CRUD Trailers
  const agregarTrailer = useCallback((t,a) => setTrailers(p => [...p, crearTrailerDefault(t,a)]), []);
  const actualizarTrailer = useCallback((id,c,v) => setTrailers(p => p.map(x => {
    if(x.id!==id) return x;
    const u = {...x,[c]:v};
    if(c==='inversionInicial'||c==='mesesAmortizacion') u.amortizacionMensual = (u.inversionInicial||0)/(u.mesesAmortizacion||1);
    return u;
  })), []);
  const eliminarTrailer = useCallback((id) => setTrailers(p => p.filter(x => x.id!==id)), []);

  // CRUD Otros
  const agregarOtroCosto = useCallback(() => setOtrosCostos(p => [...p, crearOtroCostoDefault()]), []);
  const actualizarOtroCosto = useCallback((id,c,v) => setOtrosCostos(p => p.map(x => x.id===id ? {...x,[c]:v} : x)), []);
  const eliminarOtroCosto = useCallback((id) => setOtrosCostos(p => p.filter(x => x.id!==id)), []);

  // CRUD Estructura
  const agregarGastoEstructura = useCallback(() => setGastosEstructura(p => [...p, crearGastoEstructuraDefault()]), []);
  const actualizarGastoEstructura = useCallback((id,c,v) => setGastosEstructura(p => p.map(x => x.id===id ? {...x,[c]:v} : x)), []);
  const eliminarGastoEstructura = useCallback((id) => setGastosEstructura(p => p.filter(x => x.id!==id)), []);

  // CRUD Seguros
  const agregarSeguro = useCallback(() => setSeguros(p => [...p, crearSeguroDefault()]), []);
  const actualizarSeguro = useCallback((id,c,v) => setSeguros(p => p.map(x => x.id===id ? {...x,[c]:v} : x)), []);
  const eliminarSeguro = useCallback((id) => setSeguros(p => p.filter(x => x.id!==id)), []);

  const fmt = (n) => new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0}).format(n||0);

  const secciones = [
    {id:'config', icon:Settings, label:'Configuración', total:null},
    {id:'personal', icon:Users, label:'Personal', total:totales.personal},
    {id:'moviles', icon:Truck, label:'Móviles', total:totales.moviles},
    {id:'trailers', icon:Home, label:'Trailers', total:totales.trailers},
    {id:'otros', icon:Package, label:'Otros Costos', total:totales.otrosCostos},
    {id:'estructura', icon:Briefcase, label:'Gastos Estructura', total:totales.estructura},
    {id:'seguros', icon:Shield, label:'Seguros', total:totales.seguros},
    {id:'resumen', icon:PieChart, label:'Resumen Comercial', total:null}
  ];

  // Context para hijos
  const ctx = {
    config, actualizarConfig, datosImportados, archivosCargados, erroresArchivos, handleFileUpload,
    personal, agregarPersonal, actualizarPersonal, eliminarPersonal,
    moviles, agregarMovil, actualizarMovil, eliminarMovil,
    trailers, agregarTrailer, actualizarTrailer, eliminarTrailer,
    otrosCostos, agregarOtroCosto, actualizarOtroCosto, eliminarOtroCosto,
    gastosEstructura, agregarGastoEstructura, actualizarGastoEstructura, eliminarGastoEstructura,
    seguros, agregarSeguro, actualizarSeguro, eliminarSeguro,
    totales, markup, fmt
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800/80 border-b border-slate-700 px-4 py-3 sticky top-0 z-50 backdrop-blur-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <button onClick={() => setMenuAbierto(!menuAbierto)} className="p-2 hover:bg-slate-700 rounded-lg lg:hidden">
              {menuAbierto ? <X size={20}/> : <Menu size={20}/>}
            </button>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
              <Calculator size={20}/>
            </div>
            <div><h1 className="text-lg font-bold">Sistema de Cotización</h1><p className="text-xs text-slate-400">v5.3 PRO</p></div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right"><p className="text-xs text-slate-400">Total</p><p className="text-xl font-bold text-emerald-400">{fmt(totales.total)}</p></div>
            <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg flex items-center gap-2 text-sm font-medium"><Download size={16}/> Exportar</button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${menuAbierto ? 'w-64' : 'w-0 overflow-hidden'} lg:w-64 bg-slate-800/50 border-r border-slate-700 min-h-[calc(100vh-64px)] transition-all`}>
          <nav className="p-4 space-y-2">
            {secciones.map(s => (
              <button key={s.id} onClick={() => setSeccionActiva(s.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${seccionActiva===s.id ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
                <div className="flex items-center gap-2"><s.icon size={18}/><span className="text-sm font-medium">{s.label}</span></div>
                {s.total !== null && <span className="text-xs font-mono">{fmt(s.total)}</span>}
              </button>
            ))}
          </nav>
          <div className="p-4 border-t border-slate-700">
            <h3 className="text-xs font-semibold text-slate-400 uppercase mb-3">Archivos</h3>
            {ARCHIVOS_SOPORTE.filter(a => a.requerido).map(a => (
              <div key={a.key} className="flex items-center gap-2 text-xs mb-1">
                {archivosCargados[a.key] ? <CheckCircle size={12} className="text-emerald-400"/> : <AlertTriangle size={12} className="text-amber-400"/>}
                <span className={archivosCargados[a.key] ? 'text-slate-300' : 'text-amber-300'}>{a.label.split('.')[0]}</span>
              </div>
            ))}
            <button onClick={() => setMostrarImportador(true)} className="mt-3 w-full px-3 py-2 bg-cyan-600/20 text-cyan-400 hover:bg-cyan-600/30 rounded-lg text-xs flex items-center justify-center gap-2">
              <Upload size={14}/> Importar
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-5xl mx-auto">
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                {React.createElement(secciones.find(s => s.id===seccionActiva)?.icon || Settings, {size:24, className:'text-emerald-400'})}
                {secciones.find(s => s.id===seccionActiva)?.label}
              </h2>
              <p className="text-slate-400 text-sm">Sección: {seccionActiva}</p>
            </div>
          </div>
        </main>
      </div>

      {/* Modal Importador */}
      {mostrarImportador && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-2xl max-h-[80vh] overflow-auto">
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <h3 className="font-bold">Importar Archivos</h3>
              <button onClick={() => setMostrarImportador(false)} className="p-1 hover:bg-slate-700 rounded"><X size={20}/></button>
            </div>
            <div className="p-4 grid gap-3">
              {ARCHIVOS_SOPORTE.map(a => (
                <div key={a.key} className={`p-3 rounded-lg border ${archivosCargados[a.key] ? 'border-emerald-500/50 bg-emerald-900/20' : a.requerido ? 'border-amber-500/50 bg-amber-900/10' : 'border-slate-600'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{a.label}</span>
                    {archivosCargados[a.key] ? <CheckCircle size={16} className="text-emerald-400"/> : a.requerido && <AlertTriangle size={16} className="text-amber-400"/>}
                  </div>
                  <p className="text-xs text-slate-400 mb-2">{a.descripcion}</p>
                  <input type="file" accept={a.esMultiHoja ? '.xlsx,.xls' : '.xlsx,.xls,.csv'}
                    onChange={e => e.target.files[0] && handleFileUpload(e.target.files[0], a.key)}
                    className="w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-slate-600 file:text-slate-200"/>
                  {erroresArchivos[a.key] && <p className="text-xs text-red-400 mt-1">{erroresArchivos[a.key]}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
