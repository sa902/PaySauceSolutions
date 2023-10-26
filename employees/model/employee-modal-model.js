exports.model = {

    load: function(obj, reset) {
        HoneycombApplication.models['profile-form-model'].load(obj);
        HoneycombApplication.models['employment-form-model'].load(obj);
		this.context.step = 0;
		for (var i=0; i < this.context.view.model.views.length; i++) {
			this.context.view.model.views[i].disabled = false;	
		}		
        //this.km.execute('_align', [true]);
        this.setEmployee();
        this.km.registerModelKeys('employee-model');
    },

    getFields: function() {
        var data = {};
        for (var i=0; i < this.context.view.model.views.length; i++) {
            var view = this.context.view.model.views[i];
            if (view.controller == 'form-controller') {
                var form = view.model.split('-')[0];
                data[form] = HoneycombApplication.models[view.model].execute('getFields');
            }	
        }
        return data;    
    },

    setEmployee: function(employee) {
        this.employee = employee || null;
    },

    getEmployee: function() {
        return this.employee;
    },

    getStepViews: function() {
		return this.context.view.model.views;
	},

    employee: null,

    context: {
		modalclass: 'small',
		options: {
			centered: false,
			observeChanges: true,
			closable: false
        },
        hasprogress: true,
		progress: 0,
		step: 0,
		header: {
			template: 'modal-header',
            iconclass: 'ui tiny image',
            img: '/paysauce-employees/img/appicon-employees.svg',
			title: 'Add Employee'
		},
		view: {
			id: 'new-employee-flow-view',
            controller: 'flow-controller',
            model: {
                views: [{
                    id: 'profile-form-view',
                    viewclass: 'step transition visible',
                    controller: 'form-controller',
                    model: 'profile-form-model'
                }, {
                    id: 'employment-form-view',
                    viewclass: 'step transition hidden',
                    attributes: [{
						name: 'style',
						value: 'display:none'
					}],
                    controller: 'form-controller',
                    model: 'employment-form-model'
                }, {
                    id: 'employee-added-view',
                    viewclass: 'step transition hidden',
					attributes: [{
						name: 'style',
						value: 'display:none'
					}],
                    controller: 'template-controller',
                    model: 'employee-added-model'
                }]
            }
		},
		buttons: [{
			id: 'back',
			close: false,
			text: 'Back',
			buttonClass: 'ui button',
			hidden: true,
			events: [{
				bind: 'click',
				id: 'click-add-employee-previous'
			}]
		}, {
			id: 'confirm',
			text: 'Continue',
			close: false,
			disabled: true,
			buttonClass: 'ui green button',
			events: [{
				bind: 'click',
				id: 'click-add-employee-next'
			}]
		}]
	}

};

exports.controllers = ['modal-progress-controller']