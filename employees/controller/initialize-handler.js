exports.events = {

	"preinitialize": function(sender) {
		HoneycombApplication.models['breadcrumb-model'].load({
			state: {},
			crumbs: [{
				name: 'Dashboard',
				href: '/dashboard'	
			}, {
				name: 'Employees',
				onClick: 'click-employees'
			}]
		});

		sender.view.message('/employees/GetEmployees', {	
			parameters: {
				includeSettings: true
			},
            callbacks: {
                success: function (result) {
                	HoneycombApplication.models['list-actions-model'].load(result.columns);
                	HoneycombApplication.models['employees-table-model'].load(result);
                	sender.data.callback();
                }
            }
		});
	},

	"bind-sidebar-toggle": function(sender) {
		sender.view.$('a').on('click', function(){
		    $('#hidden-sidebar').sidebar('toggle');
		});
	},

	"bind-list-actions": function(sender) {
		sender.view.$('.ui.dropdown').dropdown();
	},

	"bind-employees-table-view": function(sender) {
		sender.view.$('.ui.dropdown').dropdown();
	},

	"bind-employees-pagination-view": function(sender) {
		sender.view.$('.ui.dropdown').dropdown({
            onChange: function(value, text, $selectedItem) {
            	HoneycombApplication.models['employees-table-model'].execute('setLimit', [value]);
            	HoneycombApplication.models['employees-table-model'].execute('setAction', [null]);
            	sender.view.executeFunction('fetch-and-populate-employees');
            	sender.view.executeFunction('set-app-setting', {
					app_id: 'employees',
					name: 'employees.tableRows',
					setting: value
				});    
            }
        });
	}	

};