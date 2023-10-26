var async = require('async');

var GetEmployees = function() {
    this.session = null;
    this.taskExecutor = null;
    this.sqlhelper = 'platform';
};

GetEmployees.meta = {
    parameters: {
        view_id: { validation: ['required', 'integer'] }
    },
    extend: {
        result: {
            success: true,
            employees: [],
            pagination: null,
            columns: undefined    
        },
        eids: [],
        pids: []
    }
};

GetEmployees.prototype.execute = function(parameters, callback) {
    var self = this;
    
    async.series([
        this.do('getSettings'),
        this.do('getEmployees')
    ], function(err) {        
        callback(err, self.result);
    });
};

GetEmployees.prototype.getEmployees = function(callback) {
    async.series([
        this.do('getStaffRecords'),
        this.do('getEmploymentRecords'),
        this.do('getProfileEmails')
    ], function(err) {
        callback(err);
    });
};

GetEmployees.prototype.getStaffRecords = function(callback) {
    var self = this;
    var params = {
        tenant_id: self.session.getTenant(),
        role_id: self.session.getRole(),
        records: ['staff'],
        pagination: !_.isEmpty(this.parameters.pagination) ? this.parameters.pagination : {
            limit: 10,
            sort: 'record_id',
            pk: 'record_id',
            direction: 'asc'    
        },
        filters: [],
        additionalFields: ['profile_id',
            'staff_name',
            'staff_email',
            'primary_phone',
            'is_terminated']
    };
    if (this.parameters.filter) {
        params.filters.push({
            type: 'text',
            text: this.parameters.filter
        });
    }
    if (!this.parameters.showTerminated) {
        params.filters.push({
            type: 'sql',
            filters: ['is_terminated = ?'],
            params: [false]
        });
    }
    
    this.taskExecutor.dispatch('paysauce-security-client/GetTenantRecords', params, function(err, rresult) {
        if (err) return callback(err);
        
        var rows = rresult.records;
        self.result.pagination = rresult.pagination;
        
        for (var i=0; i < rows.length; i++) {
            self.eids.push(rows[i].record_id);
            if (rows[i].profile_id) {
                self.pids.push(rows[i].profile_id);
            }
            self.result.employees.push({
                id: rows[i].record_id,                
                employee_name: rows[i].staff_name,
                job_title: null,
                employment_status: null,
                phone: rows[i].primary_phone,
                email: rows[i].staff_email,
                linked: {
                    class: 'item',
                    label: rows[i].profile_id ? 'Yes' : 'No',
                    labelclass: rows[i].profile_id ? 'green' : 'black',
                    value: 0
                },
                profile_id: rows[i].profile_id
            });
        }
        callback();
    });
};

GetEmployees.prototype.getEmploymentRecords = function(callback) {
    if (this.eids.length == 0) return callback();
    var self = this;
    this.taskExecutor.dispatch('paysauce-security-client/GetTenantRecords', {
        tenant_id: this.session.getTenant(),
        role_id: this.session.getRole(),
        records: ['employment'],
        searchLocalTenantRecords: true,
        additionalFields: ['job_title', 'staff_id', 'es.employment_status_name', 'es.employment_status_class', 'es.employment_status_identifier'],
        additionalJoin: 'left join ps_employment_status es on r.employment_status_id = es.id',
        filters: [{
            type: 'sql',
            filters: ['r.staff_id in (?)'],
            params: [this.eids]
        }]
    }, function(err, rows) {
        if (err) return callback(err);
        var eidx = {};
        for (let i=0; i < rows.length; i++) {
            if (!eidx[rows[i].staff_id]) {
                eidx[rows[i].staff_id] = {
                    jt: [],
                    es: []
                };    
            }
            eidx[rows[i].staff_id].jt.push(rows[i].job_title);
            if (rows[i].employment_status_identifier) {
                eidx[rows[i].staff_id].es.push({
                    id: rows[i].employment_status_identifier,
                    name: rows[i].employment_status_name,
                    class: rows[i].employment_status_class
                });
            }
            
        }
        for (let i=0; i < self.result.employees.length; i++) {
            var emp = eidx[self.result.employees[i].id];
            if (emp) {
                self.result.employees[i].job_title = emp.jt.join(', ');
                for (let j=0; j < emp.es.length; i++) {
                    if (emp.es[j].id == 'active') {
                        self.result.employees[i].employment_status = {
                            class: 'item',
                            label: emp.es[j].name,
                            labelclass: emp.es[j].class
                        };
                        break;
                    } else if (emp.es[j].id == 'pending') {
                        self.result.employees[i].employment_status = {
                            class: 'item',
                            label: emp.es[j].name,
                            labelclass: emp.es[j].class
                        };
                    } else if (emp.es[j].id == 'terminated') {
                        if (!self.result.employees[i].employment_status) {
                            self.result.employees[i].employment_status = {
                                class: 'item',
                                label: emp.es[j].name,
                                labelclass: emp.es[j].class
                            };
                        }                        
                    }
                }
            }   
        }
        callback();
    });
};

GetEmployees.prototype.getProfileEmails = function(callback) {
    if (this.pids.length == 0) return callback();
    var self = this;
    this.sqlhelper.select({
        text: 'select email, profile_id from ps_profile_email',
        filters: ['is_primary', 'profile_id in (?)'],
        params: [this.pids]
    }, function(err, rows) {
        if (err) return callback(err);
        var pidx = {};
        for (let i=0; i < rows.length; i++) {
            pidx[rows[i].profile_id] = rows[i].email;
        }
        for (let i=0; i < self.result.employees.length; i++) {
            var pid = self.result.employees[i].profile_id;
            if (pid) {
                if (pidx[pid]) {
                    self.result.employees[i].email = pidx[rows[i].profile_id]    
                }
                delete self.result.employees[i].profile_id; 
            }
        }
        callback();
    });
};

GetEmployees.prototype.getSettings = function(callback) {
    if (!this.parameters.includeSettings)  return callback();
    var self = this;
    this.taskExecutor.dispatch('paysauce-platform/GetAppSetting', {
        names: ['employees.tableColumns', 'employees.tableRows'],
        app_identifier: 'employees',
        view_id: this.parameters.view_id
    }, function(err, settings) {
        if (err) return callback(err);
        self.result.columns = settings['employees.tableColumns'] || columns;
        callback();
    });
};

var columns = [/*{
    disabled: false,
    selected: true,
    name: 'Photo',
    id: 'photo'    
}, {
    disabled: true,
    selected: true,
    name: 'Alerts',
    id: 'alerts'   
}, */{
    disabled: true,
    selected: true,
    name: 'Name',
    id: 'employee_name'       
}, {
    disabled: true,
    selected: true,
    name: 'Job Title',
    id: 'job_title'       
}, {
    disabled: false,
    selected: true,
    name: 'Employment Status',
    id: 'employment_status'       
}, {
    disabled: false,
    selected: true,
    name: 'Phone',
    id: 'phone'    
}, {
    disabled: false,
    selected: true,
    name: 'Email',
    id: 'email'     
}, {
    disabled: false,
    selected: true,
    name: 'Linked',
    id: 'linked'     
}];

module.exports = GetEmployees;