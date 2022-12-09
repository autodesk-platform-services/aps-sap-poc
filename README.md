# APS/SAP Prototype

![platforms](https://img.shields.io/badge/platform-windows%20%7C%20osx%20%7C%20linux-lightgray.svg)
[![node.js](https://img.shields.io/badge/node.js-16.17-blue.svg)](https://nodejs.org)
[![npm](https://img.shields.io/badge/npm-8.15-blue.svg)](https://www.npmjs.com/)
[![license](https://img.shields.io/:license-mit-green.svg)](https://opensource.org/licenses/MIT)

[![Model Derivative](https://img.shields.io/badge/Model%20Derivative-v2-green.svg)](https://aps.autodesk.com/en/docs/model-derivative/v2/overview/)
[![Viewer](https://img.shields.io/badge/Viewer-v7-green.svg)](https://aps.autodesk.com/en/docs/viewer/v7/developers_guide/overview/)

Prototype application integrating [Autodesk Platform Services](https://aps.autodesk.com) and SAP Data Warehouse Cloud.

![thumbnail](./thumbnail.png)

## Can I run it locally?

Currently the setup of the application is a bit tricky as it involves things like:

- Obtaining APS application credentials
- Preparing a 3D design with specific metadata
- Creating several tables and views in the SAP Data Warehouse Cloud
- Populating the tables/views with sample data corresponding to the 3D design

Because of that, the sample app is currently _not_ intended to be runnable by others.

## Troubleshooting

Submit your question via [APS Support Form](https://aps.autodesk.com/en/support/get-help).

## License

This sample is licensed under the terms of the [MIT License](http://opensource.org/licenses/MIT).
Please see the [LICENSE](LICENSE) file for more details.

## Authors

Petr Broz ([@ipetrbroz](https://twitter.com/ipetrbroz)), Developer Advocate