# Arquitectura de Bulma (Denki Pipeline Designer)

Este documento describe la arquitectura actual del código en `src/`: los procesos de Electron, las capas del renderer, el modelo de dominio del editor visual, y las convenciones que el proyecto sigue para mantenerse SOLID/DRY. Está pensado para que alguien nuevo en el repo pueda ubicarse sin tener que leer archivo por archivo.

## 1. Qué es esta aplicación

Bulma (nombre de producto: **Denki Pipeline Designer**) es una app de escritorio Electron que permite **diseñar visualmente pipelines de transformación de datos** (basados en Polars) y **modelos de Machine Learning**, arrastrando y conectando nodos en un canvas tipo n8n/Node-RED, y ejecutarlos contra un backend Python local ("Tsubasa") para ver el resultado.

El canvas serializa el grafo de nodos a un contrato JSON (`GraphDocument`) que el backend interpreta como un árbol de sintaxis abstracta (AST) de operaciones Polars — de ahí el nombre "AST Editor" en el código.

## 2. Stack técnico

| Capa | Tecnología |
|---|---|
| Shell de escritorio | Electron 42, empaquetado con Electron Forge |
| UI | React 19 + TypeScript, HeroUI (componentes base), Tailwind CSS 4 |
| Canvas de nodos | [reactflow](https://reactflow.dev) v11 |
| Build | Webpack (vía `@electron-forge/plugin-webpack`), `ts-loader` |
| Backend de ejecución | Binario Python empaquetado (`bin/tsubasa.exe`), un servidor Flask que evalúa el AST con Polars/scikit-learn/Bokeh |
| Extracción de documentos | `bin/xmljava.exe` (docx/xls/pdf → XML) + Python embebido (`bin/python-3.13.14-embed-amd64/`) para BeautifulSoup/polars/pdf2docx |

El proceso `main` de Electron nunca ejecuta lógica de negocio directamente: orquesta subprocesos (`tsubasa.exe`, Python embebido) y expone resultados al renderer vía IPC.

## 3. Los dos procesos de Electron

```
src/
├── index.ts                 # Entry point del proceso MAIN (composition root)
├── preload.ts                # Puente de contextBridge — el ÚNICO archivo con acceso a ipcRenderer
├── renderer.tsx               # Entry point del proceso RENDERER (monta React)
├── main/                     # Todo lo que corre en el proceso main
└── ast-editor/, shared/, pages/, App.tsx   # Todo lo que corre en el proceso renderer
```

- **`src/index.ts`** es el *composition root* del proceso main: construye los servicios (`PythonInterpreter`, `BackendManager`, `DocumentProcessorService`, `DatasetExtractor`), los inyecta en `registerHandlers(...)`, arranca `tsubasa.exe` y crea la `BrowserWindow`.
- **`src/preload.ts`** corre en un contexto aislado (`contextBridge`) y expone `window.desktop` como la única superficie que el renderer puede usar para hablar con el proceso main. El renderer **nunca** importa `electron` directamente.
- Los nombres de canal IPC viven en un solo lugar: [`src/shared/ipc-channels.ts`](../src/shared/ipc-channels.ts) (`IPC_CHANNELS`), importado tanto por `preload.ts` como por cada handler en `main/handlers/`. Antes de esto cada lado redeclaraba los strings de canal por su cuenta y podían desincronizarse (pasó con `backends:start`).

## 4. Proceso main (`src/main/`)

```
main/
├── config.ts                 # resolvePorts() — encuentra puertos libres para tsubasa
├── handlers/                  # Un archivo por dominio de canales IPC — delgados, solo delegan
│   ├── index.ts                #   registerHandlers(): composition root de los handlers
│   ├── dialog.ts                #   diálogos nativos de archivo (sin dependencias inyectadas)
│   ├── backend.ts               #   start/stop/status de tsubasa.exe
│   ├── api.ts                   #   ejecutar pipeline + orquestar poda de XML
│   ├── document.ts              #   procesar un documento (doc/pdf/xls → texto plano)
│   └── dataset.ts               #   columnas/preview de un CSV/Parquet
├── services/
│   ├── python-interpreter.ts    # Único punto que sabe ejecutar el Python embebido
│   ├── backend-manager.ts       # spawn/kill de tsubasa.exe
│   ├── api-client.ts             # cliente axios hacia tsubasa.exe
│   ├── document-processor.ts     # orquesta PDFConverter + xmljava.exe + XMLExtractor
│   └── pruning-orchestrator.ts   # arma el XML podado a partir del resultado de ejecución
└── scripts_python/             # Generación de código Python "a mano" (ver §4.1)
    ├── python-script-builder.ts        # Builder genérico: imports+setup+lógica+output
    ├── python-script-runner-builder.ts # Clase base para *Builder de runners
    ├── run-python-script.ts            # Ensambla + ejecuta + parsea JSON + normaliza error
    ├── pdf-converter.ts / -strings.ts
    ├── xml_extractor/
    ├── xml_pruner/
    └── dataset_extractor/
```

### 4.1 Patrón de los "scripts Python"

Varias features (extraer texto de un XML, podar un XML, leer columnas de un CSV/Parquet, convertir PDF→DOCX) funcionan generando **código Python como texto** y ejecutándolo vía `python.exe -c "<code>"`. Para evitar que cada feature reinvente su propio ensamblado/ejecución/parseo de errores, el patrón es:

1. **`PythonScriptBuilder`** — junta `imports + setup + lógica + output` en un solo string de código Python.
2. **`PythonScriptRunnerBuilder<T>`** (clase base abstracta) — cada builder concreto (`XMLExtractorBuilder`, `XMLPrunerBuilder`) solo declara sus propios campos; recibe un `PythonInterpreter` inyectado (no crea el suyo).
3. **`runPythonScript<T>()`** — dado un `PythonInterpreter` + las 4 piezas de texto + un prefijo de error, ejecuta el código y devuelve el JSON parseado, lanzando un error con contexto si el script devolvió `{"error": ...}`.

Todo nuevo "script Python" implementa estas piezas en vez de copiar el ciclo completo. `PythonInterpreter` se construye **una sola vez** en `src/index.ts` y se inyecta hacia abajo — no hay una instancia por servicio.

### 4.2 Canales IPC expuestos

| Canal (`IPC_CHANNELS`) | Handler | Qué hace |
|---|---|---|
| `dialog:selectFile` / `dialog:selectSavePath` / `file:save` / `dialog:download-file` | `dialog.ts` | Diálogos nativos de archivo |
| `backends:start` / `backends:stop` / `backends:status` | `backend.ts` | Ciclo de vida de `tsubasa.exe` |
| `api:execute-pipeline` | `api.ts` | Ejecuta el `GraphDocument` contra tsubasa; si hay `testFilePath`, orquesta la poda del XML vía `PruningOrchestrator` |
| `api:process-document` | `document.ts` | doc/pdf/xls/xlsx → array de strings (para el nodo "File Reader") |
| `dataset:get-columns` / `dataset:get-preview` | `dataset.ts` | Columnas/preview de un CSV/Parquet (para el nodo "Scan") |

## 5. Proceso renderer — capas

El renderer sigue **atomic design** dentro de `src/ast-editor/`, con una carpeta `shared/` para todo lo que no es específico del editor de AST:

```
src/
├── shared/                    # Reutilizable por cualquier feature, no depende de ast-editor/
│   ├── adapters/                # DesktopAdapter — la única forma correcta de hablar con window.desktop
│   ├── atoms/                   # Botones/inputs genéricos (Button, Select, PillTabButton, PaginationBar...)
│   ├── hooks/                   # Hooks genéricos (useFileBrowse)
│   ├── algoritmos/               # dag_builder, node_ports, series_types — el contrato canvas ⇄ backend
│   ├── services/                 # pipeline_service (ejecutar el pipeline)
│   ├── types/                    # ast_types.ts — la única fuente de verdad de tipos del dominio
│   └── utils/                    # ast_to_flow, flow_to_ast, node_labels, node_metadata, event_bus, column_store...
│
├── ast-editor/                 # Todo lo específico del editor visual, en capas atómicas
│   ├── atoms/                    # NodeHandle
│   ├── molecules/                 # AstNodeCard, ChainForm, NodeContextMenu, NodeHeader, PropertyField...
│   ├── organisms/                  # NodeLibrary, NodePanel, ResultTable, Toolbar, HelpModal, ExamplesLibrary
│   │   ├── data/                    # Listas constantes de NodeLibrary (ver §8)
│   │   ├── hooks/                   # useNodeFormState
│   │   ├── node-form/                # Sistema de formularios declarativos de NodePanel (ver §7)
│   │   └── result-table/             # Subcomponentes + hooks de ResultTable (ver §6.3)
│   ├── templates/                  # AstCanvas (el editor completo), AstEditorLayout
│   │   └── hooks/                    # 8 hooks que le dan estado/lógica a AstCanvasInner (ver §6.1)
│   ├── file-reader/                # Feature semi-independiente: leer un doc/pdf/xls a una columna
│   └── examples/                   # Pipelines de ejemplo precargados (ExamplesLibrary)
│
└── pages/EditorPage.tsx        # Compone AstEditorLayout + AstCanvas — la única "página" de la app
```

### 5.1 El adapter de escritorio

`src/shared/adapters/desktop-adapter.ts` implementa la interfaz `DesktopAdapter` (`src/shared/adapters/types.ts`) delegando a `window.desktop` (lo que `preload.ts` expuso). **Es la única forma correcta de llamar al proceso main desde un componente** — nunca se debe tocar `(window as any).desktop` directamente en un componente (esto se corrigió varias veces: `pipeline_service.ts`, `NodePanel.tsx`, `AstCanvas.tsx`, `ResultTable.tsx` lo hacían y se migraron todos al adapter).

## 6. `AstCanvas` — el editor completo

`AstCanvas.tsx` (en `templates/`) es el componente raíz del canvas. Sigue el principio de que **un template solo compone**: todo el estado y la lógica de negocio vive en hooks dedicados bajo `templates/hooks/`, y el componente en sí solo llama a esos hooks y renderiza JSX.

### 6.1 Los 8 hooks de `AstCanvas`

| Hook | Responsabilidad |
|---|---|
| `useNodeSelection` | Nodo seleccionado, el drawer de propiedades (`NodePanel`), y `handleDrawerChange` (escribe una edición de vuelta al canvas) |
| `useNodeContextMenu` | Menú contextual (click derecho) + agregar hijo / duplicar / borrar nodo |
| `useNodeGrouping` | Selección múltiple + agrupar/desagrupar en un `groupNode` |
| `useCanvasExecution` | Construir el `GraphDocument` de ejecución, llamar a `pipelineService`, estado de resultado/error/loading |
| `useCanvasIO` | Cargar pipeline por defecto al montar, importar/exportar JSON, cargar un ejemplo |
| `useNodeCreation` | Cómo entra un nodo nuevo al canvas: arrastrado desde `NodeLibrary` o agregado directo desde `HelpModal` |
| `useEdgeConnections` | `onConnect` (con el sello de orden estable en la arista) + validación de conexiones estructurales |
| `useCanvasModals` | Visibilidad de `HelpModal`/`ExamplesLibrary` |

`useNodeSelection` y `useNodeContextMenu` se coordinan **por evento** (`eventBus.notify("OPEN_NODE_PANEL", nodeId)`) en vez de acoplarse directamente entre sí — el mismo patrón que ya usaban `columnStore`/`NodePanel`.

### 6.2 `NodePanel` — el drawer de propiedades

`NodePanel.tsx` es el panel que aparece al hacer click en un nodo para editar sus propiedades. Internamente:

- **`hooks/useNodeFormState.ts`** — `editValues`, la suscripción a `columnStore`, y `handleFieldChange`.
- **`node-form/`** — el sistema de formularios en sí (ver §7).

### 6.3 `ResultTable` — el modal de resultados

Al ejecutar un pipeline, `ResultTable.tsx` muestra el resultado en un modal con pestañas (una por salida del grafo) y 3 modos (Polars / SQL / Plot). Está descompuesto en `organisms/result-table/`:

- `normalize-results.ts` — normaliza las 3 formas posibles de `ExecutionResult` (`dataframe`, `series`, `outputs`) a un array uniforme de `NamedResult`.
- `hooks/useResultViewState.ts` — qué pestaña/modo está activo.
- `hooks/useResultPagination.ts` — paginación (compartida entre la vista de DataFrame y la de Series).
- `OutputTabsBar`, `ViewModeSwitch`, `ResultHeaderInfo`, `PolarsExplanationBanner`, `SeriesResultView`, `DataFrameResultView`, `SqlModeView`, `PlotModeView`, `ResultModalFooter` — un componente por sección visual.

## 7. Sistema de formularios de `NodePanel` (`node-form/`)

Cada tipo de nodo del AST (~124 tipos) necesita un formulario distinto en el panel de propiedades. En vez de un `switch` gigante (como existía antes), hay un **registro declarativo**:

```ts
// node-form/field-spec.tsx
type NodeFormEntry = FieldSpec[] | ((ctx: FormContext) => ReactNode);

// node-form/node-form-schemas.tsx
export const NODE_FORM_SCHEMAS: Record<string, NodeFormEntry> = {
    col: [{ kind: "select", key: "name", label: "Column Name", ... }],
    binary: [{ kind: "select", key: "op", options: BINARY_OPERATORS, ... }],
    join: joinForm,   // shape con lógica condicional → función de render a medida
    ...
};
```

- Un tipo de nodo con un formulario **simple** (lista fija de campos) se declara como un array de `FieldSpec` (`text` | `select` | `multiselect` | `switch` | `list`), interpretado genéricamente por `renderFieldSpecs()`.
- Un tipo de nodo con lógica condicional real (el nodo de ML, `join`, `chain`, `scan`, `call`...) se declara como una función `(ctx) => ReactNode` — el mismo código que antes vivía en un `case`, ahora una entrada de mapa en vez de una rama de switch.
- **Agregar un tipo de nodo nuevo = agregar una entrada al mapa**, nunca editar un switch compartido. Mismo espíritu que `node_ports.ts` (§9).

Los formularios complejos que necesitan su propio estado (`ScanForm`, `LoadDatasetColumnForm`, `RenameForm`, `CallForm`) viven en `node-form/sub-forms.tsx`, con su lógica de "elegir archivo → cargar columnas" compartida vía `node-form/hooks/useDatasetPathFetch.ts`.

## 8. Convención `data/`

Cuando un archivo mezcla **lógica** (funciones, closures de `getValue`/`onChange`) con **datos puros** (listas de opciones, mapeos tipo→ícono, catálogos de nodos), los datos se separan a una carpeta `data/` sibling, para que el archivo de lógica se lea como "el campo X tiene las opciones Y" en vez de mezclar forma con literales sin nombre:

- `ast-editor/organisms/node-form/data/` — `dtype-options.ts`, `field-options.ts`, `node-type-groups.ts`, `call-form-data.ts`.
- `ast-editor/organisms/data/` — `node-categories.ts` (el catálogo `CATEGORIES` de `NodeLibrary`, ~475 líneas) y `node-icons.ts` (`ICON_MAP`).

Los consumidores externos de estos datos (`HelpModal.tsx`, `useNodeCreation.ts`) importan **directo de la carpeta `data/`**, no a través de re-exports del componente que originalmente los declaraba — evita una capa de indirección innecesaria.

## 9. El contrato canvas ⇄ backend (`shared/algoritmos/`)

Este es el núcleo del dominio: cómo un grafo de nodos de ReactFlow se convierte en el AST que Tsubasa ejecuta, y viceversa.

- **`node_ports.ts`** — registro declarativo de qué "puertos" (conectores) tiene cada tipo de nodo, tanto entrantes (`NODE_INCOMING_PORTS`) como salientes (`NODE_OUTGOING_PORTS`), y a qué campo del JSON de salida corresponde cada uno. También expone `isValidConnection()`, usado por `useEdgeConnections` para rechazar conexiones estructuralmente inválidas (una expresión conectada donde va un DataFrame, etc.) **antes** de dibujarlas.
- **`dag_builder.ts`** (`GraphDocumentBuilder`) — el único serializador canvas → `GraphDocument`. `buildGraphDocument()` (exportar JSON) y `buildExecutionDocument()` (ejecutar) resuelven ambos a esta misma clase; ya no hay dos walkers independientes que puedan divergir.
- **`series_types.ts`** — el conjunto canónico `SERIES_NODE_TYPES` (tipos de nodo Series, ~150 identificadores) y `DF_EXPR_ONLY_TYPES`, importado por `ast_to_flow.ts` y `flow_to_ast.ts` para no mantener dos copias de la misma lista.
- **`shared/utils/ast_to_flow.ts`** — `PipelineJson`/`GraphDocument` → nodos/aristas de ReactFlow (al cargar un pipeline).
- **`shared/utils/flow_to_ast.ts`** — utilidades para reconstruir subárboles de expresión desde el canvas (usado por `dag_builder.ts`).
- **`shared/utils/node_labels.ts`** — `getNodeLabel(nodeType, properties)`, la única función que decide la etiqueta legible de un nodo ("Sort(by=[...])", "Chain (AND) · 3"...). Antes existía duplicada como `getLabel` en `ast_to_flow.ts` y `getDynamicLabel` en `AstCanvas.tsx`; ya habían divergido (un tipo de nodo tenía etiqueta bonita en un lado y no en el otro).

### Nodo DataFrame vs. nodo Series/Expresión

Un nodo del canvas es, conceptualmente, uno de dos tipos (`AstNodeData.isExpression`):

- **DataFrame (`DFNode`)**: `scan`, `filter`, `select`, `join`, `group_by`, `write_csv`... — transforma un DataFrame en otro.
- **Expresión / Series (`ExprNode`)**: `col`, `binary`, `get_column`, `str_contains`, `rolling_mean`... — computa un valor o una columna.

Varios identificadores de tipo (`sort`, `fill_null`, `shift`, `sample`, `unique`, `rechunk`, `drop_nulls`) son **compartidos** entre ambos mundos (ej. `.sort()` existe tanto en `DataFrame` como en `Series` de Polars) — el código que interpreta estos tipos debe distinguir por `isExpression`/contexto, nunca asumir que el string del tipo alcanza. Esto ya causó bugs reales (switches con un `case` DataFrame y un `case` Series para el mismo nombre, donde el segundo quedaba enmascarado) — documentados inline donde se corrigieron (`NodePanel`'s `node-form-schemas.tsx`, `node_labels.ts`).

## 10. Otras piezas compartidas

- **`event_bus.ts`** — pub/sub mínimo (`subscribe`/`unsubscribe`/`notify`), sin tipos por evento. Se usa para desacoplar features que no deberían conocerse directamente: `columnStore` → cualquier componente que necesite la lista de columnas (`COLUMNS_CHANGED`), el menú contextual → `NodePanel` (`OPEN_NODE_PANEL`).
- **`column_store.ts`** — singleton con las columnas del dataset activo, alimentado desde nodos `scan` o desde un resultado de ejecución.
- **`node_metadata.ts`** — diccionario estático de descripciones/uso típico por tipo de nodo (mostrado en `NodePanel`) y `nodeSupportsSql()` (si un tipo de nodo es exportable a SQL).
- **`ast_wrappers.ts`** — helpers puros para envolver cadenas de operadores binarios (`buildBinaryOpChain`).

## 11. Build y arranque

- `npm start` → `electron-forge start`: levanta webpack en modo watch para main + renderer, y Electron.
- `src/index.ts` (main, on `app.ready`): resuelve puertos libres → crea `BackendManager`/`ApiClient`/`PythonInterpreter` → arranca `tsubasa.exe` → registra los handlers IPC → crea la `BrowserWindow`.
- **Gotcha conocido**: en algún momento hubo archivos `.js` compilados obsoletos committeados junto a su fuente `.ts` (`node_ports.js`, `dag_builder.js`, `flow_to_ast.js`) que webpack resolvía *antes* que el `.ts` real, haciendo que ediciones al código real no se reflejaran en el bundle. `webpack.renderer.config.ts` fuerza `extensions: ['.ts', '.tsx', '.js', ...]` (TS primero) como mitigación, con el incidente documentado inline. Si en el futuro aparece un `.js` con el mismo nombre que un `.ts` en `shared/`, sospechar de esto primero.
- `npm run lint` → ESLint sobre `.ts`/`.tsx`. Hay 4 errores preexistentes conocidos y aceptados (no relacionados con lógica): 2 por la regla `react-hooks/exhaustive-deps` referenciada en comentarios pero no configurada como plugin, y 2 por bloques `catch {}` vacíos intencionales en `flow_to_ast.ts`.

## 12. Convenciones a seguir al agregar código nuevo

1. **Nunca tocar `window.desktop` directo** — pasar siempre por `desktopAdapter` (`shared/adapters/desktop-adapter.ts`).
2. **Nunca agregar un `case` a un switch gigante de tipos de nodo** — si es para `NodePanel`, agregar una entrada a `NODE_FORM_SCHEMAS`; si es una lista de tipos, va a `data/`.
3. **Un componente "template" u "organism" grande compone hooks, no acumula estado propio** — si un componente empieza a juntar `useState`/`useEffect`/handlers no triviales, es candidato a un hook dedicado en su propia carpeta `hooks/`.
4. **Datos puros (arrays de opciones, mapas tipo→ícono/etiqueta) van en un archivo `data/` aparte** de la lógica que los consume.
5. **`PythonInterpreter` se inyecta, nunca se instancia por servicio** — cualquier clase nueva que necesite ejecutar Python lo recibe por constructor.
6. **Los canales IPC se agregan a `IPC_CHANNELS`** (`shared/ipc-channels.ts`), nunca como string literal suelto en `preload.ts` o un handler.
