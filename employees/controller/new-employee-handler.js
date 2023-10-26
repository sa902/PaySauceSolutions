exports.events = {

    "bind-profile-form-view-invite-employee": function(sender) {
        sender.view.$('#fg-invite-employee.ui.checkbox').checkbox();
        sender.view.$('#fg-invite-employee').on('click', function(){
            $('#extended-profile').transition('slide');
            HoneycombApplication.models['profile-form-model'].execute('toggleExtendedFields', []);
            sender.view.executeFunction('set-action-enable');
        });
    },

    "update-profile-form-view": function(sender) {        
        sender.view.executeFunction('set-action-enable');          
    },

    "update-employment-form-view": function(sender) {        
        sender.view.executeFunction('set-action-enable');          
    },

    "click-add-employee-next": function(sender) {
        var model = HoneycombApplication.models['employee-modal-model'];
        var step = model.get('context').step;
        var last = model.execute('getLastStep');
        var action = step == (last - 1) ? 'hideActions' : 'showActions';
        
        sender.view.executeFunction(action);

        if (action == 'hideActions') {
            var params = model.execute('getFields');
            sender.view.message('/employees/NewEmployee', {
                parameters: params,
                callbacks: {
                    success: function (result) {                	
                        sender.view.executeFunction('display-messages');
                        if (result.success) {
                            model.execute('setEmployee', [result.staff_id]);
                            model.execute('next');
                        }
                    }
                }
            });
                
        } else {
            model.execute('next'); 
        }
    },

    "click-add-employee-previous": function(sender) {
        HoneycombApplication.models['employee-modal-model'].execute('previous');
    },

    "click-view-employee": function(sender) {
        var staff_id = HoneycombApplication.models['employee-modal-model'].execute('getEmployee');
        sender.view.raiseEventById('goto-employee', {
            staff_id: staff_id
        });    
    },

    "click-add-another-employee": function(sender) {
        HoneycombApplication.clearModelKeys('employee-model');            
    }
};

exports.functions = {

	"set-action-enable": function(view, model, parameters) {
        var value = parameters && parameters.hasOwnProperty('value') ? parameters.value : HoneycombApplication.models['employee-modal-model'].execute('validate');
        HoneycombApplication.models['employee-modal-model'].execute('setActionEnabled', [value]);	
    }
};