import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// `npm run build`         → dist/          static site (relative base: works on any host / sub-path, e.g. GitHub Pages)
// `npm run build:single`  → dist-single/   ONE index.html (JS, CSS, fonts, public assets inlined) — opens by double-click
export default defineConfig(({ mode }) => {
  const single = mode === 'single';
  return {
    base: './',
    plugins: [react(), tailwindcss(), ...(single ? [viteSingleFile({ removeViteModuleLoader: true })] : [])],
    build: single
      ? { outDir: 'dist-single', copyPublicDir: false, assetsInlineLimit: 100_000_000, cssCodeSplit: false, chunkSizeWarningLimit: 100_000 }
      : { chunkSizeWarningLimit: 2000 },
    optimizeDeps: {
      // lazy-loaded libraries: pre-bundle them at dev start, otherwise the first slide that uses one
      // triggers a dependency re-optimisation and a full page reload ("Outdated Optimize Dep")
      include: [
        '@theatre/core',
        '@splinetool/runtime',
        '@lottiefiles/dotlottie-react',
        'katex',
        'lenis',
        '@formkit/auto-animate/react',
        'prism-react-renderer',
        'topojson-client',
      ],
    },
  };
});
