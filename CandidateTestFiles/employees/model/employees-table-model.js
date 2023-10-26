exports.model = {

	load: function(obj) {
		this.context.data = obj.employees;
		this.context.pagination = obj.pagination || {};
		HoneycombApplication.models['employees-pagination-model'].load(obj.pagination);
		if (obj.columns) {
			this.km.execute('setColumnProperties', [obj.columns]);		
		}		
	},

	setShowTerminated: function(value) {
		this.context.showTerminated = value ? 1 : 0;
	},

	template: 'table',
	context: {
		nocontainer: true,
		onHeaderClick: 'click-sort-employees|th:not(.no-sort)',
		onRowClick: 'click-edit-employee|td:not(:last-child)',
		pagination: {
		},
		columns: [/*{
            name: '',
            id: 'photo',
            sortable: false,
            display: {                
                view: {
                    template: 'cell-data'
                }
            }
        },*/ {
            name: 'Name',
            id: 'employee_name',
            display: {
                view: {
                    template: 'cell-data'
                }
            }
        }, {
            name: 'Job Title',
            id: 'job_title',
            display: {
                view: {
                    template: 'cell-data'
                }
            }
        }, {
			name: 'Status',
			id: 'employment_status',
			display: {				
				view: {
					template: 'cell-label'
				}
			}
		}, {
			name: 'Phone',
			id: 'phone',
			display: {
				view: {
					template: 'cell-data'
				}
			}
		}, {
			name: 'Email',
			id: 'email',
			display: {
				view: {
					template: 'cell-data'
				}
			}
		}, {
			name: 'Linked',
			id: 'linked',
			display: {				
				view: {
					template: 'cell-label'
				}
			}
		}, {
			name: 'Actions',
			sortable: false,
			id: 'actions',
			display: {
				headerclass: 'no-sort right aligned',
				dataclass: 'right aligned actions',
				view: 'table-cells:cell-value-actions',
				context: {
					items: [{
						id: 'add-note',
						events: [{
							bind: 'click',
							id: 'click-add-note'
						}]
					}, {
						id: 'send-message',
						events: [{
							bind: 'click',
							id: 'click-send-message'
						}]
					}, {
						id: 'send-link-invite',						
						events: [{
							bind: 'click',
							id: 'click-send-link-invite'
						}]
					}]
				}
			}
		}]
	}
};

exports.controllers = ['table-columns-controller', 'table-pagination-controller'];