var _us = require('underscore')._;
var txn = require('txn');
var period = require('period');
var common = require('common-helpers');
var domain = require('domain-helpers');
var settings = require('settings');
var dialogs = require('alloy/dialogs');
var moment = require('moment');
var payroll = require('nzPayroll');
var rf = require('rowFactory');
var empLib = require('employee');
var txnHelper = require('TransactionHelper');
var TaskLogger = require('TaskLogger');
var cf = require('ctrlFactory');
var ctrlMeta = require('ctrlMeta');

var args = arguments[0] || null;
var employee_id = args.id;
var navigation = args.navigation;
var nav = Alloy.Globals.navMenu;

var employer_id = Ti.App.Properties.getInt('eid');

var currentPeriod = period.getOpenPeriod();

var logger = new TaskLogger({
	task: 'employee',
	level: Alloy.Globals.logginglevel
});

var focused;
var employeeTxn = null;
var employeeYtdTxn = null;
var bankAccounts = null;
var employerBankAccounts = null;
var ruleSwitches = {};
var currentRules = settings.getRules();
var rulesConfig = settings.rulesConfig;
var isDirty = false;
var rowMeta;
var slide_in =  Titanium.UI.createAnimation({bottom:0});
var slide_out =  Titanium.UI.createAnimation({bottom:-251});

Alloy.Globals.loading.show('loading', false);
var postlayout = 0;
var detailsSection;

setTimeout(function() {
	initialize();
}, 50);



function initialize() {
	
	function load(callback) {
		Alloy.Globals.te.dispatch('/console/GetEmployee', {
			employer_id: employer_id,
			employee_id: employee_id,
			period_id: currentPeriod.id,
			txnTypes: txnHelper.sourceTxns,
			includeDocuments: true
		}, function(result) {
			employee = result.employee;
			employeeTxn = result.employeeTxn;
			bankAccounts = result.accounts || [];
			documents = result.documents || [];
			callback();				
		});	
	}

	//var buttonWidth = (common.getScreenWidth() / 2) - 17;

	//$.vwSave.width = buttonWidth;
	//$.vwPay.width = buttonWidth;

	/* platform specifics */
	var datePicker = null;

	switch(Ti.Platform.osname) {
		case 'iphone':
			/*pckTaxCode = Alloy.createController('common/toolbar-picker', {
				buttons: [{
					options: {
						classes: ['dialog-cancel'],
						title: 'Cancel'
					},
					trigger: 'cancel'
				}, {
					options: {
						classes: ['dialog-clear'],
						title: 'More...'
					},
					trigger: 'more'
				}, {
					options: {
						classes: ['dialog-done'],
						title: 'Done'
					},
					trigger: 'done'
				}],
				children: domain.getPickerTaxCodes()	
			});
			$.window.add(pckTaxCode.getView());
			pckTaxCode.on('done', selectTaxCode);
			pckTaxCode.on('more', selectMoreTaxCode);*/
			break;

		case 'android':
			datePicker = Ti.UI.createPicker({
				type: Titanium.UI.PICKER_TYPE_DATE
			});
			$.headerbar.setParentContainer($.window);
			$.headerbar.setBack(onBack);
			$.headerbar.setActionButtons({
				visible: [
					{
						icon: '/images/icons/home-icon-trans.png',
						action: clickHome
					}
				]
			});
			break;	
	}
	/* end of platform specifics */

	load(function() {
		var payrollSettingsSection = Alloy.createController('employee/employeeSectionPayrollSettings', {
			employee: employee,
			employeeTxn: employeeTxn,
			bankAccounts: bankAccounts,
			visible: ['time_entry_type', 'taxCode', 'bank_account_no', 'ird_no', 'start_date', 'end_date', 'ytd_totals', 'bank_accounts'],
			pckDate: null,
			nav: nav,
			table: $.tblEmployee,
			_$: $
		});
		payrollSettingsSection.on('change', changePayrollSettings);
		payrollSettingsSection.on('getYtdTxn', getYtdTxn);
		payrollSettingsSection.on('getBankAccounts', function(e) {
			getBankAccounts(e.callback);
		});

		detailsSection = Alloy.createController('employee/employeeSectionPersonalDetails', {
			employee: employee,
			documents: documents,
			visible: ['photo', 'first_name', 'last_name', 'email', 'address1', 'address2', 'address3', 'documents'],
			_$: $,
			nav: nav
		});	
		detailsSection.on('change', changePersonalDetails);
		
		var row;
		var secRules = rf.createSection($, 'PAYROLL RULES');
		for (var i=0; i < rulesConfig.length; i++) {
			var rule = rulesConfig[i];
			if (currentRules[rule.id]) {
		 		row = $.UI.create('TableViewRow', {
					classes: ['table-control', 'has-child'],
					controller: 'employee/payroll-' + rule.id,
					txn: rule.txn
					//ruleActive: employeeTxn[rule.txn].value === 'Y'	
				});
		 		row.addEventListener('click', showRuleSettings);
				var lbl = $.UI.create('Label', {classes:['table-label'], text:rule.text});
				var vwSwitch = $.UI.create('View', {
					classes: ['inset-right']
				});
				var swt = $.UI.create('Switch', {
					id:rule.id,
					bubbleParent: false,
					right: 0
				});
				swt.addEventListener('change', changeRuleSetting);
				vwSwitch.add(lbl);
				vwSwitch.add(swt);
				row.add(vwSwitch);

				/* platform specifics */
				if (Ti.Platform.osname == 'android') {
					row.add($.UI.create('ImageView', {
						classes: ['has-child-image']
					}));
				}
				/* end of platform specifics */
				row.add(cf.createControl($, null, 'view', ctrlMeta.divider.divider));
				secRules.add(row);
				ruleSwitches[rule.id] = swt;
			}	
		}

		rowMeta = ctrlMeta.employee.getMeta({
			clickAllowance: clickAllowance,
			clickDeduction: clickDeduction,
			employeeTxn: employeeTxn	
		});
		row = rf.createRow($, 'allowances', _us.extend(rowMeta.allowances, ctrlMeta.divider));
		secRules.add(row);

		row = rf.createRow($, 'deductions', _us.extend(rowMeta.deductions, ctrlMeta.divider));
		secRules.add(row);

		var control = ctrlMeta.employee.getControlMeta({
			navigation: navigation,
			clickSave: clickSave,
			clickPay: clickPay	
		});
		secRules.add(rf.createRow($, null, ctrlMeta.buttonsRow.getMeta($, control)));

		$.tblEmployee.setData([
			detailsSection.getView(),
			payrollSettingsSection.getView(),
			secRules
		]);
		payrollSettingsSection.ensureEntryRows();
		payrollSettingsSection.refresh(['default_rate', 'default_hours', 'salary']);

		refresh();	
	});
}

