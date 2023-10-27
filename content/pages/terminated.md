Title: Terminated Employees 
Slug: terminated-employees
Authors: Sam Anderson
Summary: How the code shows terminated emplooyees


terminated employees are shown in a table
They arecontrolled via checkbox located in `list-actions.html` file
On toggle, it calls the `input:update-terminated` function located in the `page-handler` 



### Page Handler
```javascript
	"update-terminated": function(sender) {
		HoneycombApplication.models['employees-table-model'].execute('setShowTerminated', [sender.control.prop('checked')]);
		sender.view.executeFunction('fetch-and-populate-employees');
	},
```
In this function `update-terminated` acts as a key which calls the anonmyous function associated with it.
`sender` is the object that triggered the event and we extract the status of the checked box from it.

<br> 
This function updates the `showTerminated` context in the associated model `employee-table-model` based on the value of the checked property extracted from `sender`.

It then calls `fetch-and-populate-employees` function to update the table view with newly fetched data.

### fetch-and-populate-employees

Once all of this has happened, this function makes a call to the backend using any filters set on the `employee-table-model` and on success populates it into the table and refreshes the table.

### employees-table-model
There are some potential side effects to this code. We might want to use some type checking to ensure that the value of `value` takes on the value. side effects could occur if it's undefined or really anyother type. 
``` javascript
	setShowTerminated: function(value) {
		this.context.showTerminated = value ? 1 : 0;
	},
```

