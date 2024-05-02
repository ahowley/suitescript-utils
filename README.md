# SuiteScript Utils

This project is intended for reuse by other account customization projects.

## Use in Account Customization project

- Add this repo to node_modules

  ```bash
  npm i git@ssh.dev.azure.com:v3/NGRP/NetSuite%20Sandbox/suitescript-utils
  ```

- Add path to tsconfig.json

  ```json
  {
    "compilerOptions": {
      ...
      "paths": {
        ...
        "SuiteScripts/utils": [
          "node_modules/suitescript-utils/src/TypeScripts"
        ],
        "SuiteScripts/utils/*": [
          "node_modules/suitescript-utils/src/TypeScripts/*"
        ]
      }
    }
  }
  ```

- Import module members
  ```typescript
  import { InternalId } from "SuiteScripts/utils/common";
  ```

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
