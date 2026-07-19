import { X } from "lucide-react";

interface IconDeleteButtonProps {
    onClick: () => void;
    size?: number;
}

/**
 * Small square remove button (X icon, red hover) — identical markup was
 * duplicated between ScanForm's remove-column and RenameForm's
 * remove-mapping buttons.
 */
export function IconDeleteButton({ onClick, size = 12 }: IconDeleteButtonProps) {
    return (
        <button
            onClick={onClick}
            className="p-1 rounded hover:bg-[#ff0000]/20 shadow-md shadow-rose-500/20 text-gray-200 font-semibold hover:text-[#ff0000] transition-colors"
        >
            <X size={size} />
        </button>
    );
}
