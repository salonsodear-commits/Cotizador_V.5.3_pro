# Cotizador Automático V5.3 PRO

Sistema profesional de cotización para servicios de salud con soporte para Personal, Móviles y Trailers.

## 🚀 Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev

# 3. Abrir en el navegador
# http://localhost:3000
```

## 📦 Build de Producción

```bash
# Generar build optimizado
npm run build

# Preview del build
npm run preview
```

## 🗂️ Estructura del Proyecto

```
/src
  /core                    # Lógica de negocio
    constants.js           # Constantes del sistema
    logic.js               # Lógica de clasificación
    calculations.js        # Cálculos de costos
    validators.js          # Validaciones
    parser.js              # Parser de archivos
  
  /components              # Componentes principales
    App.jsx                # Componente raíz
    Dashboard.jsx          # Panel de control
    Personal.jsx           # Gestión de personal
    Moviles.jsx            # Gestión de móviles
    Trailers.jsx           # Gestión de trailers
    Results.jsx            # Resultados y exportación
  
  /components/subcomponents  # Subcomponentes reutilizables
    TipoContratacionSelector.jsx
    HonorariosMonotributo.jsx
    ClasificacionRules.jsx
    HorasPorDiaSelector.jsx
    ItemsAdicionales.jsx
    ItemsCapacitaciones.jsx
    ViandasInline.jsx
    MovilesDisponibles.jsx
    MovilesAlquiler.jsx
    MovilesCompra.jsx
    ServiceMoviles.jsx
    MantenimientoMoviles.jsx
    TrailersDisponibles.jsx
    TrailersAlquiler.jsx
    TrailersCompra.jsx
    MantenimientoTrailers.jsx
    DiagramaSelector.jsx
    PersonalCard.jsx
    ResumenCategoria.jsx
    ExportButtons.jsx
  
  /services                # Servicios
    excelBuilder.js        # Generador de Excel
    reportGenerator.js     # Generador de PDF
    dataNormalizer.js      # Normalizador de datos
    fileImporter.js        # Importador de archivos
  
  /theme                   # Estilos
    theme.js               # Variables del tema
    styles.css             # Estilos globales
    layout.jsx             # Componente de layout
  
  main.jsx                 # Punto de entrada
```

## 🔧 Cómo Editar el Proyecto

### Modificar constantes
Editar `/src/core/constants.js`:
- Provincias disponibles
- Tipos de contratación
- Convenios
- Diagramas de trabajo
- Items predefinidos

### Modificar cálculos
Editar `/src/core/calculations.js`:
- `calcularCostoPersona()` - Costo por persona
- `calcularCostoMovil()` - Costo por móvil
- `calcularCostoTrailer()` - Costo por trailer
- `calcularTotales()` - Totales globales

### Modificar validaciones
Editar `/src/core/validators.js`:
- Agregar nuevas reglas de validación
- Modificar mensajes de error

### Modificar estilos
Editar `/src/theme/`:
- `theme.js` - Variables de colores, tipografía, espaciado
- `styles.css` - Estilos CSS globales
- `layout.jsx` - Estructura de la página

## ➕ Cómo Agregar Categorías Nuevas

### 1. Agregar constantes
En `/src/core/constants.js`:
```javascript
export const NUEVA_CATEGORIA_TIPOS = [
  { value: 'tipo1', label: 'Tipo 1' },
  { value: 'tipo2', label: 'Tipo 2' }
];
```

### 2. Agregar lógica
En `/src/core/logic.js`:
```javascript
export const getNuevaCategoriaClasificacion = (tipo, params) => {
  // Lógica de clasificación
};
```

### 3. Agregar cálculos
En `/src/core/calculations.js`:
```javascript
export const calcularCostoNuevaCategoria = (item) => {
  // Cálculos de costo
};
```

### 4. Crear componente
Crear `/src/components/NuevaCategoria.jsx`:
```jsx
import React from 'react';

const NuevaCategoria = ({ items, onChange }) => {
  return (
    <div>
      {/* UI del componente */}
    </div>
  );
};

export default NuevaCategoria;
```

### 5. Integrar en App.jsx
```jsx
import NuevaCategoria from './NuevaCategoria.jsx';
// Agregar al render
```

### 6. Agregar hoja de Excel
En `/src/services/excelBuilder.js`:
```javascript
const crearHojaNuevaCategoria = (workbook, payload) => {
  // Crear hoja con datos
};
```

## 📊 Cómo Regenerar el Excel Exportable

El Excel se genera automáticamente desde `ExportButtons.jsx`:

1. Los datos se preparan en `prepararPayload()`
2. Se llama a `excelBuilder.js` → `generarExcel(payload)`
3. Se crea un blob y se descarga

Para modificar el formato:
1. Editar `/src/services/excelBuilder.js`
2. Modificar las funciones `crearHoja*` según necesidad
3. Ajustar estilos en `estiloHeader`, `estiloSubtotal`, `estiloTotal`

## 🎨 Paleta de Colores

| Color | Hex | Uso |
|-------|-----|-----|
| Primary | #2A4E77 | Color principal |
| Primary Light | #3D6A9A | Hover, focus |
| Primary Dark | #1B3552 | Headers |
| Success | #268347 | Confirmaciones |
| Warning | #D99A00 | Advertencias |
| Error | #C0392B | Errores |

## 📋 Reglas de Negocio V5.3

1. **Trailers NO tienen Service** - Solo Mantenimiento
2. **Cálculos mensualizados** - P × Q / 12 para items anuales
3. **Amortización editable** - Override manual permitido
4. **Separación estricta** - Móviles y Trailers son categorías independientes

## 🛠️ Tecnologías

- **React 18** - UI
- **Vite 5** - Build tool
- **Lucide React** - Iconos
- **ExcelJS** - Generación de Excel
- **jsPDF** - Generación de PDF
- **XLSX** - Lectura de archivos Excel

## 📄 Licencia

MIT © Sistema de Cotización
