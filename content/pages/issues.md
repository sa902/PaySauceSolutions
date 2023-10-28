Title: Issues
Slug: issues
Authors: Sam Anderson
Order: 5
Summary: Issues with the current implementation

**Issues I have found during this challenge** <br>
*potentially outdated version of tidev?*
Titanium Lost official support and became community driven. This can have pro's and con's
a major con being that updates can be slow due to being community driven and non-profit funded
#### immediate issues
1. Uses outdated class style - should upgrade to ES6 class style
1. Use of Var, in  modern js we want to use ```const``` and ```let```
1. since version 10, titanium supports async functions so upgrade as required. 
1. Nothing is going to show on iphone? 
    - in relation to the `employee.js` file, which is the initialization file. 
1. we can remove async library in favor of propmises or async/await. (added in es2015 and es2017)
1. Some functions use functions and the type is assumed, no type checking or error catching for invalid types.
1. remove commented code. 
1. Use absolute paths
    - change ```var moment = require('../../../../core/moment');``` to an absolute path. (inside `EnsurePeriodFiling`)
1. use the optional chaining operator to prevent any errors being thrown (`key.?value`)
1. Nullish Coalasing to provide defaults results when something is null or undefined
