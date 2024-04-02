# Account Customization Project Template

This repository serves as a template for an Account Customization project, and
can be used as a foundation for new projects.

## SuiteScript 2.1

To take full advantage of TypeScript and modern ECMAScript language features, it
should be standard to use SuiteScript 2.1. package.json is configured for
SuiteScript 2.1 and ESNext features.

## TypeScript

[TypeScript](https://www.typescriptlang.org/) enables all the benefits of static
type-checking in a modern, module-based JavaScript environment. tsconfig.json is
configured in this project to compile into the example-directory folder.

## Unit Testing with Jest

[Jest](https://jestjs.io/) is a JavaScript testing framework supported by
NetSuite directly for SuiteScript unit testing. A basic example is included here
in the \_\_tests\_\_ directory for how mocking data and functions works in Jest.
While Jest supports TypeScript, using it with NetSuite's package for unit
testing can prove to be a bit of a headache, so vanilla JS is used here for
simplicity & ease of development. That said, unit testing can have limited
utility with SuiteScript due to how heavily mocked all behavior winds up being,
and the way errors are thrown in SuiteScript.

## Tools

- [Visual Studio Code](https://code.visualstudio.com/)
- [Node.js](https://nodejs.org/en/download/package-manager)
- [SuiteCloud CLI](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/chapter_1558708800.html#SuiteCloud-CLI-for-Node.js-Guide)

## Setup

List the steps required for another developer to initialize a clone of this
repository.

- Install Dependencies

  ```bash
  npm i
  ```

- Install Recommended VS Code Extensions

  - Recommended extensions for code formatting are in .vscode/extensions.json.

- Setup SuiteCloud Development Framework

  - Install SuiteCloud CLI

    ```bash
    npm i @oracle/suitecloud-cli
    ```

    OR (to install globally)

    ```bash
    npm i -g @oracle/suitecloud-cli
    ```

  - Create access token (requires role with associated Access Token permissions)
    - Home > Settings Portlet > Manage Access Tokens > New My Access Token
    - Application Name: SuiteCloud Development Integration
    - Token Name: Any
  - Setup Account in CLI
    ```bash
    suitecloud account:setup -i
    ```

## Build & Deploy

- Test
  ```bash
  npm run test
  ```
- Compile
  ```bash
  npm run build
  ```
- Validate Project (with SuiteCloud CLI)
  ```bash
  npm run validate
  ```
- Deploy (with SuiteCloud CLI)
  ```bash
  npm run deploy
  ```
