![Sample-Code](https://gitlab.com/softbutterfly/open-source/open-source-office/-/raw/master/assets/dynova/dynova-open-source--banner--sample-code.png)

[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-v2.0%20adopted-ff69b4.svg)](code_of_conduct.md)
[![License](https://img.shields.io/badge/License-BSD_3--Clause-blue.svg)](LICENSE.txt)

# Sample System: Azure Function

This repository contains many sample Azure Functions that demonstrate how to
implement the New Relic agent in an Azure Function.

By default New Relic does not support Azure Functions, but it is possible to
use the New Relic agent in an Azure Function by using the New Relic agent API. This repository contains examples of how to use the New Relic agent API for functions written in Java, JavaScript and TypeScript.

## Requirements

In order to run the samples in this repository, you will need the following
tools:

* sdkman [↗][href:sdkman]
* nvm [↗][href:nvm]
* Azure Functions Core Tools [↗][href:azfct]
* Azure CLI [↗][href:azcli]
* New Relic account [↗][href:newrelic]
* Visual Studio Code (VSCode) with the Azure Functions extension

## Directory Structure

The principal components of this repository are organized as follows:

```
.
├── scripts
├── sample-java
├── sample-javascript
└── sample-typescript
```

* `scripts`: Contains scripts to automate the deployment of the Azure Functions.
* `sample-java`: Contains a sample Azure Function written in Java.
* `sample-javascript`: Contains a sample Azure Function written in JavaScript.
* `sample-typescript`: Contains a sample Azure Function written in TypeScript.

For detailed information about each sample, see the `README.md` file in each
folder.

## Usage

To use the samples in this repository, follow these steps:

1. Clone this repository to your local machine.

2. Open a terminal and navigate to the root of the repository.

3. Select a sample, navigate to its directory, follow the instructions in the
   `README.md` and meet the requirements.

4. Run the sample locally to ensure that it works as expected.

5. Deploy the sample to azure using the scripts provided in the `scripts`
   directory. This scripts can be run using the following command:

   ```bash
   ./scripts/create_resourcegroup.sh \
       $resource_group_name \
       $location

   ./scripts/create_functionapp.sh \
       $project_name \
       $function_app_runtime \
       $function_app_runtime_version \
       $resource_group_name \
       $location

   ./scripts/configure_functionapp.sh \
       $project_name \
       $function_app_runtime \
       $resource_group_name \
       $new_relic_license_key

   ./scripts/publish_functionapp.sh \
       $project_name \
       $function_app_runtime \
       $resource_group_name

   ./scripts/invoke_function.sh \
       $project_name \
       $function_name \
       $resource_group_name \
       $execution_times \
       $execution_interval
   ```

6. Monitor the Azure Function in the New Relic dashboard.

7. Clean up the resources using the following command:

   ```bash
   az group delete --name $resource_group_name --yes
   ```

## Contributing

Sugestions and contributions are welcome!

> Please note that this project is released with a Contributor Code of Conduct. By participating in this project you agree to abide by its terms.

For more information, please refer to the [Code of Conduct][href:code_of_conduct].

## License

This project is licensed under the terms of the BSD-3-Clause
[↗][href:license] license.

[href:sdkman]: https://sdkman.io/
[href:nvm]: https://github.com/nvm-sh/nvm
[href:azfct]: https://github.com/Azure/azure-functions-core-tools
[href:azcli]: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli
[href:newrelic]: https://newrelic.com/signup
[href:license]: LICENSE.txt
[href:code_of_conduct]: CODE_OF_CONDUCT.md
