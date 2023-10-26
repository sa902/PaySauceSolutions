exports.model = {
	views: [{
		id: 'modal-new-employee',
		controller: 'modal-controller',
		model: 'employee-modal-model',
		handlers: ['new-employee-handler']
	}, {
		id: 'employees',
		viewclass: 'ui stackable divided grid',
		controller: 'flow-controller',
		model: {
			views: [{
				id: 'breadcrumb',
				controller: 'template-controller',
				viewclass: 'sixteen wide column',
				model: 'breadcrumb-model'
			}, {
				id: 'main',
				controller: 'flow-controller',
				viewclass: 'sixteen wide tablet twelve wide computer column',
				model: {
					views: [{
						id: 'sidebar-toggle',
						controller: 'template-controller',
						model: {
							template: '<a href="#" class=""><i class="large black text ellipsis vertical icon"></i></a>'
						}
					}, {
						id: 'title',
						viewclass: 'ui two column stackable grid',
						controller: 'template-controller',
						model: {
							template: 'title-img',
							context: {
								name: 'Employees',
								headerclass: 'ui big image',
								img: '/paysauce-employees/img/appicon-employees.svg',
								actions: [{
									id: 'new-employee-button',
									onClick: 'click-new-employee',
									text: 'Add New Employee',
									buttonclass: 'basic red',
									icon: 'plus'
								}]
							}
						}
					}, {
						id: 'content',
						controller: 'flow-controller',
						model: {
							containerclasses: ['ui stackable grid', 'sixteen wide stretched column'],
							views: [{
								id: 'list-actions',
								viewclass: 'ui two column grid',
								controller: 'template-controller',
								model: 'list-actions-model'
							}, {
								id: 'employees-table-view',
								viewclass: 'ui very basic sortable selectable table',
								viewelement: 'table',
								controller: 'table-controller',
								model: 'employees-table-model'
							}, {
								id: 'employees-pagination-view',
								viewclass: 'ui one column grid',
								controller: 'template-controller',
								model: 'employees-pagination-model'
							}]
						}
					}]
				}
			}, {
				id: 'sidebar',
				controller: 'template-controller',
				viewclass: 'four wide computer only column',
				model: {
					template: 'sidebar-employees'
				}
			}]
		}
	}]
}