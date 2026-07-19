interface ToggleSwitchProps {
    label: string;
    isSelected: boolean;
    onChange: (val: boolean) => void;
}

export const ToggleSwitch = ({ label, isSelected, onChange }: ToggleSwitchProps) => {
    return (
        <label className="flex items-center gap-3 cursor-pointer group">
            {label && (
                <span className="text-gray-300 font-medium text-xs tracking-wide">
                    {label}
                </span>
            )}
            <div className="relative flex items-center">
                <input
                    type="checkbox"
                    className="sr-only"
                    checked={isSelected}
                    onChange={(e) => onChange(e.target.checked)}
                />
                {/* Track */}
                <div className={`w-9 h-5 rounded-full border transition-colors duration-200 ease-in-out ${
                    isSelected 
                        ? "bg-cyan-500/80 border-cyan-400/50" 
                        : "bg-slate-800/80 border-slate-600/50"
                }`}></div>
                {/* Thumb */}
                <div className={`absolute top-[2px] left-[2px] w-4 h-4 rounded-full transition-transform duration-200 ease-in-out ${
                    isSelected 
                        ? "translate-x-4 bg-white shadow-sm" 
                        : "translate-x-0 bg-slate-400"
                }`}></div>
            </div>
        </label>
    );
};
