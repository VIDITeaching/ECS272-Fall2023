# More about the Framework


This is a tempalate in Vue.js and TypeScript. Vue 3.0 sits between React and basic JavaScript depending on the developers comfort level. For this class, we stick with [Options API](https://vuejs.org/api/#options-api) rather than Composition API (not required so you can switch depending on how you feel). We offer Vue, since it is a modern framework that companies use so it could be useful for you if one of your projects in this class could make use of it.

What this page covers:
 - Pointers if you want to use your own setup or a simpler template for the assignment
 - **The files you have to care about**
 - Libraries used in this framework

## Other Setups

If you want to be free of any frontend frameworks (e.g., Vue.js and React), go to the `VanillaJS-Template` folder.
If you want to use Vue.js but not with TypeScript, just remove any type specifications from the `Example.vue`. You can always refer to `VanillaJS-Template/example.js` for this migration.


## The Files You Have to Care about

`package.json` is where we manage the libraries we installed. Besides this, most of the files you can ignore, but **the files under `./src/` are your concern**.

* `./src/main.ts` is the root script file for Vue.js that instatinates our single page application.
* `./src/App.vue` is the root file for all **development** needs and is also where we manage the layout and load in components.
* `./src/types.ts` is usually where we declare our customized types (if you have any)
* `./src/stores/` is where we manage the stores if you're planning to use it. The store is a container that holds your application state.
* `./src/components/` is where we create the components. You may have multiple components depends on your design.

## Libraries Installed in this Framework
 * D3.js v7 for visualization
 * [axios](https://axios-http.com/docs/intro) for API.
 * [pinia](https://pinia.vuejs.org/introduction.html) for store management in Vue.js
 * [Vuetify](https://next.vuetifyjs.com/en/components/all/) for UI that follows Google Material Design 3.
 * [lodash](https://lodash.com/) for utility functions in JavaScript.


# Vite 

**NOTE: the following is from Vite, which you can ignore it.**

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Type Support For `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin) to make the TypeScript language service aware of `.vue` types.

If the standalone TypeScript plugin doesn't feel fast enough to you, Volar has also implemented a [Take Over Mode](https://github.com/johnsoncodehk/volar/discussions/471#discussioncomment-1361669) that is more performant. You can enable it by the following steps:

1. Disable the built-in TypeScript Extension
   1. Run `Extensions: Show Built-in Extensions` from VSCode's command palette
   2. Find `TypeScript and JavaScript Language Features`, right click and select `Disable (Workspace)`
2. Reload the VSCode window by running `Developer: Reload Window` from the command palette.
