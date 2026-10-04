// Lightweight esbuild bundler used as a fallback build path in this environment
// (Vite's Rollup build is unavailable here). Produces dist/assets/app.js.
// Tailwind CSS is compiled separately via the Tailwind CLI; main.jsx's CSS
// import is treated as empty here and the compiled stylesheet is linked in HTML.
import * as esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['src/main.jsx'],
  bundle: true,
  minify: true,
  sourcemap: false,
  format: 'esm',
  target: ['es2020'],
  jsx: 'automatic',
  loader: { '.css': 'empty' },
  define: { 'process.env.NODE_ENV': '"production"' },
  banner: {
    js: 'window.global=window;window.process=window.process||{env:{NODE_ENV:"production"}};',
  },
  outfile: 'dist/assets/app.js',
  logLevel: 'info',
});

console.log('ESBUILD_BUNDLE_DONE');
