(function() {

   var lang = YAHOO.lang, Dom = YAHOO.util.Dom, Event = YAHOO.util.Event;


/**
 * InPlaceEditable datatable using inputEx fields
 * @class inputEx.widget.dtInPlaceEdit
 * @extends inputEx.widget.DataTable
 * @constructor
 * @param {Object} options Options
 */
inputEx.widget.dtInPlaceEdit = function(options) {
   inputEx.widget.dtInPlaceEdit.superclass.constructor.call(this, options);
 	
};

lang.extend(inputEx.widget.dtInPlaceEdit, inputEx.widget.DataTable , {
	
	renderDatatable: function() {
		inputEx.widget.dtInPlaceEdit.superclass.renderDatatable.call(this);
		
		 // Force save on blur event
		this.datatable.onEditorBlurEvent = function(oArgs) {
			if(oArgs.editor.save) {
			    oArgs.editor.save();
			} 
		};
		
		// When the cellEditor fires the "editorSaveEvent"
		this.datatable.subscribe("editorSaveEvent",function(oArgs){
			var record = oArgs.editor.getRecord();		
			// If the record got an id (meaning it isn't a new Row that the user didn't add yet)
			if( !YAHOO.lang.isUndefined(record.getData('id')) ){
				// If the data in the cellEditor changed
				if(oArgs.newData != oArgs.oldData){
					this.itemModifiedEvt.fire(record);
				}
			}
				
		}, this, true);
		
	},


   /**
    * Additional options
    */
   setOptions: function(options) {
     inputEx.widget.dtInPlaceEdit.superclass.setOptions.call(this, options);
     
     this.options.allowModify = false;
     this.options.editableFields = options.editableFields; 
   },
   
   /**
    * Make the datatable inplace editable with inputEx fields
    */
   initEditor: function() {
      
      // Set up editing flow
      var highlightEditableCell = function(oArgs) {
          var elCell = oArgs.target;
          if(YAHOO.util.Dom.hasClass(elCell, "yui-dt-editable")) {
              this.highlightCell(elCell);
          }
      };

      this.datatable.subscribe("cellMouseoverEvent", highlightEditableCell);
      this.datatable.subscribe("cellMouseoutEvent", this.datatable.onEventUnhighlightCell);
		

   },
   
   /**
    * Convert a single inputEx field definition to a DataTable column definition
    */
   fieldToColumndef: function(field) {
      var columnDef = {
         key: field.inputParams.name,
         label: field.inputParams.label,
         sortable: this.options.sortable, 
         resizeable: this.options.resizeable
      };

      // In cell editing if the field is listed in this.options.editableFields
      if(lang.isArray(this.options.editableFields) ) {
         if(inputEx.indexOf(field.inputParams.name, this.options.editableFields) != -1) {
             columnDef.editor = new inputEx.widget.CellEditor(field);
         }
      }
      
      // Field formatter
      if(field.formatter) {
         columnDef.formatter = field.formatter;
      }
      else {
         if(field.type == "date") {
            columnDef.formatter = YAHOO.widget.DataTable.formatDate;
         }
      }
      // TODO: other formatters
      return columnDef;
   },

   /**
    * Handling cell click events
    */
   _onCellClick: function(ev,args) {
      var target = Event.getTarget(ev);
      var column = this.datatable.getColumn(target);      
      var rowIndex = this.datatable.getTrIndex(target);
      var record = this.datatable.getRecord(target);

      if (column.key == 'delete') {
			if( !YAHOO.lang.isUndefined(record.getData('id')) ){
	         if (confirm(inputEx.messages.confirmDeletion)) {
	            if(this.editingNewRecord) {
	               this.editingNewRecord = false;
	            }
	            else {
	               this.itemRemovedEvt.fire( record );
	            }
	            this.datatable.deleteRow(target);
	            this.hideSubform();
	         }
			}
      }
      else if(column.key == 'modify') {
         this.onClickModify(rowIndex);
      } 
      else {				
      	this.onCellClick(ev,rowIndex);
      }
   },

   /**
    * Public handler - When clicking on one of the datatable's cells
    */
   onCellClick: function(ev, rowIndex) {
		
		// Get a particular CellEditor
		var elCell = ev.target, oColumn;
		elCell = this.datatable.getTdEl(elCell);
		if(elCell) {

			oColumn = this.datatable.getColumn(elCell);
			if(oColumn && oColumn.editor) {
				var oCellEditor = this.datatable._oCellEditor;
				// Clean up active CellEditor
				if(oCellEditor) {
					// Return if field isn't validated
					if( !oCellEditor._inputExField.validate() ) {
						return;
					}
				}
			}
		}

		// Only if the cell is inputEx valid
		this.datatable.onEventShowCellEditor(ev);
		
   },

	/**
    * When clicking on the "insert" button to add a row
    */
	onInsertButton: function(e) {
		var tbl = this.datatable;

      // Insert a new row
      tbl.addRow({});
 				
      // Select the new row
      var lastRow = tbl.getLastTrEl();
		tbl.selectRow(lastRow);
		
		// Get the last cell's inner div node
		var lastIndex = lastRow.childNodes.length - 1;
		lastCell = lastRow.childNodes[lastIndex].childNodes[0];
		
		// Empty the cell (removing "delete")
		lastCell.innerHTML = '';
		
		// Create an "Add" Button
		this.addButton = inputEx.cn('input', {type:'button',value:inputEx.messages.addButtonText}, null, null);
      Event.addListener(this.addButton, 'click', this.onAddButton, this, true);
      lastCell.appendChild(this.addButton);

		// Create a "Cancel" Button
		this.deleteButton = inputEx.cn('input', {type:'button',value:inputEx.messages.cancelText}, null, null);
		Event.addListener(this.deleteButton, 'click', this.onCancelButton, this, true);
      lastCell.appendChild(this.deleteButton);

		// Disable the "Insert Button"
		this.insertButton.disabled = true ;
	},
   
	onAddButton: function(e) {	
		var target = Event.getTarget(e);
      var record = this.datatable.getRecord(target);
		
		target.parentNode.innerHTML = inputEx.messages.deleteText;
		
		this.datatable.unselectRow(record);
		this.insertButton.disabled = false ;
		
		this.itemAddedEvt.fire(record);
		Event.stopEvent(e);	
	},
	
	onCancelButton: function(e) {
		var target = Event.getTarget(e);
		
		this.datatable.deleteRow(target);
    	this.insertButton.disabled = false ;
		Event.stopEvent(e);
	}
   
});




/**
 * The CellEditor class provides functionality for inline editing in datatables
 * using the inputEx field definition.
 *
 * @class inputEx.widget.CellEditor
 * @extends YAHOO.widget.BaseCellEditor 
 * @constructor
 * @param {Object} inputExFieldDef InputEx field definition object
 */
inputEx.widget.CellEditor = function(inputExFieldDef) {
    this._inputExFieldDef = inputExFieldDef;
   
    this._sId = "yui-textboxceditor" + YAHOO.widget.BaseCellEditor._nCount;
	 YAHOO.widget.BaseCellEditor._nCount++;
    inputEx.widget.CellEditor.superclass.constructor.call(this, "inputEx", {disableBtns:false});
};

// CellEditor extends BaseCellEditor
lang.extend(inputEx.widget.CellEditor, YAHOO.widget.BaseCellEditor,{
	
	
   /**
    * Render the inputEx field editor
    */
   renderForm : function() {
   
      // Build the inputEx field
      this._inputExField = inputEx(this._inputExFieldDef);
      this.getContainerEl().appendChild(this._inputExField.getEl());
   },

   /**
    * Resets CellEditor UI to initial state.
    */
   resetForm : function() {
       this._inputExField.setValue(lang.isValue(this.value) ? this.value.toString() : "");
   },
	
   /**
    * Sets focus in CellEditor.
    */
   focus : function() {
      this._inputExField.focus();
   },

   /**
    * Returns new value for CellEditor.
    */
   getInputValue : function() {
      return this._inputExField.getValue();
   },

	/**
	 * When clicking the save button but also when clicking out of the cell
	 */
	save: function() {
		// Save only if cell is validated
		if(this._inputExField.validate()) {	    
			inputEx.widget.CellEditor.superclass.save.call(this);	    
		}
	},
	
	cancel: function() {
		inputEx.widget.CellEditor.superclass.cancel.call(this);
	}
	

});

// Copy static members to CellEditor class
lang.augmentObject(inputEx.widget.CellEditor, YAHOO.widget.BaseCellEditor);

})();