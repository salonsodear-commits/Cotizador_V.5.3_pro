/**
 * SISTEMA DE COTIZACIÓN V5.3 PRO
 * theme.js - Definición del tema visual global
 * 
 * Paleta de colores, tipografías, espaciado, sombras y variables reutilizables
 * Compatible con todos los componentes del sistema
 */

/**
 * Paleta de colores corporativa V5.2 Pro + refinamiento V5.3
 */
const colors = {
  // Colores principales (azul corporativo)
  primary: '#2A4E77',
  primaryLight: '#3D6A9A',
  primaryDark: '#1B3552',
  primaryHover: '#345D8A',
  primaryFocus: '#4A7DB0',
  
  // Grises corporativos
  gray50: '#FAFBFC',
  gray100: '#F5F7FA',
  gray200: '#E9ECF1',
  gray300: '#D0D6DE',
  gray400: '#A7B0BC',
  gray500: '#7B8796',
  gray600: '#576273',
  gray700: '#3D4654',
  gray800: '#2D3440',
  gray900: '#1A1F26',
  
  // Estados
  success: '#268347',
  successLight: '#D4EDDA',
  successDark: '#1E6B39',
  
  warning: '#D99A00',
  warningLight: '#FFF3CD',
  warningDark: '#B38200',
  
  error: '#C0392B',
  errorLight: '#F8D7DA',
  errorDark: '#9C2D22',
  
  info: '#1E73B8',
  infoLight: '#D1ECF1',
  infoDark: '#185A8F',
  
  // Fondos
  background: '#F5F7FA',
  backgroundDark: '#1A1F26',
  surface: '#FFFFFF',
  surfaceDark: '#2D3440',
  
  // Texto
  textPrimary: '#1A1F26',
  textSecondary: '#576273',
  textMuted: '#7B8796',
  textLight: '#FFFFFF',
  textDisabled: '#A7B0BC',
  
  // Bordes
  border: '#D0D6DE',
  borderLight: '#E9ECF1',
  borderDark: '#A7B0BC',
  
  // Categorías específicas del sistema
  categories: {
    personal: '#2A4E77',
    personalLight: '#E8EEF5',
    moviles: '#E67E22',
    movilesLight: '#FDF2E6',
    trailers: '#8E44AD',
    trailersLight: '#F4EBF7',
    capacitaciones: '#3F51B5',
    capacitacionesLight: '#ECEEF8',
    adicionales: '#E91E63',
    adicionalesLight: '#FCE4EC',
    service: '#2196F3',
    serviceLight: '#E3F2FD',
    mantenimiento: '#FF9800',
    mantenimientoLight: '#FFF3E0'
  },
  
  // Tipos de contratación
  contratos: {
    rd: '#2A4E77',
    rdLight: '#E8EEF5',
    mt: '#00ACC1',
    mtLight: '#E0F7FA',
    fuco: '#7B1FA2',
    fucoLight: '#F3E5F5'
  },
  
  // Adquisición
  adquisicion: {
    disponible: '#4CAF50',
    disponibleLight: '#E8F5E9',
    alquiler: '#00BCD4',
    alquilerLight: '#E0F7FA',
    compra: '#9C27B0',
    compraLight: '#F3E5F5'
  }
};

/**
 * Tipografías
 */
const typography = {
  fontFamily: "'Roboto', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
  fontFamilyMono: "'Roboto Mono', 'Consolas', monospace",
  
  // Tamaños de fuente
  fontSize: {
    xxs: '10px',
    xs: '11px',
    sm: '13px',
    md: '15px',
    lg: '18px',
    xl: '22px',
    xxl: '28px',
    xxxl: '36px'
  },
  
  // Pesos de fuente
  fontWeight: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  },
  
  // Altura de línea
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75
  },
  
  // Espaciado de letras
  letterSpacing: {
    tight: '-0.02em',
    normal: '0',
    wide: '0.02em',
    wider: '0.05em'
  }
};

/**
 * Espaciado
 */
