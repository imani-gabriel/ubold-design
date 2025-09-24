// Script Node.js pour builder client et serveur en parallèle avec esbuild
const esbuild = require('esbuild');
const path = require('path');

const builds = [
  // Build côté client
  esbuild.build({
    entryPoints: [
      path.join(__dirname, 'src/public/js/main.js'),
      path.join(__dirname, 'src/public/js/modules/FormEngin.js'),
      path.join(__dirname, 'src/public/js/data.js'),
      path.join(__dirname, 'src/public/js/master.js')
    ],
    outdir: 'dist/client',
    bundle: true,
    minify: true,
    sourcemap: true,
    splitting: true,
    format: 'esm',
    target: ['es2017'],
    logLevel: 'info',
  }),
  // Build côté serveur
  esbuild.build({
    entryPoints: [path.join(__dirname, 'src/server/app.js')],
    outfile: 'dist/server/app.js',
    bundle: true,
    platform: 'node',
    target: ['node18'],
    minify: false,
    sourcemap: true,
    logLevel: 'info',
    external: ['apexcharts']
  })
];

Promise.all(builds)
  .then(() => {
    console.log('Build client et serveur terminé !');
  })
  .catch((err) => {
    console.error('Erreur dans le build :', err);
    process.exit(1);
  });
