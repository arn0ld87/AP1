import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { MAIN_SCROLL_ID } from "./lib/scroll";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    // Die App-Shell scrollt in <main>, nicht im Fenster — sonst öffnet eine
    // neue Route auf der Scrollposition der vorherigen.
    scrollToTopSelectors: [`#${MAIN_SCROLL_ID}`],
    defaultPreloadStaleTime: 0,
  });

  return router;
};
