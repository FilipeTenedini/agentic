import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useKnowledgeBase } from "@/contexts/knowledge-base-context";
import { ACCEPTED_FILE_EXTENSIONS } from "@/mocks/knowledge-base";
import { cn } from "@/lib/utils";

export function KnowledgeFileUpload() {
  const { addFiles } = useKnowledgeBase();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    addFiles(files);
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
        dragging ? "border-primary bg-accent" : "border-border"
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <UploadCloud className="size-6" />
      </span>
      <div className="space-y-1">
        <p className="text-sm font-medium">
          Arraste arquivos aqui ou clique para enviar
        </p>
        <p className="mx-auto max-w-md text-xs text-muted-foreground">
          Apenas planilhas CSV e XLSX. O assistente usará esse material para
          responder com mais contexto.
        </p>
      </div>
      <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
        Selecionar arquivos
      </Button>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED_FILE_EXTENSIONS}
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
