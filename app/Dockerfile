# =============================================================================
# AP1-Lernplattform -- Frontend, gebaut fuer armserver (pruefung.alexle135.de)
# =============================================================================
# TanStack Start baut ueber Nitro. Die Lovable-Konfiguration
# (@lovable.dev/vite-tanstack-config) setzt als Nitro-Ziel standardmaessig
# Cloudflare -- das ergibt einen Worker, den kein Node startet. NITRO_PRESET
# stellt das auf einen gewoehnlichen Node-Server um. Ohne diese Zeile baut das
# Image durch und der Container endet danach ohne Servereinstieg.
#
# Der Paketmanager ist bun: das Projekt bringt bun.lock mit, nicht
# package-lock.json. Mit npm entstuende ein anderer Abhaengigkeitsbaum als der,
# den Lovable gebaut hat.
#
# Zur Buildzeit eingebettet werden alle VITE_*-Variablen -- sie landen im
# Browser-Bundle und sind damit oeffentlich. Deshalb steht hier ausschliesslich
# der publishable Key (anon), niemals der service_role-Key.
# =============================================================================

FROM oven/bun:1.3-alpine AS build
WORKDIR /bau

# Erst die Manifeste, damit der Abhaengigkeits-Layer nicht bei jeder
# Quelltextaenderung neu entsteht.
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

# Diese beiden wandern ins Browser-Bundle. Sie sind oeffentlich -- der anon-Key
# ist genau dafuer gebaut, und ohne RLS waere er auch mit Geheimhaltung wertlos.
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ENV VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
ENV VITE_SUPABASE_PUBLISHABLE_KEY=${VITE_SUPABASE_PUBLISHABLE_KEY}

ENV NITRO_PRESET=node-server
RUN bun run build

# -----------------------------------------------------------------------------
# Laufzeit: nur das gebaute Ergebnis, kein Quelltext, keine Bauwerkzeuge.
# -----------------------------------------------------------------------------
FROM node:22-alpine AS laufzeit
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

COPY --from=build /bau/.output ./.output

# Nicht als root laufen. node:alpine bringt den Benutzer `node` bereits mit.
USER node

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
