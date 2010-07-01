(function() {

	/**
	 * Create a multi select field
	 * @class inputEx.MultiSelectField
	 * @extends inputEx.SelectField
	 * @constructor
	 * @param {Object} options Added options:
	 * <ul>
	 *    <li>options: contains the list of options configs ([{value:'usa'}, {value:'fr', label:'France'}])</li>
	 * </ul>
	 */
	inputEx.MultiSelectField = function(options) {
		inputEx.MultiSelectField.superclass.constructor.call(this,options);
	};
	
	YAHOO.lang.extend(inputEx.MultiSelectField, inputEx.SelectField,{
		
		/**
		 * Build the DDList
		 */
		renderComponent: function() {
			
			inputEx.MultiSelectField.superclass.renderComponent.call(this);
			
			this.ddlist = new inputEx.widget.DDList({parentEl: this.fieldContainer});
			
		},
		
		/**
		 * Register the "change" event
		 */
		initEvents: function() {
			YAHOO.util.Event.addListener(this.el,"change", this.onAddNewItem, this, true);
			this.ddlist.itemRemovedEvt.subscribe(this.onItemRemoved, this, true);
			this.ddlist.listReorderedEvt.subscribe(this.fireUpdatedEvt, this, true);
		},
		
		/**
		 * Re-enable the option element when an item is removed by the user
		 */
		onItemRemoved: function(e,params) {
			
			this.showOption({ value : params[0] });
			this.el.selectedIndex = 0;
			
			this.fireUpdatedEvt();
			
		},
		
		/**
		 * Add an item to the list when the select changed
		 */
		onAddNewItem: function() {
			
			var value, position, option;
			
			if (this.el.selectedIndex !== 0) {
				
				// Get the selector value
				value = inputEx.MultiSelectField.superclass.getValue.call(this);
				
				position = this.getPosition({ value : value });
				option = this.optionsList[position];
				
				this.ddlist.addItem({ value: value, label: option.label });
				
				// hide option (+ select first option)
				this.hideOption({ position : position });
				this.el.selectedIndex = 0;
				
				this.fireUpdatedEvt();
				
			}
		},
	
		/**
		 * Set the value of the list
		 * @param {String} value The value to set
		 * @param {boolean} [sendUpdatedEvt] (optional) Wether this setValue should fire the updatedEvt or not (default is true, pass false to NOT send the event)
		 */
		setValue: function(value, sendUpdatedEvt) {
			
			var i, length, position, option, ddlistValue = [];
			
			if (!YAHOO.lang.isArray(value)) {
				return;
			}
			
			// Re-enable all options
			for (i = 0, length=this.optionsList.length ; i < length ; i += 1) {
				this.enableOption(i);
			}
			
			// disable selected options and fill ddlist value
			for (i = 0, length=value.length ; i < length ; i += 1) {
				
				position = this.getPosition({ value : value[i] });
				option = this.optionsList[position];
				
				ddlistValue.push({ value: option.value, label: option.label });
				
				this.disableOption({ position: position });
			}
			
			// set ddlist value
			this.ddlist.setValue(ddlistValue);
			
			
			if(sendUpdatedEvt !== false) {
				// fire update event
				this.fireUpdatedEvt();
			}
		},
	
		/**
		 * Return the value
		 * @return {Any} an array of selected values
		 */
		getValue: function() {
			return this.ddlist.getValue();
		}
		
	});
	
	// Register this class as "multiselect" type
	inputEx.registerType("multiselect", inputEx.MultiSelectField);

}());
