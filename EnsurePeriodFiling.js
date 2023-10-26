var async = require('async');
var extend = require('node.extend');
var moment = require('../../../../core/moment');

var EnsurePeriodFiling = function() {
	this.sqlhelper = null;
    this.te = null;
    this.tasklogger = null;
};

EnsurePeriodFiling.meta = {
    parameters: {
        period_id: { validation: ['required', 'integer'] },
        payment_date: { validation: ['required', 'date'] }    
    }
}

EnsurePeriodFiling.prototype.execute = function(parameters, callback) {
    
    var self = this;
    
    this.te.dispatch('/data/Retrieve', {
        entity: 'period_filing_document',
        fields: 'id',
        key: 'period_id',
        id: parameters.period_id
    }, function (data) {
        if (data.length === 0) {
            self.sqlhelper.get({
                text: 'select e.company, e.id as employer_id, e.is_large_company, e.intermediary_id, p.name, pc.pay_ird from period p \
join employer e on p.employer_id = e.id \
join period_close pc on p.id = pc.period_id',
                filters: ['p.id = ?'],
                params: [parameters.period_id]
            }, function (err, results, fields) {
                if (err) throw err;

                if (results.length == 1) {
                    
                    if (results[0].pay_ird === 1) {
                        insertFilingForPeriod(self, results[0].intermediary_id, {
                            id: results[0].employer_id,
                            name: results[0].company
                        }, {
                            id: parameters.period_id,
                            name: results[0].name
                        }, moment(parameters.payment_date).toDate(), results[0].is_large_company, callback);
                    } else {
                        self.tasklogger.debug('no filing done as pay_ird not specified for period %s', [parameters.period_id]);
                        callback();	
                    }
                } else {
                    callback();
                }
            });
        } else {
            callback(data);
        }
    });
};


function ensureFiling(self, type, intermediary_id, date, filing, callback) {
    var result = {
        created: false,
        record: null
    };

    self.sqlhelper.get({
        text: 'select \
			f.id as filing_id, \
			f.type, \
			f.name, \
			f.start_date, \
			f.end_date, \
			ifp.id as intermediary_filing_process_id \
		from filing f left join intermediary_filing_process ifp on f.id = ifp.filing_id',
        filters: ['type = ?', 'start_date <= ? and end_date >= ?', 'ifp.intermediary_id = ?'],
        params: [type, date, date, intermediary_id]
    }, function (err, results, fields) {
        if (err) throw err;
        if (results.length === 0) {
            
            // TODO: these inserts needs to be concurrent and moved to SP?
            self.te.dispatch('/data/Store', {
                _entity: 'filing',
                type: type,
                name: filing.name,
                start_date: filing.start_date.toDate(),
                end_date: filing.end_date.toDate()
            }, function (data) {
                result.created = true;
                result.record = {
                    filing_id: data.id,
                    type: data.type,
                    start_date: data.start_date,
                    end_date: data.end_date
                };
                self.te.dispatch('/data/Store', {
                    _entity: 'intermediary_filing_process',
                    filing_id: result.record.filing_id,
                    intermediary_id: intermediary_id
                }, function (data) {
                    result.record.intermediary_filing_process_id = data.id;
                    callback(result);
                });
            });
            
        } else {
            result.record = {
                filing_id: results[0].filing_id,
                type: results[0].type,
                name: results[0].name,
                start_date: results[0].start_date,
                end_date: results[0].end_date,
                intermediary_filing_process_id: results[0].intermediary_filing_process_id
            };
            
            if (result.record.intermediary_filing_process_id === null) {
                self.te.dispatch('/data/Store', {
                    _entity: 'intermediary_filing_process',
                    filing_id: result.record.filing_id,
                    intermediary_id: intermediary_id
                }, function (data) {
                    result.created = true;
                    result.record.intermediary_filing_process_id = data.id;
                    callback(result);
                });		
            } else {
                callback(result);
            }            
        }
    });
}

function ensureEmployerFilingProcess(self, employerId, filing, callback) {

    function create() {
        self.te.dispatch('/data/Store', {
            _entity: 'employer_filing',
            employer_id: employerId,
            intermediary_filing_process_id: filing.record.intermediary_filing_process_id,
            state: 1
        }, function (data) {
            callback({
                created: true,
                id: data.id
            });
        });
    }
    
    if (filing.created) {
        create();
    } else {
        self.sqlhelper.get({
            text: 'select id from employer_filing',
            filters: ['employer_id = ?', 'intermediary_filing_process_id = ?'],
            params: [employerId, filing.record.intermediary_filing_process_id]
        }, function (err, results, fields) {
            if (err) throw err;
            if (results.length === 0) {
                create();
            } else {
                callback({
                    created: false,
                    id: results[0].id
                });
            }
        });
    }
}

