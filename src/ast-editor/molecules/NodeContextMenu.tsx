
import { PlusCircle, Copy, Trash2, Settings } from "lucide-react";
import { useEffect, useRef } from "react";

interface NodeContextMenuProps {
    x: number;
    y: number;
    nodeId: string;
    isOpen: boolean;
    onClose: () => void;
    onAddChild: (nodeId: string) => void;
    onDuplicate: (nodeId: string) => void;
    onDelete: (nodeId: string) => void;
    onEditProperties?: (nodeId: string) => void;
}

export const NodeContextMenu = ({
    x,
    y,
    nodeId,
    isOpen,
    onClose,
    onAddChild,
    onDuplicate,
    onDelete,
    onEditProperties,
}: NodeContextMenuProps) => {
    const menuRef = useRef<HTMLDivElement>(null);

    // Close on any outside click or scroll
    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as HTMLElement)) {
                onClose();
            }
        };
        const handleScroll = () => onClose();
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("scroll", handleScroll, true);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("scroll", handleScroll, true);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const items = [
        ...(onEditProperties ? [{
            key: "edit",
            label: "Edit Properties",
            icon: <Settings className="w-4 h-4" />,
            color: "text-emerald-400 hover:bg-emerald-500/10 hover:bg-emerald-500/20 shadow-md",
            action: () => onEditProperties(nodeId),
        }] : []),
        {
            key: "add",
            label: "Add Child Node",
            icon: <PlusCircle className="w-4 h-4" />,
            color: "text-emerald-400 hover:bg-emerald-500/10 hover:bg-emerald-500/20 shadow-md",
            action: () => onAddChild(nodeId),
        },
        {
            key: "duplicate",
            label: "Duplicate Node",
            icon: <Copy className="w-4 h-4" />,
            color: "text-blue-400 hover:bg-blue-500/10 hover:bg-blue-500/20 shadow-md",
            action: () => onDuplicate(nodeId),
        },
        {
            key: "delete",
            label: "Delete Node",
            icon: <Trash2 className="w-4 h-4" />,
            color: "text-[#ff0000] hover:bg-[#ff0000]/20 shadow-md shadow-rose-500/20",
            action: () => onDelete(nodeId),
        },
    ];

    return (
        <div
            ref={menuRef}
            className="fixed z-[9999]"
            style={{ left: x, top: y }}
            onContextMenu={(e) => e.preventDefault()}
        >
            <div className="glass-panel/95 backdrop-blur-xl border border-2 border-blue-500/50 rounded-xl shadow-2xl overflow-hidden min-w-[180px] py-1">
                {items.map(item => (
                    <button
                        key={item.key}
                        onClick={() => {
                            item.action();
                            onClose();
                        }}
                        className={`w-full text-left px-3 py-2.5 text-sm flex items-center gap-2.5 transition-colors ${item.color}`}
                    >
                        {item.icon}
                        {item.label}
                    </button>
                ))}
            </div>
        </div>
    );
};
