exports.events = {

	"click-prev-employee": function(sender) {
		HoneycombApplication.models['employees-table-model'].execute('setAction', [-1]);
		sender.view.executeFunction('fetch-and-populate-employees');
	},

	"click-next-employee": function(sender) {
		HoneycombApplication.models['employees-table-model'].execute('setAction', [1]);
		sender.view.executeFunction('fetch-and-populate-employees');
	},

	"employees-search": function(sender) {
		HoneycombApplication.models['list-actions-model'].execute('setSearch', [sender.control.val()]);
		sender.view.executeFunction('fetch-and-populate-employees');		
	},

	"update-terminated": function(sender) {
		HoneycombApplication.models['employees-table-model'].execute('setShowTerminated', [sender.control.prop('checked')]);
		sender.view.executeFunction('fetch-and-populate-employees');
	},

	"click-sort-employees": function(sender) {
		HoneycombApplication.models['employees-table-model'].execute('toggleSort', [sender.data.value]);
		sender.view.executeFunction('fetch-and-populate-employees');
	},

	"click-edit-employee": function(sender) {
		var obj = HoneycombApplication.models['employees-table-model'].get('context').data[sender.data.value];

		sender.view.raiseEventById('redirect-location', {
			location: '/employee/' + obj.id
		});
	},

	"click-send-link-invite": function(sender) {

	},

	"click-send-message": function(sender) {

	},

	"click-add-note": function(sender) {

	},

	"click-new-employee": function(sender) {
		sender.view.executeFunction('fetch-new-employee-data-and-show');	
	},
	
	"click-employee-column-selector": function(sender) {
		var setting = HoneycombApplication.models['employees-table-model'].execute('toggleColumn', [sender.data.value]);	
		HoneycombApplication.models['list-actions-model'].load(setting);
		sender.view.executeFunction('set-app-setting', {
			app_id: 'employees',
			name: 'employees.tableColumns',
			setting: setting
		});
		setTimeout(function() {
			HoneycombView.refresh('list-actions');
		}, 500);
	},

};

exports.functions = {

	"fetch-and-populate-employees": function(view, model, parameters) {		
		view.message('/employees/GetEmployees', {
			parameters: $.extend({
				filter: $('#employee-search').val(),
			}, HoneycombApplication.models['employees-table-model'].execute('getPagination')),
            callbacks: {
                success: function (result) {                	
                	HoneycombApplication.models['employees-table-model'].load(result);                	
                	HoneycombView.refreshViews(['employees-table-view', 'employees-pagination-view']);
                }
            }
		});
	},
	
	"fetch-new-employee-data-and-show": function(view, model, parameters) {
		view.message('/employees/GetNewEmployeeData', {
			parameters: {},
            callbacks: {
                success: function (result) {                	
                	HoneycombApplication.models['employee-modal-model'].load(result);                	
                	HoneycombView.getView('modal-new-employee').executeFunction('show');
                }
            }
		});
		
	}


};


exports.globalEvents = {
    
    "new-employee-added": function(sender) {
		sender.view.executeFunction('fetch-and-populate-employees');
	},
	
	"goto-employee": function(sender) {
        sender.view.raiseEventById('redirect-location', {
            location: '/employee/' + sender.data.staff_id
        });
    }

};