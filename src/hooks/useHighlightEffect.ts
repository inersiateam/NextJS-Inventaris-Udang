'use client';
import { useEffect } from 'react';

export default function useHighlightEffect(prefix: string) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const highlightId = params.get('highlight');
    if (!highlightId) return;

    const element = document.getElementById(`${prefix}-${highlightId}`);
    if (element) {
      element.classList.add('highlight-blue');
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // hapus efek setelah beberapa detik
      const timeout = setTimeout(() => {
        element.classList.remove('highlight-blue');
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [prefix]);
}
