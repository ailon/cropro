# Browser Library Developer Starter Kit

This repository is a starting point for efficient development of JavaScript libraries targeting use
in browser applications.

## Goals

This repository is based on the need to have an easy and fairly simple starting point 
for development of JavaScript libraries with these goals in mind:

### Development
- using [TypeScript](https://www.typescriptlang.org/)
- linting (with [ESLint](https://eslint.org/))
- formatting (with [Prettier](https://prettier.io/))

### Debugging & manual testing
- manual testing "app" with live reload
- ready for debugging in Visual Studio Code

### Build & publish
- build UMD and ESM bundles
- build typings in a single file
- copy license, readme, and sanitized package.json
- ready to be published to npm

### Documentation
- generate reference documentation

### Misc
- created around [yarn](https://yarnpkg.com/) but feel free to use npm instead.

## How to use

### Setup

1. Create a target folder on your drive.
2. Clone this repository into it:

```shell
git clone https://github.com/ailon/browser-lib-starter.git .
```
3. Delete `.git` sub-folder and re-initialize your repository
```shell
git init
```
4. Go through `package.json` and `rollup.config.prod.js` and change names, descriptions, 
and other information where needed.
5. Install dependencies by running:
```shell
yarn
```


### Develop & debug

Your library code goes under `/src`. 
This repository includes a sample class in `src/logic/LibDemo.ts` - fill free to remove it.
Export everything that needs to be exported in `src/index.ts`.

Write your manual testing code in `/test/manual/experiments.ts`. 
The manual testing web page template is in `template.html`. 

**Note** that while changes to `experiments.ts`
are hot-reloaded, changes to `template.html` are not.

To start a dev/debugging session run:

```shell
yarn start
```

You can set breakpoints in your code and run a debugging session in Visual Studio Code and other editors.

### Build & publish

You can build your ready-to-publish library with

```shell
yarn build
```

The output is in the `/dist` sub-folder which you can publish to npm by running

```shell
npm publish ./dist
```

### Building reference docs

Write your [doc-comments](https://typedoc.org/guides/doccomments/) in your code then run

```shell
yarn docs
```

The docs are generated in `/docs` which by default is included in `.gitignore`. 
You may want to remove it from there depending on your needs.

## Missing stuff and known issues

**There's no automated testing of any sort** as I lack the knowledge to implement any of it in a meaningful
way for interactive browser-focused libraries. 
In case you have the skills and know-how please reach out in the issues and, potentially, submit a pull-request.

**HTML template for manual testing (`template.html`) is not hot-reloaded.** Generally, this shouldn't be a big deal as you should change your code in `experiments.ts` for the most part. But be aware that if you need to change the HTML you will have to restart the session.

## Credits

The whole project is based around [rollup.js](http://rollupjs.org/guide/en/) and plugins for it. See `package.json` for the list of dev dependencies.

Created by [Alan Mendelevich](https://twitter.com/ailon) as a basis 
for [marker.js 2](https://github.com/ailon/markerjs2/) and other libraries.