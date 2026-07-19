# Propuesta: algoritmo unificado de serialización canvas → AST

**Contexto:** reemplaza los hallazgos F1, F2, F3, F5, F6, F9, F11, F13 de `Tsubasa/AUDITORIA_AST_BULMA_TSUBASA.md` con un único algoritmo, en vez de los dos serializadores independientes (`dag_builder.ts` / `flow_to_ast.ts`) que hoy divergen.

---

## 0. Principio rector

Tsubasa ya resolvió este mismo problema en el backend con una tabla declarativa (`DF_REGISTRY`/`EXPR_REGISTRY`) en vez de una escalera `if/elif` por tipo. Bulma debe adoptar el mismo principio: **un solo registro declarativo de puertos** (`NODE_PORTS`) que reemplaza tanto el `switch` de `NodeHandles` (qué conectores dibujar) como los `if/else` de los dos serializadores actuales (qué campo del backend llena cada arista). Un tipo de nodo nuevo se agrega con **una fila en una tabla**, no tocando tres archivos distintos como hoy.

Consecuencia directa: deja de haber dos algoritmos. Hay uno, usado tanto por "Exportar JSON" como por "Ejecutar".

---

## 1. Qué cambia en el modelo de datos

### 1.1 Metadata explícita en la arista (`Edge.data`)

Hoy el "rol" de una arista (¿es `right` de un join? ¿la 2ª expresión de un `chain`?) se infiere en tiempo de serialización a partir de la posición X del nodo origen en el lienzo — la causa raíz de F3, y de un problema equivalente no reportado explícitamente en la auditoría original pero encontrado al diseñar esto: `buildExpr` también ordena por posición X los operandos de `binary` (`flow_to_ast.ts:57`), las 3 ramas de `when` (`:139`) y los operandos de `chain` (`:152`) — a pesar de que `binary` **sí** ya tiene handles `left`/`right` dedicados (`AstNodeCard.tsx:235-236`) que hoy simplemente no se leen.

Propuesta: fijar el rol y el orden **una sola vez, en el momento de crear la conexión**, y persistirlo en la arista — nunca recalcularlo desde coordenadas que cambian cada vez que el usuario reordena el lienzo.

```ts
interface AstEdgeData {
  role?: string;   // nombre de campo en el backend: "right" | "predicate" | "aggs" | "condition" | ...
                    // si se omite, se deriva de targetHandle/sourceHandle
  order?: number;   // orden estable para campos de tipo lista (chain.operands, select.exprs, group_by.aggs...)
                    // asignado una vez al conectar, autoincremental por nodo+rol
  port?: string;    // solo para aristas de tipo "bindings" hacia un subgraph
}
```

### 1.2 Registro declarativo de puertos (`NODE_PORTS`)

Una fila por tipo de nodo, generada idealmente desde el volcado de contrato de Tsubasa propuesto en la Fase 0 de la auditoría (`DF_REGISTRY`/`EXPR_REGISTRY` con sus campos y anotaciones), no escrita a mano:

