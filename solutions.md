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


### SQL Question Test
This SQL query appears to be selecting data from one or more tables to retrieve distinct combinations of 'period_id' and 'employee_id' that meet certain conditions. Let's break it down step by step:

1. The inner query:
   - This part of the query is enclosed in parentheses and acts as a subquery.
   - It selects distinct combinations of 'period_id' and 'employee_id' from two tables, 'period' (aliased as 'p') and 'txn' (aliased as 't').
   - It only selects rows where the 'state' column in the 'period' table is equal to 1.
   - It adds a computed column 'type' with a constant value of 'PT_AC_ACC_LEAVE' for each row selected from 'txn'.

2. The subquery alias 'op':
   - The results of the inner query are aliased as 'op'.

3. The main query:
   - It selects distinct combinations of 'period_id' and 'employee_id' from the 'op' subquery.
   - It performs a left join with the 'txn' table (aliased as 't') based on three conditions:
     - 'op.period_id' is equal to 't.period_id'.
     - 'op.employee_id' is equal to 't.employee_id'.
     - 'op.type' is equal to 't.type'.
   - The purpose of this left join is to find matching rows in the 'txn' table that have the same 'period_id', 'employee_id', and 'type'. The 'left join' means that all rows from 'op' are retained, and matching rows from 'txn' are included.

4. The WHERE clause:
   - It filters the results to include only rows where 't.type' is null.
   - This condition effectively filters out the rows where a match was found in the 'txn' table (where 't.type' is not null), leaving only those combinations of 'period_id' and 'employee_id' from 'op' that don't have corresponding entries in 'txn' with a non-null 'type'.

In summary, the query retrieves distinct combinations of 'period_id' and 'employee_id' from the 'op' subquery, but only those combinations that don't have corresponding entries in the 'txn' table with a non-null 'type'. This could be used, for example, to find 'period_id' and 'employee_id' pairs that are missing certain types of entries in the 'txn' table.

``` sql
-- Create the 'period' table
CREATE TABLE period (
    id INT PRIMARY KEY,
    state INT
);

-- Create the 'txn' table
CREATE TABLE txn (
    period_id INT,
    employee_id INT,
    type VARCHAR(50)
);

-- Insert sample data into the 'period' table
INSERT INTO period (id, state) VALUES
    (1, 1),
    (2, 0),
    (3, 1),
    (4, 1);

-- Insert sample data into the 'txn' table
INSERT INTO txn (period_id, employee_id, type) VALUES
    (1, 101, 'PT_AC_ACC_LEAVE'),
    (2, 102, 'PT_AC_ACC_LEAVE'),
    (3, 101, 'PT_AC_ACC_LEAVE'),
    (4, 103, 'PT_OTHER_TYPE');

INSERT INTO period (id, state) VALUES
    (5, 0),
    (6, 1),
    (7, 1),
    (8, 0);

-- Insert additional sample data into the 'txn' table
INSERT INTO txn (period_id, employee_id, type) VALUES
    (5, 102, 'PT_OTHER_TYPE'),
    (6, 103, 'PT_AC_ACC_LEAVE'),
    (7, 104, 'PT_OTHER_TYPE'),
    (8, 105, 'PT_AC_ACC_LEAVE');
-- The provided query
SELECT DISTINCT op.period_id, op.employee_id
FROM (
    SELECT DISTINCT t.period_id, t.employee_id, 'PT_AC_ACC_LEAVE' AS type
    FROM period p
    JOIN txn t ON p.id = t.period_id
    WHERE p.state = 1
) op
LEFT JOIN txn t ON op.period_id = t.period_id AND op.employee_id = t.employee_id AND op.type = t.type
WHERE t.type IS NULL;

```