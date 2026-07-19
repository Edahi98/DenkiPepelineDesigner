import React from "react";
import { Network } from "lucide-react";

interface AstEditorLayoutProps {
    children: React.ReactNode;
}

export const AstEditorLayout = ({ children }: AstEditorLayoutProps) => {
    return (
        <div className="flex flex-col w-full h-[calc(100vh-36px)] pt-3">
            <header className="px-6 py-4 flex flex-row items-center justify-between z-10 bg-[rgba(15,23,42,0.4)] backdrop-blur-md border-b border-white/5 mb-4 shadow-sm rounded-t-xl mx-4">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                        <Network className="w-6 h-6 text-teal-400 drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]" />
                        <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-300 drop-shadow-sm tracking-tight">
                            Denki Pipeline Designer
                        </h1>
                    </div>
                    <p className="text-xs font-medium text-blue-200/70 ml-9">
                        Entorno interactivo para diseñar y realizar pruebas de tus flujos de procesamiento de datos y machine learning antes de exportarlos.
                    </p>
                </div>

            </header>

            <div className="flex-1 px-4 pb-4 overflow-hidden">
                <div className="w-full h-full rounded-2xl border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.3)] overflow-hidden bg-[rgba(15,23,42,0.4)] backdrop-blur-md relative">
                    {children}
                </div>
            </div>
        </div>
    );
};
