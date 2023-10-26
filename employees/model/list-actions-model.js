exports.model = {

	load: function(columns) {
		this.context.columns = columns;
	},

	setActive: function(value) {
		this.context.active = value;
	},

	setSearch: function(value) {
		this.context.search = value;
	},

	template: 'list-actions',
	context: {
		type: 'employee',
		search: null	
	}
}