Title: SQL Question
Slug: sql-question
Authors: Sam Anderson
Order:2
Summary: Discussion on the sql question

### ReWrite
1. The inner query, aliased op
The first thing is to select two columns from (`t.period_id` `t.employee_id`) from `period` table with distinct values and create a new column with a constant value. `Distinct` removes any duplication. 
This has 3 columns, `period_id`	`employee_id` and `type`. The values in this table are all unique rows whose state is 1  in the period table and displays the employee id aswell as period id from txn table.
Here is some example code and output
``` sql

CREATE TABLE period (
    id INT PRIMARY KEY,
    state INT
);


CREATE TABLE txn (
    txn_id INT PRIMARY KEY,
    period_id INT,
    employee_id varchar(128)
);


INSERT INTO period (id, state) VALUES
(1, 1),
(2, 1),
(3, 2),
(4, 4);


INSERT INTO txn (txn_id, period_id, employee_id) VALUES
(101, 1, "Sam"),
(102, 1, "Josh"),
(103, 2, "Sam"),
(104, 3, "Greg"),
(105, 1, "Alex"),
(106, 4, "Josh");



  SELECT DISTINCT t.period_id, t.employee_id, 'PT_AC_ACC_LEAVE' AS type
    FROM period p
    JOIN txn t ON p.id = t.period_id
    WHERE p.state = 1
``` 

|  Period_id | employee_id  | type  |
|--:|---|---|
|1   |sam   |PT_AC_ACC_LEAVE  |
| 1  | josh   | PT_AC_ACC_LEAVE   |
| 2  |  sam | PT_AC_ACC_LEAVE  |
|  1 | alex  |  PT_AC_ACC_LEAVE |

You can see that it has excluded anyone whose state is greater than 1, namely greg and and a josh. 
We then select any distinct `period_id`, `op.employee_id` from our inner query

## Left Join
First, we need to modify our previous tables to include a type. 

``` sql
CREATE TABLE txn (
    txn_id INT PRIMARY KEY,
    period_id INT,
    employee_id varchar(128),
    type varchar(128)
);

INSERT INTO txn (txn_id, period_id, employee_id, type) VALUES
(101, 1, 'Sam', 'PT_AC_ACC_LEAVE'),
(102, 1, 'Josh', 'PT_AC_ACC_LEAVE'),
(103, 2, 'Sam', 'OtherType'),
(104, 3, 'Greg', 'PT_AC_ACC_LEAVE'),
(105, 1, 'Alex', 'literallyAnyOtherType'),
(106, 4, 'Josh', 'PT_AC_ACC_LEAVE'),
(107, 5, 'Sophie', 'PT_AC_ACC_LEAVE'),
(108, 1, 'Emma', NULL),
(109, 6, 'Liam', 'NULL');

``` 

The left join joins rows where the `period_id,` `employee_id,` and `type` match between the `op` subquery and the `txn` table.
The left join ensures all items from `op` are added and only matching rows from `txn` are added.
The outerquery retrieves rows from the 'op' subquery that do not have a corresponding record in the 'txn' table based on the 'period_id,' 'employee_id,' and 'type' criteria. It selects those rows where 't.type' is NULL, which indicates the absence of matching records in the 'txn' table.



Running our final completed query gives us these results!
| period_id | employee_id|
|--:|---|
|2| sam| 
|1|alex| 
|1|emma|

#### A simpler solution? 



