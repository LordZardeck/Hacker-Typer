/**
 *	HackerTyper
 *
 *	JQuery plugin that takes a file or string input to display on screen as if being "typed".
 *	The plugin can either type the text on it's own, or based on keypresses of user
 *
 *	@author		LordZardeck <sean@blackfireweb.com>
 *	@version	1.0
 *	@license	Creative Commons Attribution-Noncommercial-Share Alike 3.0
 *	@copyright	Copyright 2011 Simone Masiero. Some Rights Reserved
 */
(function($){

	function InvalidParameter(parameterName, parameterType) {

	    this.name = "InvalidParameter";
	    this.message = "Parameter " + parameterName + " is expected to be an instance of " + parameterType;

	}	
	InvalidParameter.prototype = Error.prototype;

	/**
	 *	Main typer class
	 *
	 *	@param 	{jQuery}	element	- The element which the code will be written to
	 *  @param  {object}	options - Various options changing how HackerTyper will behave
	 */
	function HackerTyper(element, options) {

		var $self = this;

		this.$el = element;
		this.index = 0;

		// Add the options to the class variables
		$.extend(this, options);

		// Ensure we are working with the right values
		if(!(this.$el instanceof jQuery))
			throw new InvalidParameter("element", "jQuery");
		if(typeof this.text !== "string")
			throw new InvalidParameter("text", "string");

		// Set up the blinking cursor interval
		this.blinkingCursorTimer = setInterval($.proxy(function() { 
			// If last char is the cursor remove it, else write it
			this.lastChrIsCursor() && this.removeCursor() || this.write("|"); 
		}, $self), 500);	

	}

	/**
	 *	Writes text to the end of the element
	 */
	HackerTyper.prototype.write = function( text ) { 
		this.$el.append(text); 
	}

	/**
	 *	Returns the html within the element
	 */
	HackerTyper.prototype.getContent = function( ) { 
		return this.$el.html(); 
	}

	/**
	 *	Overwrites all content in the element
	 */
	HackerTyper.prototype.setContent = function( val ) { 
		this.$el.html( val ); 
	}

	/**
	 *	Returns a boolean whether or not the last character is the cursor
	 */	 
	HackerTyper.prototype.lastChrIsCursor = function( ) { 
		// Check the last character of the content for the cursor
		return this.getContent().substr(-1) === "|"; 
	}

	/**
	 *	Removes the cursor from the element if it exists
	 */
	HackerTyper.prototype.removeCursor = function( ) { 

		// Get the current content
		var content = this.getContent();
		// Is the cursor in the content?
		if(this.lastChrIsCursor()) 
			// If so, overwrite the content, removing the cursor
			this.setContent(content.substr(0, content.length - 1));

	}

	/**
	 *	Adds the next set of text from the code to the element
	 *	based on the speed setting
	 */
	HackerTyper.prototype.addText = function( ) {

		if(!this.text)
			return;

		// Determine the index increment
		var increment = this.speed - ((this.control == $.HackerTyper.control.keyPress) ? 1 : 6);

		// add to the index the speed
		this.index += (increment > 0)? increment : 1;	

		var text = $("<div/>").text(this.text.substring(0, this.index)).html(), // parse the text for stripping html enities
			rtn = new RegExp("\n", "g"), // newline regex
			rts = new RegExp("\\s", "g"), // whitespace regex
			rtt = new RegExp("\\t", "g"); // tab regex

		// if the last char is the blinking cursor remove it before adding the text
		this.removeCursor();

		// replace newline chars with br, tabs with 4 space and blanks with an html blank
		this.$el.html(
			text
				.replace(rtn, "<br/>")
				.replace(rtt, "&nbsp;&nbsp;&nbsp;&nbsp;")
				.replace(rts, "&nbsp;")
		);

		// scroll to make sure bottom is always visible
		if(this.scrollTarget == $.HackerTyper.scrollTarget.element)
			this.$el.scrollTop(this.$el[0].scrollHeight); 
		if(this.scrollTarget == $.HackerTyper.scrollTarget.window)
			$("html,body").scrollTop($(document).height());

	}

	$.extend({
		HackerTyper: {
			control: {
				keyPress: 1,
				timer: 2				
			},

			scrollTarget: {
				window: 1,
				element: 2
			},

			//create Access Granted popUp      FIXME: popup is on top of the page and doesn't show is the page is scrolled
			showAccess: function() { 
				$.HackerTyper.hideAccess(); // hide all popups
				$("<div>").addClass("access granted hacker-typer").html("<h1>ACCESS GRANTED</h1>").hide().prependTo(document.body).fadeIn();	
			},

			//create Access Denied popUp      FIXME: popup is on top of the page and doesn't show is the page is scrolled
			showDenied: function() {
				$.HackerTyper.hideAccess(); // hide all popups

				$("<div>").addClass("access granted hacker-typer").html("<h1>ACCESS DENIED</h1>").hide().prependTo(document.body).fadeIn();	
			},

			// remove all existing popups
			hideAccess: function() { $(".hacker-typer.access").remove(); }
		}
	});

	$.fn.HackerTyper = function(options) {

		// Clear the typer
		if(options == 'reset') {
			finish();

			return this;
		}

		// Don't create another typer over the same element
		if(this.data('hackertyper-has-typer') !== true)
			this.data('hackertyper-has-typer', true);
		else
			return this;

		// Set up the default values and merge them with the options
		var defaults = {
				text: null,
				speed: 4,
				file: null,
				complete: function(){},
				control: $.HackerTyper.control.keyPress,
				scrollTarget: $.HackerTyper.scrollTarget.element,
				allowedKeys: [122]
			},
			options = $.extend(defaults, options),
			$self = this, 
			typer;

		this.addClass('hacker-typer-console');

		// If a file was defined, get it
		if(options.file !== null) {
			// get the text file
			$.get(options.file, function(data){
                options.text = data; // save the textfile in Typer.text
                start();
            });
		}
		else
			start();

		// Start the typer
		function start() {
			typer = new HackerTyper($self, options);

			$self.data('hackertyper-typer', typer);

			// Automated typing
			if(options.control === $.HackerTyper.control.timer) {

				$self.data('hackertyper-automated-interval', setInterval(function(){				
					typer.addText();

					// If the typer has reached the end, clear the events and call the complete callback
					if(typer.text && typer.text.length <= typer.index) 
						finish();
				}, Math.floor(75 / options.speed)));

			}

			if(options.control === $.HackerTyper.control.keyPress) {

				$( document ).keydown(
		            function ( key ) { 

			            typer.addText();
	                 
	                	if($.inArray(key.keyCode, options.allowedKeys) == -1) { 

	                		if(key.preventDefault)
	                			key.preventDefault();
	                		
	                        key.returnValue = false;

	                	}

	                	// If the typer has reached the end, clear the events and call the complete callback
						if(typer.text && typer.text.length <= typer.index) 
							finish();
		                
		            }
			    );

			}

		}	

		// Clean up the typer
		function finish() {
			this.data('hackertyper-has-typer', false);
			clearInterval($self.data('hackertyper-automated-interval'));
			clearInterval($self.data('hackertyper-typer').blinkingCursorTimer);
			options.complete();
		}		

	}
})(window.jQuery);