const spacing = {
  xxs: '4px',
  xs: '8px',
  sm: '12px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
  xxxl: '64px',
  
  // Espaciado específico
  inputPadding: '8px 12px',
  buttonPadding: '10px 16px',
  cardPadding: '16px',
  sectionPadding: '24px',
  pagePadding: '32px'
};

/**
 * Bordes
 */
const borders = {
  // Radius
  radius: {
    none: '0',
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    full: '9999px'
  },
  
  // Ancho de borde
  width: {
    thin: '1px',
    medium: '2px',
    thick: '3px'
  },
  
  // Estilos predefinidos
  default: `1px solid ${colors.border}`,
  light: `1px solid ${colors.borderLight}`,
  dark: `1px solid ${colors.borderDark}`,
  primary: `1px solid ${colors.primary}`,
  success: `1px solid ${colors.success}`,
  error: `1px solid ${colors.error}`,
  warning: `1px solid ${colors.warning}`,
  
  // Focus
  focus: `2px solid ${colors.primaryFocus}`,
  focusOffset: '2px'
};

/**
 * Sombras
 */
const shadows = {
  none: 'none',
  xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
  sm: '0 2px 4px rgba(0, 0, 0, 0.08)',
  md: '0 4px 8px rgba(0, 0, 0, 0.10)',
  lg: '0 8px 16px rgba(0, 0, 0, 0.12)',
  xl: '0 12px 24px rgba(0, 0, 0, 0.15)',
  
  // Sombras específicas
  card: '0 2px 4px rgba(0, 0, 0, 0.08)',
  cardHover: '0 4px 8px rgba(0, 0, 0, 0.12)',
  panel: '0 3px 6px rgba(0, 0, 0, 0.12)',
  modal: '0 8px 32px rgba(0, 0, 0, 0.20)',
  dropdown: '0 4px 12px rgba(0, 0, 0, 0.15)',
  tooltip: '0 2px 8px rgba(0, 0, 0, 0.20)',
  
  // Sombras internas
  inset: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
  insetFocus: `inset 0 0 0 2px ${colors.primaryFocus}`
};

/**
 * Transiciones
 */
const transitions = {
  fast: '150ms ease',
  normal: '250ms ease',
  slow: '350ms ease',
  
  // Transiciones específicas
  color: 'color 150ms ease',
  background: 'background-color 150ms ease',
  border: 'border-color 150ms ease',
  shadow: 'box-shadow 200ms ease',
  transform: 'transform 200ms ease',
  opacity: 'opacity 200ms ease',
  all: 'all 200ms ease'
};

/**
 * Breakpoints responsive
 */
const breakpoints = {
  xs: '320px',
  sm: '576px',
  md: '768px',
  lg: '992px',
  xl: '1200px',
  xxl: '1400px'
};

/**
 * Z-index layers
 */
const zIndex = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  fixed: 300,
  modalBackdrop: 400,
  modal: 500,
  popover: 600,
  tooltip: 700,
  toast: 800
};

/**
 * Estilos de componentes específicos
 */
