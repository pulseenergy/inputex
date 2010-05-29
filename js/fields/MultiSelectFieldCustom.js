(function() {   
	
	var inputEx = YAHOO.inputEx;

  /**
 * Create a multi Select field customized
 * @class inputEx.MultiSelectFieldCustom
 * @extends inputEx.MultiSelectField
 * @constructor
 * @param {Object} options Added options:
 * <ul>
 *	  <li>maxItems: the number of Items</li>
 *	  <li>maxItemsAlert: a function executed when the maxItems is reach</li>
 *	  <li>listSelectOptions : the options for a select field inside of the custom list</li>
 * </ul>
 */


inputEx.MultiSelectFieldCustom = function(options) {
	this.options = this.options || {};
  this.listSelectOptions= options.listSelectOptions;
  this.maxItems = options.maxItems;	
  this.maxItemsAlert = options.maxItemsAlert;
	inputEx.MultiSelectFieldCustom.superclass.constructor.call(this,options);
	
};
YAHOO.lang.extend(inputEx.MultiSelectFieldCustom, inputEx.MultiSelectField,{
   /**
    * renderComponent : override the MultiSelectField renderComponent function
    * <ul>
    *   <li>Use the custom ddlist </li>
    *   <li>put options for select fields in the ddList Custom</li>
    * </ul>
    */

   renderComponent: function() {
      inputEx.MultiSelectField.superclass.renderComponent.call(this);
      
      this.ddlist = new inputEx.widget.DDListCustom({parentEl: this.fieldContainer,listSelectOptions: this.listSelectOptions, maxItems: this.maxItems, maxItemsAlert: this.maxItemsAlert });
      
   }
});

})();
