import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

type AiChatPanelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AiChatPanel({ open, onOpenChange }: AiChatPanelProps) {
  const isMobile = useIsMobile();

  const content = (
    <div className="flex h-full w-full flex-col">
      <div className="flex h-16.25 shrink-0 items-center justify-end px-4">
        <Button variant="ghost" size="icon-sm" onClick={() => onOpenChange(false)}>
          <X />
          <span className="sr-only">Close AI chat</span>
        </Button>
      </div>
      {/* mensagens e input */}

    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full p-0 sm:max-w-none">
          {content}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside
      data-open={open}
      className="sticky top-0 h-svh w-0 shrink-0 overflow-hidden transition-[width] duration-200 ease-linear data-[open=true]:w-110 data-[open=true]:border-l"
    >
      {/* largura fixa por dentro, para o conteúdo não reflowar durante a animação */}
      <div className="h-full w-110">
        {content}
      </div>
    </aside>
  );
}
