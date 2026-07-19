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
