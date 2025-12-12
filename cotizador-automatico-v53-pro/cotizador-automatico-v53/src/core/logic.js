/**
 * SISTEMA DE COTIZACIÓN V5.3 PRO
 * logic.js - Lógica de negocio y reglas
 * Basado en V5.2 PRO con correcciones V5.3
 */

import {
  TIPOS_CONTRATO,
  DIAGRAMAS,
  CATEGORIAS_POR_CONVENIO,
  PUESTOS_POR_CATEGORIA,
  TOPES_HORAS_CONVENIO,
  VIANDAS_PETROLERO_DEFAULT,
  SERVICE_MOVILES_PREDEFINIDOS,
  MANTENIMIENTO_MOVILES_PREDEFINIDOS,
  MANTENIMIENTO_TRAILERS_PREDEFINIDOS
} from './constants.js';

// ═══════════════════════════════════════════════════════════════════════════
// CLASIFICACIÓN DE PERSONAL (V5.3 Punto 2)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Obtiene la clasificación según tipo de contrato
 * V5.3: MT y FUCO tienen clasificación propia, no muestran convenio
 */
export const getClasificacion = (tipoContrato) => {
  const tipo = TIPOS_CONTRATO.find(t => t.value === tipoContrato);
  return tipo ? tipo.clasificacion : 'Sin clasificar';
};

/**
 * Determina si debe mostrar selector de convenio
 * V5.3 Punto 2: Solo RD muestra convenio
 */
export const debeMostrarConvenio = (tipoContrato) => {
  const tipo = TIPOS_CONTRATO.find(t => t.value === tipoContrato);
  return tipo ? tipo.muestraConvenio : false;
};

/**
 * Determina si el puesto es libre (editable) o de lista
 * V5.3 Punto 2: MT y FUCO tienen puesto libre
 */
export const esPuestoLibre = (tipoContrato) => {
  return tipoContrato === 'MT' || tipoContrato === 'FUCO';
};

/**
 * V5.3 Punto 1: Determina si debe mostrar costo convalidado
 * Solo visible si NO es Monotributista
 */
export const debeMostrarCostoConvalidado = (tipoContrato) => {
  return tipoContrato !== 'MT';
};

// ═══════════════════════════════════════════════════════════════════════════
// CATEGORÍAS Y PUESTOS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Obtiene las categorías disponibles según convenio
 */
export const getCategoriasPorConvenio = (convenio) => {
  return CATEGORIAS_POR_CONVENIO[convenio] || [];
};

/**
 * Obtiene los puestos disponibles según categoría
 */
export const getPuestosPorCategoria = (categoria) => {
  return PUESTOS_POR_CATEGORIA[categoria] || [];
};

/**
 * Valida si una combinación convenio-categoría es válida
 */
export const esConvenioCategoriaValido = (convenio, categoria) => {
  const categorias = getCategoriasPorConvenio(convenio);
  return categorias.includes(categoria);
};

/**
 * Valida si una combinación categoría-puesto es válida
 */
export const esCategoriaPuestoValido = (categoria, puesto) => {
  const puestos = getPuestosPorCategoria(categoria);
  return puestos.includes(puesto);
};

// ═══════════════════════════════════════════════════════════════════════════
// HORAS Y DIAGRAMAS (V5.3 Punto 4)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Obtiene los días del mes según diagrama
 */
export const getDiasMesPorDiagrama = (diagrama) => {
  const diag = DIAGRAMAS.find(d => d.value === diagrama);
  return diag ? diag.diasMes : 0;
};

/**
 * V5.3 Punto 4: Calcula horas del mes
 * Horas del mes = (horas por día) × (días del diagrama vigente)
 */
export const calcularHorasMes = (diagrama, horasPorDia, horasManuales = 0) => {
  // Si diagrama es Manual, usar horas manuales directamente
  if (diagrama === 'Manual') {
    return horasManuales;
  }
  
  const diasMes = getDiasMesPorDiagrama(diagrama);
  
  // Si horasPorDia es 'manual', usar horasManuales para el cálculo
  const horas = horasPorDia === 'manual' ? horasManuales : horasPorDia;
  
  return diasMes * horas;
};

/**
 * Obtiene el tope de horas según convenio/tipo
 */
export const getTopeHoras = (tipoContrato, convenio) => {
  if (tipoContrato === 'MT') return TOPES_HORAS_CONVENIO['Monotributista'];
  if (tipoContrato === 'FUCO') return TOPES_HORAS_CONVENIO['Fuera de Convenio'];
  return TOPES_HORAS_CONVENIO[convenio] || 192;
};

/**
 * Valida si las horas están dentro del tope
 */
export const validarTopeHoras = (horasMes, tipoContrato, convenio) => {
  const tope = getTopeHoras(tipoContrato, convenio);
  return {
    esValido: horasMes <= tope,
    tope,
    exceso: Math.max(0, horasMes - tope)
  };
};