```ts
type Arity = "single" | "list" | "dict";
type ChildKind = "df" | "expr" | "series";

interface PortSpec {
  handleId: string;
  field: string;      // campo exacto del backend (predicate, exprs, aggs, right, condition, then, otherwise, operands...)
  arity: Arity;
  childKind: ChildKind;
  direction: "target" | "source"; // desde la perspectiva del nodo dueño del puerto
}

const NODE_PORTS: Record<string, PortSpec[]> = {
  filter:       [{ handleId: "dataflow-in", field: "source",    arity: "single", childKind: "df",   direction: "target" },
                 { handleId: "predicate",   field: "predicate", arity: "single", childKind: "expr", direction: "source" }],

  with_columns: [{ handleId: "dataflow-in", field: "source", arity: "single", childKind: "df",   direction: "target" },
                 { handleId: "expr",        field: "exprs",  arity: "list",   childKind: "expr", direction: "source" }],   // ← resuelve F5

  group_by:     [{ handleId: "dataflow-in", field: "source", arity: "single", childKind: "df",   direction: "target" },
                 { handleId: "agg",         field: "aggs",   arity: "list",   childKind: "expr", direction: "source" }],   // ← resuelve F6

  join:         [{ handleId: "input", field: "source", arity: "single", childKind: "df", direction: "target" },
                 { handleId: "right", field: "right",  arity: "single", childKind: "df", direction: "target" }],           // ← resuelve F3 (join)

  binary:       [{ handleId: "left",  field: "left",  arity: "single", childKind: "expr", direction: "source" },
                 { handleId: "right", field: "right", arity: "single", childKind: "expr", direction: "source" }],          // ← usa los handles que ya existían

  when:         [{ handleId: "condition", field: "condition", arity: "single", childKind: "expr", direction: "source" },
                 { handleId: "then",      field: "then",      arity: "single", childKind: "expr", direction: "source" },
                 { handleId: "otherwise", field: "otherwise", arity: "single", childKind: "expr", direction: "source" }],  // ← resuelve F9 (when)

  chain:        [{ handleId: "operand", field: "operands", arity: "list", childKind: "expr", direction: "source" }],
  // ...una entrada por cada clave de DF_REGISTRY / EXPR_REGISTRY
};
```

`NODE_PORTS` reemplaza simultáneamente: el `switch` de `NodeHandles` (los `<Handle>` se renderizan iterando esta tabla, no escribiendo un `case` por tipo) y la lógica de `wireEdgeKey`/`buildDFNode`/`buildExpr` que hoy decide "a qué campo va esta arista" mirando el string del `nodeType`.

---

## 2. El algoritmo unificado

Un único `buildDocument`, sin ramas por botón:

```ts
function buildDocument(nodes: Node<AstNodeData>[], edges: Edge[]): BackendDocument {
  // 1. Clasificar cada nodo: df | expr | series | group  (una sola función, no isExpression disperso)
  const kindOf = classifyAll(nodes);

  // 2. Validación estructural PREVIA (client-side), antes de construir nada:
  //    por cada nodo, ¿tiene conectado todo campo "required" según el contrato de Tsubasa (Fase 0)?
  //    ¿hay más de una arista en un puerto de arity "single"? ¿hay ids de handle sin fila en NODE_PORTS?
  const problems = validateStructure(nodes, edges, kindOf);
  if (problems.length) throw new AggregateValidationError(problems); // resuelve F11: falla antes de tocar el backend

  // 3. Ciclo (mismo algoritmo DFS 3 colores que check_acyclic en graph.py, corrido aquí también)
  assertAcyclic(nodes, edges, kindOf);

  // 4. Caso legítimo y distinto: cadena de Series pura, sin nodos DF -> {"series": [...]}
  if (isPureSeriesChain(nodes, kindOf)) return { series: buildSeriesChain(...) };

  // 5. Recorrido único, con "visited" COMPARTIDO entre todas las hojas (deduplicación por id,
  //    igual que ya hace dag_builder.ts hoy -- se conserva, es el patrón correcto)
  const visited = new Set<string>();
  const nodesById: Record<string, StepJSON> = {};

  function serialize(id: string): void {
    if (visited.has(id)) return;
    visited.add(id);
    const node = nodes.find(n => n.id === id)!;

    if (node.type === "groupNode") {
      nodesById[id] = serializeGroupAsSubgraph(id, nodes, edges, serialize); // ya correcto en dag_builder.ts hoy
      return;
    }

    if (kindOf[id] === "expr") return; // los nodos de expresión se inline-an desde su padre, nunca aparecen sueltos en `nodes`

    const step: StepJSON = { type: node.data.nodeType };
    for (const port of NODE_PORTS[node.data.nodeType] ?? []) {
      const incoming = edgesInto(node.id, port.handleId, edges)
        .sort((a, b) => (a.data?.order ?? 0) - (b.data?.order ?? 0)); // orden persistido, NUNCA por posición x/y

      if (port.childKind === "df") {
        for (const e of incoming) serialize(e.source);           // el padre DF entra a la tabla plana por id
        if (port.arity === "single" && incoming[0]) step[port.field] = incoming[0].source;
      } else {
        const built = incoming.map(e => buildExprSubtree(e.source, nodes, edges)); // recursivo, se mantiene igual que hoy
        step[port.field] = port.arity === "list" ? built : built[0] ?? null;
      }
    }
    nodesById[id] = step;
  }

  const leaves = nodes.filter(n => kindOf[n.id] === "df" && !hasOutgoingDFEdge(n.id, edges, kindOf));
  leaves.forEach(l => serialize(l.id));

  return { graph: { nodes: nodesById, outputs: leaves.map(l => l.id) } };
}
```

