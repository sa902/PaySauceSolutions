Title: Employee Action button
Slug: employee-action-button
Authors: Sam Anderson
Order: 4
Summary: where to add employee action buttons

Lets talk about adding a new method of interaction with the employee list, specifically, filtering for recently hired employees. 

To do this we have to edit 3 things, the model, view and controller.

## updating the view
We can update the view in one of two ways
### Adding a column
```html 

<div class="twelve wide column">

    <div class="ui three column stackable grid">
        <div class="column">
            <div class="ui search">
                <div class="ui icon input">
                    <input id="employee-search" handler-events="input|debounce:employees-search" class="prompt" type="text" placeholder="Search Employees..." value="{search}">
                    <i class="search icon"></i>
                </div>
                <div class="results"></div>
            </div>
        </div>
        <div class="column">
            <div id="toggle-terminated" class="ui toggle checkbox margin top five">
                <input type="checkbox" name="termintaed" handler-events="input:update-terminated">
                <label>Show terminated employees</label>
            </div>
        </div>
          <div class="column">
            <div id="toggle-newHires" class="ui toggle checkbox margin top five">
                <input type="checkbox" name="newHire" handler-events="input:update-newHires">
                <label>Show New Hires</label>
            </div>
        </div>


    </div>
</div>

<div class="right aligned four wide column">
    {> column-selector /}    
</div>
``` 

### Adding a row
``` html 

<div class="twelve wide column">

    <div class="ui two column stackable grid">
        <div class="column">
            <div class="ui search">
                <div class="ui icon input">
                    <input id="employee-search" handler-events="input|debounce:employees-search" class="prompt" type="text" placeholder="Search Employees..." value="{search}">
                    <i class="search icon"></i>
                </div>
                <div class="results"></div>
            </div>
        </div>
        <div class="column">
            <div class="row">
               <div id="toggle-terminated" class="ui toggle checkbox margin top five">
                    <input type="checkbox" name="termintaed" handler-events="input:update-terminated">
                    <label>Show terminated employees</label>
                </div>
                 <div id="toggle-newHires" class="ui toggle checkbox margin top five">
                    <input type="checkbox" name="newHire" handler-events="input:update-newHires">
                    <label>Show New Hires</label>
                </div>
            </div> 
        </div>


    </div>
</div>

<div class="right aligned four wide column">
    {> column-selector /}    
</div>
```
## Updating the controller
We need to add a new controller function. This will be similiar to the toggle terminated function
``` javascript
"update-newHires": (sender) => {
    HoneycombApplication.models['employees-table-model'].execute('setShowNewHires', [sender.control.prop('checked')]);
    sender.view.executeFunction('fetch-and-populate-employees');
}
```
The functionality is pretty much the same as the set terminated function

## Updating the model
Finally, we have to update the model.
``` javascript 
setShowNewHires: (value) => this.context.setShowNewHires = value ? 1 : 0
``` 

## Final words
Notice how we have used javascripts new arrow functions to improve readability.


