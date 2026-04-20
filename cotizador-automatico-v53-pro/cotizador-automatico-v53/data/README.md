# Datos del cotizador (Excel → JSON)

Acá van los **archivos fuente** que alimentan el sistema. Nada se "hardcodea"
en el código: todo vive en Excel y se regenera como JSON automáticamente.

## Estructura

```
data/excel/               ← ponés los .xlsx acá
src/data/                 ← se genera solo (NO editar a mano)
  <nombre>.json
  index.js                ← re-exporta todos los datasets
```

## Flujo de trabajo

1. Editás o agregás un `.xlsx` en `data/excel/`.
2. Corrés `npm run data:build` (o `npm run data:watch` mientras trabajás).
3. Hacés commit del Excel **y** del JSON generado.
4. En GitHub, el workflow `deploy-s3.yml` corre `npm run build`, que ya
   incluye `data:build`. El sitio se publica con los datos actualizados.

## Reglas del Excel

- **Fila 1** = nombres de columna. Se normalizan a `snake_case`
  (`Precio Hora` → `precio_hora`).
- Una fila por registro. Filas totalmente vacías se ignoran.
- Varias hojas por archivo: el JSON queda como objeto
  `{ hoja1: [...], hoja2: [...] }`. Una sola hoja: JSON es un array plano.
- Nombre del archivo = nombre del JSON.  
  `convenios.xlsx` → `src/data/convenios.json`.

## Usar los datos desde el código

```js
// Opción 1: import nombrado
import { convenios } from '@/data';

// Opción 2: import directo del JSON
import convenios from '@/data/convenios.json';
```

## Comandos

| Comando                  | Qué hace                                         |
| ------------------------ | ------------------------------------------------ |
| `npm run data:build`     | Convierte todos los Excel a JSON una vez         |
| `npm run data:watch`     | Igual, pero se queda observando cambios          |
| `npm run build`          | `data:build` + build de producción de Vite       |
| `npm run dev`            | `data:build` + servidor de desarrollo            |

## Preguntas frecuentes

**¿Y si borro un Excel?** Borrá también el `.json` correspondiente y hacé
commit. El `index.js` se regenera sin él en la próxima corrida.

**¿Puedo mezclar Excel con otros formatos (CSV)?** Por ahora sólo `.xlsx`.
Si hace falta CSV, se suma al script (es un cambio chico).

**¿Qué pasa con fórmulas de Excel?** Se evalúan con sus valores calculados
al leer el archivo, así que el JSON contiene el resultado final.
