import { useEffect, useRef } from "react";

const MAX_FADE_SIZE = 32;

/**
 * Expõe `--fade-top` e `--fade-bottom` (em px) no elemento rolável, proporcionais
 * ao conteúdo ainda escondido em cada direção (até `MAX_FADE_SIZE`). Zero quando
 * não há nada para rolar. O elemento usa as variáveis numa `mask-image`.
 */
export function useScrollFade<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let frame = 0;

    function update() {
      if (!element) return;
      const { scrollTop, scrollHeight, clientHeight } = element;
      const hiddenBottom = scrollHeight - clientHeight - scrollTop;

      element.style.setProperty(
        "--fade-top",
        `${Math.min(Math.max(scrollTop, 0), MAX_FADE_SIZE)}px`,
      );
      element.style.setProperty(
        "--fade-bottom",
        `${Math.min(Math.max(hiddenBottom, 0), MAX_FADE_SIZE)}px`,
      );
    }

    function scheduleUpdate() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    }

    update();

    element.addEventListener("scroll", scheduleUpdate, { passive: true });

    // Tamanho do próprio container (resize da janela, sidebar colapsando).
    const resizeObserver = new ResizeObserver(scheduleUpdate);
    resizeObserver.observe(element);

    // Conteúdo que entra, sai ou muda de altura (rotas de canal, collapsibles).
    const mutationObserver = new MutationObserver(scheduleUpdate);
    mutationObserver.observe(element, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    return () => {
      cancelAnimationFrame(frame);
      element.removeEventListener("scroll", scheduleUpdate);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return { ref };
}