function ensureEmployerFilingDocuments(self, employerFilingProcess, filingDocuments, callback) {
	
    function requiresDocuments(callback) {
        if (employerFilingProcess.created) {
            callback(true);
        } else {
            self.sqlhelper.get({
                text: 'select count(*) as c from employer_filing_document',
                filters: ['employer_filing_id = ?'],
                params: [employerFilingProcess.id]
            }, function (err, results, fields) {
                if (err) throw err;
                var result = results[0].c > 0;
                callback(result);
            });
        }
    }
    
    requiresDocuments(function(required) {
        
        if (required) {
            async.each(filingDocuments, function (record, _callback) {
                self.te.dispatch('/data/Store', extend({
                    _entity: 'filing_document'
                }, record), function (result) {
                    record.id = result.id;

                    self.te.dispatch('/data/Store', {
                        _entity: 'employer_filing_document',
                        filing_document_id: result.id,
                        employer_filing_id: employerFilingProcess.id
                    }, function (result) {
                        _callback(null);
                    });
                });
            }, function (err) {
                callback({
                    created: true,
                    records: filingDocuments
                });
            });
        } else {

            self.sqlhelper.get({
                text: 'select fd.id, employer_filing_id, type, name, start_date, end_date, filing_date \
                    from filing_document fd join employer_filing_document efd on fd.id = efd.filing_document_id',
                filters: ['employer_filing_id = ?'],
                params: [employerFilingProcess.id]
            }, function (err, results, fields) {
                if (err) throw err;
                callback({
                    created: false,
                    records: results
                });
            });
        }
    });
}

function ensureIntermediaryFilingDocuments(self, filing, filingDocuments, callback) {
	
    function requiresDocuments(callback) {
        if (filing.created) {
            callback(true);
        } else {
            self.sqlhelper.get({
                text: 'select count(*) as c from intermediary_filing_document',
                filters: ['intermediary_filing_process_id = ?'],
                params: [filing.intermediary_filing_process_id]
            }, function (err, results, fields) {
                if (err) throw err;
                var result = results[0].c > 0;
                callback(result);
            });
        }
    }
    
    requiresDocuments(function(required) {
    
        if (required) {
            async.each(filingDocuments, function (record, _callback) {
                self.te.dispatch('/data/Store', extend({
                    _entity: 'filing_document'
                }, record), function (result) {
                    record.id = result.id;

                    self.te.dispatch('/data/Store', {
                        _entity: 'intermediary_filing_document',
                        filing_document_id: result.id,
                        intermediary_filing_process_id: filing.intermediary_filing_process_id
                    }, function (result) {
                        _callback(null);
                    });
                });
            }, function (err) {
                callback({
                    created: true,
                    records: filingDocuments
                });
            });
        } else {
            self.sqlhelper.get({
                text: 'select fd.id, intermediary_filing_process_id, type, name, start_date, end_date, filing_date \
					from filing_document fd join intermediary_filing_document ifd on fd.id = ifd.filing_document_id',
                filters: ['intermediary_filing_process_id = ?'],
                params: [filing.intermediary_filing_process_id]
            }, function (err, results, fields) {
                if (err) throw err;
                callback({
                    created: false,
                    records: results
                });
            });
        }
    });
}

