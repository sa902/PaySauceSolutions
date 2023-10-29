Title: Pagination
Slug: pagination
Authors: Sam Anderson
Order:7
Summary: Pagination

Pagination allows us to split results into smaller lists to easier display on a screen and control the amount recieved from an endpoint. It allows easier control in the front end.

### FE vs BE 
There are two ways to handle pagination logic, on the front end and on the back end. 
<br>

#### FE pagination
Making a request to the server and paginating the recieved response. This can have benefits such as making only one call to the backend and desinging a simpler back end. 
all the data is present in the front end so searching, filtreing, reducing are possible on the whole data set without calling the backend multiple times. 

However, there could be potentially thounsands of results and sorting, handling paginations or filtering could be costly operations to handle in browser. 
In general, this is not the most effective method.

#### BE pagination
Handling pagination on the backend and taking parameters that specify pagination criteria.
For instance, passing a `pagination` object with current page, amount per page and any other relavant information. This is generally considered the best practice approach.

Once example library is `knex-paginate` Which requires information of the following form
``` javascript
paginate: {
    currentPage: 1,
    perPage:6
}
```
All the business logic is handled on the back end and the front end recieves 6 responses as well as information pertaining to currentPage, total, amount of pages, last page etc.

#### Pagination in this code.
Pagination in this code is handled on the backend. 
In the `GetEmployee.js` backend class if the request parameters contains no information about pagination it will set to a default. 
``` javascript
        pagination: !_.isEmpty(this.parameters.pagination) ? this.parameters.pagination : {
            limit: 10,
            sort: 'record_id',
            pk: 'record_id',
            direction: 'asc'    
        },
```
The front end has two views, one in a table, which is paginated, otherwise it could be thousands of rows long. And another view that, from my understanding, is an individual employee view with buttons to move move +/- 1 through the list.

The pagination requirements are passed through to the relevant models and controllers and ultimately used in the BE request. 