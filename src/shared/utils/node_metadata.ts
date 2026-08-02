export interface PipelineNodeExample {
    type: string;
    label: string;
    method?: string;
}

export interface NodeMetadata {
    name: string;
    description: string;
    typicalUse: string;
    category: string;
    pipeline: PipelineNodeExample[];
    pipelineExplanation: string;
}

export const NODE_METADATA_MAP: Record<string, NodeMetadata> = {
    write_csv: {
        name: "Exportar a CSV",
        description: "Guarda el flujo actual en un archivo CSV en el servidor local.",
        typicalUse: "Al final de un flujo para guardar los datos limpiados o procesados.",
        category: "export",
        pipeline: [],
        pipelineExplanation: ""
    },
    write_excel: {
        name: "Exportar a Excel",
        description: "Guarda el flujo actual en un archivo Excel en el servidor local.",
        typicalUse: "Para exportar datos procesados listos para compartir con otras áreas.",
        category: "export",
        pipeline: [],
        pipelineExplanation: ""
    },
    write_html: {
        name: "Exportar a HTML",
        description: "Guarda el flujo actual en una tabla HTML estática en el servidor local.",
        typicalUse: "Para incrustar los resultados en un reporte o enviarlos por correo.",
        category: "export",
        pipeline: [],
        pipelineExplanation: ""
    },
    write_json: {
        name: "Exportar a JSON",
        description: "Guarda el flujo actual en un archivo JSON en el servidor local.",
        typicalUse: "Para exportar resultados de la extracción como JSON estructurado.",
        category: "export",
        pipeline: [],
        pipelineExplanation: ""
    },
    // ─── Bokeh Visualizations ─────────────────────────────────────────
    bokeh_scatter: {
        name: "Gráfico de Dispersión (Scatter)",
        description: "Genera un gráfico de dispersión interactivo usando Bokeh. Puede asignar colores automáticamente a los puntos si seleccionas una 'Color Column' (ideal para clustering o clasificación).",
        typicalUse: "Visualizar la relación entre dos variables numéricas, o ver grupos generados por algoritmos de clustering usando colores.",
        category: "visualizations",
        pipeline: [],
        pipelineExplanation: ""
    },
    bokeh_line: {
        name: "Gráfico de Líneas (Line)",
        description: "Genera un gráfico de líneas interactivo usando Bokeh.",
        typicalUse: "Visualizar tendencias a lo largo del tiempo o secuencias continuas.",
        category: "visualizations",
        pipeline: [],
        pipelineExplanation: ""
    },
    bokeh_pie: {
        name: "Gráfico de Pastel (Pie)",
        description: "Genera un gráfico de pastel interactivo usando Bokeh.",
        typicalUse: "Mostrar la proporción de categorías relativas a un total.",
        category: "visualizations",
        pipeline: [],
        pipelineExplanation: ""
    },
    bokeh_histogram: {
        name: "Histograma (Histogram)",
        description: "Genera un histograma interactivo usando Bokeh calculando las frecuencias internamente.",
        typicalUse: "Analizar la distribución de frecuencias de una variable numérica.",
        category: "visualizations",
        pipeline: [],
        pipelineExplanation: ""
    },
    bokeh_confusion_matrix: {
        name: "Matriz de Confusión (Confusion)",
        description: "Genera un mapa de calor numérico (Heatmap) que cruza una columna con los valores reales y otra con los predichos.",
        typicalUse: "Evaluar el rendimiento de algoritmos de clasificación (Logistic Regression, SVC) visualizando aciertos y errores.",
        category: "visualizations",
        pipeline: [],
        pipelineExplanation: ""
    },
    col: {
        name: "Column Reference (col)",
        description: "Representa una referencia a una columna del DataFrame por su nombre. Permite realizar operaciones sobre los valores de esa columna.",
        typicalUse: "Seleccionar la columna 'ingresos' para multiplicarla por un factor o filtrarla.",
        category: "columns",
        pipeline: [
            { type: "scan", label: "Scan" },
            { type: "col", label: "Col" },
            { type: "select", label: "Select" }
        ],
        pipelineExplanation: "Carga el conjunto de datos, extrae la columna referenciada y la proyecta en la salida."
    },
    lit: {
        name: "Literal Value (lit)",
        description: "Representa un valor constante (como un número entero, flotante, texto o booleano) dentro de una expresión.",
        typicalUse: "Comparar si una columna es mayor que 100 (Lit(100)) o asignarle un texto fijo a una nueva columna.",
        category: "columns",
        pipeline: [
            { type: "scan", label: "Scan" },
            { type: "col", label: "Col" },
            { type: "binary", label: "BinaryOp" },
            { type: "select", label: "Select" }
        ],
        pipelineExplanation: "Evalúa una columna comparándola con un valor literal constante (Lit) para generar una salida filtrada o seleccionada."
    },
    binary: {
        name: "Binary Operation (binary)",
        description: "Realiza una operación aritmética (+, -, *, /) o lógica (==, !=, >, <, &, |) entre dos expresiones.",
        typicalUse: "Multiplicar la columna 'precio' por la columna 'cantidad' para calcular el total.",
        category: "operations",
        pipeline: [
            { type: "scan", label: "Scan" },
            { type: "col", label: "Col" },
            { type: "binary", label: "BinaryOp" },
            { type: "alias", label: "Alias" },
            { type: "select", label: "Select" }
        ],
        pipelineExplanation: "Toma una columna, realiza una operación (por ejemplo, multiplicar por 2 usando un literal o por otra columna) y le pone un alias antes de seleccionarla."
    },
    unary: {
        name: "Unary Operation (unary)",
        description: "Aplica un operador unitario sobre una expresión, como negar un booleano (not) o cambiar el signo a un número (negate).",
        typicalUse: "Invertir una condición de filtro para obtener los elementos que no la cumplen.",
        category: "operations",
        pipeline: [
            { type: "scan", label: "Scan" },
            { type: "col", label: "Col" },
            { type: "unary", label: "UnaryOp" },
            { type: "filter", label: "Filter" }
        ],
        pipelineExplanation: "Filtra la tabla conservando los registros que no cumplen la condición (gracias al operador unario de negación)."
    },
    alias: {
        name: "Alias",
        description: "Asigna un nombre o etiqueta nueva a la salida de una expresión.",
        typicalUse: "Renombrar la columna resultante de un cálculo complejo a algo legible como 'costo_total'.",
        category: "operations",
        pipeline: [
            { type: "scan", label: "Scan" },
            { type: "col", label: "Col" },
            { type: "alias", label: "Alias" },
            { type: "with_columns", label: "WithColumns" }
        ],
        pipelineExplanation: "Agrega una columna al DataFrame original dándole un nuevo nombre personalizado."
    },
    cast: {
        name: "Cast",
        description: "Convierte los valores de una columna a un tipo de dato diferente (por ejemplo, texto a entero, o flotante a booleano).",
        typicalUse: "Convertir la columna 'edad_texto' de tipo String a entero (Int32) para poder hacer cálculos matemáticos.",
        category: "operations",
        pipeline: [
            { type: "scan", label: "Scan" },
            { type: "col", label: "Col" },
            { type: "cast", label: "Cast" },
            { type: "select", label: "Select" }
        ],
        pipelineExplanation: "Transforma el tipo de datos de una columna (por ejemplo, a flotante) para asegurar compatibilidad en operaciones posteriores."
    },
    chain: {
        name: "Chain (BinaryOp con N operandos)",
        description:
            "Wrapper visual que se serializa como un árbol anidado de BinaryOps. Une 2+ expresiones completas (no operandos sueltos) con un único operador (OR `|` o AND `&`). Útil cuando un Filter necesita más de 2 condiciones.",
        typicalUse:
            "Filtrar filas donde ((pais == 'ES') OR (edad > 18)) OR (ciudad == 'Madrid'): tres BinaryOps encadenados con OR.",
        category: "operations",
        pipeline: [
            { type: "scan", label: "Scan" },
            { type: "col", label: "Col (a)" },
            { type: "chain", label: "Chain (OR)" },
            { type: "filter", label: "Filter" }
        ],
        pipelineExplanation:
            "El Chain se conecta a 2+ operandos (columnas, literales o llamadas). Al serializar, el wrapper los anida en un árbol left-associative de BinaryOps, que el AST existente entiende sin modificaciones."
    },
    call: {
        name: "Method Call (call)",
        description: "Ejecuta un método nativo de Polars sobre una columna o expresión (por ejemplo, funciones matemáticas, agregaciones o manipulación de cadenas).",
        typicalUse: "Calcular el promedio (.mean()), convertir un texto a mayúsculas (.str.to_uppercase()), o extraer el año de una fecha (.dt.year()).",
        category: "operations",
        pipeline: [
            { type: "scan", label: "Scan" },
            { type: "col", label: "Col" },
            { type: "call", label: "Call (Mean)" },
            { type: "select", label: "Select" }
        ],
        pipelineExplanation: "Aplica un método específico de Polars (como promediar o transformar texto) sobre una columna."
    },
    when: {
        name: "When / Then (CASE WHEN)",
        description: "Permite estructurar lógica condicional del estilo: si se cumple una condición A, retornar B; de lo contrario, retornar C.",
        typicalUse: "Crear una columna 'rango_edad' que valga 'Adulto' si la edad es >= 18 y 'Menor' si no.",
        category: "operations",
        pipeline: [
            { type: "scan", label: "Scan" },
            { type: "col", label: "Col" },
            { type: "when", label: "When/Then" },
            { type: "alias", label: "Alias" },
            { type: "with_columns", label: "WithColumns" }
        ],
        pipelineExplanation: "Agrega una columna calculada basándose en condiciones lógicas (si se cumple X, entonces Y, si no Z)."
    },
    sort_expr: {
        name: "Sort Expression (sort_expr)",
        description: "Ordena los elementos dentro de una expresión o grupo de ventana, útil en combinaciones con agregaciones o funciones de ventana.",
        typicalUse: "Ordenar las transacciones por fecha dentro de la ventana de cada cliente.",
        category: "operations",
        pipeline: [
            { type: "scan", label: "Scan" },
            { type: "col", label: "Col" },
            { type: "sort_expr", label: "SortExpr" },
            { type: "over", label: "Over" },
            { type: "select", label: "Select" }
        ],
        pipelineExplanation: "Aplica un cálculo de ventana donde los valores se ordenan previamente dentro de cada grupo para garantizar el orden cronológico."
    },
    over: {
        name: "Over (Window)",
        description: "Evalúa una expresión sobre una partición o grupo de filas (función de ventana), sin colapsar el número de filas del DataFrame.",
        typicalUse: "Calcular el porcentaje de ventas de un vendedor con respecto al total de su departamento.",
        category: "window",
        pipeline: [
            { type: "scan", label: "Scan" },
            { type: "col", label: "Col" },
            { type: "over", label: "Over" },
            { type: "alias", label: "Alias" },
            { type: "with_columns", label: "WithColumns" }
        ],
        pipelineExplanation: "Calcula métricas agrupadas (como sumas acumuladas o totales por categoría) y las adjunta a cada fila original."
    },
    group_by: {
        name: "Group By",
        description: "Agrupa las filas del DataFrame por una o más columnas para aplicar agregaciones sobre los grupos resultantes.",
        typicalUse: "Agrupar el DataFrame por la columna 'categoria' y obtener la suma de ventas por categoría.",
        category: "aggregations",
        pipeline: [
            { type: "scan", label: "Scan" },
            { type: "group_by", label: "GroupBy" },
            { type: "call", label: "Call (Sum)" },
            { type: "select", label: "Select" }
        ],
        pipelineExplanation: "Agrupa el conjunto de datos por una clave (por ejemplo, región) y colapsa los datos calculando la suma de cada grupo."
    },
    scan: {
        name: "Scan Data (scan)",
        description: "Representa el nodo inicial del flujo. Lee un conjunto de datos cargado o definido manualmente en forma de filas/columnas.",
        typicalUse: "Cargar el dataset de productos o ventas para comenzar a realizar filtros y transformaciones.",
        category: "dataframe",
        pipeline: [
            { type: "scan", label: "Scan" },
            { type: "select", label: "Select" }
        ],
        pipelineExplanation: "Carga el dataset inicial de entrada para que las siguientes operaciones puedan consumir sus columnas."
    },
    select: {
        name: "Select",
        description: "Proyecta o extrae únicamente las columnas especificadas, descartando todas las demás del DataFrame.",
        typicalUse: "Quedarse solo con las columnas 'cliente_id' y 'monto' de una tabla que tiene 30 columnas.",
        category: "dataframe",
        pipeline: [
            { type: "scan", label: "Scan" },
            { type: "select", label: "Select" }
        ],
        pipelineExplanation: "Filtra verticalmente el DataFrame para mostrar únicamente las columnas de interés."
    },
    with_columns: {
        name: "With Columns (with_columns)",
        description: "Agrega nuevas columnas calculadas o sobrescribe columnas existentes, conservando el resto de las columnas intactas.",
        typicalUse: "Agregar una nueva columna 'precio_con_descuento' multiplicando el precio original por 0.9.",
        category: "dataframe",
        pipeline: [
            { type: "scan", label: "Scan" },
            { type: "col", label: "Col" },
            { type: "alias", label: "Alias" },
            { type: "with_columns", label: "WithColumns" }
        ],
        pipelineExplanation: "Agrega o modifica columnas en el DataFrame aplicando una expresión de cálculo."
    },
    filter: {
        name: "Filter",
        description: "Filtra las filas del DataFrame conservando únicamente aquellas que cumplen con una condición lógica dada.",
        typicalUse: "Conservar solo los registros donde la columna 'activo' sea igual a True.",
        category: "dataframe",
        pipeline: [
            { type: "scan", label: "Scan" },
            { type: "col", label: "Col" },
            { type: "binary", label: "BinaryOp" },
            { type: "filter", label: "Filter" }
        ],
        pipelineExplanation: "Filtra horizontalmente la tabla para conservar únicamente las filas que cumplan la condición booleana."
    },
    sort: {
        name: "Sort",
        description: "Ordena las filas del DataFrame completo de acuerdo a los valores de una o más columnas especificadas.",
        typicalUse: "Ordenar las ventas de mayor a menor para ver los productos más vendidos al principio.",
        category: "dataframe",
        pipeline: [
            { type: "scan", label: "Scan" },
            { type: "sort", label: "Sort" }
        ],
        pipelineExplanation: "Reordena las filas de la tabla de acuerdo a los criterios de ordenación ascendente o descendente."
    },
    join: {
        name: "Join",
        description: "Combina dos DataFrames (izquierdo y derecho) en base a una columna clave común, similar a una operación JOIN de SQL.",
        typicalUse: "Unir la tabla de 'ventas' con la de 'clientes' usando el campo 'cliente_id' para obtener el nombre del cliente en cada venta.",
        category: "dataframe",
        pipeline: [
            { type: "scan", label: "Scan (Left)" },
            { type: "scan", label: "Scan (Right)" },
            { type: "join", label: "Join" }
        ],
        pipelineExplanation: "Fusiona las columnas de dos fuentes de datos distintas haciendo coincidir sus claves."
    },
    join_asof: {
        name: "Join Asof",
        description: "Realiza una unión 'Asof' (por aproximación), ideal para alinear series de tiempo donde las marcas de tiempo no coinciden exactamente.",
        typicalUse: "Unir transacciones financieras con la tasa de cambio de divisas más cercana en el tiempo.",
        category: "dataframe",
        pipeline: [
            { type: "scan", label: "Scan (Base)" },
            { type: "scan", label: "Scan (Right)" },
            { type: "join_asof", label: "JoinAsof" }
        ],
        pipelineExplanation: "Une dos conjuntos de datos emparejando la clave más cercana (por ejemplo, el precio de una acción en la hora más cercana)."
    },
    cross_join: {
        name: "Cross Join",
        description: "Realiza un producto cartesiano, combinando cada fila del DataFrame izquierdo con cada fila del derecho.",
        typicalUse: "Combinar una lista de 'tiendas' con una lista de 'productos' para generar todas las combinaciones posibles de inventario.",
        category: "dataframe",
        pipeline: [
            { type: "scan", label: "Scan (Left)" },
            { type: "scan", label: "Scan (Right)" },
            { type: "cross_join", label: "CrossJoin" }
        ],
        pipelineExplanation: "Multiplica cada fila de la primera tabla con cada fila de la segunda."
    },
    slice: {
        name: "Slice",
        description: "Extrae un subconjunto de filas continuo especificando una posición inicial (offset) y una cantidad máxima (length).",
        typicalUse: "Paginación de datos: obtener las filas de la posición 20 a la 30.",
        category: "dataframe",
        pipeline: [
            { type: "scan", label: "Scan" },
            { type: "slice", label: "Slice" }
        ],
        pipelineExplanation: "Corta la tabla para quedarse únicamente con un rango de filas específico."
    },
    head: {
        name: "Head",
        description: "Obtiene las primeras N filas del DataFrame. Es muy útil para previsualizar los primeros registros.",
        typicalUse: "Mostrar las primeras 5 filas del DataFrame para verificar el formato de los datos.",
        category: "dataframe",
        pipeline: [
            { type: "scan", label: "Scan" },
            { type: "head", label: "Head" }
        ],
        pipelineExplanation: "Limita el número de filas en la salida para quedarse solo con el inicio de la tabla."
    },
    tail: {
        name: "Tail",
        description: "Obtiene las últimas N filas del DataFrame. Permite revisar el final del conjunto de datos.",
        typicalUse: "Revisar los últimos 5 registros de un archivo para verificar si se cargaron correctamente todos los datos.",
        category: "dataframe",
        pipeline: [
            { type: "scan", label: "Scan" },
            { type: "tail", label: "Tail" }
        ],
        pipelineExplanation: "Limita el número de filas en la salida para quedarse solo con el final de la tabla."
    },
    rename: {
        name: "Rename",
        description: "Cambia el nombre de una o más columnas del DataFrame de forma explícita mediante un mapeo.",
        typicalUse: "Renombrar la columna 'id_usr' a 'usuario_id' para homogeneizar el esquema de nombres.",
        category: "dataframe",
        pipeline: [
            { type: "scan", label: "Scan" },
            { type: "rename", label: "Rename" }
        ],
        pipelineExplanation: "Modifica los nombres de las columnas seleccionadas según el mapeo indicado."
    },
    drop: {
        name: "Drop Columns (drop)",
        description: "Elimina columnas específicas del DataFrame, manteniendo todas las demás.",
        typicalUse: "Eliminar columnas temporales como '_tmp_calc' antes de exportar el resultado final.",
        category: "dataframe",
        pipeline: [
            { type: "scan", label: "Scan" },
            { type: "drop", label: "Drop" }
        ],
        pipelineExplanation: "Excluye las columnas seleccionadas de la salida del DataFrame."
    },
    drop_nulls: {
        name: "Drop Nulls",
        description: "Elimina aquellas filas que contienen valores nulos (missing values) en todo el DataFrame o en un subconjunto de columnas.",
        typicalUse: "Eliminar los registros de clientes que no tienen un correo electrónico registrado.",
        category: "dataframe",
        pipeline: [
            { type: "scan", label: "Scan" },
            { type: "drop_nulls", label: "DropNulls" }
        ],
        pipelineExplanation: "Limpia la tabla removiendo filas incompletas o que contienen valores vacíos."
    },
    fill_null: {
        name: "Fill Null",
        description: "Rellena los valores nulos con un valor constante o utilizando una estrategia específica (como interpolación o arrastrar el último valor).",
        typicalUse: "Reemplazar los valores nulos de 'calificacion' por el promedio de la columna o por un cero.",
        category: "dataframe",
        pipeline: [
            { type: "scan", label: "Scan" },
            { type: "fill_null", label: "FillNull" }
        ],
        pipelineExplanation: "Reemplaza celdas vacías (nulas) por valores definidos o calculados estratégicamente."
    },
    unique: {
        name: "Unique",
        description: "Conserva únicamente filas distintas, eliminando los registros duplicados.",
        typicalUse: "Obtener un listado de los países únicos desde una tabla de direcciones de clientes.",
        category: "dataframe",
        pipeline: [
            { type: "scan", label: "Scan" },
            { type: "unique", label: "Unique" }
        ],
        pipelineExplanation: "Filtra la tabla para remover todas las filas repetidas, dejando un registro único por combinación."
    },
    // ─── Machine Learning Nodes ──────────────────────────────────────
    logistic_regression: {
        name: "Logistic Regression",
        description: "Entrena un modelo de clasificación lineal (Regresión Logística).",
        typicalUse: "Clasificar correos como spam o no spam en base a características numéricas o vectorizadas.",
        category: "machine_learning",
        pipeline: [
            { type: "scan", label: "Scan" },
            { type: "logistic_regression", label: "LogisticRegression" }
        ],
        pipelineExplanation: "Toma las columnas seleccionadas y entrena un modelo predictivo, agregando una columna con las predicciones."
    },
    svc: {
        name: "Support Vector Classification (SVC)",
        description: "Entrena un modelo clasificador de Vectores de Soporte. Convierte texto simple automáticamente a clases numéricas.",
        typicalUse: "Clasificación de textos largos (como quejas de clientes) previamente vectorizados con TF-IDF.",
        category: "machine_learning",
        pipeline: [
            { type: "scan", label: "Scan" },
            { type: "tfidf_vectorizer", label: "TF-IDF" },
            { type: "svc", label: "SVC" }
        ],
        pipelineExplanation: "Busca el hiperplano óptimo para separar clases en datos de alta dimensionalidad."
    },
    multinomial_nb: {
        name: "Multinomial Naive Bayes",
        description: "Clasificador Naive Bayes para distribuciones multinomiales. (Soporte automático para variables categóricas).",
        typicalUse: "Clasificación de documentos o análisis de sentimiento a partir de vectores numéricos de palabras.",
        category: "machine_learning",
        pipeline: [
            { type: "scan", label: "Scan" },
            { type: "count_vectorizer", label: "CountVec" },
            { type: "multinomial_nb", label: "NaiveBayes" }
        ],
        pipelineExplanation: "Usa el teorema de Bayes asumiendo independencia entre características para clasificar datos rápidamente."
    },
    sgd_classifier: {
        name: "SGD Classifier",
        description: "Clasificador lineal optimizado por Descenso de Gradiente.",
        typicalUse: "Entrenamiento rápido sobre conjuntos de datos numéricos o vectorizados muy grandes.",
        category: "machine_learning",
        pipeline: [
            { type: "scan", label: "Scan" },
            { type: "sgd_classifier", label: "SGD" }
        ],
        pipelineExplanation: "Ajusta parámetros paso a paso reduciendo el error en lotes pequeños, ideal para Big Data."
    },
    kmeans: {
        name: "K-Means Clustering",
        description: "Agrupa los datos en K clústeres basándose en características.",
        typicalUse: "Segmentación de clientes agrupándolos por variables (edad, ingresos, etc.).",
        category: "machine_learning",
        pipeline: [
            { type: "scan", label: "Scan" },
            { type: "kmeans", label: "KMeans" }
        ],
        pipelineExplanation: "Descubre grupos ocultos en los datos no etiquetados midiendo distancias al centroide más cercano."
    },
    dbscan: {
        name: "DBSCAN Clustering",
        description: "Encuentra clústeres basados en densidad de datos.",
        typicalUse: "Identificar anomalías o fraudes a partir de registros y métricas.",
        category: "machine_learning",
        pipeline: [
            { type: "scan", label: "Scan" },
            { type: "dbscan", label: "DBSCAN" }
        ],
        pipelineExplanation: "Une puntos cercanos densamente poblados y marca como 'ruido' (outliers) a los puntos aislados."
    },
    agglomerative_clustering: {
        name: "Agglomerative Clustering",
        description: "Clustering jerárquico ascendente que fusiona clústeres. (Convierte automáticamente cadenas simples a numéricas).",
        typicalUse: "Crear una taxonomía jerárquica a partir de descripciones.",
        category: "machine_learning",
        pipeline: [
            { type: "scan", label: "Scan" },
            { type: "agglomerative_clustering", label: "Agglomerative" }
        ],
        pipelineExplanation: "Construye una jerarquía anidada combinando iterativamente los clústeres más similares."
    },
    truncated_svd: {
        name: "Truncated SVD (LSA)",
        description: "Reduce dimensionalidad. A menudo usado con matrices dispersas (Sparse).",
        typicalUse: "Reducir la dimensionalidad después de aplicar un TF-IDF para acelerar el entrenamiento.",
        category: "machine_learning",
        pipeline: [
            { type: "scan", label: "Scan" },
            { type: "tfidf_vectorizer", label: "TF-IDF" },
            { type: "truncated_svd", label: "TruncatedSVD" }
        ],
        pipelineExplanation: "Extrae los componentes principales de variación sin centrar los datos, conservando el patrón principal."
    },
    lda: {
        name: "Latent Dirichlet Allocation (LDA)",
        description: "Modelo generativo estadístico de tópicos. (Ideal para matrices de frecuencias de palabras).",
        typicalUse: "Topic modeling: descubrir que el 50% de las noticias hablan de 'deportes' usando matrices vectorizadas.",
        category: "machine_learning",
        pipeline: [
            { type: "scan", label: "Scan" },
            { type: "count_vectorizer", label: "CountVec" },
            { type: "lda", label: "LDA" }
        ],
        pipelineExplanation: "Asigna cada fila a una mezcla de tópicos latentes interpretables."
    },
    nmf: {
        name: "Non-Negative Matrix Factorization",
        description: "Factorización para extraer características aditivas.",
        typicalUse: "Extracción de temas a partir de frecuencias numéricas generadas por un TF-IDF (nunca texto crudo).",
        category: "machine_learning",
        pipeline: [
            { type: "scan", label: "Scan" },
            { type: "tfidf_vectorizer", label: "TF-IDF" },
            { type: "nmf", label: "NMF" }
        ],
        pipelineExplanation: "Descompone los datos en partes básicas sumables que tienen sentido interpretativo."
    },
    tfidf_vectorizer: {
        name: "TF-IDF Vectorizer",
        description: "Convierte texto libre en una matriz de características TF-IDF (Frecuencia de término - Frecuencia Inversa de Documento).",
        typicalUse: "Preparar una columna de reseñas de productos para poder entrenar un clasificador SVC.",
        category: "machine_learning",
        pipeline: [
            { type: "scan", label: "Scan" },
            { type: "tfidf_vectorizer", label: "TF-IDF" }
        ],
        pipelineExplanation: "Pondera las palabras: da más peso a términos raros globales que aparecen mucho en una fila específica."
    },
    count_vectorizer: {
        name: "Count Vectorizer",
        description: "Convierte texto en una matriz de conteo de palabras clave (Bag of Words).",
        typicalUse: "Extraer la frecuencia de palabras simples para entrenar un modelo Naive Bayes rápido.",
        category: "machine_learning",
        pipeline: [
            { type: "scan", label: "Scan" },
            { type: "count_vectorizer", label: "CountVec" }
        ],
        pipelineExplanation: "Cuenta cuántas veces aparece cada palabra de un diccionario definido en cada fila de texto."
    },
    hashing_vectorizer: {
        name: "Hashing Vectorizer",
        description: "Vectoriza texto usando el truco de Hashing. Rápido y sin estado.",
        typicalUse: "Vectorizar un dataset gigantesco que no cabe en la memoria (Out-of-core learning).",
        category: "machine_learning",
        pipeline: [
            { type: "scan", label: "Scan" },
            { type: "hashing_vectorizer", label: "HashingVec" }
        ],
        pipelineExplanation: "Convierte tokens a un espacio numérico sin necesidad de construir un diccionario en memoria."
    },
    // ─── Series AST nodes ─────────────────────────────────────────
    get_column: {
        name: "Get Column",
        description: "Extrae una columna nombrada de un DataFrame padre. Es el puente entre el AST de DataFrame y el AST de Series.",
        typicalUse: "Seleccionar la columna 'revenue' para aplicar operaciones de Series como abs() o cum_sum().",
        category: "series",
        pipeline: [
            { type: "scan", label: "Scan" },
            { type: "get_column", label: "GetColumn" },
            { type: "abs", label: "Abs" }
        ],
        pipelineExplanation: "Extrae una columna del DataFrame para aplicarle operaciones de Series."
    },
    from_list: {
        name: "From List",
        description: "Crea una Series a partir de una lista de valores de Python.",
        typicalUse: "Crear una Series de prueba con valores específicos como [1, 2, 3, 4, 5].",
        category: "series",
        pipeline: [
            { type: "from_list", label: "FromList" },
            { type: "sum", label: "Sum" }
        ],
        pipelineExplanation: "Crea una Series desde una lista y aplica una agregación."
    },
    from_scalar: {
        name: "From Scalar",
        description: "Crea una Series de longitud 1 a partir de un valor escalar.",
        typicalUse: "Crear una Series con un solo valor como 42 o 'hello'.",
        category: "series",
        pipeline: [
            { type: "from_scalar", label: "FromScalar" }
        ],
        pipelineExplanation: "Crea una Series de un solo elemento desde un escalar."
    },
    abs: {
        name: "Absolute Value",
        description: "Valor absoluto elemento por elemento.",
        typicalUse: "Convertir valores negativos a positivos en una columna de diferencias.",
        category: "series",
        pipeline: [
            { type: "get_column", label: "GetColumn" },
            { type: "abs", label: "Abs" }
        ],
        pipelineExplanation: "Aplica valor absoluto a cada elemento de la Series."
    },
    sign: {
        name: "Sign",
        description: "Signo de cada elemento (-1, 0, 1).",
        typicalUse: "Determinar el signo de diferencias o cambios.",
        category: "series",
        pipeline: [
            { type: "get_column", label: "GetColumn" },
            { type: "sign", label: "Sign" }
        ],
        pipelineExplanation: "Extrae el signo de cada elemento."
    },
    negate: {
        name: "Negate",
        description: "Negación elemento por elemento.",
        typicalUse: "Invertir el signo de valores numéricos.",
        category: "series",
        pipeline: [
            { type: "get_column", label: "GetColumn" },
            { type: "negate", label: "Negate" }
        ],
        pipelineExplanation: "Niega cada elemento de la Series."
    },
    sqrt: {
        name: "Square Root",
        description: "Raíz cuadrada elemento por elemento.",
        typicalUse: "Calcular desviaciones estándar o normalizar datos.",
        category: "series",
        pipeline: [
            { type: "get_column", label: "GetColumn" },
            { type: "sqrt", label: "Sqrt" }
        ],
        pipelineExplanation: "Aplica raíz cuadrada a cada elemento."
    },
    exp: {
        name: "Exponential",
        description: "Exponencial elemento por elemento (e^x).",
        typicalUse: "Calcular crecimiento exponencial o probabilidades.",
        category: "series",
        pipeline: [
            { type: "get_column", label: "GetColumn" },
            { type: "exp", label: "Exp" }
        ],
        pipelineExplanation: "Aplica exponencial a cada elemento."
    },
    log: {
        name: "Logarithm",
        description: "Logaritmo natural elemento por elemento.",
        typicalUse: "Normalizar datos sesgados o calcular rendimientos logarítmicos.",
        category: "series",
        pipeline: [
            { type: "get_column", label: "GetColumn" },
            { type: "log", label: "Log" }
        ],
        pipelineExplanation: "Aplica logaritmo natural a cada elemento."
    },
    log1p: {
        name: "Log1p",
        description: "log(1 + x), numéricamente estable para x pequeños.",
        typicalUse: "Transformar datos con valores cercanos a cero.",
        category: "series",
        pipeline: [
            { type: "get_column", label: "GetColumn" },
            { type: "log1p", label: "Log1p" }
        ],
        pipelineExplanation: "Aplica log(1+x) a cada elemento."
    },
    floor: {
        name: "Floor",
        description: "Redondea hacia abajo al entero más cercano.",
        typicalUse: "Truncar valores decimales a enteros.",
        category: "series",
        pipeline: [
            { type: "get_column", label: "GetColumn" },
            { type: "floor", label: "Floor" }
        ],
        pipelineExplanation: "Redondea hacia abajo cada elemento."
    },
    ceil: {
        name: "Ceil",
        description: "Redondea hacia arriba al entero más cercano.",
        typicalUse: "Redondear precios o cantidades hacia arriba.",
        category: "series",
        pipeline: [
            { type: "get_column", label: "GetColumn" },
            { type: "ceil", label: "Ceil" }
        ],
        pipelineExplanation: "Redondea hacia arriba cada elemento."
    },
    round: {
        name: "Round",
        description: "Redondea a un número específico de decimales.",
        typicalUse: "Redondear precios a 2 decimales o porcentajes a 1 decimal.",
        category: "series",
        pipeline: [
            { type: "get_column", label: "GetColumn" },
            { type: "round", label: "Round" }
        ],
        pipelineExplanation: "Redondea cada elemento al número de decimales especificado."
    },
    pow: {
        name: "Power",
        description: "Potencia elemento por elemento (e ** exponent).",
        typicalUse: "Calcular cuadrados, cubos o potencias arbitrarias.",
        category: "series",
        pipeline: [
            { type: "get_column", label: "GetColumn" },
            { type: "pow", label: "Pow" }
        ],
        pipelineExplanation: "Eleva cada elemento a la potencia especificada."
    },
    clip: {
        name: "Clip",
        description: "Recorta valores fuera de un rango [min, max].",
        typicalUse: "Limitar valores atípicos o normalizar rangos.",
        category: "series",
        pipeline: [
            { type: "get_column", label: "GetColumn" },
            { type: "clip", label: "Clip" }
        ],
        pipelineExplanation: "Recorta valores fuera del rango especificado."
    },
    sum: {
        name: "Sum",
        description: "Suma todos los elementos (devuelve un escalar).",
        typicalUse: "Calcular totales de ventas, cantidades o montos.",
        category: "series",
        pipeline: [
            { type: "get_column", label: "GetColumn" },
            { type: "sum", label: "Sum" }
        ],
        pipelineExplanation: "Suma todos los elementos de la Series."
    },
    min: {
        name: "Min",
        description: "Valor mínimo (devuelve un escalar).",
        typicalUse: "Encontrar el precio más bajo o la fecha más antigua.",
        category: "series",
        pipeline: [
            { type: "get_column", label: "GetColumn" },
            { type: "min", label: "Min" }
        ],
        pipelineExplanation: "Encuentra el valor mínimo."
    },
    max: {
        name: "Max",
        description: "Valor máximo (devuelve un escalar).",
        typicalUse: "Encontrar el precio más alto o la fecha más reciente.",
        category: "series",
        pipeline: [
            { type: "get_column", label: "GetColumn" },
            { type: "max", label: "Max" }
        ],
        pipelineExplanation: "Encuentra el valor máximo."
    },
    mean: {
        name: "Mean",
        description: "Media aritmética (devuelve un escalar).",
        typicalUse: "Calcular promedios de ventas, edades o calificaciones.",
        category: "series",
        pipeline: [
            { type: "get_column", label: "GetColumn" },
            { type: "mean", label: "Mean" }
        ],
        pipelineExplanation: "Calcula la media aritmética."
    },
    median: {
        name: "Median",
        description: "Valor mediano (devuelve un escalar).",
        typicalUse: "Encontrar el valor central de distribuciones sesgadas.",
        category: "series",
        pipeline: [
            { type: "get_column", label: "GetColumn" },
            { type: "median", label: "Median" }
        ],
        pipelineExplanation: "Calcula la mediana."
    },
    count: {
        name: "Count",
        description: "Número de elementos no nulos.",
        typicalUse: "Contar registros válidos excluyendo nulos.",
        category: "series",
        pipeline: [
            { type: "get_column", label: "GetColumn" },
            { type: "count", label: "Count" }
        ],
        pipelineExplanation: "Cuenta elementos no nulos."
    },
    n_unique: {
        name: "N Unique",
        description: "Número de valores únicos.",
        typicalUse: "Contar categorías distintas o IDs únicos.",
        category: "series",
        pipeline: [
            { type: "get_column", label: "GetColumn" },
            { type: "n_unique", label: "NUnique" }
        ],
        pipelineExplanation: "Cuenta valores únicos."
    },
    first: {
        name: "First",
        description: "Primer elemento no nulo.",
        typicalUse: "Obtener el primer valor de una serie temporal.",
        category: "series",
        pipeline: [
            { type: "get_column", label: "GetColumn" },
            { type: "first", label: "First" }
        ],
        pipelineExplanation: "Extrae el primer elemento."
    },
    last: {
        name: "Last",
        description: "Último elemento no nulo.",
        typicalUse: "Obtener el último valor de una serie temporal.",
        category: "series",
        pipeline: [
            { type: "get_column", label: "GetColumn" },
            { type: "last", label: "Last" }
        ],
        pipelineExplanation: "Extrae el último elemento."
    },
    std: {
        name: "Standard Deviation",
        description: "Desviación estándar.",
        typicalUse: "Medir la dispersión de datos o calcular intervalos de confianza.",
        category: "series",
        pipeline: [
            { type: "get_column", label: "GetColumn" },
            { type: "std", label: "Std" }
        ],
        pipelineExplanation: "Calcula la desviación estándar."
    },
    var: {
        name: "Variance",
        description: "Varianza.",
        typicalUse: "Medir la variabilidad de datos.",
        category: "series",
        pipeline: [
            { type: "get_column", label: "GetColumn" },
            { type: "var", label: "Var" }
        ],
        pipelineExplanation: "Calcula la varianza."
    },
    quantile: {
        name: "Quantile",
        description: "Cuantil en una probabilidad dada [0, 1].",
        typicalUse: "Calcular percentiles (P25, P50, P75) o quartiles.",
        category: "series",
        pipeline: [
            { type: "get_column", label: "GetColumn" },
            { type: "quantile", label: "Quantile" }
        ],
        pipelineExplanation: "Calcula el cuantil en la probabilidad especificada."
    },
    shift: {
        name: "Shift",
        description: "Desplaza la Series por n posiciones.",
        typicalUse: "Calcular diferencias con períodos anteriores o crear lags.",
        category: "series",
        pipeline: [
            { type: "get_column", label: "GetColumn" },
            { type: "shift", label: "Shift" }
        ],
        pipelineExplanation: "Desplaza los valores por n posiciones."
    },
    diff: {
        name: "Diff",
        description: "Diferencia elemento por elemento con el valor n posiciones atrás.",
        typicalUse: "Calcular cambios diarios o variaciones periódicas.",
        category: "series",
        pipeline: [
            { type: "get_column", label: "GetColumn" },
            { type: "diff", label: "Diff" }
        ],
        pipelineExplanation: "Calcula diferencias con valores anteriores."
    },
    cum_sum: {
        name: "Cumulative Sum",
        description: "Suma acumulativa.",
        typicalUse: "Calcular totales acumulados o series temporales acumuladas.",
        category: "series",
        pipeline: [
            { type: "get_column", label: "GetColumn" },
            { type: "cum_sum", label: "CumSum" }
        ],
        pipelineExplanation: "Calcula la suma acumulativa."
    },
    rolling_mean: {
        name: "Rolling Mean",
        description: "Media móvil sobre una ventana fija.",
        typicalUse: "Suavizar series temporales o calcular promedios móviles.",
        category: "series",
        pipeline: [
            { type: "get_column", label: "GetColumn" },
            { type: "rolling_mean", label: "RollingMean" }
        ],
        pipelineExplanation: "Calcula la media móvil sobre la ventana especificada."
    },
    str_contains: {
        name: "String Contains",
        description: "Máscara booleana: True si la cadena contiene el patrón.",
        typicalUse: "Filtrar correos que contienen '@gmail.com' o textos con palabras clave.",
        category: "series",
        pipeline: [
            { type: "get_column", label: "GetColumn" },
            { type: "str_contains", label: "StrContains" }
        ],
        pipelineExplanation: "Verifica si cada cadena contiene el patrón."
    },
    str_to_uppercase: {
        name: "String Uppercase",
        description: "Convierte la cadena a mayúsculas.",
        typicalUse: "Normalizar textos para comparaciones case-insensitive.",
        category: "series",
        pipeline: [
            { type: "get_column", label: "GetColumn" },
            { type: "str_to_uppercase", label: "StrUppercase" }
        ],
        pipelineExplanation: "Convierte cada cadena a mayúsculas."
    },
    str_to_lowercase: {
        name: "String Lowercase",
        description: "Convierte la cadena a minúsculas.",
        typicalUse: "Normalizar textos para comparaciones case-insensitive.",
        category: "series",
        pipeline: [
            { type: "get_column", label: "GetColumn" },
            { type: "str_to_lowercase", label: "StrLowercase" }
        ],
        pipelineExplanation: "Convierte cada cadena a minúsculas."
    },
    dt_year: {
        name: "Datetime Year",
        description: "Extrae el componente año.",
        typicalUse: "Agrupar transacciones por año o extraer el año de fechas.",
        category: "series",
        pipeline: [
            { type: "get_column", label: "GetColumn" },
            { type: "dt_year", label: "DtYear" }
        ],
        pipelineExplanation: "Extrae el año de cada valor datetime."
    },
    dt_month: {
        name: "Datetime Month",
        description: "Extrae el componente mes (1-12).",
        typicalUse: "Agrupar transacciones por mes o analizar estacionalidad.",
        category: "series",
        pipeline: [
            { type: "get_column", label: "GetColumn" },
            { type: "dt_month", label: "DtMonth" }
        ],
        pipelineExplanation: "Extrae el mes de cada valor datetime."
    },
    dt_day: {
        name: "Datetime Day",
        description: "Extrae el componente día del mes.",
        typicalUse: "Analizar patrones diarios o agrupar por día.",
        category: "series",
        pipeline: [
            { type: "get_column", label: "GetColumn" },
            { type: "dt_day", label: "DtDay" }
        ],
        pipelineExplanation: "Extrae el día del mes de cada valor datetime."
    },
    arr_sum: {
        name: "Array Sum",
        description: "Suma de cada lista interna.",
        typicalUse: "Calcular totales de listas de valores.",
        category: "series",
        pipeline: [
            { type: "get_column", label: "GetColumn" },
            { type: "arr_sum", label: "ArrSum" }
        ],
        pipelineExplanation: "Suma los elementos de cada lista."
    },
    arr_lengths: {
        name: "Array Lengths",
        description: "Longitud de cada lista interna.",
        typicalUse: "Contar elementos en listas o validar tamaños.",
        category: "series",
        pipeline: [
            { type: "get_column", label: "GetColumn" },
            { type: "arr_lengths", label: "ArrLengths" }
        ],
        pipelineExplanation: "Calcula la longitud de cada lista."
    },
    combine_conditions: {
        name: "Combine Conditions",
        description: "Combina múltiples series booleanas usando AND, OR, XOR o NOT. El puerto 'conds' acepta tantas conexiones como necesites — no hay límite. NOT solo usa la primera condición conectada.",
        typicalUse: "1. Crea las condiciones booleanas (is_in, is_between, contains_any, series_filter, otro combine_conditions, etc.).\n2. Conecta la salida de cada una al puerto 'conds' de este nodo.\n3. Elige el operador en el panel (AND/OR/XOR/NOT).",
        category: "series",
        pipeline: [],
        pipelineExplanation: "Combina condiciones booleanas con el operador seleccionado."
    },
    series_filter: {
        name: "Filter (Series)",
        description: "Filtra una Serie utilizando una Serie de booleanos (True/False) como condición. Para filtrar la misma columna, haz una bifurcación: conecta la salida de tu columna original al puerto 'source' de este filtro, y saca otro cable de esa misma salida hacia un nodo de condición (ej. Is Between, Str Contains). Luego conecta la salida de la condición al puerto 'predicate' de este filtro.",
        typicalUse: "1. Carga una columna.\n2. Conéctala a 'source' del filtro y también a un nodo de condición.\n3. Conecta el resultado de la condición a 'predicate' del filtro.",
        category: "series",
        pipeline: [
            { type: "get_column", label: "GetColumn" },
            { type: "series_filter", label: "Filter (Series)" }
        ],
        pipelineExplanation: "Aplica una máscara de booleanos a la Serie original."
    },
    is_in: {
        name: "Is In",
        description: "Verifica si los valores de la serie están dentro de una lista. Puedes escribir los valores manualmente o cargarlos desde un archivo CSV/Parquet usando el botón Browse en el panel de propiedades.",
        typicalUse: "1. Cargar una columna objetivo.\n2. Abrir las propiedades del nodo y cargar los valores desde un archivo o escribirlos manualmente.\n3. Usar el resultado booleano en un Filter (Series).",
        category: "series",
        pipeline: [],
        pipelineExplanation: ""
    },
    contains_any: {
        name: "Contains Any",
        description: "Comprueba si cada cadena (string) de la serie contiene ALGUNA de las palabras/patrones especificados. Puedes dar una lista manual, o bien cargarla con 'Load Dataset Column' y conectarla al puerto 'patterns_series'.",
        typicalUse: "1. Cargar columna de comentarios.\n2. Conectar un 'Load Dataset Column' (ej. dataset de palabras prohibidas) al puerto 'patterns_series'.\n3. Usar como máscara de filtrado.",
        category: "series_strings",
        pipeline: [],
        pipelineExplanation: ""
    },
    fit: {
        name: "Fit Model",
        description: "Ejecuta el entrenamiento del algoritmo y persiste el modelo entrenado en disco (~/ml_models).",
        typicalUse: "Conéctalo después de un nodo de algoritmo para guardar el modelo en formato .joblib.",
        category: "Machine Learning",
        pipeline: [
            { type: "logistic_regression", label: "Algoritmo ML (Ej: Logistic Regression, KMeans, etc.)" },
            { type: "fit", label: "Fit Model" }
        ],
        pipelineExplanation: "Conecta este nodo justo después de CUALQUIER algoritmo de Machine Learning para ejecutar su entrenamiento y persistirlo en disco."
    }
};

