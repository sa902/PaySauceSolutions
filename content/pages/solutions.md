Title: Employees
Slug: docs
Authors: Sam Anderson
Summary: Short version for index and feeds
# {title}

## Main challenge
### About the code
The code is for a Titanium JS Alloy app. 
Alloy is an MVC application framework by TiDev for the Titanium SDK. (https://github.com/tidev/alloy)
Overall architecture is **MVC** 

The code provides a way to show and manage employee information, payroll settings, and related rules. It handles data retrieval, user interactions, and data saving.

#### Page.json
page.json provides the overall structure and configuration for the employee modules defined in a json object.

While it is incomplete, the template object provides overall structure and defines things found in html such as title, favicon etc. The empty `body` section implies that this configuration file has no associated html body structure and the HTML content is stored in a differant file or dynamically generated. 

`defaultPage` specifies URL mappings to pages. In this case, the wildcard maps everything to `employee-page`
`pages` defines all pages in the web app, we have one, with associated models,views and controllers.
`modules` tells us any specific modules used on the page, we can see some inohuse modules and UI libraries.
Similiarly, `handlers` tells us any handlers to handle tasks on the page.

The `js` and `css` arrays are empty but would contain any files relevant to the module.
`sockets` shows that web sockets are not used  here.

### Issues
potentially outdated version of tidev? 
Lost official support and became community driven. This can have pro's and con's
a major con being that updates can be slow due to being community driven and non-profit funded
#### immediate issues
1. Uses outdated class style - should upgrade to ES6 class style
1. Use of Var, in  modern js we want to use ```const``` and ```let```
1. since version 10, titanium supports async functions so upgrade as required  
1. upadate underscore to lodash?? 
1. Nothing is going to show on iphone?
1. we can remove async library in favor of propmises or async/await. (added in es2015 and es2017)

