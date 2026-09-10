import { build, context } from 'esbuild';

const options = {
  entryPoints: ['frontend/src/main.jsx'],
  outfile: 'src/main/resources/static/app/app.js',
  bundle: true,
  minify: true,
  jsx: 'automatic',
  target: ['es2020'],
  define: { 'process.env.NODE_ENV': '"production"' },
  legalComments: 'linked',
};

if (process.argv.includes('--watch')) {
  const ctx = await context(options);
  await ctx.watch();
  console.log('Watching React sources. Serve the app through the existing Spring/gateway service.');
} else {
  await build(options);
}
