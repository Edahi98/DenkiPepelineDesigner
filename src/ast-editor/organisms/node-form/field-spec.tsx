import type { ReactNode } from "react";
import type { Node, Edge } from "reactflow";
import type { AstNodeData } from "../../../shared/types/ast_types";
import { TextField, SelectField, SwitchField, MultiSelectField, ListField } from "../../molecules/PropertyField";

/**
 * Everything a node type's form needs to read/write. Built once per
 * render in NodePanel and threaded through every field spec and custom
 * form registered in `NODE_FORM_SCHEMAS` — no field or custom renderer
 * reaches into component state directly.
 */
export interface FormContext {
    type: string;
    node: Node<AstNodeData>;
    editValues: Record<string, any>;
    handleFieldChange: (key: string | null, value: any, newType?: string) => void;
    availableColumns: string[];
    /** availableColumns prefixed with "" for an empty/manual-entry option. */
    columnOptions: string[];
    allNodes?: Node<AstNodeData>[];
    allEdges?: Edge[];
}

interface FieldBase {
    key: string;
    label: string | ((ctx: FormContext) => string);
    /** Field is only rendered when this returns true (defaults to always-shown). */
    when?: (ctx: FormContext) => boolean;
}

export interface TextSpec extends FieldBase {
    kind: "text";
    placeholder?: string | ((ctx: FormContext) => string);
    getValue: (ctx: FormContext) => string;
    onChange: (value: string, ctx: FormContext) => void;
}

export interface SelectSpec extends FieldBase {
    kind: "select";
    options: string[] | ((ctx: FormContext) => string[]);
    getValue: (ctx: FormContext) => string;
    onChange: (value: string, ctx: FormContext) => void;
}

export interface MultiSelectSpec extends FieldBase {
    kind: "multiselect";
    options: (ctx: FormContext) => string[];
    placeholder?: string;
    getValue: (ctx: FormContext) => string[];
    onChange: (value: string[], ctx: FormContext) => void;
}

export interface SwitchSpec extends FieldBase {
    kind: "switch";
    getValue: (ctx: FormContext) => boolean;
    onChange: (value: boolean, ctx: FormContext) => void;
}

export interface ListSpec extends FieldBase {
    kind: "list";
    placeholder?: string;
    getValue: (ctx: FormContext) => string;
    onChange: (value: string, ctx: FormContext) => void;
}

export type FieldSpec = TextSpec | SelectSpec | MultiSelectSpec | SwitchSpec | ListSpec;

/**
 * A node type's form is either a plain list of fields (rendered
 * generically by `renderFieldSpecs`) or, for shapes a fixed field list
 * can't express (cross-field JSX, sub-components, external data
 * fetches), a custom render function. Either way it is exactly one
 * entry in `NODE_FORM_SCHEMAS` — never a `case` in a shared switch.
 */
export type NodeFormEntry = FieldSpec[] | ((ctx: FormContext) => ReactNode);

/**
 * Field specs derived from a node's own properties, for types with no
 * hand-written entry in `NODE_FORM_SCHEMAS`.
 *
 * Without this a node carrying editable properties but no registered
 * form told the user "este tipo de nodo no requiere propiedades" and
 * gave them nothing to edit — the properties were real, reachable by the
 * serializer and meaningful to Tsubasa, just not reachable by the person
 * using the app. Deriving the fields from the values themselves covers
 * every such type at once, including any added later, instead of the
 * list being kept in sync by hand and quietly falling behind.
 *
 * A hand-written entry always wins: it knows the column pickers, the
 * enumerated options and the cross-field rules this cannot infer. This
 * is the floor, not the ceiling.
 */
export function inferFieldSpecs(properties: Record<string, any>): FieldSpec[] {
    const label = (key: string) =>
        key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

    return Object.keys(properties).map((key): FieldSpec => {
        const value = properties[key];

        if (typeof value === "boolean") {
            return {
                kind: "switch", key, label: label(key),
                getValue: (c) => !!c.editValues[key],
                onChange: (v, c) => c.handleFieldChange(key, v),
            };
        }

        // Arrays, and the JSON-encoded strings several nodes store them as,
        // get the list editor rather than one long unparseable text box.
        const isList = Array.isArray(value)
            || (typeof value === "string" && value.trim().startsWith("["));
        if (isList) {
            return {
                kind: "list", key, label: label(key), placeholder: `Add ${label(key)}...`,
                getValue: (c) => {
                    const v = c.editValues[key];
                    return typeof v === "string" ? v : JSON.stringify(v ?? []);
                },
                onChange: (v, c) => c.handleFieldChange(key, v),
            };
        }

        const isNumber = typeof value === "number";
        return {
            kind: "text", key, label: label(key),
            placeholder: isNumber ? "e.g. 1" : "",
            getValue: (c) => {
                const v = c.editValues[key];
                return v === undefined || v === null ? "" : String(v);
            },
            onChange: (v, c) => {
                if (!isNumber) return c.handleFieldChange(key, v);
                // Keep an empty box meaning "unset" rather than 0, which is a
                // meaningful value for offsets, seeds and window sizes alike.
                if (v.trim() === "") return c.handleFieldChange(key, null);
                const n = Number(v);
                c.handleFieldChange(key, Number.isNaN(n) ? v : n);
            },
        };
    });
}

function resolve<T>(value: T | ((ctx: FormContext) => T), ctx: FormContext): T {
    return typeof value === "function" ? (value as (ctx: FormContext) => T)(ctx) : value;
}

export function renderFieldSpecs(fields: FieldSpec[], ctx: FormContext): ReactNode {
    return (
        <div className="flex flex-col gap-4">
            {fields.map((field, i) => {
                if (field.when && !field.when(ctx)) return null;
                const label = resolve(field.label, ctx);
                const key = `${field.key}-${i}`;

                switch (field.kind) {
                    case "text":
                        return (
                            <TextField
                                key={key}
                                label={label}
                                placeholder={resolve(field.placeholder ?? "", ctx)}
                                value={field.getValue(ctx)}
                                onChange={(val) => field.onChange(val, ctx)}
                            />
                        );
                    case "select":
                        return (
                            <SelectField
                                key={key}
                                label={label}
                                value={field.getValue(ctx)}
                                options={resolve(field.options, ctx)}
                                onChange={(val) => field.onChange(val, ctx)}
                            />
                        );
                    case "multiselect":
                        return (
                            <MultiSelectField
                                key={key}
                                label={label}
                                options={field.options(ctx)}
                                selected={field.getValue(ctx)}
                                onChange={(val) => field.onChange(val, ctx)}
                                placeholder={field.placeholder}
                            />
                        );
                    case "switch":
                        return (
                            <SwitchField
                                key={key}
                                label={label}
                                isSelected={field.getValue(ctx)}
                                onChange={(val) => field.onChange(val, ctx)}
                            />
                        );
                    case "list":
                        return (
                            <ListField
                                key={key}
                                label={label}
                                value={field.getValue(ctx)}
                                onChange={(val) => field.onChange(val, ctx)}
                                placeholder={field.placeholder}
                            />
                        );
                }
            })}
        </div>
    );
}
