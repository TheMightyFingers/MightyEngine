(function( $ ) {
	
	$.widget("custom.boolean", {
		_create: function(){
			var that = this;
			this.element.parent().addClass("special");
			this.element.hide();
			this.element[0].cbs.push(function(val){
				if(val == false){
					that.wrapper.find(".active").removeClass("active");
					that.wrapper.find(".valueFalse").addClass("active");
				}
				else{
					that.wrapper.find(".active").removeClass("active");
					that.wrapper.find(".valueTrue").addClass("active");
				}
			});
			var val = this.element.val();
			
			var valueTrue = "", valueFalse = "";
			if(val == "true"){
				valueTrue = "active";
			}
			else{
				valueFalse = "active";
			}
			
			this.wrapper = $('<span />')
				.addClass("custom_boolean")
				.html('<span class="'+valueTrue+' valueTrue"><span class="true">true</span></span><span class="'+valueFalse+' valueFalse"><span class="false">false</span></span>');
				
			
			
			this.wrapper.on("click", function(e){
				var t = $(e.target);
				if(t.html() == "false"){
					that.element[0].setValue(false);
					that.wrapper.find(".active").removeClass("active");
					t.parent().addClass("active");
				}
				else if(t.html() == "true"){
					that.element[0].setValue(true);
					that.wrapper.find(".active").removeClass("active");
					t.parent().addClass("active");
				}
			});
			
			this.wrapper.insertAfter( this.element );
		}
	});
	
	
	$.widget("custom.adjust", {
		_create: function(){
			this.element.hide();
			/*
			<span class="custom_adjust">
				<span class="ca_current">999</span>
				
			</span> 
			*/
			
			this.element.parent().addClass("special");
			
			this.wrapper = $( "<span>" )
				.addClass( "custom_adjust" )
				.insertAfter( this.element );
			
			this.input = $("<input />")
				.addClass("ca_current")
			;
			
			this.arrows = $(''+
				'<span class="ca_arrows">'+
					'<span class="ca_up"></span>'+
					'<span class="ca_down"></span>'+
				'</span>');
			
			this.wrapper.append(this.input);
			this.wrapper.append(this.arrows);
			
			
			var step = parseFloat(this.element.attr("step")) || 1;
			var min = parseFloat(this.element.attr("min"));
			var max = parseFloat(this.element.attr("max"));
			var val = parseFloat(this.element.val());
			
			this.input.val(val);
			
			var that = this;
			this.input.on("keyup", function(){
				//that.input.val(val);
				that.element[0].setValue(this.value);
				val = this.value;
			});
			
			
			this.wrapper.on("click",function(e){
				
				if(isNaN(val)){
					val = 0;
				}
				if($(e.target).hasClass("ca_up")){
					val += step;
				}
				else if($(e.target).hasClass("ca_down")){
					val -= step;
				}
				if(!isNaN(min) && val < min ){
					val = min;
				}
				if(!isNaN(max) && val > max){
					val = max;
				}
				that.input.val(val);
				that.element[0].setValue(val);
			});
			
			this.wrapper.on("mousewheel", function(e){
				if(e.originalEvent && e.originalEvent.wheelDelta){
					if(e.originalEvent.wheelDelta > 0){
						if(isNaN(val)){
							val = 0;
						}
						val += step;
					}
					else if(e.originalEvent.wheelDelta < 0){
						if(isNaN(val)){
							val = 0;
						}
						val -= step;
					}
					that.input.val(val);
					that.element[0].setValue(val);
				}
			});
			
			
			
			
		}
		
		
		
		
		
	});
	
	
	$.widget( "custom.combobox", {
		_create: function() {
			this.wrapper = $( "<span>" )
			.addClass( "custom_select" )
			.insertAfter( this.element );
			
			
			this.element.initialValue = this.element.val();
			
			
			
			this.element.hide();
			this._createAutocomplete();
			this._createShowAllButton();
		},
		
		_createAutocomplete: function() {
			var selected = this.element.children( ":selected" ),
				value = selected.val() ? selected.text() : "";
			
			this.element.initialText = selected.text();
				
			this.input = $( "<input>" )
			.appendTo( this.wrapper )
			.val( value )
			.attr( "title", "" )
			.addClass( "custom-combobox-input ui-widget ui-widget-content ui-state-default ui-corner-left" )
			.autocomplete({
				delay: 0,
				minLength: 0,
				source: $.proxy( this, "_source" )
			});
			/*.tooltip({
				tooltipClass: "ui-state-highlight"
			});*/
			
			this._on( this.input, {
				autocompleteselect: function( event, ui ) {
					ui.item.option.selected = true;
					this._trigger( "select", event, {
						item: ui.item.option
					});
					this._trigger( "onchange", event, {
						item: ui.item.option
					});
					$(ui.item.option).parent()[0].setValue($(ui.item.option).val());
				},
				
				autocompletechange: "_removeIfInvalid"
			});
		},
		
		_createShowAllButton: function() {
			var input = this.input,
				wasOpen = false;
			
			$( "<a>" )
			.attr( "tabIndex", -1 )
			.addClass("cs_arrow")
			.attr( "title", "Show All Items" )
			//.tooltip()
			.appendTo( this.wrapper )
			.removeClass( "ui-corner-all" )
			.mousedown(function() {
				wasOpen = input.autocomplete( "widget" ).is( ":visible" );
			})
			.click(function() {
				input.focus();
				
				// Close if already visible
				if ( wasOpen ) {
					return;
				}
				
				// Pass empty string as value to search for, displaying all results
				input.autocomplete( "search", "" );
			})
			.html("<span></span>");
		},
		
		_source: function( request, response ) {
			var matcher = new RegExp( $.ui.autocomplete.escapeRegex(request.term), "i" );
			response( this.element.children( "option" ).map(function() {
				var text = $( this ).text();
				if ( this.value && ( !request.term || matcher.test(text) ) )
					return {
						label: text,
						value: text,
						option: this
					};
			}) );
		},
		
		_removeIfInvalid: function( event, ui ) {
			
			// Selected an item, nothing to do
			if ( ui.item ) {
				return;
			}
			
			// Search for a match (case-insensitive)
			var value = this.input.val(),
				valueLowerCase = value.toLowerCase(),
				valid = false;
			this.element.children( "option" ).each(function() {
				if ( $( this ).text().toLowerCase() === valueLowerCase ) {
					this.selected = valid = true;
					return false;
				}
			});
			
			
			
			// Found a match, nothing to do
			if ( valid ) {
				this.element.initialValue = value;
				var selected = this.element.children( ":selected" ),
				value = selected.val() ? selected.text() : "";
			
				this.element.initialText = selected.text();
				return;
			}
			
			// Remove invalid value
			this.input
			.val(  this.element.initialText  )
			//.attr( "title", value + " didn't match any item" )
			.tooltip( "open" );
			this.element.val( this.element.initialValue );
			this.input.data( "ui-autocomplete" ).term = "";
		},
		
		_destroy: function() {
			this.wrapper.remove();
			this.element.show();
		}
	});
})( jQuery );
