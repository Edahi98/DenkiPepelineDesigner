import { useState, useEffect } from "react";
import type { Node } from "reactflow";
import type { AstNodeData } from "../../../shared/types/ast_types";
import { columnStore } from "../../../shared/utils/column_store";
import { eventBus } from "../../../shared/utils/event_bus";

/**
 * The in-progress edit state for whichever node NodePanel currently has
 * open: the property bag being edited, the column-store subscription
 * that feeds column pickers, and the change handler that writes an edit
 * back onto the canvas. Pulled out of NodePanel so that component only
 * has to handle layout/rendering.
 */
export function useNodeFormState(
    node: Node<AstNodeData> | null,
    onChange: (nodeId: string, updatedProperties: Record<string, any>, newType?: string) => void,
) {
    const [editValues, setEditValues] = useState<Record<string, any>>({});
    const [availableColumns, setAvailableColumns] = useState<string[]>(columnStore.columns);

    // Listen to column changes from the global store
    useEffect(() => {
        setAvailableColumns(columnStore.columns);
        const handler = (cols: string[]) => {
            setAvailableColumns(cols);
        };
        eventBus.subscribe("COLUMNS_CHANGED", handler);
        return () => {
            eventBus.unsubscribe("COLUMNS_CHANGED", handler);
        };
    }, []);

    // Reset local edit state when the active node changes.  We depend
    // on the node id AND the properties reference so an external
    // update (e.g. another form on the page mutating the same node)
    // is reflected here too.  We don't sync on every keystroke to
    // avoid clobbering the user's in-progress edit; the explicit
    // handleFieldChange call is the source of truth during typing.
    useEffect(() => {
        if (node) {
            setEditValues({ ...node.data.properties });
        }
    }, [node?.id, node?.data?.properties]);

    const handleFieldChange = (key: string | null, value: any, newType?: string) => {
        if (!node) return;
        const updated = key ? { ...editValues, [key]: value } : { ...editValues };
        if (key) setEditValues(updated);
        onChange(node.id, updated, newType);
    };

    /** Build column options with a fallback for manual entry */
    const columnOptions = availableColumns.length > 0
        ? ["", ...availableColumns]
        : [""];

    return { editValues, availableColumns, columnOptions, handleFieldChange };
}