function getEmployerFilingDocuments(payDate, employer, filingName, sd, ed, isTwiceFiling) {
	var nm = moment(payDate);
    var dm = moment(payDate).date();

    nm.add('months', 1);

    var ir348 = {
        type: 'IR348',
        name: 'IR348 ' + employer.name + ' ' + filingName,
        start_date: sd,
        end_date: ed
    };
    if (isTwiceFiling) {
        ir348.filing_date = moment(nm.format('MM') + '-05-' + nm.format('YYYY'), 'MM-DD-YYYY');
    } else {
        ir348.filing_date = moment(nm.format('MM') + '-20-' + nm.format('YYYY'), 'MM-DD-YYYY');
    }

    var filingDocuments = [ir348];

    if (isTwiceFiling) {
        filingDocuments.push({
            type: 'IR345',
            name: 'IR345(a) ' + employer.name + ' ' + filingName,
            start_date: sd,
            end_date: moment(sd.format('MM') + '-15-' + sd.format('YYYY'), 'MM-DD-YYYY'),
            filing_date: moment(sd.format('MM') + '-20-' + sd.format('YYYY'), 'MM-DD-YYYY')
        });
        filingDocuments.push({
            type: 'IR345',
            name: 'IR345(b) ' + employer.name + ' ' + filingName,
            start_date: moment(sd.format('MM') + '-16-' + sd.format('YYYY'), 'MM-DD-YYYY'),
            end_date: ed,
            filing_date: moment(nm.format('MM') + '-05-' + nm.format('YYYY'), 'MM-DD-YYYY')
        });
    } else {
        filingDocuments.push({
            type: 'IR345',
            name: 'IR345 ' + employer.name + ' ' + filingName,
            start_date: sd,
            end_date: ed,
            filing_date: moment(nm.format('MM') + '-20-' + nm.format('YYYY'), 'MM-DD-YYYY')
        });	
    }
    
    return filingDocuments;
}

function getIntermediaryFilingDocuments(payDate, filingName, sd, ed) {
    var nm = moment(payDate);
    var dm = moment(payDate).date();

    nm.add('months', 1);
    var filingDocuments = [];
    
    filingDocuments.push({
        type: 'EPS',
        name: 'EPS ' + filingName,
        start_date: sd,
        end_date: ed,
        filing_date: moment(nm.format('MM') + '-20-' + nm.format('YYYY'), 'MM-DD-YYYY')
    });
    filingDocuments.push({
        type: 'SCF',
        name: 'SCF ' + filingName,
        start_date: sd,
        end_date: ed,
        filing_date: moment(nm.format('MM') + '-20-' + nm.format('YYYY'), 'MM-DD-YYYY')
    });
    
    return filingDocuments;
}

function insertFilingForPeriod(self, intermediary_id, employer, period, payDate, isTwiceFiling, callback) {

    var sd = moment(payDate);
    var ed = moment(payDate);
    
    sd.startOf('month');
    ed.endOf('month');
    
    var filingName = sd.format('MMM YYYY');
    
    ensureFiling(self, 'IR Filing', intermediary_id, payDate, {
        name: filingName,
        start_date: sd,
        end_date: ed
    }, function (filing) {
        
        ensureEmployerFilingProcess(self, employer.id, filing, function(employerFilingProcess) {
        
            var periodFilingDocumentIds = [];
            
            async.parallel([
                function (_callback) {
                    var employerFilingDocuments = getEmployerFilingDocuments(payDate, employer, filingName, sd, ed, isTwiceFiling);
                    ensureEmployerFilingDocuments(self, employerFilingProcess, employerFilingDocuments, function(filingDocuments) {
                        for (var i=0; i < filingDocuments.records.length; i++) {
                            var thisDoc = filingDocuments.records[i];
                            if (thisDoc.start_date <= payDate && payDate <= thisDoc.end_date) {
                                periodFilingDocumentIds.push(thisDoc.id);
                            }
                        }
						_callback(null, null);
                    }); 
                },
                function (_callback) {
                    var intermediaryFilingDocuments = getIntermediaryFilingDocuments(payDate, filingName, sd, ed);
                    ensureIntermediaryFilingDocuments(self, filing, intermediaryFilingDocuments, function(filingDocuments) {
                        for (var i=0; i < filingDocuments.records.length; i++) {
                            var thisDoc = filingDocuments.records[i];
                            if (thisDoc.start_date <= payDate && payDate <= thisDoc.end_date) {
                                periodFilingDocumentIds.push(thisDoc.id);
                            }
                        }
						_callback(null, null);
                    });
                }
            ], function (err, results) {
                if (err) throw err;
                
                if (periodFilingDocumentIds.length > 0) {
                    var sql = {
                        insert: 'period_filing_document',
                        fields: ['period_id', 'filing_document_id']
                    };
                    self.sqlhelper.asyncInsert(sql, periodFilingDocumentIds, function (id) {
                        return [period.id, id];
                    }, function (err, results, fields) {
						callback(results);
                    });
                } else {
                    callback();
                }
            });
        });
    });
}

module.exports = EnsurePeriodFiling;