// ═══════════════════════════════════════════════════════════════════════════
// CREACIÓN DE ENTIDADES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Crea un nuevo registro de personal con valores default
 */
export const crearPersonalDefault = () => ({
  id: Date.now(),
  tipoContrato: 'RD',
  convenio: 'FATSA',
  categoria: '',
  puesto: '',
  cantidad: 1,
  diagrama: '7x7',
  horasPorDia: 8,
  horasManuales: 0,
  valorHora: 0,
  incluyeConvalidado: false,
  costoConvalidado: 0,
  // FATSA adicionales
  adicionalEnfermeria: false,
  plusNocturno: false,
  antiguedadAnios: 0,
  antiguedadImporte: 5000,
  // Petrolero viandas
  viandasPetrolero: VIANDAS_PETROLERO_DEFAULT.map(v => ({ ...v })),
  // Items y capacitaciones (V5.3 Punto 7)
  itemsAdicionales: [],
  capacitaciones: [],
  // Horas extra
  horasExtra: [],
  // Markup
  mkLinea: 0
});

/**
 * Crea un nuevo móvil con valores default
 * V5.3 Punto 10: Service + Mantenimiento obligatorios
 */
export const crearMovilDefault = (tipo, adquisicion) => ({
  id: Date.now(),
  tipo,
  adquisicion,
  descripcion: '',
  modelo: '',
  dominio: '',
  anios: 0,
  // Costos según adquisición
  costoAlquiler: 0,
  inversionInicial: 0,
  mesesAmortizacion: 12,
  amortizacionMensual: 0,
  // V5.3 Punto 10.6: Subsecciones obligatorias
  itemsService: SERVICE_MOVILES_PREDEFINIDOS.map((s, i) => ({
    id: Date.now() + i,
    descripcion: s.descripcion,
    precio: s.precioDefault,
    frecuenciaAnual: s.frecuenciaAnual,
    incluir: true
  })),
  itemsMantenimiento: MANTENIMIENTO_MOVILES_PREDEFINIDOS.map((m, i) => ({
    id: Date.now() + 100 + i,
    descripcion: m.descripcion,
    precio: m.precioDefault,
    frecuenciaAnual: m.frecuenciaAnual,
    incluir: true
  })),
  // V5.3 Punto 10.9
  incluirCTC: true,
  mkLinea: 0
});

/**
 * Crea un nuevo trailer con valores default
 * V5.3 Punto 10.6: Solo Mantenimiento, sin Service
 */
export const crearTrailerDefault = (tipo, adquisicion) => ({
  id: Date.now(),
  tipo,
  adquisicion,
  descripcion: '',
  modelo: '',
  identificacion: '',
  anios: 0,
  // Costos según adquisición
  costoAlquiler: 0,
  inversionInicial: 0,
  mesesAmortizacion: 24,
  amortizacionMensual: 0,
  // V5.3 Punto 10.6: Solo mantenimiento
  itemsMantenimiento: MANTENIMIENTO_TRAILERS_PREDEFINIDOS.map((m, i) => ({
    id: Date.now() + i,
    descripcion: m.descripcion,
    precio: m.precioDefault,
    frecuenciaAnual: m.frecuenciaAnual,
    incluir: true
  })),
  // V5.3 Punto 10.9
  incluirCTC: true,
  mkLinea: 0
});

/**
 * Crea un nuevo item de otro costo
 */
export const crearOtroCostoDefault = () => ({
  id: Date.now(),
  descripcion: '',
  precio: 0,
  cantidad: 1,
  categoria: '',
  mkLinea: 0,
  incluirCTC: true
});

/**
 * Crea un nuevo gasto de estructura
 */
export const crearGastoEstructuraDefault = () => ({
  id: Date.now(),
  descripcion: '',
  precio: 0,
  cantidad: 1,
  categoria: '',
  mkLinea: 0,
  incluirCTC: true
});

/**
 * Crea un nuevo seguro
 */
export const crearSeguroDefault = () => ({
  id: Date.now(),
  tipo: 'ART',
  descripcion: '',
  prima: 0,
  aplicaSobre: '',
  mkLinea: 0,
  incluirCTC: true
});

/**
 * Crea un nuevo item adicional para personal
 */
export const crearItemAdicionalDefault = (item = {}) => ({
  id: Date.now(),
  descripcion: item.descripcion || '',
  precio: item.precioDefault || item.precio || 0,
  cantidad: item.cantidad || 1,
  categoria: item.categoria || '',
  mkInd: 0,
  incluirCTC: true
});

/**
 * Crea una nueva capacitación para personal
 */
export const crearCapacitacionDefault = (cap = {}) => ({
  id: Date.now(),
  descripcion: cap.descripcion || '',
  precio: cap.precioDefault || cap.precio || 0,
  cantidad: cap.cantidad || 1,
  duracionHoras: cap.duracionHoras || 0,
  certificacion: cap.certificacion || false,
  mkInd: 0,
  incluirCTC: true
});

/**
 * Crea una nueva hora extra
 */
