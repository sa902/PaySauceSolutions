var async = require('async');

var NewEmployee = function() {
    this.config = null;
    this.session = null;
    this.taskExecutor = null;
};

NewEmployee.meta = {
    parameters: {},
    messages: {
        success: {
            type: 'success',
            text: 'New Employee has been added.' 
        }
    },
    extend: {
        result: {
            success: true,
            messages: []
        }
    }
};

NewEmployee.prototype.execute = function(parameters, callback) {
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

        var delegates = self.config.get('paysauce-employees/newEmployee', cells);
        
        async.eachSeries(delegates, function(item, _callback) {
            self.taskExecutor.dispatch(item, parameters, function(err, result) {
                if (err) return callback(err);
                self.result.success = self.result.success && result.success;
                if (!result.success) {
                    self.result.messages = self.result.messages.concat(result.messages);
                }
                _callback();
            });
        }, function(err) {
            if (err) return callback(err);
            if (self.result.success) {
                self.result.messages.push(NewEmployee.meta.messages.success);
            }
            callback(null, self.result);
        });
    });
};

module.exports = NewEmployee;