// Returns metadata with fallbacks for specific method names (e.g. for calls like 'sum', 'mean')
export function getNodeMetadata(nodeType: string, properties: Record<string, any> = {}): NodeMetadata {
    if (nodeType === "call" && properties.method) {
        const method = properties.method;
        
        // Define metadata specific to common Polars methods
        const methodMetadataMap: Record<string, { name: string; description: string; typicalUse: string; pipeline: PipelineNodeExample[]; pipelineExplanation: string }> = {
            "sum": {
                name: "Call: Sum (.sum())",
                description: "Suma todos los valores numéricos no nulos de una columna.",
                typicalUse: "Calcular el total facturado sumando los montos de todas las transacciones.",
                pipeline: [{ type: "scan", label: "Scan" }, { type: "col", label: "Col" }, { type: "call", label: "Sum" }, { type: "select", label: "Select" }],
                pipelineExplanation: "Agrupa o proyecta la columna aplicando la suma agregada sobre sus elementos."
            },
            "mean": {
                name: "Call: Mean (.mean())",
                description: "Calcula la media aritmética (promedio) de los valores numéricos de una columna.",
                typicalUse: "Obtener la temperatura promedio del mes o la edad promedio de los usuarios.",
                pipeline: [{ type: "scan", label: "Scan" }, { type: "col", label: "Col" }, { type: "call", label: "Mean" }, { type: "select", label: "Select" }],
                pipelineExplanation: "Obtiene el promedio de los valores de la columna referenciada."
            },
            "min": {
                name: "Call: Min (.min())",
                description: "Encuentra el valor mínimo (numérico, alfabético o de fecha) de una columna.",
                typicalUse: "Saber cuál fue la venta de menor valor o la fecha más antigua de registro.",
                pipeline: [{ type: "scan", label: "Scan" }, { type: "col", label: "Col" }, { type: "call", label: "Min" }, { type: "select", label: "Select" }],
                pipelineExplanation: "Busca e imprime el menor de los valores en la columna."
            },
            "max": {
                name: "Call: Max (.max())",
                description: "Encuentra el valor máximo de una columna.",
                typicalUse: "Determinar la puntuación más alta en un examen o el precio máximo de un producto.",
                pipeline: [{ type: "scan", label: "Scan" }, { type: "col", label: "Col" }, { type: "call", label: "Max" }, { type: "select", label: "Select" }],
                pipelineExplanation: "Busca y retorna el mayor valor contenido en la columna seleccionada."
            },
            "count": {
                name: "Call: Count (.count())",
                description: "Cuenta la cantidad de registros no nulos presentes en una columna.",
                typicalUse: "Contar cuántas transacciones tienen un código de cupón asociado.",
                pipeline: [{ type: "scan", label: "Scan" }, { type: "col", label: "Col" }, { type: "call", label: "Count" }, { type: "select", label: "Select" }],
                pipelineExplanation: "Calcula el número total de valores no vacíos en la columna."
            },
            "n_unique": {
                name: "Call: N Unique (.n_unique())",
                description: "Cuenta el número de valores únicos y distintos presentes en la columna.",
                typicalUse: "Saber de cuántos países diferentes son los clientes registrados en la tabla.",
                pipeline: [{ type: "scan", label: "Scan" }, { type: "col", label: "Col" }, { type: "call", label: "N Unique" }, { type: "select", label: "Select" }],
                pipelineExplanation: "Cuenta cuántos elementos diferentes existen en la columna sin contar repetidos."
            },
            "str.contains": {
                name: "Call: Contains (.str.contains())",
                description: "Verifica si los valores de texto de una columna contienen un patrón o subcadena específica, devolviendo valores booleanos.",
                typicalUse: "Identificar si un correo electrónico contiene el dominio '@gmail.com'.",
                pipeline: [{ type: "scan", label: "Scan" }, { type: "col", label: "Col" }, { type: "call", label: "Contains" }, { type: "filter", label: "Filter" }],
                pipelineExplanation: "Filtra la tabla para dejar solo las filas cuyo texto cumple con contener el patrón buscado."
            },
            "str.replace": {
                name: "Call: Replace (.str.replace())",
                description: "Reemplaza la primera aparición de un patrón de texto por otro valor.",
                typicalUse: "Reemplazar el prefijo telefónico '+34' por '0034'.",
                pipeline: [{ type: "scan", label: "Scan" }, { type: "col", label: "Col" }, { type: "call", label: "Replace" }, { type: "alias", label: "Alias" }, { type: "select", label: "Select" }],
                pipelineExplanation: "Modifica el texto en las filas correspondientes sustituyendo una subcadena por otra."
            },
            "str.to_uppercase": {
                name: "Call: Uppercase (.str.to_uppercase())",
                description: "Convierte todos los caracteres de texto a mayúsculas.",
                typicalUse: "Estandarizar nombres de ciudades ('madrid' -> 'MADRID') para evitar discrepancias de mayúsculas.",
                pipeline: [{ type: "scan", label: "Scan" }, { type: "col", label: "Col" }, { type: "call", label: "Uppercase" }, { type: "select", label: "Select" }],
                pipelineExplanation: "Transforma todo el texto de la columna a letras mayúsculas."
            },
            "str.to_lowercase": {
                name: "Call: Lowercase (.str.to_lowercase())",
                description: "Convierte todos los caracteres de texto a minúsculas.",
                typicalUse: "Convertir todos los correos electrónicos a minúsculas para comparaciones uniformes.",
                pipeline: [{ type: "scan", label: "Scan" }, { type: "col", label: "Col" }, { type: "call", label: "Lowercase" }, { type: "select", label: "Select" }],
                pipelineExplanation: "Transforma todo el texto de la columna a letras minúsculas."
            },
            "dt.year": {
                name: "Call: Year (.dt.year())",
                description: "Extrae la parte del año a partir de un tipo de dato de Fecha o Fecha y Hora (Date/Datetime).",
                typicalUse: "Obtener el año '2026' a partir del valor de fecha '2026-06-07'.",
                pipeline: [{ type: "scan", label: "Scan" }, { type: "col", label: "Col" }, { type: "call", label: "Year" }, { type: "alias", label: "Alias" }, { type: "select", label: "Select" }],
                pipelineExplanation: "Extrae el año como un entero a partir de la columna temporal."
            },
            "dt.month": {
                name: "Call: Month (.dt.month())",
                description: "Extrae el mes del año (número del 1 al 12) a partir de una columna de fecha.",
                typicalUse: "Agrupar transacciones según el mes en el que se realizaron.",
                pipeline: [{ type: "scan", label: "Scan" }, { type: "col", label: "Col" }, { type: "call", label: "Month" }, { type: "select", label: "Select" }],
                pipelineExplanation: "Extrae el número del mes a partir de la columna de fecha."
            },
            "shift": {
                name: "Call: Shift (.shift())",
                description: "Desplaza los valores de una columna hacia arriba o hacia abajo una cantidad de posiciones dada.",
                typicalUse: "Calcular el valor de ventas del día anterior restando la columna desplazada en 1 fila.",
                pipeline: [{ type: "scan", label: "Scan" }, { type: "col", label: "Col" }, { type: "call", label: "Shift" }, { type: "select", label: "Select" }],
                pipelineExplanation: "Desplaza los valores de la columna permitiendo comparar una celda con su valor anterior."
            }
        };

        if (methodMetadataMap[method]) {
            return {
                ...methodMetadataMap[method],
                category: "operations"
            };
        }

        // Generic fallback for call:method
        return {
            name: `Call: .${method}()`,
            description: `Ejecuta la función '${method}' de Polars sobre la columna seleccionada.`,
            typicalUse: `Aplicar la función de expresión .${method}() sobre una columna de entrada.`,
            category: "operations",
            pipeline: [
                { type: "scan", label: "Scan" },
                { type: "col", label: "Col" },
                { type: "call", label: `Call (${method})` },
                { type: "select", label: "Select" }
            ],
            pipelineExplanation: `Aplica el método .${method}() sobre la columna referenciada.`
        };
    }

    if (NODE_METADATA_MAP[nodeType]) {
        return NODE_METADATA_MAP[nodeType];
    }

    // Default fallback
    return {
        name: nodeType.toUpperCase(),
        description: `Nodo de tipo ${nodeType} para realizar operaciones en el pipeline de datos.`,
        typicalUse: `Incluir el nodo de tipo ${nodeType} en tu flujo de procesamiento de DataFrame.`,
        category: "dataframe",
        pipeline: [
            { type: "scan", label: "Scan" },
            { type: nodeType, label: nodeType.charAt(0).toUpperCase() + nodeType.slice(1) }
        ],
        pipelineExplanation: `Aplica la operación de tipo ${nodeType} sobre el conjunto de datos.`
    };
}

