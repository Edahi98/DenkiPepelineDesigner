import { useState, useCallback } from "react";

/** Visibility of the Help and Examples Library modals. */
export function useCanvasModals() {
    const [helpOpen, setHelpOpen] = useState(false);
    const [examplesOpen, setExamplesOpen] = useState(false);

    const openHelp = useCallback(() => setHelpOpen(true), []);
    const closeHelp = useCallback(() => setHelpOpen(false), []);
    const openExamples = useCallback(() => setExamplesOpen(true), []);
    const closeExamples = useCallback(() => setExamplesOpen(false), []);

    return { helpOpen, openHelp, closeHelp, examplesOpen, openExamples, closeExamples };
}
