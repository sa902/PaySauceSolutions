exports.model = {
	views: [{
		id: 'hidden-sidebar',
		controller: 'template-controller',
		viewclass: 'ui right sidebar',
		model: {
			template: 'sidebar-employees'
		}
	}, {
		id: 'pusher',
		controller: 'flow-controller',
		viewclass: 'pusher',
		model: {
			views: [{
				id: 'confirmation-modal-view',
				controller: 'modal-controller',
				model: 'confirmation-modal-model'
			}, {
				id: 'topbar',
				controller: 'template-controller',
				viewclass: 'ui fixed borderless menu',
				model: 'topbar-template-model'
			}, {
				id: 'content-views',
				viewclass: 'app',
				controller: 'flow-controller',
				model: 'employees-views-model'		
			}]
		}	
	}]
}