Este `buildDocument` es la **única** función que llaman tanto `handleExportJson` como `handleExecute` en `AstCanvas.tsx` — desaparece la posibilidad misma de que ambos botones diverjan (F1), y como el manejo de `groupNode`→`subgraph` vive dentro del mismo recorrido (no en un módulo aparte que "Ejecutar" nunca invoca), F2 desaparece por construcción, no por disciplina de mantenimiento.

---

## 3. Compatibilidad con flujos ya guardados

Los grafos guardados antes de esta migración no tienen `edge.data.order`/`role` explícitos. Se resuelve con una función de migración que corre **una sola vez** al cargar un flujo antiguo:

```ts
function migrateLegacyEdges(nodes, edges): Edge[] {
  return edges.map(e => {
    if (e.data?.role !== undefined) return e; // ya migrado
    const role = e.targetHandle ?? inferRoleByPositionHeuristic(e, nodes); // el heurístico viejo se usa UNA VEZ, aislado aquí
    const order = computeStableOrder(e, nodes, edges);
    return { ...e, data: { ...e.data, role, order } };
  });
}
```

La heurística de posición no se elimina de golpe (evitaría romper diseños guardados con el algoritmo viejo); se confina a este único punto de entrada, se ejecuta una vez, y su resultado se persiste — nunca vuelve a correr en el camino caliente de serialización.

---

## 4. Qué NO cambia

- `buildExpr`/la construcción recursiva de subárboles de expresión, `isSeriesNode`, `buildSeriesChain`: la lógica es correcta hoy, solo se re-conecta al nuevo dispatch por tabla en vez de invocarse desde dos lugares distintos.
- El formato `{"graph": {...}}` en sí: ya es correcto y es el que hoy solo usa "Exportar". Se generaliza como formato único.
- `serializeGroupAsSubgraph`: su lógica ya es correcta en `dag_builder.ts`; se reutiliza tal cual dentro del nuevo `buildDocument`.

## 5. Impacto directo sobre los hallazgos de la auditoría

| Hallazgo | Resuelto por |
|---|---|
| F1 — dos serializadores | un único `buildDocument`, un único punto de llamada para ambos botones |
| F2 — grupos rotos en Ejecutar | el manejo de `groupNode` vive dentro del único algoritmo, no en un módulo que "Ejecutar" ignora |
| F3 — heurística X en joins | handles `input`/`right` explícitos + `NODE_PORTS`, más el mismo tratamiento para `binary`/`when`/`chain` (no reportado como F3 pero de la misma familia) |
| F5 — `with_columns` sin puerto | fila explícita en `NODE_PORTS` |
| F6 — `group_by` mal `cased` | fila explícita en `NODE_PORTS`, ya no depende de un `switch` con nombres de tipo escritos a mano |
| F9 — expresiones sin puertos semánticos | fila explícita para `call`/`alias`/`cast`/`over`/`sort_expr`/`when` |
| F11 — falla tardía | `validateStructure()` corre antes de tocar el backend |
| F13 — duplicación | una sola implementación |

---

*Este documento propone el algoritmo; su implementación corresponde a la Fase 1–3 del plan de refactorización en `Tsubasa/AUDITORIA_AST_BULMA_TSUBASA.md`.*
