/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 by Hitachi Vantara, LLC : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2029-07-20
 ******************************************************************************/


/**
 * Utility methods designed for general use
 */

define("common-ui/util/util", ["dijit/registry", "dojo/dom"], function(registry, dom) {
  return {

  /**
     * Parse the parameters from the current URL.
     *
     * @return Map of decoded parameter names and values
     */
    getUrlParameters: function() {
      var urlParams = {};
      var e,
        a = /\+/g,  // Regex for replacing addition symbol with a space
        reg = /([^&=]+)=?([^&]*)/g,
        decode = function (s) { return decodeURIComponent(s.replace(a, " ")); },
        query = window.location.search.substring(1);

      while (e = reg.exec(query)) {
        var paramName = decode(e[1]);
        var paramVal = decode(e[2]);

        if (urlParams[paramName] !== undefined) {
          paramVal = $.isArray(urlParams[paramName])
            ? urlParams[paramName].concat([paramVal])
            : [urlParams[paramName], paramVal];
        }
        urlParams[paramName] = paramVal;
      }
      return urlParams;
    },

    /**
     * Parses the language portion of a locale URL parameter, if defined.
     *
     * @return language portion of the URL parameter "locale". If it is not defined, undefined is returned.
     */
    getLocale: function() {
      var locale = this.getUrlParameters().locale;
      if (locale && locale.length > 2) {
        locale = locale.substring(0, 2);
      }
      return locale;
    },


    /**
     * Used by localizeDom, not intended for direct calling
     * @param key
     * @param text
     */
    localizeDomCtrl: function(key, text, idPrefix) {

      var prop = null;
      var e = null;
      var id = null;
      var prefix = idPrefix || "";

      if(key.indexOf('_label') == key.length-6 ) {
        id = key.substr(0, key.length-6);
        prop = 'label';
      } else if(key.indexOf('_title') == key.length-6 ) {
        id = key.substr(0, key.length-6);
        prop = 'title';
      } else if(key.indexOf('_content') == key.length-8 ) {
        id = key.substr(0, key.length-8);
        prop = 'inner';
      } else if(key.indexOf('_legend') == key.length-7 ) {
        id = key.substr(0, key.length-7);
        prop = 'legend';
      } else if(key.indexOf('_header') == key.length-7 ) {
        id = key.substr(0, key.length-7);
        prop = 'header';
      } else if(key.indexOf('_button') == key.length-7 ) {
        id = key.substr(0, key.length-7);
        prop = 'inner';
      }

      if(id != null) {
        id = prefix + id;
        if(this[id]) {
          e = this[id];
        } else {
          e = registry.byId(id);
          if(!e) {
            e = dom.byId(id);
          }
        }
      }
      var index = -1;
      if(!e) {
        // see if there are indexed items
        e = dom.byId(id+'1');
        if(e) {
          index = 1;
        }
      }
      while(e && prop) {
        if(prop == 'inner') {
          if(e.domNode) {
            e = e.domNode;
          }
          e.innerHTML = text;
        }
        else if(prop == 'legend') {
          // this is for field set legends
          if (e.firstElementChild === undefined) {
            var child = e.firstChild;
            while (child) {
              if (child.nodeType == 1 /*Node.ELEMENT_NODE*/) {
                child.innerHTML = text;
                break;
              }
              child = child.nextSibling;
            }
          }
          else {
            e.firstElementChild.innerHTML = text;
          }
        }
        else if(prop == 'label' && e.setLabel) {
          // this is for Dojo menu items
          e.setLabel(text);
        }
        else if(prop == 'title' && e.setTitle) {
          e.setTitle(text);
        }
        else if(e.set) {
          e.set(prop, text);
        }
        else if(prop == 'title' && e.title) {
          e.title = text;
        }
        if(index != -1) {
          index++;
          e = dojo.byId(id+index);
        } else {
          e = null;
        }
      }
    },

    /**
     * Inject localization strings into DOM elements using a naming convention.
     * <p>
     * Iterates over all keys in the bundle (assumed to have been previously loaded) and matches them to
     * DOM elements ID based on a naming convention.
     * <code>
     *   errorMessage_label=Here is an error Message.
     * </code>
     * errorMessage will be the DOM id it tries to match on and label is the type of element to set the value on.
     * Supported types:
     * <ul>
     *   <li>label: sets a label</li>
     *   <li>title: sets a title</li>
     *   <li>legend - sets a legend in a fieldset</li>
     *   <li>content : sets innerHTML</li>
     * </ul>
     * </p>
     * @param bundleName - name of the mesages bundle to use as the source for translations
     * @param prefix - id prefix to match on when getting id's from the dom
     */
    localizeDom: function(/*String*/ bundleName, /*Optional|String*/ prefix) {
      var key;
      if(pentaho && pentaho.common && pentaho.common.Messages) {
        var bundle = pentaho.common.Messages.getBundle(bundleName);
        if (bundle) {
          for (key in bundle) {
            if (bundle.hasOwnProperty(key)) {
              this.localizeDomCtrl(key, pentaho.common.Messages.getString(key), prefix);
            }
          }
        }
      } else {
        console.log("pentaho.common.Messages not available for localizing the DOM");
      }
    },

    /**
     * Checks if the type is numeric
     *
     * @name util#_isNumberType
     * @method
     * @param {String} type
     * @return {Boolean} if the type is a numeric type
     */
    isNumberType: function (type) {
      var whiteList = ["java.lang.Number", "java.lang.Byte", "java.lang.Double", "java.lang.Float", "java.lang.Integer",
        "java.lang.Long", "java.lang.Short", "java.math.BigDecimal", "java.math.BigInteger"];
      return whiteList.indexOf(type) >= 0;
    },

    /**
     * Converts a locale name to the dojo/i18n notion
     *
     * @name util#normalizeDojoLocale
     * @method
     * @param {String} locale
     * @return {String} dojo representation of the locale (lowercase, delimited with hyphens) or "en" if conversion's failed.
     */
    normalizeDojoLocale: function(locale) {
      return locale.match( /^[a-z]{2}(?:[-_][a-z]{2}){0,2}$/i ) ? locale.replace( /_/g, "-" ).toLowerCase() : "en";
    },

    /**
     * Converts timezone string without ":" (ex: "+0500" ) to a compatible timezone string including ":"
     * Although most browsers support this format, the standard for a timezone string should be "+00:00" for example.
     * @name util#convertTimezoneToStandardFormat
     * @method
     * @param {String} timezone will be in the format of "<+|->[x]xxx either by itself or ending a date. Ex: +600 or +0000 or -0530 or 2020-11-01T00:00:00.000-0700
     * @return {String} timezone string including ":" separating hours and minutes, or the exact same string if the format provided is not correct"
     */
    convertTimezoneToStandardFormat: function(timezone) {
      var tzRegex = /^.*[+-]{1}\d{3,4}$/;
      var match = timezone.match(tzRegex);
      if (match && match.length > 0) {
        var indexToInsert = timezone.length - 2;
        return timezone.slice(0, indexToInsert) + ":" + timezone.slice(indexToInsert);
      }
      return timezone;
    }
  }
});
