import path from "node:path";
import { defineConfig } from "vitest/config";

/**
 * Pruebas unitarias del panel (MxH-0177).
 *
 * **Qué entra aquí y qué no.** Esto es para la **lógica pura**: transiciones de
 * estado, validación de lo que llega de la API, aritmética de indicadores. Los
 * componentes con mucho `ra-core` dan mala relación esfuerzo/valor y ya están
 * cubiertos por las pruebas de navegador de `e2e/`, que son las que de verdad
 * miran la pantalla.
 *
 * `e2e/` queda excluido a propósito: esos `.spec` los genera `bddgen` para
 * Playwright, y vitest no debe tocarlos.
 *
 * El alias `@` se repite aquí en vez de traerse `vite-tsconfig-paths`: es la
 * misma línea que ya tiene `vite.config.ts` y evita una dependencia más. Si
 * algún día aparece un segundo alias, conviene mover los dos a un fichero
 * compartido antes de que empiecen a divergir.
 */
export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  test: {
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    exclude: ["e2e/**", "node_modules/**", "dist/**"],
    // `jsdom` y no `node`: varias piezas leen `sessionStorage`, que es donde el
    // panel guarda lo que tiene que sobrevivir a una redirección.
    environment: "jsdom",
  },
});
