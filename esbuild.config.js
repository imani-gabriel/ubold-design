const esbuild = require('esbuild');
const path = require('path');

const isWatch = process.argv.includes('--watch');

const config = {
  entryPoints: ['public/js/main.js'],
  bundle: true,
  minify: true,
  sourcemap: true,
  target: ['chrome58', 'firefox57', 'safari11', 'edge16'],
  outfile: 'public/dist/bundle.js',
  loader: {
    '.js': 'jsx',
    '.css': 'css',
  },
  define: {
    'process.env.NODE_ENV': '"production"'
  },
  plugins: [
    {
      name: 'on-rebuild',
      setup(build) {
        if (isWatch) {
          build.onEnd(result => {
            if (result.errors.length > 0) {
              console.error('Build failed:', result.errors);
            } else {
              console.log('Build succeeded');
            }
          });
        }
      },
    },
  ],
};

if (isWatch) {
  esbuild.context(config).then(ctx => {
    ctx.watch();
    console.log('Watching for changes...');
  });
} else {
  esbuild.build(config).catch(() => process.exit(1));
} 