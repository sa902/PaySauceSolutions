exports.model = {
		
	load: function(obj) {
		this.context = $.extend({
			onPrevClick: 'click-prev-employee',
			onNextClick: 'click-next-employee'}, obj, {
				limit: '' + obj.limit
			});
	},

	template: 'pagination',
	context: null
}