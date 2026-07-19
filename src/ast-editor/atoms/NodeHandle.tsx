
import { Handle, Position } from "reactflow";

interface NodeHandleProps {
    type: "source" | "target";
    position: Position;
    id?: string;
    /**
     * Vertical offset (in px) used to stack multiple handles on the
     * same side of a node (e.g. the Filter node has two target handles
     * on the right: one for the dataflow and one for the predicate).
     */
    offsetY?: number;
    label?: string;
}

export const NodeHandle = ({ type, position, id, offsetY = 0, label }: NodeHandleProps) => {
    return (
        <>
            <Handle
                id={id}
                position={position}
                style={{
                    width: 10,
                    height: 10,
                    background: type === "source" ? "#229AA4" : "#8a8a8a",
                    border: "2px solid #562407",
                    borderRadius: "50%",
                    ...(offsetY
                        ? position === Position.Left || position === Position.Right
                            ? { top: `calc(50% + ${offsetY}px)` }
                            : { left: `calc(50% + ${offsetY}px)` }
                        : {}),
                }}
                title={label}
                type={type}
            />
            {label && (
                <span
                    style={{
                        position: "absolute",
                        ...(position === Position.Left
                            ? { left: 14, top: `calc(50% + ${offsetY}px - 8px)` }
                            : position === Position.Right
                            ? { right: 14, top: `calc(50% + ${offsetY}px - 8px)` }
                            : position === Position.Top
                            ? { top: -16, left: `calc(50% + ${offsetY}px - 16px)` }
                            : { bottom: -16, left: `calc(50% + ${offsetY}px - 16px)` }),
                        fontSize: 8,
                        fontWeight: 700,
                        color: "#9a9a9a",
                        textTransform: "uppercase",
                        pointerEvents: "none",
                        background: "rgba(231,216,211,0.85)",
                        padding: "0 3px",
                        borderRadius: 2,
                    }}
                >
                    {label}
                </span>
            )}
        </>
    );
};
