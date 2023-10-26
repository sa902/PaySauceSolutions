exports.model = {
    load: function(obj) {
        obj = obj || {}
        this.context.lookupData.workCodes = obj.workEntitlementLookup || this.context.lookupData.workCodes;
        this.context.data = obj.employment || {};     
    },

    getFields: function() {
        return this.context.data;
    },

    template: 'sections',
	context: {
        header: 'Employment',
        containerclasses: ['ui form'],
        sections: [{
            template: 'form-fields',            
            fields: [{
                id: 'job_title',
                view: 'fields:input-1',            
                groupclass: 'field required',
                context: {
                    label: 'Job Title',
                    placeholder: 'Job Title',
                    maxlength: 50
                },
                validation: ['required']
            }, {
                id: 'start_date',
                view: 'fields:semantic-date',
                groupclass: 'required field',
                context: {
                    label: 'Start Date',
                    placeholder: 'Select date',
                    options: {
                        type: 'date',
                        popupOptions: {
                            observeChanges: false,
                            inline: true
                        }
                    }
                },
                converter: 'date',
                validation: ['requiredif-enabled']    
            }, {
                id: 'work_entitlement_id',
                view: 'semantic-dropdown:semantic-select',
                groupclass: 'required field',
                context: {
                    label: 'Entitled to work in NZ?',
                    selectclass: 'selection',
                    items: null
                },
                validation: ['requiredif-enabled']
            }]    
        }],
        
        lookupFields: {
            work_entitlement_id: 'workCodes'
        },
        lookupData: {
            workCodes: []
        },        
        data: {}
	}
};