const components = {
  // Botones
  button: {
    primary: {
      background: colors.primary,
      color: colors.textLight,
      border: 'none',
      hoverBackground: colors.primaryHover,
      activeBackground: colors.primaryDark
    },
    secondary: {
      background: colors.gray200,
      color: colors.textPrimary,
      border: borders.default,
      hoverBackground: colors.gray300,
      activeBackground: colors.gray400
    },
    success: {
      background: colors.success,
      color: colors.textLight,
      border: 'none',
      hoverBackground: colors.successDark
    },
    danger: {
      background: colors.error,
      color: colors.textLight,
      border: 'none',
      hoverBackground: colors.errorDark
    },
    ghost: {
      background: 'transparent',
      color: colors.primary,
      border: 'none',
      hoverBackground: colors.gray100
    }
  },
  
  // Inputs
  input: {
    background: colors.surface,
    border: borders.default,
    borderRadius: borders.radius.md,
    padding: spacing.inputPadding,
    focusBorder: colors.primary,
    focusShadow: `0 0 0 3px ${colors.primaryLight}33`,
    errorBorder: colors.error,
    disabledBackground: colors.gray100
  },
  
  // Cards
  card: {
    background: colors.surface,
    border: borders.light,
    borderRadius: borders.radius.lg,
    shadow: shadows.card,
    padding: spacing.cardPadding,
    hoverShadow: shadows.cardHover
  },
  
  // Tablas
  table: {
    headerBackground: colors.gray200,
    headerColor: colors.textPrimary,
    rowEven: colors.surface,
    rowOdd: colors.gray50,
    rowHover: colors.gray100,
    border: borders.light,
    cellPadding: `${spacing.sm} ${spacing.md}`
  },
  
  // Badges
  badge: {
    borderRadius: borders.radius.full,
    padding: `${spacing.xxs} ${spacing.xs}`,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium
  },
  
  // Tooltips
  tooltip: {
    background: colors.gray800,
    color: colors.textLight,
    borderRadius: borders.radius.sm,
    padding: `${spacing.xs} ${spacing.sm}`,
    shadow: shadows.tooltip,
    fontSize: typography.fontSize.xs
  },
  
  // Modales
  modal: {
    background: colors.surface,
    backdropBackground: 'rgba(0, 0, 0, 0.5)',
    borderRadius: borders.radius.xl,
    shadow: shadows.modal,
    padding: spacing.sectionPadding
  }
};

/**
 * Estilos específicos para categorías del sistema
 */
const categoryStyles = {
  personal: {
    headerBg: colors.categories.personal,
    headerText: colors.textLight,
    lightBg: colors.categories.personalLight,
    accentColor: colors.categories.personal
  },
  moviles: {
    headerBg: colors.categories.moviles,
    headerText: colors.textLight,
    lightBg: colors.categories.movilesLight,
    accentColor: colors.categories.moviles
  },
  trailers: {
    headerBg: colors.categories.trailers,
    headerText: colors.textLight,
    lightBg: colors.categories.trailersLight,
    accentColor: colors.categories.trailers
  },
  capacitaciones: {
    headerBg: colors.categories.capacitaciones,
    headerText: colors.textLight,
    lightBg: colors.categories.capacitacionesLight,
    accentColor: colors.categories.capacitaciones
  },
  adicionales: {
    headerBg: colors.categories.adicionales,
    headerText: colors.textLight,
    lightBg: colors.categories.adicionalesLight,
    accentColor: colors.categories.adicionales
  },
  service: {
    headerBg: colors.categories.service,
    headerText: colors.textLight,
    lightBg: colors.categories.serviceLight,
    accentColor: colors.categories.service
  },
  mantenimiento: {
    headerBg: colors.categories.mantenimiento,
    headerText: colors.textLight,
    lightBg: colors.categories.mantenimientoLight,
    accentColor: colors.categories.mantenimiento
  }
};

/**
 * Utilidades de tema
 */
const utils = {
  // Obtener color con opacidad
  rgba: (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  },
  
  // Media query helper
  media: (breakpoint) => `@media (min-width: ${breakpoints[breakpoint]})`,
  
  // Truncar texto
  truncate: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  
  // Centrar flex
  flexCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  // Scroll personalizado
  customScroll: {
    scrollbarWidth: 'thin',
    scrollbarColor: `${colors.gray400} ${colors.gray100}`
  }
};

/**
 * Tema completo
 */
const theme = {
  colors,
  typography,
  spacing,
  borders,
  shadows,
  transitions,
  breakpoints,
  zIndex,
  components,
  categoryStyles,
  utils,
  
  // Metadatos
  name: 'V5.3 PRO Theme',
  version: '5.3.0',
  mode: 'light'
};

// Exportaciones individuales
export {
  colors,
  typography,
  spacing,
  borders,
  shadows,
  transitions,
  breakpoints,
  zIndex,
  components,
  categoryStyles,
  utils
};

// Exportación por defecto
export default theme;
