---
stoplight-id: sz5hf6lkwwyg5
---

# Why a monorepo?

The goal of this monorepo is to achieve maximum interoperability and minimum duplication of effort between the various projects in the digital health ecosystem.

**A monorepo is not a monolith**.

In fact, a well-designed monorepo helps to avoid the creation of monolithic applications by providing maximum visibility and reusability between:

* UI components
* Analytical tools and models
* API documentation/libraries
* Data transformation pipelines

This allows us to easily share code and data between projects.

**But won't this be a massive dependency to use in other projects?**

Hell, no. Libraries and components can automatically be published to NPM and consumed by other projects. So if you only need one library, you don't need to install the entire monorepo. And if you need to make a change to a library, you can do so in the monorepo and publish the new version to NPM.

### More Info on Monorepos

* [Monorepo in Git](https://www.atlassian.com/git/tutorials/monorepos)
* [Monorepo != monolith](https://blog.nrwl.io/misconceptions-about-monorepos-monorepo-monolith-df1250d4b03c)
* [Nrwl Nx Resources](https://nx.dev/latest/angular/getting-started/resources)

Here's the base structure of our monorepo:

```
- apps/
    - {{appName}}  <-- A complete user-facing application
    - {{appName}}-e2e  <-- Cypress end-to-end tests for the application
- libs/
    - {{apiName}}-api-spec <-- OpenAPI >3.0.1 specifications designed with Stoplight Studio
    - {{apiName}}-sdk-{{language}}  <-- Language-specific libraries for using APIs will live
- tools/
    - {{toolName}}  <-- A tool that is not a user-facing application but is used by developers
```

## [How to add a new API](add-an-api.md)

## NX Monorepo Helpers

This project use [Nx](https://nx.dev) to manage the inter-related dependencies.

🔎 **Smart, Fast and Extensible Build System**

### Adding capabilities to your workspace

Nx supports many plugins which add capabilities for developing different types of applications and different tools.

These capabilities include generating applications, libraries, etc as well as the devtools to test, and build projects as well.

Below are our core plugins:

* [React](https://reactjs.org)
  * `npm install --save-dev @nrwl/react`
* Web (no framework frontends)
  * `npm install --save-dev @nrwl/web`
* [Angular](https://angular.io)
  * `npm install --save-dev @nrwl/angular`
* [Nest](https://nestjs.com)
  * `npm install --save-dev @nrwl/nest`
* [Express](https://expressjs.com)
  * `npm install --save-dev @nrwl/express`
* [Node](https://nodejs.org)
  * `npm install --save-dev @nrwl/node`

There are also many [community plugins](https://nx.dev/community) you could add.

### Generate an application

Run `nx g @nrwl/react:app my-app` to generate an application.

> You can use any of the plugins above to generate applications as well.

When using Nx, you can create multiple applications and libraries in the same workspace.

### Generate a library

Run `nx g @nrwl/react:lib my-lib` to generate a library.

> You can also use any of the plugins above to generate libraries as well.

Libraries are shareable across libraries and applications. They can be imported from `@curedao/mylib`.

### Development server

Run `nx serve my-app` for a dev server. Navigate to http://localhost:4200/. The app will automatically reload if you change any of the source files.

### Code scaffolding

Run `nx g @nrwl/react:component my-component --project=my-app` to generate a new component.

### Build

Run `nx build my-app` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

### Running unit tests

Run `nx test my-app` to execute the unit tests via [Jest](https://jestjs.io).

Run `nx affected:test` to execute the unit tests affected by a change.

### Running end-to-end tests

Run `nx e2e my-app` to execute the end-to-end tests via [Cypress](https://www.cypress.io).

Run `nx affected:e2e` to execute the end-to-end tests affected by a change.

### Understand your workspace

Run `nx graph` to see a diagram of the dependencies of your projects.

### Further help

Visit the [Nx Documentation](https://nx.dev) to learn more.

## ☁ Nx Cloud

### Distributed Computation Caching & Distributed Task Execution

[Nx Cloud](https://nx.app/) pairs with Nx in order to enable you to build and test code more rapidly.
