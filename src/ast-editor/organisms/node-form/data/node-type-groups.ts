/** Node types whose form is the "path + browse-to-save" write_* shape. */
export const WRITE_FILE_TYPES = ["write_csv", "write_excel", "write_html", "write_json"];

/** Every ML node type that shares the mlNodeForm shape. */
export const MULTI_ML_TYPES = [
    "logistic_regression", "svc", "multinomial_nb", "sgd_classifier",
    "kmeans", "dbscan", "agglomerative_clustering",
    "truncated_svd", "lda", "nmf",
    "tfidf_vectorizer", "count_vectorizer", "hashing_vectorizer",
];

/** ML sub-groups mlNodeForm branches on to decide which fields to show. */
export const SUPERVISED_ML_TYPES = ["logistic_regression", "svc", "multinomial_nb", "sgd_classifier"];
export const VECTORIZER_ML_TYPES = ["tfidf_vectorizer", "count_vectorizer", "hashing_vectorizer"];
export const DIMENSIONALITY_ML_TYPES = ["truncated_svd", "lda", "nmf"];
