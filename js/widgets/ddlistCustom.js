(function() {

   var lang = YAHOO.lang;
   var inputEx = YAHOO.inputEx;
   
inputEx.widget.DDListCustom = function(options) {
  
	this.listSelectOptions = options.listSelectOptions;
	this.maxItems = options.maxItems;
	this.maxItemsAlert = options.maxItemsAlert;

	inputEx.widget.DDListCustom.superclass.constructor.call(this,options);

	this.selects = [];
};
YAHOO.lang.extend(inputEx.widget.DDListCustom,inputEx.widget.DDList,{
/**
    * Add an item to the list
    * @param {String|Object} item Either a string with the given value or an object with "label" and "value" attributes
    */
   addItem: function(item) {

      if (this.maxItems && this.items.length >= this.maxItems){
				this.maxItemsAlert ? this.maxItemsAlert.call() : alert("You're limited to "+this.maxItems+" items");
			  return;	
			}
      var li = inputEx.cn('li', {className: 'inputEx-DDList-item'});
      
      if(this.listSelectOptions){
        var select = new inputEx.SelectField(this.listSelectOptions); 
        this.selects.push(select);
        li.appendChild(select.el);
		  }
      li.appendChild( inputEx.cn('span', null, null, (typeof item == "object") ? item.label : item) );
 

      // Option for the "remove" link (default: true)
		if(!!this.options.allowDelete){
			var removeLink = inputEx.cn('div', {className:"removeButton"}, null, ""); 
	      li.appendChild( removeLink );
	      Event.addListener(removeLink, 'click', function(e) {
	         var a = Event.getTarget(e);
	         var li = a.parentNode;
	         this.removeItem( inputEx.indexOf(li,this.ul.childNodes) );
	      }, this, true);
      }

      var dditem = new inputEx.widget.DDListItem(li);
      dditem._list = this;
      
      this.items.push( (typeof item == "object") ? item.value : item );
      
      this.ul.appendChild(li);
   }


});
})();
