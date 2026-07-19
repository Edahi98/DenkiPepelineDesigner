import React, { memo } from 'react';
import { NodeProps, NodeResizer } from 'reactflow';
import { Boxes } from 'lucide-react';

export const GroupNode = memo(({ data, selected }: NodeProps) => {
    return (
        <>
            <NodeResizer 
                color="#c026d3" 
                isVisible={selected} 
                minWidth={200} 
                minHeight={200}
            />
            
            <div className="w-full h-full rounded-2xl border-2 border-fuchsia-500/40 bg-fuchsia-950/20 backdrop-blur-sm relative transition-colors duration-200"
                 style={{ 
                    minWidth: '200px', 
                    minHeight: '200px',
                    borderColor: selected ? 'rgba(217, 70, 239, 0.8)' : 'rgba(217, 70, 239, 0.4)',
                    boxShadow: selected ? '0 0 20px rgba(217, 70, 239, 0.2)' : 'none'
                 }}>
                
                {/* Header */}
                <div className="absolute top-0 left-0 w-full h-10 border-b-2 border-fuchsia-500/40 bg-fuchsia-500/10 flex items-center px-4 gap-2 rounded-t-[14px]">
                    <Boxes className="w-4 h-4 text-fuchsia-300" />
                    <span className="text-sm font-bold text-fuchsia-100 tracking-wide">
                        {data?.label || "Macro Nodo (Subgrafo)"}
                    </span>
                </div>
                
                {/* No handles needed for groups in standard setup as children handles are exposed */}
                {/* The body is transparent and just acts as a container for child nodes */}
            </div>
        </>
    );
});

GroupNode.displayName = "GroupNode";
