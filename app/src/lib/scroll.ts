/**
 * ID des scrollbaren Inhaltsbereichs der App-Shell (`<main>` in `AppLayout`).
 *
 * Liegt bewusst in einem eigenen Modul: `router.tsx` braucht den Wert für
 * `scrollToTopSelectors`, soll dafür aber nicht das ganze Layout samt
 * Radix-Abhängigkeiten importieren.
 */
export const MAIN_SCROLL_ID = "app-main-scroll";
