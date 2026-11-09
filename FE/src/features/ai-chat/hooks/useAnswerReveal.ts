import { useEffect, useMemo, useState } from 'react';
import { revealText, splitChatText } from '../utils/chatPresentation';

export function useAnswerReveal(content: string, animate: boolean) {
  const units = useMemo(() => (animate ? splitChatText(content) : []), [animate, content]);
  const [reducedMotion, setReducedMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const [visible, setVisible] = useState(animate && !reducedMotion ? '' : content);
  const [skipped, setSkipped] = useState(false);
  useEffect(() => {
    if (!animate) return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [animate]);
  useEffect(() => {
    if (!animate || reducedMotion || skipped) {
      setVisible(content);
      return;
    }
    setVisible('');
    const started = performance.now();
    const timer = window.setInterval(() => {
      const next = revealText(units, performance.now() - started, false);
      setVisible(next);
      if (next === content) window.clearInterval(timer);
    }, 32);
    return () => window.clearInterval(timer);
  }, [animate, content, reducedMotion, skipped, units]);
  const text = !animate || reducedMotion || skipped ? content : visible;
  return { text, revealing: text !== content, skip: () => setSkipped(true) };
}
