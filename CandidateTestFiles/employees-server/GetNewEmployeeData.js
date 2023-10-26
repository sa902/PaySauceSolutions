var async = require('async');

var GetNewEmployeeData = function() {
    this.taskExecutor = null;
    this.session = null;
    this.config = null;
};

GetNewEmployeeData.meta = {
    extend: {
        result: {
            harvest: undefined,
            genderLookup: []    
        }
    }
};

GetNewEmployeeData.prototype.execute = function(parameters, callback) {
    var self = this;
    async.series([
        this.do('getLookups'),
        this.do('getAppHarvest')
    ], function(err) {
        callback(err, self.result);
    });
};

GetNewEmployeeData.prototype.getLookups = function(callback) {
	var self = this;
	async.parallel({
        genderLookup: this.do('getLookupItems', ['paysauce-account/GetGenderCodesForLookup']),
        workEntitlementLookup: this.do('getLookupItems', ['paysauce-employees/GetWorkEntitlementCodesForLookup'])	
	}, function(err, data) {
		if (err) return callback(err);		
		_.extend(self.result, data);
		callback();
	});
};

GetNewEmployeeData.prototype.getLookupItems = function(task, callback) {
	this.taskExecutor.dispatch(task, {}, callback);
};

GetNewEmployeeData.prototype.getAppHarvest = function(callback) {
    var self = this;
    this.taskExecutor.dispatch('paysauce-security-client/GetTenantRecords', {
		tenant_id: this.session.getTenant(),
		role_id: this.session.getRole(),
        records: ['appInstall'],
        additionalFields: ['app_props'],		
		searchLocalTenantRecords: true
	}, function(err, rows) {
		if (err) return callback(err);
        
        var cells = [];

        for (var i=0; i < rows.length; i++) {
            cells.push(rows[i].app_props.cell);
        }

		self.result.harvest = {
            js: self.config.get('honeycomb-spa/getHarvest-newEmployee-js', cells) || [],
            css: self.config.get('honeycomb-spa/getHarvest-newEmployee-css', cells) || []
        }
		callback();
	});
};

module.exports = GetNewEmployeeData;