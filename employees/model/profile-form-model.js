exports.model = {
    
    load: function(obj) {
        obj = obj || {};
        this.context.lookupData.genderCodes = obj.genderLookup || this.context.lookupData.genderCodes;
        this.context.data = obj.profile || {};             
    },

    toggleExtendedFields: function() {
        this._showExtended = !this._showExtended;
        var fields = this.km.getFields(['date_of_birth',
            'gender_id',
            'primary_phone',
            'address']);
        for (var i=0; i < fields.length; i++) {
            fields[i].disabled = !this._showExtended;    
        }
        this.km.refreshLinkedViews(['date_of_birth', 'gender_id', 'primary_phone', 'address']);    
    },

    getFields: function() {
        return this.context.data;
    },

    _showExtended: false,
    
    template: 'sections',
	context: {
        header: 'Profile',
        sectionclasses: ['ui form'],
        sections: [{
            template: 'form-fields',
            containerclasses: ['two required fields'],
            fields: [{
                id: 'first_name',
                view: 'fields:input-1',            
                groupclass: 'field',
                context: {
                    label: 'First Name',
                    placeholder: 'First Name',
                    maxlength: 50
                },
                validation: ['required']
            }, {
                id: 'last_name',
                view: 'fields:input-1',            
                groupclass: 'field',
                context: {
                    label: 'Last Name',
                    placeholder: 'Last Name',
                    maxlength: 50
                },
                validation: ['required']
            }]    
        }, {
            template: 'form-fields',            
            fields: [{
                id: 'staff_email',
                view: 'fields:input-1',            
                groupclass: 'field required',
                context: {
                    label: 'Email',
                    placeholder: 'Email',
                    maxlength: 50
                },
                validation: ['required', 'email']
            }, {
                id: 'invite-employee',
                view: 'honeycomb-fields:template',
                groupclass: 'ui toggle checkbox checked',
                template: 'invite-employee',
                context: {}
            }]    
        }, {
            template: 'form-fields',
            id: 'extended-profile',            
            containerclasses: ['margin top twenty hidden'],
            fields: [{
                id: 'date_of_birth',
                view: 'fields:semantic-date',
                groupclass: 'required field',
                context: {
                    label: 'Date of Birth',
                    placeholder: 'Select date',
                    options: {
                        type: 'date',
                        popupOptions: {
                            observeChanges: false,
                            inline: true
                        }
                    }
                }    
            }, {
                id: 'gender_id',
                view: 'semantic-dropdown:semantic-select',                
                groupclass: 'field',
                context: {
                    label: 'Gender',
                    selectclass: 'selection',
                    items: null
                },
                disabled: true
            }, {
                id: 'primary_phone',
                view: 'fields:input-1',            
                groupclass: 'field required',
                context: {
                    label: 'Primary Phone',
                    placeholder: 'Primary Phone',
                    maxlength: 50
                },
                validation: ['requiredif-enabled'],
                disabled: true
            }, {
                id: 'address',
                view: 'fields:address',
                groupclass: 'required field',
                context: {
                    label: 'Address',
                    placeholder: 'Start typing for a list of addresses...',
                    inputs: [{
                        id: 'address_line_1',
                        type: 'hidden'
                    }, {
                        id: 'address_line_2',
                        type: 'hidden'
                    }, {
                        id: 'suburb',
                        type: 'hidden'
                    }, {
                        id: 'city',
                        type: 'hidden'
                    }, {
                        id: 'postcode',
                        type: 'hidden'
                    }]
                },
                validation: ['address'],
                disabled: true
            }]    
        }],
        
        lookupFields: {
            gender_id: 'genderCodes'
        },
        lookupData: {
            genderCodes: []
        },        
        data: {}
	}
};