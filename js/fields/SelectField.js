(function () {

	var Event = YAHOO.util.Event, lang = YAHOO.lang;

	/**
	 * Create a select field
	 * @class inputEx.SelectField
	 * @extends inputEx.Field
	 * @constructor
	 * @param {Object} options Added options:
	 * <ul>
	 *    <li>options: contains the list of options configs ([{value:'usa'}, {value:'fr', label:'France'}])</li>
	 * </ul>
	 */
	inputEx.SelectField = function (options) {
		inputEx.SelectField.superclass.constructor.call(this, options);
	};

	lang.extend(inputEx.SelectField, inputEx.Field, {
		
		/**
		 * Set the default values of the options
		 * @param {Object} options Options object as passed to the constructor
		 */
		setOptions: function (options) {
		
			var i, length;
		
			inputEx.SelectField.superclass.setOptions.call(this, options);
		
			this.options.options = lang.isArray(options.options) ? options.options : [];
		
			// Retro-compatibility with old pattern (changed since 2010-06-30)
			if (lang.isArray(options.selectValues)) {
			
				for (i = 0, length = options.selectValues.length; i < length; i += 1) {
				
					this.options.options.push({
						value: options.selectValues[i],
						label: "" + ((options.selectOptions && !lang.isUndefined(options.selectOptions[i])) ? options.selectOptions[i] : options.selectValues[i])
					});
				
				}
			}
		
		},
	
		/**
		 * Build a select tag with options
		 */
		renderComponent: function () {
		
			var i, length;
		
			// create DOM <select> node
			this.el = inputEx.cn('select', {
			
				id: this.divEl.id ? this.divEl.id + '-field' : YAHOO.util.Dom.generateId(),
				name: this.options.name || ''
			
			});
		
			// list of options (e.g. [{ label: "France", value:"fr", node:<DOM-node>, visible:true }, {...}, ...])
			this.optionsList = [];
		
			// add options
			for (i = 0, length = this.options.options.length; i < length; i += 1) {
				this.addOption(this.options.options[i]);
			}
		
			// append <select> to DOM tree
			this.fieldContainer.appendChild(this.el);
		},
	
		/**
		 * Register the "change" event
		 */
		initEvents: function () {
			Event.addListener(this.el, "change", this.onChange, this, true);
			Event.addFocusListener(this.el, this.onFocus, this, true);
			Event.addBlurListener(this.el, this.onBlur, this, true);
		},
	
		/**
		 * Set the value
		 * @param {String} value The value to set
		 * @param {boolean} [sendUpdatedEvt] (optional) Wether this setValue should fire the updatedEvt or not (default is true, pass false to NOT send the event)
		 */
		setValue: function (value, sendUpdatedEvt) {
		
			var i, length, option, firstIndexAvailable, optionFound = false;
		
			for (i = 0, length = this.optionsList.length; i < length ; i += 1) {
			
				if (this.optionsList[i].visible) {
				
					option = this.optionsList[i];
				
					if (value === option.value) {
					
						option.node.selected = "selected";
						optionFound = true;
						break; // option node already found
					
					} else if (lang.isUndefined(firstIndexAvailable)) {
					
						firstIndexAvailable = i;
					}
				
				}
			
			}
		
			// select value from first option available when
			// value not matching any visible option
			if (!optionFound) {
				option = this.optionsList[firstIndexAvailable];
				option.node.selected = "selected";
				value = option.value;
			}
		
			// Call Field.setValue to set class and fire updated event
			inputEx.SelectField.superclass.setValue.call(this, value, sendUpdatedEvt);
		},
	
		/**
		 * Return the value
		 * @return {Any} the selected value
		 */
		getValue: function () {
		
			var optionIndex;
			
			if (this.el.selectedIndex >= 0) {
				
				optionIndex = inputEx.indexOf(this.el.childNodes[this.el.selectedIndex], this.optionsList, function (node, option) {
					return node === option.node;
				});
			
				return this.optionsList[optionIndex].value;
				
			} else {
				
				return "";
				
			}
		},
	
		/**
		 * Disable the field
		 */
		disable: function () {
			this.el.disabled = true;
		},

		/**
		 * Enable the field
		 */
		enable: function () {
			this.el.disabled = false;
		},
	
		/**
		 * Add an option in the selector
		 * @param {Object} config An object describing the option to add (e.g. { value: 'second' [, label: 'Second' [, position: 1 || after: 'First' || before: 'Third']] })
		 */
		addOption: function (config) {
		
			var option, position, that;
		
		
			option = {
				value: config.value,
				label: (lang.isString(config.label) && config.label.length > 0) ? config.label : ""+config.value,
				visible: true
			};
		
			// Create DOM <option> node
			option.node = inputEx.cn('option', {value: option.value}, null, option.label);
		
		
			// Get option's position
			//   -> don't pass config.value to getPosition !!!
			//     (we search position of existing option, whereas config.value is a property of new option to be created...)
			position = this.getPosition({ position: config.position, label: config.before || config.after });
		
			if (position === -1) { //  (default is at the end)
				position = this.optionsList.length;
			
			} else if (lang.isString(config.after)) {
				// +1 to insert "after" position (not "at" position)
				position += 1;
			}
		
		
			// Insert option in list at position
			this.optionsList.splice(position, 0, option);
		
			// Append <option> node in DOM
			this.attachToSelectAtPosition(option.node, position);
		
			// select new option
			if (!!config.selected) {
			
				// setTimeout for IE6 (let time to create dom option)
				that = this;
				setTimeout(function () {
					that.setValue(option.value);
				}, 0);
			
			}
		
		},
	
		/**
		 * Remove an option in the selector
		 * @param {Object} config An object targeting the option to remove (e.g. { position : 1 } || { value: 'second' } || { label: 'Second' })
		 */
		removeOption: function (config) {
		
			var position, option;
		
			// Get option's position
			position = this.getPosition(config);
		
			if (position === -1) {
				throw new Error("SelectField : invalid or missing position, label or value in removeOption");
			}
		
			// Option to remove
			option = this.optionsList[position];
		
			// Clear if removing selected option
			if (this.getValue() === option.value) {
				this.clear();
			}
		
			// Remove option in list at position
			this.optionsList.splice(position, 1); // remove 1 element at position
		
			// remove from selector
			this.el.removeChild(option.node);
		
		},
	
		/**
		 * Hide an option in the selector
		 * @param {Object} config An object targeting the option to hide (e.g. { position : 1 } || { value: 'second' } || { label: 'Second' })
		 */
		hideOption: function (config) {
		
			var position, option;
		
			position = this.getPosition(config);
		
			if (position !== -1) {
			
				option = this.optionsList[position];
			
				// test if visible first in case we try to hide twice or more...
				if (option.visible) {
				
					option.visible = false;
				
					// Clear if hiding selected option
					if (this.getValue() === option.value) {
						this.clear();
					}
				
					// Remove from DOM
					//   -> style.display = 'none' would work only on FF
					//   -> other browsers (IE, Chrome...) require to remove option from DOM
					this.el.removeChild(option.node);
				
				}
			
			}
		
		},
	
		/**
		 * Show an option in the selector
		 * @param {Object} config An object targeting the option to show (e.g. { position : 1 } || { value: 'second' } || { label: 'Second' })
		 */
		showOption: function (config) {
		
			var position, option;
		
			position = this.getPosition(config);
		
			if (position !== -1) {
			
				option = this.optionsList[position];
				option.visible = true;
			
				this.attachToSelectAtPosition(option.node, position);
			
			}
		
		},
	
		/**
		 * Get the position of an option in optionsList (NOT in the DOM)
		 * @param {Object} config An object targeting the option (e.g. { position : 1 } || { value: 'second' } || { label: 'Second' })
		 */
		getPosition: function (config) {
		
			var nbOptions, position;
		
			nbOptions = this.optionsList.length;
		
			// Handle position
			if (lang.isNumber(config.position) && config.position >= 0 && config.position <= nbOptions) {
			
				position = parseInt(config.position, 10);
			
			} else if (!lang.isUndefined(config.value)) {
			
				// get position of option with value === config.value
				position = inputEx.indexOf(config.value, this.optionsList, function (value, opt) {
					return opt.value === value;
				});
			
			} else if (lang.isString(config.label)) {
			
				// get position of option with label === config.label
				position = inputEx.indexOf(config.label, this.optionsList, function (label, opt) {
					return opt.label === label;
				});
			
			}
		
			return position || -1;
		},
		
		/**
		 * Attach an <option> node to the <select> at the specified position
		 * @param {HTMLElement} node The <option> node to attach to the <select>
		 * @param {Int} position The position of the option in optionsList (may not be the "real" position in DOM)
		 */
		attachToSelectAtPosition: function (node, position) {
		
			var domPosition, i;
		
			// Compute real DOM position (since previous options in optionsList may be hidden)
			domPosition = 0;
		
			for (i = 0; i < position; i += 1) {
				
				if (this.optionsList[i].visible) {
					
					domPosition += 1;
					
				}
				
			}
		
			// Insert in DOM
			if (domPosition < this.el.childNodes.length) {
			
				YAHOO.util.Dom.insertBefore(node, this.el.childNodes[domPosition]);
			
			} else {
			
				this.el.appendChild(node);
			
			}
		}
	
	});

	// Register this class as "select" type
	inputEx.registerType("select", inputEx.SelectField, [
		{
			type: 'list',
			name: 'options',
			label: 'Options',
			elementType: {
				type: 'group',
				fields: [
					{ label:'Value', name:'value', value:'' }, // not required to allow '' value (which is default)
					{ label:'Label', name:'label' } // optional : if left empty, label is same as value
				]
			},
			value: [],
			required: true
		}
	]);

}());