/* event handlers */
function onPostlayout() {
	postlayout++;
	if (postlayout > 1) {
		Alloy.Globals.loading.hide();
	}
	logger.debug('onPostlayout');
}

function onFocus() {
	logger.debug('onFocus()');
	//Alloy.Globals.loading.hide();
	/*if (employeeAlreadyPaid()) {
		$.vwPay.visible = false;
		$.vwSave.left = null;	
	}*/
}

function clickHome() {
	logger.debug('clickHome()');
	saveEmployee(function() {
		nav.home();	
	});	
}

function showRuleSettings(e) {	
	//if (e.row.ruleActive) {
	if (employeeTxn[e.row.txn].value == 'Y') {
		var win = Alloy.createController(e.row.controller, {
			employeeTxn: employeeTxn,
			onUpdate: updateTxn
		}).getView();
		nav.openWindow(win);
		setDirty(true);	
	}
}
function changeRuleSetting(e) {
	var ruleId = e.source.id;
	var txn;

	for (var i=0; i < rulesConfig.length; i++) {
		if (rulesConfig[i].id == ruleId) {
			txn = rulesConfig[i].txn;
			break;
		}
	}
	if (txn) {
		employeeTxn[txn].value = e.source.value ? 'Y' : 'N';	
	}
	setDirty(true);	
}

function updateTxn(txns) {
	for (var txnId in txns) {
		var txn = txns[txnId];
		
		if (_us.isHash(txn)) {
			if (txn.value !== undefined) {
				employeeTxn[txnId].value = txn.value;
			}
			if (txn.amount !== undefined) {
				employeeTxn[txnId].amount = txn.amount;
			}	
		}
		
	}
}

function getYtdTxn(e) {
	Alloy.Globals.te.dispatch('/console/GetEmployeeTxns', {
		period_id: currentPeriod.id,
		employee_id: employee_id,
		txnTypes: txnHelper.accumulatorTxns
	}, function(results) {
		employeeYtdTxn = results;
		e.callback(employeeYtdTxn);		
	});	
}

function getBankAccounts(callback) {
	if (bankAccounts === null) {
		Alloy.Globals.te.dispatch('/console/GetBankAccounts', {
			employee_id: employer_id
		}, function(results) {
			bankAccounts = results;
			callback(bankAccounts);	
		});	
	} else {
		callback(bankAccounts);	
	}
}

function getEmployerBankAccounts(callback) {
	if (employerBankAccounts === null) {
		Alloy.Globals.te.dispatch('/console/GetBankAccounts', {
			employer_id: employer_id
		}, function(results) {
			employerBankAccounts = results;
			callback(employerBankAccounts);	
		});	
	} else {
		callback(employerBankAccounts);	
	}	
}