export function nodeSupportsSql(nodeType: string, properties: Record<string, any> = {}): boolean {
    // Generated from Tsubasa's registries: every node whose `to_sql` raises.
    // The hand-kept version of this list had drifted badly in both
    // directions - 41 types with no SQL that showed no warning, and 17 that
    // warned despite exporting fine - so the badge was misinforming either
    // way. Regenerate after touching any `to_sql`:
    //   python -c "import inspect; from polars_ast.parser import DF_REGISTRY, _series_table; ..."
    const unsupportedTypes = [
        "agglomerative_clustering", "arg_true", "arr_shift", "arr_to_struct", "bokeh_confusion_matrix", "bokeh_histogram",
        "bokeh_line", "bokeh_pie", "bokeh_scatter", "bottom_k", "branch", "combine_conditions",
        "contains_any", "count_vectorizer", "cut", "dbscan", "describe", "drop",
        "drop_nulls", "dt_combine", "dt_strftime", "entropy", "explode", "fill_nan",
        "fill_null", "hashing_vectorizer", "head", "hstack", "input_port", "interpolate",
        "is_infinite", "join_asof", "kmeans", "kurtosis", "lda", "logistic_regression",
        "mode", "multinomial_nb", "nmf", "pct_change", "peak_max", "peak_min",
        "qcut", "rechunk", "rename", "rolling_max", "rolling_mean", "rolling_min",
        "rolling_std", "rolling_sum", "rolling_var", "sample", "series_arith", "series_compare",
        "series_filter", "sgd_classifier", "shift", "shuffle", "sign", "str_decode",
        "str_extract_all", "str_json_extract", "str_replace_all", "str_split", "str_strptime", "struct_field",
        "struct_json_encode", "struct_rename_fields", "struct_unnest", "svc", "tail", "tfidf_vectorizer",
        "top_k", "transpose", "truncated_svd", "unnest", "unpivot", "vstack",
        "with_columns", "with_row_index", "write_csv", "write_excel", "write_html", "write_json",
    ];
    if (unsupportedTypes.includes(nodeType)) {
        return false;
    }
    
    // For call nodes, check if the specific method is unsupported in SQL
    if (nodeType === "call" && properties.method) {
        const method = properties.method;
        const unsupportedMethods = [
            "str.replace_all", "str.split", "str.strptime", 
            "dt.strftime", "rolling_mean", "rolling_sum"
        ];
        if (unsupportedMethods.includes(method)) {
            return false;
        }
    }
    
    return true;
}
