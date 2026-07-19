import { AstEditorLayout } from "../ast-editor/templates/AstEditorLayout";
import { AstCanvas } from "../ast-editor/templates/AstCanvas";

export default function EditorPage() {
  return (
    <AstEditorLayout>
      <AstCanvas />
    </AstEditorLayout>
  );
}
