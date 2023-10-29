Title: Overview
Slug: 1overview
order:1
Authors: Sam Anderson
Category: test
Summary: Short version for index and feeds

### About the code
The code is for a Titanium JS Alloy app. 
Alloy is an MVC application framework by TiDev for the Titanium SDK. (https://github.com/tidev/alloy)
<br>
Overall architecture is **MVC** 

The code provides a way to show and manage employee information, payroll settings, and related rules. It handles data retrieval, user interactions, and data saving.

There are two views for viewing information about employees, pagination view and table view. These are described in the `employees-views-model` file.

#### Page.json
page.json provides the overall structure and configuration for the employee modules defined in a json object.

While it is incomplete, the template object provides overall structure and defines things found in html such as title, favicon etc. The empty `body` section implies that this configuration file has no associated html body structure and the HTML content is stored in a differant file or dynamically generated. 

`defaultPage` specifies URL mappings to pages. In this case, the wildcard maps everything to `employee-page`
`pages` defines all pages in the web app, we have one, with associated models,views and controllers.
`modules` tells us any specific modules used on the page, we can see some inohuse modules and UI libraries.
Similiarly, `handlers` tells us any handlers to handle tasks on the page.

The `js` and `css` arrays are empty but would contain any files relevant to the module.
`sockets` shows that web sockets are not used  here.

#### exmployee.js
This is a controller for an Alloy.js
The bulk of the code takes place inside the `initilize` function, which is called in a setTimeout function, presumabely to ensure any other components are initlized in the app. 
This has some drawbacks and other patterns could be used. For instance, events or lifecycle hooks. It's always possible the the hardcoded amount of time isn't enough time to load everything required...

There are some platform specific functions, but it looks as if the iphone layout will not load correctly as the bulk of it is commented out..