function changePayrollSettings(value) {
	if (value.employee) {
		_us.extend(employee, value.employee);
	}
	if (value.employeeTxn) {
		_us.extend(employeeTxn, value.employeeTxn);
	}
}
function changePersonalDetails(value) {
	_us.extend(employee, value);
}

function getDeductionBankAccounts(e) {
	getBankAccounts(function(employeeAccounts) {
		getEmployerBankAccounts(function(employerAccounts) {
			e.callback(employeeAccounts.concat(employerAccounts));
		});
	})	
}

function clickAllowance(e) {
	var ctlr = Alloy.createController('employee/allowances', {
		employeeTxn: employeeTxn,
		employeeId: employee_id,
		nav: nav
	});
	ctlr.on('update', function(allowances, accounts) {
		logger.debug('update(): accounts=%s', [JSON.stringify(accounts)]);
		bankAccounts = accounts;
		setEntityTypeOnAccounts();
		employeeTxn['TX_ALLOW'] = allowances['TX_ALLOW'];
		employeeTxn['NTX_ALLOW'] = allowances['NTX_ALLOW'];
		/*$.trigger('change', {
			employeeTxn: allowances
		});*/	
	});
	ctlr.on('getBankAccounts', getDeductionBankAccounts);
	nav.openWindow(ctlr.getView());
}

function clickDeduction(e) {
	var ctlr = Alloy.createController('employee/allowances', {
		employeeTxn: employeeTxn,
		employeeId: employee_id,
		nav: nav,
		isDeduction: true,
		newBankAccountEntity: {
			id: employee.id,
			entity_type: 'Employee'
		}
	});
	ctlr.on('update', function(deductions, accounts) {
		logger.debug('update(): accounts=%s', [JSON.stringify(accounts)]);
		bankAccounts = accounts;
		setEntityTypeOnAccounts();
		employeeTxn['TX_DEDUCT'] = deductions['TX_DEDUCT'];
		employeeTxn['NTX_DEDUCT'] = deductions['NTX_DEDUCT'];
	});
	ctlr.on('getBankAccounts', getDeductionBankAccounts);
	nav.openWindow(ctlr.getView());
}

function clickSave(e) {	
	saveEmployee(function() {
		nav.close();	
	});	
}

function onBack(e) {
	detailsSection.destroy();
	Ti.Media.hideCamera();
	saveEmployee(function() {
		nav.close();
		
	});	
}

function showConfirmSave(callback) {
	var confirm = Titanium.UI.createAlertDialog({
        title: 'Save',
        message: 'Employee not saved. Would you like to save details?',
        buttonNames: ['Yes', 'No']
	});
	confirm.addEventListener('click', callback);
	confirm.show();	
}

function saveEmployee(callback) {
	var params = {
		id: employee_id,
		employee: employee,
		accounts: bankAccounts,
		documents: documents,
		period_id: currentPeriod.id,
		txn: _us.extend({}, employeeTxn, employeeYtdTxn)
	}

	Alloy.Globals.te.dispatch('/console/SaveEmployee', params, function (data) {
		callback();			
	});	
}

function clickPay(e) {
	saveEmployee(function() {
		var win = Alloy.createController('employee/newpayemployee', {
			employee_id: employee.id,
			navigation: 'calculateonly'
		}).getView();
		nav.openWindow(win);	
	});
}
/* end of event handlers */

/* functions */
function setEntityTypeOnAccounts() {
	if (bankAccounts) {
		for (var i=0; i < bankAccounts.length; i++) {
			var acc = bankAccounts[i];
			if (acc._remove !== true && !acc.entity_type) {
				acc.entity_type = 'Employer';
				acc.entity_id = employer_id;
			}
		}	
	} else {
		logger.warn('no accounts and there should be!');
	}

}
function forceDirty() {
	setDirty(true);
}

function setDirty(value) {
	isDirty = value;	
}
function employeeAlreadyPaid() {
	var payStatus = period.getEmployeePayStatusFromCurrent(employee_id);
	return payStatus == 'Processed';
}
/* end of functions */



/* refresh handlers */
function refresh() {
	var employeeName = (employee.first_name + ' ' + employee.last_name).toLowerCase();

	/* platform specifics */
	if (Ti.Platform.osname == 'android') {
		$.headerbar.setTitle({
		    text: employeeName
		});
	} else if (Ti.Platform.osname == 'iphone') {
		$.lblTitle.text = employeeName;	
	}
	/* end of platform specifics */

	/*if (navigation == 'saveonly' || employee == null) {
		$.vwPay.visible = false;
		$.vwSave.left = null;
	}*/

	for (var i=0; i < rulesConfig.length; i++) {
		var rule = rulesConfig[i];
		if (ruleSwitches[rule.id]) {
			ruleSwitches[rule.id].value = employeeTxn[rule.txn].value === 'Y';	
		}
	}
	setDirty(false);
}
/* end of refresh handlers */



