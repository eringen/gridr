/*jslint undef: true, browser: true */

/*global jQuery*/

/**
 * Plugin for handling right-click event for jquery 1.3+
 *
 * Copyrighted by Morten Sjoegren <m_abs_AT_mabs.dk> Denmark 2009
 *
 * Licensed under MIT
 * ---------------------------------------------------------------------------------------------------
 *  Copyright (c) 2009 Morten Sjoegren <m_abs_AT_mabs.dk> 
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 * ---------------------------------------------------------------------------------------------------
 */

/*****************************************************************************************************
 * Changelog:
 *		v1.0	Initial release.
 ****************************************************************************************************/

( function( $ ) {
	//// Private variables:

	// Define values for the three mouse buttons.
	var left_button = 0;
	var middel_button = 1;
	var right_button = 2;

	//// Private functions

	// Forward declair function "clear_temp_events", this is going to be used to remove temporary events from the right-click element.
	var clear_temp_events = function( ) {};

	// Handle the mouseup-event, this is the event that actually triggers the action we want for the right-click.
	var mouseup_event = function( e ) {
		// data contains our callback function amd the mousedown event object.
		var data = e.data;

		// Get the event-object from the mousedown-event, as this object has the information about which button was clicked. Fallback to the mouseup event object to avoid thrown exceptions if data.evt doesn't exist, this will effectively stop disable this event from doing its job.
		var evt = data.evt || e;
		
		// Remove the mouseup_event from the event stack for this object
		clear_temp_events.call( this, evt );
		if (  evt.button == right_button && data && $.isFunction( data.callback ) ) {
			// since we have both a callback function and we known the button clicked was the right one, call the callback function.
			var res = data.callback.call( this, evt );
			if ( typeof res == "boolean" ) {
				return res;
			} else {
				return false; // Stop default behavior.
			}
		} else {
			return true;
		}
	};

	// Handle the mousedown-event, this is needed to detech that the right_button var clicked. 
	var mousedown_event = function( e ) {
		var data = e.data; // The data object for this event.
		if ( data && $.isFunction( data.callback ) && e.button == right_button ) {
			data.evt = e; // the mouseup event needs the event object from this event.
			$( this ).bind( "mouseup", data, mouseup_event ).bind( "mouseleave", clear_temp_events );
		}
	};

	// This funciton removes temporary event functions from the element.
	clear_temp_events = function( ) {
		var el = $( this );

		el.unbind( "mouseup", mouseup_event );
		el.unbind( "mouseleave", clear_temp_events );
	};

	// Event function for handling the browsers build-in right-click menu. Used by $.fn.disableContextMenu
	var no_contextmenu = function( e ) {
		var el = $( this );

		var condition_event = el.data( "no_right_click_condition" );

		var res;
		if ( $.isFunction( condition_event ) ) {
			res = condition_event.call( this, e );
		} 

		if ( typeof res == "boolean" ) {
			return res;
		} else {
			return false;
		}
	};

	/// Public functions

	// Disable the browsers build-in right-click menu.
	// condition_event is a event-function which checks if the menu should be disabled. If condition_event returns false the build-in menu is disabled.
	// If condition_event isn't provided, the right-click menu is always disabled.
	$.fn.disableContextMenu = function( condition_event ) {
		$( this ).each( function( ) {
			var el = $( this );

			// Check if this is already set on this element
			if ( el.data( "stop_right_click_enabled" ) ) {
				return;
			}

			el.data( "stop_right_click_enabled", true );
			el.data( "no_right_click_condition", condition_event );

			this.oncontextmenu = no_contextmenu;
		} );

		return this;
	};

	// Remove the disabling of the build-in contextmenu.
	$.fn.enableContextMenu = function( ) {
		$( this ).each( function( ) {
			var el = $( this );

			// Only remove the disabledContextMenu if it's actually set. 
			if ( el.data( "stop_right_click_enabled" ) ) {
				el.removeData( "stop_right_click_enabled" );
				el.removeData( "no_right_click_condition" );

				this.oncontextmenu = undefined;
			}
		} );

		return this;
	};
	
	// Bind a right click event to the DOM-elements
	$.fn.rightClick = function( callback, contextmenu_condition_event ) {
		// callback is required
		if ( !callback || !$.isFunction( callback ) ) {
			return this;
		}

		// We only want to apply this to elements that it hasn't already been applied too.
		var els;
		$( this ).each( function( ) {
			var el = $( this );
			// If this element has the data "right_click_enabled", skip it.
			if ( el.data( "right_click_enabled" ) ) {
				return;
			}

			if ( !els ) {
				els = el;
			} else {
				els = els.add( el );
			}
		} );

		// Stop if no valid elements have been found.
		if ( !els || els.size( ) === 0 ) {
			return this;
		}

		// Bind the mousedown-event to the found elements.
		els.bind( "mousedown", {
			callback : callback
		}, mousedown_event );

		els.disableContextMenu( contextmenu_condition_event );

		// Mark the elements with the right_click_enabled to indicate that this has been applied.
		els.data( "right_click_enabled", true );
		return els;
	};

	// Remove the right-click event-handling
	$.fn.removeRightClick = function( ) {
		$( this ).each( function( ) {
			var el = $( this );
			if ( el.data( "right_click_enabled" ) ) {
				el.unbind( "mousedown", mousedown_event );
				el.removeData( "right_click_enabled" );
				clear_temp_events.call( el );
				
				el.enableContextMenu( );
			}
		} );
		
		return this;
	};
} )( jQuery );