export const crearHoraExtraDefault = () => ({
  id: Date.now(),
  tipo: 'HE50',
  cantidad: 0,
  mkInd: 0,
  incluirCTC: true
});

// ═══════════════════════════════════════════════════════════════════════════
// ACTUALIZACIÓN DE ENTIDADES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Actualiza un registro de personal con lógica de cascada
 * V5.3: Aplica reglas de clasificación
 */
export const actualizarPersonal = (personal, campo, valor, provinciaSeleccionada, dataMonotributistas) => {
  const actualizado = { ...personal, [campo]: valor };
  
  // Cascada al cambiar convenio
  if (campo === 'convenio') {
    actualizado.categoria = '';
    actualizado.puesto = '';
    if (valor === 'Petrolero') {
      actualizado.viandasPetrolero = VIANDAS_PETROLERO_DEFAULT.map(v => ({ ...v }));
    }
  }
  
  // Cascada al cambiar categoría
  if (campo === 'categoria') {
    actualizado.puesto = '';
  }
  
  // V5.3 Punto 2: Lógica al cambiar tipo de contrato
  if (campo === 'tipoContrato') {
    if (valor === 'MT' || valor === 'FUCO') {
      actualizado.diagrama = 'Manual';
      actualizado.convenio = '';
      actualizado.categoria = '';
      actualizado.puesto = '';
    } else {
      actualizado.convenio = 'FATSA';
    }
  }
  
  // V5.3 Punto 5: Autocompletar valor hora desde archivo soporte
  if ((campo === 'puesto' || campo === 'tipoContrato') && 
      (actualizado.tipoContrato === 'MT' || actualizado.tipoContrato === 'FUCO') && 
      provinciaSeleccionada && 
      dataMonotributistas && 
      dataMonotributistas.length > 0) {
    const found = dataMonotributistas.find(m => 
      m.Provincia === provinciaSeleccionada && 
      m.Puesto === (actualizado.puesto || valor)
    );
    if (found && found.Valor_Sugerido) {
      actualizado.valorHora = found.Valor_Sugerido;
    }
  }
  
  return actualizado;
};

/**
 * Actualiza un móvil con cálculo de amortización
 */
export const actualizarMovil = (movil, campo, valor) => {
  const actualizado = { ...movil, [campo]: valor };
  
  // Recalcular amortización si cambian los valores
  if (campo === 'inversionInicial' || campo === 'mesesAmortizacion') {
    const inversion = actualizado.inversionInicial || 0;
    const meses = actualizado.mesesAmortizacion || 1;
    actualizado.amortizacionMensual = inversion / meses;
  }
  
  return actualizado;
};

/**
 * Actualiza un trailer con cálculo de amortización
 */
export const actualizarTrailer = (trailer, campo, valor) => {
  const actualizado = { ...trailer, [campo]: valor };
  
  // Recalcular amortización si cambian los valores
  if (campo === 'inversionInicial' || campo === 'mesesAmortizacion') {
    const inversion = actualizado.inversionInicial || 0;
    const meses = actualizado.mesesAmortizacion || 1;
    actualizado.amortizacionMensual = inversion / meses;
  }
  
  return actualizado;
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Genera descripción automática para móvil
 */
export const generarDescripcionMovil = (tipo, adquisicion, modelo, dominio) => {
  const tipoLabel = tipo || 'Móvil';
  const adqLabel = adquisicion || '';
  const modeloStr = modelo ? ` - ${modelo}` : '';
  const dominioStr = dominio ? ` (${dominio})` : '';
  return `${tipoLabel} ${adqLabel}${modeloStr}${dominioStr}`.trim();
};

/**
 * Genera descripción automática para trailer
 */
export const generarDescripcionTrailer = (tipo, adquisicion, modelo, identificacion) => {
  const tipoLabel = tipo || 'Trailer';
  const adqLabel = adquisicion || '';
  const modeloStr = modelo ? ` - ${modelo}` : '';
  const idStr = identificacion ? ` (${identificacion})` : '';
  return `${tipoLabel} ${adqLabel}${modeloStr}${idStr}`.trim();
};

export default {
  getClasificacion,
  debeMostrarConvenio,
  esPuestoLibre,
  debeMostrarCostoConvalidado,
  getCategoriasPorConvenio,
  getPuestosPorCategoria,
  esConvenioCategoriaValido,
  esCategoriaPuestoValido,
  getDiasMesPorDiagrama,
  calcularHorasMes,
  getTopeHoras,
  validarTopeHoras,
  crearPersonalDefault,
  crearMovilDefault,
  crearTrailerDefault,
  crearOtroCostoDefault,
  crearGastoEstructuraDefault,
  crearSeguroDefault,
  crearItemAdicionalDefault,
  crearCapacitacionDefault,
  crearHoraExtraDefault,
  actualizarPersonal,
  actualizarMovil,
  actualizarTrailer,
  generarDescripcionMovil,
  generarDescripcionTrailer
};
