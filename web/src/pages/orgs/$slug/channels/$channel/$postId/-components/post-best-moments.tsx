import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";
import { BestMomentCard } from "./best-moment-card";
import { BestMomentsEmpty } from "./best-moments-empty";
import { BestMomentsPagination } from "./best-moments-pagination";

const PAGE_SIZE = 6;

// TODO: remover — melhores momentos fictícios até existir endpoint para listá-los.
// Troque para `[]` para ver o estado vazio.
const MOCK_BEST_MOMENTS = [
  { id: "bm-1", title: "O momento em que o Claude Code resolve o bug sozinho", createdAt: "2026-10-02T12:00:00Z" },
  { id: "bm-2", title: "Como o CLAUDE.md muda o jeito que o agente trabalha", createdAt: "2026-10-02T12:00:00Z" },
  { id: "bm-3", title: "Skills: instruções reutilizáveis em 30 segundos", createdAt: "2026-10-02T12:00:00Z" },
  { id: "bm-4", title: "Commands para automatizar tarefas repetitivas", createdAt: "2026-10-02T12:00:00Z" },
  { id: "bm-5", title: "Conectando o Claude a ferramentas externas com MCP", createdAt: "2026-10-02T12:00:00Z" },
  { id: "bm-6", title: "O fluxo de trabalho completo, do começo ao fim", createdAt: "2026-10-02T12:00:00Z" },
  { id: "bm-7", title: "Erros comuns ao configurar o contexto do projeto", createdAt: "2026-10-02T12:00:00Z" },
];

/** Seção de melhores momentos do post. Só faz sentido para posts que são vídeo. */
export function PostBestMoments() {
  const [currentPage] = useQueryState(
    "best_moments_page",
    parseAsInteger.withDefault(0),
  );

  const totalCount = MOCK_BEST_MOMENTS.length;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const bestMoments = MOCK_BEST_MOMENTS.slice(
    currentPage * PAGE_SIZE,
    (currentPage + 1) * PAGE_SIZE,
  );

  const hasBestMoments = totalCount > 0;

  return (
    <section className="space-y-4 rounded-xl border border-border bg-card px-4 pt-3 pb-4 dark:bg-zinc-900/20">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-medium">Best moments</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            The highlights picked from this video.
          </p>
        </div>
        {/* TODO: ligar ao endpoint que gera os melhores momentos. */}
        <Button variant="outline" size="sm">
          <Sparkles className="size-4" />
          Generate best moments
        </Button>
      </header>

      {hasBestMoments ? (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {bestMoments.map((bestMoment) => (
              <BestMomentCard key={bestMoment.id} bestMoment={bestMoment} />
            ))}
          </div>

          <footer className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Showing {bestMoments.length} of {totalCount} best moments
            </span>
            <BestMomentsPagination totalPages={totalPages} />
          </footer>
        </>
      ) : (
        <BestMomentsEmpty />
      )}
    </section>
  );
}
