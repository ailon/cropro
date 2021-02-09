import typescript from '@rollup/plugin-typescript';
import htmlTemplate from 'rollup-plugin-generate-html-template';
import dev from 'rollup-plugin-dev';
import livereload from 'rollup-plugin-livereload';
import pkg from './package.json';

export default {
  input: ['test/manual/experiments.ts'],
  output: {
    dir: 'build-dev',
    format: 'umd',
    sourcemap: true,
    name: pkg.name
  },
  plugins: [
    typescript(), 
    htmlTemplate({
      template: 'test/manual/template.html',
      target: 'index.html'      
    }),
    dev('build-dev'),
    livereload('build-dev')
  ]
};
