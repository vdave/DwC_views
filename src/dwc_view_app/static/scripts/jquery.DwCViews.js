// ******** //
/*
TODO:
   recordTable: hover over value shows whole value as popup (like image popup)
   recordTable: formatting
   recordsTable: cache field option - per field
   recordsTable: cache fields option - all fields
   recordsTable: special class for active (single record) row
   recordsTable: row number field to be handled in fields array
   recordsTable: nPage(n) function - jump to page number "n"
   mapView: realtime scroll/move/zoom marker querying
   all: various hook options
*/
// ******** //
(function($) {

  /***************************************************************************
   * DwCViews
   *
   * Creates a self-contained suite of objects for browsing data from a
   * Darwin Core database.
   ***************************************************************************/

  $.DwCViews = function(element, options) {

    this.options = {};

    // store this object instance in the main element's .data() attribute
    element.data('DwCViews', this);

    this.init = function(element, option) {

      // merge default options and options passed into the function
      this.options = $.extend({}, $.DwCViews.defaultOptions, options);

      // create a handle on the DOM element
      this.element = element;

      this.gatewayAddress = this.options.gatewayAddress;
      this.baseDir = this.options.baseDir;
      this.showToolbar = this.options.showToolbar;
      this.fields = this.options.fields;
      this.recordTable = this.options.recordTable;
      this.recordTableOptions = this.options.recordTableOptions;
      this.viewPicker = this.options.viewPicker;
      this.viewPickerOptions = this.options.viewPickerOptions;
      this.recordsTable = this.options.recordsTable;
      this.recordsTableOptions = this.options.recordsTableOptions;
      this.onInit = this.options.onInit;
      this.onSearch = this.options.onSearch;

      setupViews(this);

      // set up an onInit/onLoad hook if an onInit function was defined
      if (typeof(this.onInit) == 'function') {
        this.onInit(this);
      }

    }

  
  /***************************************************************************
   * DwCViews - Begin Public Functions
   ***************************************************************************/

   // this.pubFunction = function() {}


  /***************************************************************************
   * DwCViews - Final Initialization Call
   ***************************************************************************/

    this.init(element, options);

  };


  /***************************************************************************
   * DwCViews - Namespace Declaration
   ***************************************************************************/

  $.fn.DwCViews = function(options) {
    return this.each(function() {
      (new $.DwCViews($(this), options));
    });
  };


  /***************************************************************************
   * DwCViews - Default Options
   ***************************************************************************/

  $.DwCViews.defaultOptions = {
    gatewayAddress: "",
    baseDir: "/gateway/",
    globalDefaultValue: '',
    showToolbar: true,
    recordTable: null,
    recordTableOptions: null,
    viewPicker: null,
    viewPickerOptions: null,
    recordsTable: null,
    recordsTableOptions: null,
    mapView: null,
    mapViewOptions: null,
    fieldsTable: null,
    fieldsTableOptions: null,
    onInit: null,
    onSearch: null
  };


  /***************************************************************************
   * DwCViews - Begin Private Functions
   ***************************************************************************/

  function setupViews(obj) {
    var toolbar;
    var search_box;
    var search_button;
    var record_table;
    var view_picker;
    var records_table;
    var map_view;
    var search_options;

    // style-ize the parent element
    obj.element.addClass('DwCViews');

    toolbar = obj.element.find('.DwCViews_Toolbar:last');
    if (toolbar.length == 0) {
      toolbar = $('<div class="DwCViews_Toolbar"></div>');
      obj.element.append(toolbar);
    }
    obj.toolbar = toolbar;

    search_button = obj.element.find('input.DwCViews_SearchButton');
    if (search_button.length == 0) {
      search_button = $('<div class="DwCViews_SearchButton"></div>');
      obj.toolbar.append(search_button);
    }
    obj.searchButton = search_button;

    search_box = obj.element.find('input.DwCViews_SearchBox');
    if (search_box.length == 0) {
      search_box = $('<input type="text" class="DwCViews_SearchBox" />');
      obj.toolbar.append(search_box);
    }
    obj.searchBox = search_box;

    // hide the toolbar if specified in the options
    if (!obj.showToolbar) {
      obj.toolbar.hide();
    }

    /* add a single record table to the suite (if not already present) */
    if (obj.recordTable == null) {
      record_table = obj.element.find('div.DwCRecordTable_Container');
      if (record_table.length == 0) {
        record_table = $('<div class="DwCRecordTable_Container"></div>');
        obj.element.append(record_table);
      }

      // if special options were specified, make sure that the the parent
      // gateway server's options are used (unless overridden)
      if (record_table.data('DwCRecordTable') == null) {
        if (obj.recordTableOptions) {
          // if no baseDir was supplied in the options, use the DwCViews baseDir
          if (obj.recordTableOptions['gatewayAddress'] == null) {
            obj.recordTableOptions['gatewayAddress'] = obj.gatewayAddress;
          }
          // if no baseDir was supplied in the options, use the DwCViews baseDir
          if (obj.recordTableOptions['baseDir'] == null) {
            obj.recordTableOptions['baseDir'] = obj.baseDir;
          }
        }
        // if no options were passed in, set some defaults
        else {
          // pass along the baseDir and gatewayAddress
          obj.recordTableOptions = {};
          obj.recordTableOptions['gatewayAddress'] = obj.gatewayAddress;
          obj.recordTableOptions['baseDir'] = obj.baseDir;
          // do not initialize the table on default (wait for a proper event)
          obj.recordTableOptions['loadOnInit'] = false;
          obj.recordTableOptions['hideOnInit'] = true;
        }

        // initialize our record table
        record_table.DwCRecordTable(obj.recordTableOptions);
      }

      obj.recordTable = record_table.data('DwCRecordTable');
    }


    /* add a view picker container before we add the views*/
    if (obj.viewPicker == null) {
      view_picker = obj.element.find('div.DwCViewPicker_Container');
      // if a container does not already exist, add one
      if (view_picker.length == 0) {
        view_picker = $('<div class="DwCViewPicker_Container"></div>');
        obj.element.append(view_picker);
      }
    }


    /* add a records listing table to the suite (if not already present or set to false) */
    if (obj.recordsTable == null) {
      records_table = obj.element.find('div.DwCRecordsTable_Container');
      if (records_table.length == 0) {
        records_table = $('<div class="DwCRecordsTable_Container"></div>');
        obj.element.append(records_table);
      }

      // if special options were specified, make sure that the the parent
      // gateway server's options are used (unless overridden)
      if (records_table.data('DwCRecordsTable') == null) {
        if (obj.recordsTableOptions) {
          // if no baseDir was supplied in the options, use the DwCViews baseDir
          if (obj.recordsTableOptions['gatewayAddress'] == null) {
            obj.recordsTableOptions['gatewayAddress'] = obj.gatewayAddress;
          }
          // if no baseDir was supplied in the options, use the DwCViews baseDir
          if (obj.recordsTableOptions['baseDir'] == null) {
            obj.recordsTableOptions['baseDir'] = obj.baseDir;
          }
        }
        // if no options were passed in, set some defaults
        else {
          // pass along the baseDir and gatewayAddress
          obj.recordsTableOptions = {};
          obj.recordsTableOptions['gatewayAddress'] = obj.gatewayAddress;
          obj.recordsTableOptions['baseDir'] = obj.baseDir;
        }

        // make this records table aware of the single record table
        if (obj.recordTable && obj.recordsTableOptions['recordTable'] == null) {
          obj.recordsTableOptions['recordTable'] = obj.recordTable;
        }

        // initialize our record table
        records_table.DwCRecordsTable(obj.recordsTableOptions);
      }

      obj.recordsTable = records_table.data('DwCRecordsTable');
    }


    /* add a maps view to the suite (if not already present or set to false) */
    if (obj.mapView == null) {
      map_view = obj.element.find('div.DwCMapView_Container');
      if (map_view.length == 0) {
        map_view = $('<div class="DwCMapView_Container"></div>');
        obj.element.append(map_view);
      }

      // if special options were specified, make sure that the the parent
      // gateway server's options are used (unless overridden)
      if (map_view.data('DwCMapView') == null) {
        if (obj.mapViewOptions) {
          // if no search was supplied in the options, use the DwCViews baseDir
          if (obj.mapViewOptions['search'] == null) {
            obj.mapViewOptions['search'] = new $.DwCViews.DwCSearch({
              'gatwayAddress': obj.gatewayAddress,
              'baseDir': obj.baseDir
            });
          }
        }
        // if no options were passed in, set some defaults
        else {
          obj.mapViewOptions = {};

          // pass along the baseDir and gatewayAddress
          search_options = {};
          search_options['gatewayAddress'] = obj.gatewayAddress;
          search_options['baseDir'] = obj.baseDir;
          // pass along any settings from the records table
          if (obj.recordsTable) {
            if (obj.recordsTable.query) {
              search_options['filter'] = obj.recordsTable.query;
            }
            if (obj.recordsTable.start) {
              search_options['start'] = obj.recordsTable.start;
            }
            if (obj.recordsTable.count) {
              search_options['count'] = obj.recordsTable.count;
            }
            if (obj.recordsTable.sortBy) {
              search_options['sortBy'] = obj.recordsTable.sortBy;
            }
            if (obj.recordsTable.sortBy) {
              search_options['sortOrder'] = obj.recordsTable.sortOrder;
            }
          }

          // if we have a single record table, set a default onMarkerClick callback
          // to display a record when you click on its marker
          obj.mapViewOptions['onMarkerClick'] = function(map_view, marker) {
            var record_id = marker.get('recordID');
            if (record_id) {
              obj.recordTable.setRecordID(marker.get('recordID'), true);
            }
          }

          obj.mapViewOptions['search'] =  new $.DwCViews.DwCSearch(search_options);
        }

        // initialize our record table
        map_view.DwCMapView(obj.mapViewOptions);
      }

      obj.mapView = map_view.data('DwCMapView');
    }


    // initialize the view picker (if not already initialized)
    // now that we have a handle on all of the views
    if (view_picker.data('DwCViewPicker') == null) {
      // if no options were passed in, set some defaults
      if (!obj.viewPicker) {
        // if no options were passed, create a blank object
        if (!obj.viewPickerOptions) {
          obj.viewPickerOptions = {};
        }

        // if no buttons were specified in the options, add all of our views
        if (!obj.viewPickerOptions.hasOwnProperty('buttons')) {
          obj.viewPickerOptions['buttons'] = {};
        
          // if not already present, give the view picker a handle on each
          // of the various views
          if (obj.recordsTable) {
            obj.viewPickerOptions['buttons']['RecordsTableButton'] = {
              "view": obj.recordsTable
            };
          }
          if (obj.mapView) {
            obj.viewPickerOptions['buttons']['MapViewButton'] = {
              "view": obj.mapView
            };
          }
          if (obj.fieldsView) {
            obj.viewPickerOptions['buttons']['FieldsTableButton'] = {
              "view": obj.fieldsTable
            };
          }
        }
      }

      // initialize our view picker
      view_picker.DwCViewPicker(obj.viewPickerOptions);

      // create an object handle on the view picker
      obj.viewPicker = view_picker.data('DwCViewPicker');
    }

    // create an onSearch function, if one was not given
    // (and we have a view that can search
    if (!obj.onSearch && (obj.recordsTable || obj.mapView)) {

      // create a callback function that triggers a search on all of our views
      obj.onSearch = function(filter, dwc_views) {

        // if the dwc_views object has a records table
        if (dwc_views.recordsTable) {
          dwc_views.recordsTable.search.filter = filter;
          dwc_views.recordsTable.fetchRecords(false);
        }

        // likewise if the dwc_views object has a map view
        if (dwc_views.mapView) {
          dwc_views.mapView.search.filter = filter;
          dwc_views.mapView.doSearch(dwc_views.mapView.search, {}, true, false);
        }
      }
    }


    // if we have an onClick callback function, bind it to the search hooks
    if (typeof(obj.onSearch) == 'function') {

      // bind a record search event when the user presses the 'enter' key
      // while the textbox is active
      obj.searchBox.keyup(function(event) {
        if (event.keyCode == 13) {
          obj.onSearch(obj.searchBox.attr('value').trim(), obj);
        }
      });

      // set the onClick event to search button
      obj.searchButton.click(function () {
        obj.onSearch(obj.searchBox.attr('value').trim(), obj);
      });
    }
  }





  /***************************************************************************
   * DwCSearch - represents a search/query in the Darwin Core Database
   ***************************************************************************/

  $.DwCViews.DwCSearch = function(options) {

    this.options = $.extend({}, $.DwCViews.DwCSearch.defaultOptions, options);

    this.gatewayAddress = this.options.gatewayAddress;
    this.baseDir = this.options.baseDir;
    this.filter = this.options.filter;
    this.filterAddendum = this.options.filterAddendum;
    this.fields = this.options.fields;
    this.start = this.options.start;
    this.count = this.options.count;
    this.sortBy = this.options.sortBy;
    this.sortOrder = this.options.sortOrder;
    this.callback = this.options.callback;

    this.data = null;

    this.baseURL = this.gatewayAddress + this.baseDir;

    this.doSearch = function(options) {
      var obj = this;
      var callback;
      if (typeof(options.callback) == 'function') {
        callback = options.callback;
      } else {
        callback = this.callback;
      }

      // if we are able to use the cache, do so
      if (options.cache && this.data != null) {
        return callback(data);
      }
      // if not, do an actual query
      else {
        var url = this.prepareRecordsUrl(options);

        /// DEBUG ///
        console.log("Search URL: " + url);

        $.getJSON(url, function(data) {
          obj.data = data;
          return callback(data);
        });
      }
    }

    // prepares the URL and its options
    this.prepareRecordsUrl = function(options) {
      var params = {};
      var filter = null;
      var filter_addendum = null;

      // build our URL paramaters, looking first at options, then
      // at the object's internal instance settings
      if (options.filter) { filter = options.filter; }
      else if (this.filter) { filter = this.filter; }

      if (options.filterAddendum) { filter_addendum = options.filterAddendum; }
      else if (this.filterAddendum) { filter_addendum = this.filterAddendum; }

      // combine our filter and filter addendum (if they exist)
      if (filter) {
        // combine both the filter and the filter addendum
        if (filter_addendum) {
          params['filter'] = "(" + filter + ") AND (" + filter_addendum + ")";
        }
        // no addendum specified, use only the raw filter
        else {
          params['filter'] = filter;
        }
      }
      // only a filter addendum was specified, it will be used in lieu of the filter
      else if (filter_addendum) {
        params['filter'] = filter_addendum;
      }

      // start at which record/page
      if (isNumeric(options.start)) { params["start"] = options.start; }
      else if (isNumeric(this.start)) { params["start"] = this.start; }

      // maximum number of records to return
      if (isNumeric(options.count)) { params["count"] = options.count; }
      else if (isNumeric(this.count)) { params["count"] = this.count; }

      // which fields do we want returned?
      // field_string will take precedence over a field array
      if (options.fieldString) { params["fields"] = options.fieldString; }
      else if (this.fieldString) { params["fields"] = this.fields_string; }
      else if (options.fields) { params["fields"] = this.prepareFieldString(options.fields); }
      else if (this.fields) { params["fields"] = this.prepareFieldString(this.fields); }

      // sort the results by this field
      if (options.sortBy) { params["orderby"] = options.sortBy; }
      else if (this.sortBy) { params["orderby"] = this.sortBy; }

      // sort ascending or descending
      if (options.sortOrder) { params["order"] = options.sortOrder; }
      else if (this.sortOrder) { params["order"] = this.sortOrder; }

      // $.param automagically does url encoding
      return this.baseURL + "records?" + $.param(params);
    }


    this.prepareFieldString = function(fields) {
      var fields_string = ""
      $.each(fields, function(i, field) {
        if (fields_string != "") {
          fields_string += ",";
        }
        fields_string += field;
      });
    }


    this.getRecordsCount = function(search_options, callback_function, callback_options) {
      // default search_options value
      search_options = typeof(search_options) != 'undefined'? search_options : {};

      // default search_options value
      callback_options = typeof(callback_options) != 'undefined'? callback_options : {};

      // preserve the search, but don't actually retreive any records
      search_options['count'] = 0;

      // use the callback to set up an intermediate function
      // that passes the record count to the supplied callback_function
      search_options['callback'] = function (data) {
        callback_function(parseInt(data.numFound), callback_options);
      }

      // run the actual search
      this.doSearch(search_options)
    }


  }

  $.DwCViews.DwCSearch.defaultOptions = {
    gatewayAddress: "",
    baseDir: "/",
    filter: null,
    filterAddendum: null,
    fields: null,
    start: 0,
    count: 25,
    sortBy: null,
    sortOrder: null,
    callback: function(data) { return data; }
  }





  /***************************************************************************
   * DwCRecordTable
   *
   * Part of the DwCViews (Darwin Core Views) Suite
   *
   * A table used to view a single record within a Darwin Core Database
   ***************************************************************************/

  $.DwCRecordTable = function(element, options) {

    this.options = {};

    element.data('DwCRecordTable', this);

    this.init = function(element, option) {

      this.options = $.extend({}, $.DwCRecordTable.defaultOptions, options);

      // create a handle for our html element
      this.element = element;

      // build the base Darwin Core Views URL
      this.baseURL = this.options.gatewayAddress + this.options.baseDir;

      this.tbody = null;
      this.globalDefaultValue = this.options.globalDefaultValue;
      this.recordID = this.options.recordID;
      this.idField = this.options.idField;
      this.recordTable = null;
      this.hideButton = null;
      this.searchBox = null;
      this.searchButton = null;

      // if we want this table to be hidden upon initialization
      if (this.options.hideOnInit) {
        this.element.hide();
      }

      prepareRecordTable(this);

      // go ahead and build the table's data unless otherwise specified
      if (this.recordID != '' && this.options.loadOnInit) {
        fetchRecord(this);
      }

    }

  
  /***************************************************************************
   * DwCRecordTable - Begin Public Functions
   ***************************************************************************/

  // change the record being displayed by the DwCRecordTable
  this.setRecordID = function(id, show_table) {
    // default value for show_table (false);
    var show_table = typeof(show_table) != 'undefined'? show_table : false;

    this.recordID = id.toString();
    this.searchBox.attr('value', this.recordID);
    fetchRecord(this, show_table);
  }


  // hide the table (if not already hidden)
  this.showTable = function() {
    var element = this.element;
    element.slideDown('slow', function() {
      element.show();
    });
  }


  // show the table (if it is hidden)
  this.hideTable = function() {
    var element = this.element;
    element.slideUp('slow', function() {
      element.hide();
    });
  }


  this.populateTable = function(record) {
    var obj = this; // object handle for callback functions
    var i = 1; // field counter
    var blank_row_html = '<tr class="DwCRecordTable_RecordRow"></tr>'; 
    var row;
    var field_label;
    var field_value;

    // clear out any existing rows
    this.tbody.find("tr.DwCRecordTable_RecordRow").remove();

    row = $(blank_row_html);
    // set a special class for the first row
    row.addClass('DwCRecordTable_FirstRecordRow');

    // the first field displayed should be the ID field (if it exists)
    if (this.idField in record) {
      // field name
      field_label = $('<td class="DwCRecordTable_FieldLabel"></td>');
      field_label.text(this.idField);
      field_label.addClass('DwCRecordTable_FirstRecordRowCell');
      field_label.addClass('DwCRecordTable_FieldLabel_LeftColumn');
      row.append(field_label);
      // field value
      field_value = $('<td class="DwCRecordTable_FieldValue"></td>');
      field_value.text(record[this.idField].toString());
      field_value.addClass('DwCRecordTable_FirstRecordRowCell');
      field_value.addClass('DwCRecordTable_FieldValue_LeftColumn');
      row.append(field_value);     
      var i = 2;
    }
    
    // loop through each field and add it to the table
    $.each(record, function(field, value) {
      // skip the id field, since we already displayed it
      if (field.toString() != obj.idField) {

        // field name
        field_label = $('<td class="DwCRecordTable_FieldLabel"></td>');
        field_label.text(field);
        row.append(field_label);
        // field value
        field_value = $('<td class="DwCRecordTable_FieldValue"></td>');
        field_value.text(value.toString());
        row.append(field_value);

        // if this is the first row, add as special class to each cell
        if (i < 3) { 
          field_label.addClass('DwCRecordTable_FirstRecordRowCell');
          field_value.addClass('DwCRecordTable_FirstRecordRowCell');
        }

        // add a special class for the right / left columns
        if (i % 2) {
          field_label.addClass('DwCRecordTable_FieldLabel_LeftColumn');
          field_value.addClass('DwCRecordTable_FieldValue_LeftColumn');
        }
          else {
          field_label.addClass('DwCRecordTable_FieldLabel_RightColumn');
          field_value.addClass('DwCRecordTable_FieldValue_RightColumn');
        }

        // new row every 2 fields
        if ((i % 2) == 0) {
          // alternating row classes
          if ((i % 4) == 0) {
            row.addClass("DwCRecordTable_RecordRow1");
          }
          else {
            row.addClass("DwCRecordTable_RecordRow2");
          }
          obj.tbody.append(row);
          row = $(blank_row_html);
        }
        i++;
      }
    });

    // if we left on an odd-numbered field, fill in the rest of the table
    // with blank cells
    if ((i % 2) == 0) {
      field_label = $('<td class="DwCRecordTable_FieldLabel"></td>');
      field_label.addClass('DwCRecordTable_FieldLabel_RightColumn');
      row.append(field_label);
      field_value = $('<td class="DwCRecordTable_FieldValue"></td>');
      field_value.addClass('DwCRecordTable_FieldValue_RightColumn');
      row.append(field_value);
      this.tbody.append(row);
    }

    // set a special class for the last row
    row = obj.tbody.find('tr.DwCRecordTable_RecordRow:last');
    row.addClass('DwCRecordTable_LastRecordRow');
    // set a special class for all cells in the last row
    row.find('td.DwCRecordTable_FieldLabel,td.DwCRecordTable_FieldValue').addClass('DwCRecordTable_LastRecordRowCell');

  }


  // returns true of the DwCRecordTable is hidden, false otherwise
  this.isHidden = function() {
    var display = this.element.css('display');
    return (!display || display == 'none');
  }


  /***************************************************************************
   * DwCRecordTable - Final Initialization Call
   ***************************************************************************/

    this.init(element, options);

  };


  /***************************************************************************
   * DwCRecordTable - Namespace Declaration
   ***************************************************************************/

  $.fn.DwCRecordTable = function(options) {
    return this.each(function() {
      (new $.DwCRecordTable($(this), options));
    });
  };


  /***************************************************************************
   * DwCRecordTable - Default Options
   ***************************************************************************/

  $.DwCRecordTable.defaultOptions = {
    loadOnInit: true,
    idField: "id",
    recordID: '',
    gatewayAddress: "",
    baseDir: "/gateway/",
    globalDefaultValue: '',
    showHideButton: true,
    hideOnInit: false
  };


  /***************************************************************************
   * DwCRecordTable - Begin Private Functions
   ***************************************************************************/

  function prepareRecordTable(obj) {
    var record_table;

    obj.element.addClass('DwCRecordTable_Container');

    // if the actual table doesn't exist, create it
    record_table = obj.element.find('table.DwCRecordTable');
    if (record_table.length == 0) {
      record_table = $('<table cellpadding="0" cellspacing="0" border="0"></table>');
      record_table.addClass('DwCRecordTable');
      obj.element.append(record_table);
      obj.recordTable = record_table;
    } else {
      obj.recordTable = record_table;
    }

    // see if a <thead> tag already exists
    var thead = obj.element.find("thead:last");
    if (thead.length == 0) {
      // create a <thead> tag
      thead = $('<thead></thead>');
      obj.recordTable.prepend(thead);
    }

    // create a header (control buttons) row
    var control_row = $('<tr class="DwCRecordTable_ControlRow"></tr>');
    var controls_container = $('<th class="DwCRecordTable_ControlsContainer"></th>');
    controls_container.attr('colspan', 4);
    var hide_button = $('<div class="DwCRecordTable_HideButton"></div>');
    hide_button.addClass('DwCRecordTable_ClickableObject');
    var search_button = $('<div class="DwCRecordTable_SearchButton"></div>');
    search_button.addClass('DwCRecordTable_ClickableObject');
    var search_box = $('<input class="DwCRecordTable_SearchBox" type="text"></text>');
    search_box.attr('value', obj.recordID.toString());
    controls_container.append(search_box);
    controls_container.append(search_button);
    controls_container.append(hide_button);
    control_row.append(controls_container);
    thead.append(control_row);

    obj.hideButton = hide_button;
    obj.searchBox = search_box;
    obj.searchButton = search_button;

    // set the hide button to "hide" this table when clicked
    hide_button.click(function() {
      obj.hideTable();
    });

    // bind a record fetch event when the user presses the 'enter' key
    // while the textbox is active
    search_box.keyup(function(event) {
      if (event.keyCode == 13) {
        obj.setRecordID($.trim(obj.searchBox.attr('value')));
      }
    });

    // bind the search button click to search for the record id
    // supplied in the search box
    search_button.click(function() {
      obj.setRecordID($.trim(obj.searchBox.attr('value')));
    });

    // see if a <tbody> tage already exists
    var tbody = obj.recordTable.find("tbody:last");
    if (tbody.length == 0) {
      // create a <tbody> tag
      tbody = $('<tbody></tbody>');
      tbody.insertAfter(thead);
    }
    else {
      tbody = tbody[0];
    }

    // set a tbody handle for future reference
    obj.tbody = tbody;
  }


  function fetchRecord(obj, show_table) {
    var url = obj.baseURL + 'record/' + encodeURI(solrEscapeValue(obj.recordID));

    // default value for the show_table parameter (false)
    show_table = typeof(show_table) != 'undefined'? show_table : false;

    $.getJSON(url, function(record) {
      obj.populateTable(record);
      // show the table automatically, if requested
      if (show_table && obj.isHidden()) {
        obj.showTable();
      }
    });
  }




  /***************************************************************************
   * DwCRecordsTable
   *
   * Transforms a (potentially) blank div into a listing of records
   * from a Darwin Core Database
   ***************************************************************************/

  $.DwCRecordsTable = function(element, options) {

    this.options = {};

    element.data('DwCRecordsTable', this);

    // DwCRecordsTable Constructor
    this.init = function(element, options) {

      this.options = $.extend({}, $.DwCRecordsTable.defaultOptions, options);

      var obj = this; // extra handle for callback functions

      this.element = element;
      this.search = this.options.search;
      this.fields = this.options.fields;
      this.fields_string = prepareFieldsString(this.options.fields);
      this.displayRowNums = this.options.displayRowNums;
      this.globalDefaultValue = this.options.globalDefaultValue;
      this.recordTable = this.options.recordTable;
      this.idField = this.options.idField;
      this.onInit = this.options.onInit;
      this.onSearch = this.options.onSearch;
      this.onRowClick = this.options.onRowClick;
      this.total = 0;
      this.db_fields = null;
      this.field_menu = null;
      this.overlay = null;

      // build the base Darwin Core Views URL
      this.baseURL = this.options.gatewayAddress + this.options.baseDir;

      // auto fetch data and load it into the table
      if (this.options.loadOnInit) {
        this.fetchRecords(false);
      }

      // add extra elements and style-ize the DwCRecordsTable element
      prepareTable(this);
      prepareHeader(this);
      prepareBody(this);
      prepareFooter(this);

      // fetch and cache the available db fields
      fetchFieldInfo(this);

      // bind right-click on field headers to the fields context menu
      this.recordsTable.find(".DwCRecordsTable_HeaderRow").bind('contextmenu', function(e) {
        obj.fields_menu.showMenu(e);
        return false;
      });

      // create an "onInit" hook (look to see if an onInit() function has been defined)
      if (typeof(this.onInit) == 'function') {
        obj.onInit(obj);
      }

    };


  /***************************************************************************
   * DwCRecordsTable - Begin Public Functions
   ***************************************************************************/

    // display record count/page information
    this.updateLabel = function(data) {
      var label = "Showing Results: ";
      label += (data.start + 1) + " - ";
      if ((data.start + this.search.count) > this.total) {
        label += (this.total) + " ";
      } else {
        label += (data.start + this.search.count) + " ";
      }
      label += " (" + data.numFound + " total)";
      this.element.find(".DwCRecordsTable_PagingInfo").text(label);
    }


    // display Darwin Core records
    this.populateRecordsData = function(data) {
      var tbody = this.recordsTable.find('tbody:last');
      var obj = this; // handle on our "this" object for the callbacks
      var row_type = 1;
      var row;
      var cell;

      // clear any previous data rows
      tbody.empty();

      $.each(data.docs, function(i, record) {
        var is_first_column = true;
        row = $('<tr class="DwCRecordsTable_ResultRow"></tr>');

        // tag the row with a special ID attribute
        if (obj.idField in record) {
          row.attr('dwcrecordstable_recordid', record[obj.idField].toString());
        }

        // if the row should be clickable
        if (obj.onRowClick != null) {
          // set special classes
          row.addClass('DwCRecordsTable_ClickableObject');
          row.addClass('DwCRecordsTable_ClickableRow');
          // bind the click function
          row.click(function() {
            obj.onRowClick(obj, $(this));
          });
        }

        // add alternating classes to even/odd rows
        row.addClass('DwCRecordsTable_ResultRow' + row_type);

        // if we wish to display row numbers
        if (obj.displayRowNums) {
          cell = $('<td class="DwCRecordsTable_Value"></td>');
          // add a special css class to identify it as a numbering cell
          cell.addClass('DwCRecordsTable_RowNumValue');
          // add a special css class to identify it as a first-column cell
          cell.addClass('DwCRecordsTable_FirstColumnValue');
          is_first_column = false;
          cell.text((i + obj.search.start + 1).toString());
          row.append(cell);
        }

        // loop through each of the defined fields
        $.each(obj.fields, function(key, field) {
          if (field['display']) {

            var value = record[key];
            // if the field is undefined for this document, display the default value
            if (value == null) {
               // look for field-specific default value.  Fallback to global default
               value = 'defaultValue' in field? field['defaultValue'] : obj.globalDefaultValue;
            }
            cell = $('<td class="DwCRecordsTable_Value"></td>');
            cell.text(value.toString());

            // if this is the first field/column, tag a speciall css class 
            if (!obj.displayRowNums && is_firs_column) {
              cell.addClass('DwCRecordsTable_FirstColumnValue');
            }

            // if the column has a special click function, make the value clickable
            if (obj.fields[key.toString()]['click'] != null) {
              cell.addClass('DwCRecordsTable_ClickableObject');
              cell.addClass('DwCRecordsTable_ClickableValue');
              cell.click(function() {
                return obj.fields[key.toString()]['click'](obj, $(this));
              });
            }

            row.append(cell);
          }
        });

        // tag the last column/cell with a special css class
        cell.addClass('DwCRecordsTable_LastColumnValue');

        // if this is the first row in the table, give it a special class
        if (i == 0) {
          row.addClass('DwCRecordsTable_FirstResultRow');
          // add a special class to each of the first row's cells too
          row.find('td.DwCRecordsTable_Value').addClass('DwCRecordsTable_FirstResultRow_Value');
        }
        tbody.append(row);
        // toggle alternating row classes
        row_type = (row_type % 2) + 1;
      });
      // add a special class to the very last result row
      row.addClass('DwCRecordsTable_LastResultRow');
      row.find('td.DwCRecordsTable_Value').addClass('DwCRecordsTable_LastResultRow_Value');
    }


    // clears the data in the table and updates and
    // repopulates it.  Also updates the paging information
    // in the footer
    this.refreshData = function(data) {
      this.total = parseInt(data.numFound);
      this.populateRecordsData(data);
      this.updateLabel(data);
    }


    // fetch data from the Darwin Core database (if not already cached)
    // cached=false will ignore any existing cache and overwrite it
    this.fetchRecords = function(cached) {
      var obj = this; // object handler for callback functions

      // default value for the 'cached' parameter (false)
      cached = typeof(cached) != 'undefined'? cached : false;

      // use the existing data cache, if requested (and it exists)
      if (cached && this.search.data != null) {
        this.refreshData(this.data);
        // create a hook for the 'onSearch' event
        if (typeof(obj.onSearch) == 'function') {
          obj.onSearch(obj);
        }
      }
      // fetch data
      else {
        this.search.doSearch({
          'fields_string': this.fields_string,
          'callback': function(data) {
            obj.refreshData(data);
            // create a hook for the 'onSearch' event
            if (typeof(obj.onSearch) == 'function') {
              obj.onSearch(obj);
            }
          }
        });
      }

    }


    // add a field (column) to the table
    this.addField = function(field_name, field_info) {
      // if we already have field info, merely extend it rather than replace it
      if (field_name in this.fields) {
        this.fields[field_name] = $.extend({}, this.fields[field_name], field_info);
      }
      // if we don't have info for this field, use only what was passed
      else {
        this.fields[field_name] = field_info;
      }
      this.fields_string = prepareFieldsString(this.fields);
      prepareHeader(this);
      this.fetchRecords(false);
      prepareFooter(this);
      this.fields_menu.itemOn('fields', field_info['name']);
    }


    // remove a field (column) from the table
    this.removeField = function(field_name) {
      if (field_name in this.fields) {
        this.fields[field_name]['display'] = false;
        removeFieldHeader(this, field_name);
        this.fields_string = prepareFieldsString(this.fields);
        prepareHeader(this);
        this.fetchRecords(true);
        prepareFooter(this);
        this.fields_menu.itemOff('fields', field_name);
      }
    }


    this.toggleField = function(field_name, field_info) {
      if (field_name in this.fields && this.fields[field_name]['display']) {
        this.removeField(field_name);
      } else {
        this.addField(field_name, field_info);
      }
    }


    // Sort by a specific field.  Current sort order
    // (i.e. "asc" / "desc") will be used.  If the table is
    // is already sorted by the given field, this function
    // will simply toggle the sort order.
    this.sortByField = function(field_name) {
      // are we reordering?
      if (this.sortBy == field_name) {
        this.sortOrder = (this.sortOrder == "asc"? "desc" : "asc");
      }
      else {
        this.sortBy = field_name;
      }
      this.fetchRecords(false);
    }


    // get the next record results page
    this.nextPage = function() {
      if ((this.search.start + this.search.count) < this.total) {
        this.search.start = this.search.start + this.search.count;
        this.fetchRecords(false);
      }
    }


    // get the next record results page
    this.prevPage = function() {
      if ((this.search.start - this.search.count) >= 0) {
        this.search.start = this.search.start - this.search.count;
        this.fetchRecords(false);
      }
    }


    // get the first record results page
    this.firstPage = function() {
      this.search.start = 0;
      this.fetchRecords(false);
    }


    // get the next record results page
    this.lastPage = function() {
      if (this.total > this.search.count) {
        // determine the last page's starting record
        this.search.start = (this.total - (this.total % this.search.count));
        this.fetchRecords(false);
      }
    }


  /***************************************************************************
   * DwCRecordsTable - Final Initialization Call
   ***************************************************************************/

    this.init(element, options);

  };


  /***************************************************************************
   * DwCRecordsTable - Namespace Declaration
   ***************************************************************************/

  $.fn.DwCRecordsTable = function(options) {
    return this.each(function() {
      (new $.DwCRecordsTable($(this), options));
    });
  };


  /***************************************************************************
   * DwCRecordsTable - Default Options
   ***************************************************************************/

  // default plugin options
  $.DwCRecordsTable.defaultOptions = {
    loadOnInit: true,
    search: new $.DwCViews.DwCSearch({
      'gatewayAddress': '',
      'baseDir': '/gateway/',
      'filter': null,
      'start': 0,
      'count': 25,
      'sortBy': null,
      'sortOrder': 'asc'
    }),
    displayRowNums: true,
    globalDefaultValue: '',
    recordTable: null,
    idField: 'id',
    onInit: null,
    onSearch: null,
    onRowClick: function(records_table, row) {
      // this click will do nothing if there is no associated record table
      if (records_table.recordTable != null) {
        id = row.attr('dwcrecordstable_recordid');
        records_table.recordTable.setRecordID(id, true);
      }
    },
    fields: {
      "id" : {
        "display": true,
        "name": "id",
        "label": "ID"
      },
      "sciName_s": {
        "display": true,
        "name": "sciName_s",
        "label": "Species",
      },
      "lng": {
        "display": true,
        "name": "lng",
        "label":"Longitude",
      },
      "lat": {
        "display": true,
        "name": "lat",
        "label": "Latitude"
      }
    }
  };


  /***************************************************************************
   * DwCRecordsTable - Begin Private Functions
   ***************************************************************************/

  // style-ize elements and add table
  function prepareTable(obj) {
    var records_table;

    obj.element.addClass("DwCRecordsTable_Container");
    
    // if the table does not already exist, create it
    records_table = obj.element.find('DwCRecordsTable');
    if (records_table.length ==0) {
      records_table = $('<table cellpadding="0" cellspacing="0" class="DwCRecordsTable"></table>');
      obj.element.append(records_table);
    }
    obj.recordsTable = records_table;
  }

  // ceate / style-ize column headers
  function prepareHeader(obj) {
    var cell;
    var sorter;
    var field;
    // create a column header row if one does not exist
    var row = obj.recordsTable.find(".DwCRecordsTable_HeaderRow");

    if (row.length == 0) {
      // is a <thead></thead> tag defined?
      var thead = obj.recordsTable.find("thead:last");
      if (thead.length == 0) {
        thead = $("<thead></thead>");
        obj.recordsTable.prepend(thead);
      }
      // create a column headers row at the end of the <thead> body
      row = $('<tr class="DwCRecordsTable_HeaderRow"></tr>');
      thead.append(row);
    }

    // clear out the header row (we are going to rebuild it)
    row.empty();

    // create result # column if requested in the options
    if (obj.displayRowNums) {
      cell = $('<th class="DwCRecordsTable_FieldHeader" dwcviews_field="__DwCRowNum">&nbsp;</th>)');
      row.append(cell);
    }

    // create labels for each of fields' column
    $.each(obj.fields, function(name, field) {
      if (field['display']) {
        cell = $('<th class="DwCRecordsTable_FieldHeader"></th>');
        cell.attr('dwcviews_field', name);
        // if no label was specified, just display the raw field name
        var label = 'label' in field? field['label'] : name;
        sorter = $('<div class="DwCRecordsTable_FieldSorter"></div>');
        sorter.attr('dwcviews_field', name);
        sorter.addClass('DwCRecordsTable_ClickableObject');
        sorter.text(label.toString());
        cell.append(sorter);
        row.append(cell);
      }
    });

    // turn on column sorting
    var sorters = row.find(".DwCRecordsTable_FieldSorter");
    // clear any previous click event functions so they don't stack
    sorters.unbind('click');
    // set the click event to sort the corresponding column
    sorters.click(function() {
      obj.sortByField($(this).attr('DwCViews_Field'));
    });
  }

  // remove a field header given the field's name
  function removeFieldHeader(obj, field_name) {
    obj.recordsTable.find('.DwCRecordsTable_FieldHeader[dwcviews_field="' + field_name + '"]').remove();
  }

  // set up the <tbody>, which will house the records data
  function prepareBody(obj) {
    // if no <tbody> was defined in the base HTML,
    // add it to the DwCRecordsTable
    if (obj.recordsTable.find("tbody").length == 0) {
      // if there is a <thead>, insert it after the <tbody> after it
      if (obj.recordsTable.find("thead:last").length == 0) {
        obj.recordsTable.prepend("<tbody></tbody>");
      }
      // otherwise, just stick it at the top of the table
      else {
        obj.recordsTable.find("thead:last").after("<tbody></tbody>");
      }
    }
  }

  // create / style-ize table footer and buttons
  function prepareFooter(obj) {
    // how many columns are in our table?
    var column_count = obj.recordsTable.find(".DwCRecordsTable_HeaderRow:last")[0].cells.length;

    // if a footer row has already been defined
    if (obj.recordsTable.find(".DwCRecordsTable_PagingRow").length == 0) {
      // if there is no table footer, create one
      if (obj.recordsTable.find("tfoot").length == 0) {
        obj.recordsTable.append('<tfoot></tfoot>');
      }
      var tfoot = obj.recordsTable.find("tfoot:last");

      var page_info_html = '<tr class="DwCRecordsTable_PagingRow">'
      page_info_html += '<th class="DwCRecordsTable_PagingButtonContainer"></th>';

      tfoot.append(page_info_html);
    }

    button_container = obj.element.find(".DwCRecordsTable_PagingButtonContainer");
    button_container.attr('colspan', column_count);

    // bind buttons to the paging functions
    if (obj.element.find(".DwCRecordsTable_FirstButton").length == 0) {
      button_container.append('<div class="DwCRecordsTable_FirstButton"></div>');
    }
    first_button = obj.element.find(".DwCRecordsTable_FirstButton");
    first_button.addClass('DwCRecordsTable_ClickableObject');
    first_button.addClass('DwCRecordsTable_FloatButton');
    first_button.click(function() {
      obj.element.data("DwCRecordsTable").firstPage();
    });

    if (obj.element.find(".DwCRecordsTable_PrevButton").length == 0) {
      button_container.append('<div class="DwCRecordsTable_PrevButton"></div>');
    }
    prev_button = obj.element.find(".DwCRecordsTable_PrevButton");
    prev_button.addClass('DwCRecordsTable_ClickableObject');
    prev_button.addClass('DwCRecordsTable_FloatButton');
    prev_button.click(function() {
      obj.element.data("DwCRecordsTable").prevPage();
    });

    if (obj.element.find(".DwCRecordsTable_LastButton").length == 0) {
      button_container.append('<div class="DwCRecordsTable_LastButton"></div>');
    }
    last_button = obj.element.find(".DwCRecordsTable_LastButton");
    last_button.addClass('DwCRecordsTable_ClickableObject');
    last_button.addClass('DwCRecordsTable_FloatButton');
    last_button.click(function() {
      obj.element.data("DwCRecordsTable").lastPage();
    });

    if (obj.element.find(".DwCRecordsTable_NextButton").length == 0) {
      button_container.append('<div class="DwCRecordsTable_NextButton"></div>');
    }
    next_button = obj.element.find(".DwCRecordsTable_NextButton");
    next_button.addClass('DwCRecordsTable_ClickableObject');
    next_button.addClass('DwCRecordsTable_FloatButton');
    next_button.click(function() {
      obj.element.data("DwCRecordsTable").nextPage();
    });

    // Paging Status Container
    if (obj.element.find(".DwCRecordsTable_PagingInfo").length == 0) {
      button_container.append('<div class="DwCRecordsTable_PagingInfo">&nbsp;</div>');
    }

  }

  // fetch a list of available fields from the database records
  function fetchFieldInfo(obj) {
    url = obj.baseURL + "fields";
    $.getJSON(url, function(db_fields) {
      obj.db_fields = db_fields;
      createFieldsMenu(obj, db_fields);
    });
  }


  // sort fields by their display order
  function sortFields(fields) {
    var sorted_fields = {};
    var weight_pairs = {};
    var weights = new Array();
    var weight = 0;

    // create an associative array of pairs {display_weight: field_name}
    // and a flat array of just the weights (so that we can sort them)
    $.each(fields, function(name, field) {
      var weight;

      // check to make sure that the field has a display order
      if (field.hasOwnProperty('displayWeight')) {
        weight = field['displayWeight'];
      }
      // if the field does not have a weight, set it arbitrarily high
      else {
        weight = 1000;
      }

      // take care of any conflicts (fields with the same weight)
      // if another field already has this weight, increment by 1 and try again
      while (weights.hasOwnPropert(weight)) {
        weight++;
      }

      weights.push(weight);
      weight_pairs[weight] = name;
    });

    // sort the weight values in order
    weights.sort();

    // now rebuild or array in sorted order
    $.each(weights, function(i, weight) {
      var name = weight_pairs[weight];
      // throw away original display weights and give them even
      // numbers (incrementing by 10)
      weight += 10;
      sorted_fields[name] = fields[name];
      sorted_fields[name]['displayWeight'] = weight;
    });

    // DEBUG //
    $.each(sorted_fields, function(name, field) {
      alert(name + ": " + field['displayWeight']);
    });
    return sorted_fields;

  }

  
  // turns all of the keys in an associative array into a
  // comma-dilineated string
  function prepareFieldsString(fields) {
    var fields_string = "";
    var is_first = true;
    $.each(fields, function(name, field) {
      if (!is_first) {
        fields_string += ",";
      }
      if (field['display']) {
        fields_string += name;
        is_first = false;
      }
    });
    return fields_string;
  }


  function createFieldsMenu(obj, db_fields) {

    // create a common overlay, if none exists
    if (obj.overlay == null) {
      obj.overlay = createMenuOverlay();
    }

    items = {};
    $.each(db_fields, function(name, field_info) {
      var item = {};
      // if the field information contains a label, use it
      if ('label' in field_info && field_info['label'] != '') {
        item['label'] = field_info['label'];
      } else {
      // fallback to the raw fieldname if no label is given
        item['label'] = name;
      }
      // set the click() event to toggle this field's presence in the table
      item['click'] = function() {
        obj.toggleField(name, {"name": name, "display": true}); 
        return false;
      }
      // if the field is in the table currently, set it as "On"
      item['on'] = (name in obj.fields && obj.fields[name]['display']);
      items[name] = item;
    });

    groups = {
      "fields": {
        "label": "Fields",
        "displayLabel": true,
        "items": items
      }
    };

    var menu = $('<div></div>');
    menu.appendTo(document.body);
    menu.DwCContextMenu({
      "groups": groups,
      "overlay": obj.overlay
    });

    obj.fields_menu = menu.data("DwCContextMenu");
  }





  /***************************************************************************
   * DwCMapView
   *
   * Creates a "spatial" (visual map) view of the given records in a
   * Darwin Core database based on the longitude and latitude values
   ***************************************************************************/

  $.DwCMapView = function(element, options) {

    this.options = {};

    // store this object instance in the main element's .data() attribute
    element.data('DwCMapView', this);

    this.init = function(element, option) {
      var obj = this; // object handle for callback functions
      var search_options = {};

      // merge default options and options passed into the function
      this.options = $.extend({}, $.DwCMapView.defaultOptions, options);

      // create a handle on the DOM element
      this.element = element;

      this.map = null; // the actual google maps object
      this.search = this.options.search;
      this.idField = this.options.idField;
      this.latitudeField = this.options.latitudeField;
      this.longitudeField = this.options.longitudeField;
      this.titleField = this.options.titleField;
      this.recordsTable = this.options.recordsTable;
      this.zoom = this.options.zoom;
      this.mapTypeId = this.options.mapTypeId;
      this.center = this.options.center;
      this.overlays = this.options.overlays;
      this.autoCenter = this.options.autoCenter;
      this.maxRecords = this.options.maxRecords;
      this.tileRows = this.options.tileRows;
      this.tileCols = this.options.tileCols;
      this.totalRecords = 0;

      // some event hook handlers
      this.onInit = this.options.onInit;
      this.onMarkerClick = this.options.onMarkerClick;
      this.onSearch = this.options.onSearch;
      this.onShow = this.options.onShow;
      this.onHide = this.options.onHide;

      // some internal variable used to help set and maintain map state
      this.lastKnownWidth = 0; // last known map container width
      this.lastKnownHeight = 0; // last known map container height
      this.lastKnownBounds = null; // the last known LatLngBounds map extent
      this.lastKnownCenter = null; // last known map center
      this.lastKnownZoom = 0; // last known zoom value of the map
      this.fitBounds = false;
      this.markerBounds = null; // used to fit the map to a new set of markers
      this.dynamicMarkers = false;
      this.dynamicMarkerEventHandler = null; // used when turning dynamic markers on and off 

      setupMapView(this);

      // if a callback function was specified for the onInit event hook
      if (typeof(this.onInit) == 'function') {
        this.onInit(this);
      }

      // perform our search and place markers on the map
      if (this.search) {
        // set a default filter addendum so that only records with
        // valid longitude and latitude values will be chosen
        this.search.filterAddendum = solrEscapeValue(this.latitudeField) + ':[\-90 TO 90] AND ';
        this.search.filterAddendum += solrEscapeValue(this.longitudeField) + ':[\-180 TO 180]';

        // bind the idle function only after the initial search
        search_options['callback'] = function () {
          // bind the idle function to our actual google maps "map" object
          obj.idleEventhandler = google.maps.event.addListener(obj.map, 'idle', function () {
            obj.restoreState();
          });
        }

        // retreive records and place markers
        this.doSearch(this.search, search_options, this.autoCenter, false);
      }

    }

  
  /***************************************************************************
   * DwCMapView - Begin Public Functions
   ***************************************************************************/

     // save the LatLngBounds box of the map's current view
     // (this allows us to restore the zoom/center later)
     this.saveState = function() {
       this.lastKnownWidth = this.element.width();
       this.lastKnownHeight = this.element.height();
       this.lastKnownBounds = this.map.getBounds();
       this.lastKnownCenter = this.map.getCenter();
       this.lastKnownZoom = this.map.getZoom();
     }


     // restores the map's last saved zoom/center
     this.restoreState = function() {
       // if the object is not visible (hidden), don't do anything at all
       if (this.isHidden()) {
         return;
       }
       
       // if the size of the map view has changed since it was last fisible
       if (this.lastKnownWidth != this.element.width()
           || this.lastKnownHeight != this.element.height()) {
         // resize the map to fit the new view size
         google.maps.event.trigger(this.map, 'resize');
       }

       // if there is a call to fit the map to a new set of markers
       else if (this.fitBounds) {
         this.fitBounds = false;
         this.map.fitBounds(this.markerBounds);
       }

       // if the bounds of the map have changed, and dynamic loading has been turned on
       else if (this.dynamicMarkers && !this.map.getBounds().equals(this.lastKnownBounds)) {
         // dynamically load all markers within the map's current/active bounds
         this.loadTile(this.map.getBounds());
       }

       // save the state so that there is no redundant resizing or marker loading
       this.saveState();

     }


     // returns true if the map view is hidden, false if it is visible
     this.isHidden = function() {
       return !this.element.is(":visible");
     }


     // hide this plugin
     this.hide = function() {
       // don't do anything if the map view is already hidden
       if (!this.isHidden()) {
         // if a callback function was specified for the onHide() event hook
         if (typeof(this.onHide) == 'function') {
           this.onHide(this);
         }
         this.saveState();
         this.element.hide();
       }
     }


     // show this plugin (only if it is hidden)
     this.show = function() {
       var obj = this;

       // do nothing if the map view is already visible
       if (this.isHidden()) {
         this.element.show(function() {
           obj.restoreState();
           // if a callback function was specified for the onShow() event hook
           if (typeof(obj.onShow) == 'function') {
             obj.onHide(obj);
           }
         });
       }
     }


     // add a marker (icon) to the map
     this.addMarker = function(key, options, values, display) {
       var obj = this;
       var marker = new google.maps.Marker(options);

       // if not display boolean is passed, default to true
       display = typeof('display') != 'undefined'? display : true; 

       // if any values were passed, add them to the marker's values
       if (values) {
         marker.setValues(values);
       }

       // if a marker click callback function has been defined
       if (typeof(obj.onMarkerClick) == 'function') {
         // set the 'click' event to the callback
         google.maps.event.addListener(marker, 'click', function() {
           obj.onMarkerClick(obj, marker);
         });
       }

       // if the key already exists, unshow/hide the previous marker
       // this marker will replace it
       if (key in this.overlays) {
         this.overlays[key].setMap(null);
       }

       // add this marker to our array of all markers/overlays
       this.overlays[key] = marker;

       // show the new marker on the map (if requested)
       if (display) {
         marker.setMap(this.map);
       }
     }


     // makes sure that all markers in the "overlays" array
     // have been made visible on the map
     this.displayOverlays = function() {
       var obj = this;

       $.each(this.overlays, function(key, overlay) {
         overlay.setMap(obj.map)
       });
     }


     // hide all icons on the map and clear out all of
     // the icons from the overlays array
     this.deleteOverlays = function() {
       var obj = this;

       $.each(this.overlays, function(key, overlay) {
         overlay.setMap(null)
       });

       this.overlays = {};
     }


     // takes a google maps bounds box then queries/displays
     // only the markers located within that box/bounds
     this.loadTile = function(bounds_box, search, search_options) {
       var obj = this;
       var filter_addendum = "";
       var northeast; // LatLng top-right corner
       var southwest; // LatLng bottom-left corner
       var max_lat;
       var max_lng;
       var min_lat;
       var min_lng;

       // if no alternative search was supplied, use the object's resident search
       search = typeof(search) != 'undefined'? search : this.search; 

       // if no alternative search was supplied, use the object's resident search
       search_options = typeof(search_options) != 'undefined'? search_options : {}; 

       northeast = bounds_box.getNorthEast();
       southwest = bounds_box.getSouthWest();

       // figure out the min/max latitude
       if (northeast.lat() > southwest.lat()) {
         max_lat = northeast.lat();
         min_lat = southwest.lat();
       }
       else {
         max_lat = southwest.lat();
         min_lat = northeast.lat();
       }

       // figure out the min/max longitude
       if (northeast.lng() > southwest.lng()) {
         max_lng = northeast.lng();
         min_lng = southwest.lng();
       }
       else {
         max_lng = southwest.lng();
         min_lng = northeast.lng();
       }

       // add a filter clause for the latitude
       filter_addendum += solrEscapeValue(this.latitudeField);
       filter_addendum += ":[";
       filter_addendum += solrEscapeValue(min_lat);
       filter_addendum += " TO ";
       filter_addendum += solrEscapeValue(max_lat);
       filter_addendum += "]";

       filter_addendum += " AND ";

       // check if the bounds box spans the 180th longitude
       if (northeast.lng() < southwest.lng()) {
         filter_addendum += "(";
         filter_addendum += solrEscapeValue(this.longitudeField);
         filter_addendum += ":";
         filter_addendum += "[" + solrEscapeValue(max_lng) + " TO 180]";
         filter_addendum += " OR ";
         filter_addendum += solrEscapeValue(this.longitudeField);
         filter_addendum += ":";
         filter_addendum += "[\-180 TO " + solrEscapeValue(min_lng) + "]";
         filter_addendum += ")";
       }
       else {
         filter_addendum += solrEscapeValue(this.longitudeField);
         filter_addendum += ":";
         filter_addendum += "[";
         filter_addendum += solrEscapeValue(min_lng);
         filter_addendum += " TO ";
         filter_addendum += solrEscapeValue(max_lng);
         filter_addendum += "]";
       }

       // add bounds as a filter addendum
       search_options['filterAddendum'] = filter_addendum;

       // this is a partial/dynamic load, it shouldn't turn
       // dynamic loading on or off
       search_options['dynamic'] = true;

       /// DEBUG ///
       console.log("[" + southwest.lat() + ", " + northeast.lng() + "] - [" + northeast.lat() + ", " + northeast.lng() + "]\n");
       console.log("[" + southwest.lat() + ", " + southwest.lng() + "] - [" + northeast.lat() + ", " + southwest.lng() + "]\n");
       console.log(filter_addendum + "\n\n");

       this.doSearch(search, search_options, false, false);
     }


     // takes the results of a DwCSearch and places a
     // the resulting records' corresponding markers on
     // the map
     this.loadMarkers = function(data, center) {
       var obj = this;
       var bounds;

       // default values
       center = typeof(center) != 'undefined'? center : false;

       // if we're going to center on our new result set, create a blank bounds
       if (center) { bounds = new google.maps.LatLngBounds(); }
  

       $.each(data.docs, function(i, record) {
         var lat;
         var lng;
         var marker_options;
         var marker_values;

         lat = record[obj.latitudeField];
         lng = record[obj.longitudeField];

         // check to make sure that lat and lng are valid numbers
         if (isNumeric(lat) && isNumeric(lng)) {
           lat = parseFloat(lat);
           lng = parseFloat(lng);

           // check to make sure that the lat and lng values have valid ranges
           if (lat <= 90 && lat >= -90 && lng <= 180 && lng >= -180) {

             marker_options = {};
             marker_options['position'] = new google.maps.LatLng(lat, lng);

             // if the title field is present, use its value as the marker title
             if (obj.titleField && obj.titleField in record) {
               marker_options['title'] = record[obj.titleField].toString();
             }

             // add the recordID to the metadata
             marker_values = {'recordID': record[obj.idField]}

             // add the marker to our mapView and tell it to display itself
             obj.addMarker(record[obj.idField], marker_options, marker_values, true);

             // if we are going to center tha map on the new result-set
             if (center) {
               // add the coordinance to be considered when zooming/centering the map
               bounds.extend(marker_options['position']);
             }
           }
           
         }
       });

       // if center == true, center/zoom the map based on the new set of markers
       if (center) {
         // set the bounds (which will be 'restored' when the map view is unhidden
         this.markerBounds = bounds;
         this.fitBounds = true;
         this.restoreState();
       }
     }


     // takes a DwcSearch object and displays the records
     // returned from the search on the map
     this.doSearch = function(search, search_options, center, cached) {
       var callback_options = {};
       
       // set some default values
       search = typeof(search) != 'undefined'? search : this.search;
       search_options = typeof(search_options) != 'undefined'? search_options : {};
       center = typeof(center) != 'undefined'? center: false;
       cached = typeof(cached) != 'undefined'? cached : false;

       // add some essential options/overrides
       search_options['fieldString'] = this.idField + "," + this.latitudeField + ',' + this.longitudeField + ',' + this.titleField;

       callback_options['mapView'] = this;
       callback_options['search_options'] = search_options;
       callback_options['center'] = center;

       // if 'dynamic' was specified, pass it onto the callback options
       if (search_options.hasOwnProperty('dynamic')) {
         callback_options['dynamic'] = search_options['dynamic'];
         delete search_options['dynamic'];
       }

       // if a callback function was specified within the search options,
       // intercept it here and pass it along, instead, to the final search callback
       if (typeof(search_options['callback']) == 'function') {
         callback_options['callback'] = search_options['callback'];
         // get rid of it so that it's not called while retreiving a result count
         delete search_options['callback'];
       }

       // perform the actual search
       search.getRecordsCount(search_options, mapView_DoSearch, callback_options);
     }


  /***************************************************************************
   * DwCMapView - Final Initialization Call
   ***************************************************************************/

    this.init(element, options);

  };


  /***************************************************************************
   * DwCMapView - Namespace Declaration
   ***************************************************************************/

  $.fn.DwCMapView = function(options) {
    return this.each(function() {
      (new $.DwCMapView($(this), options));
    });
  };


  /***************************************************************************
   * DwCMapView - Default Options
   ***************************************************************************/

  $.DwCMapView.defaultOptions = {
    recordsTable: null,
    search: null,
    idField: 'id',
    latitudeField: 'lat',
    longitudeField: 'lng',
    titleField: 'sciName_s',
    maxRecords: 500,
    overlays: {},
    zoom: 0,
    center: new google.maps.LatLng(0,0),
    autoCenter: true,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    tileRows: 5,
    tileCols: 5,
    onInit: null,
    onMarkerClick: null,
    onSearch: null,
    onShow: null,
    onHide: null
  };


  /***************************************************************************
   * DwCMapView - Begin Private Functions
   ***************************************************************************/

  function setupMapView(obj) {
    var map;
    var map_options = {}

    // style-ize the map container
    obj.element.addClass('DwCMapView_Container');

    // options for the map
    map_options['zoom'] = obj.zoom;
    map_options['center'] = obj.center;
    map_options['mapTypeId'] = obj.mapTypeId;

    // initialize the map
    obj.map = new google.maps.Map(obj.element[0], map_options);

    // set the map's initial state
    obj.saveState();

  }


  // helper function, used as a callback function in the
  // map view's doSearch() public function
  function mapView_DoSearch(count, options) {
    var obj = options['mapView'];
    var search_options = options['search_options'];
    var center = options['center'];
    var callback = options['callback'];
    var dynamic; // if the search query is partial/dynamic query

    // if no dynamic option was specified, assume it is false
    dynamic = options.hasOwnProperty('dynamic')? options['dynamic'] : false;

    // set the count (which would be 0 otherwise)
    search_options['count'] = obj.maxRecords;

    // if the total number of valid records is greater than the
    // maximum allowed number of records/markers, set sort to random
    if (count > obj.maxRecords) {
      // a trick to show a random collection of records 
      search_options['sortBy'] = 'random_1';
    }

    // if this is not a partial query, turn on dynamic marker loading
    // if the count is greater than the actual number of displayed markers
    if (!dynamic) {
      obj.dynamicMarkers = count > obj.maxRecords;
    }

    // set our callback to actually load the markers found in the data
    search_options['callback'] = function(data) {
      obj.loadMarkers(data, center)

      // if another callback was specified in the options, go ahead and call
      // after the markers have been loaded
      if (typeof(callback) == 'function') {
        callback(data);
      }

      // if a callback function was defined for the onSearch event hook
      if (typeof(obj.onSearch) == 'function') {
        obj.onSearch(obj);
      }
    };

    // clear any existing markers
    obj.deleteOverlays();

    obj.search.doSearch(search_options);
  }


  function mapView_LoadByTiles(obj) {
    // determine our initial bounds
    var bounds = obj.map.getBounds();

    // how many tiles? (rows & columns)
    var tile_rows = obj.tileRows;
    var tile_cols = obj.tileCols;
    
  }




  /***************************************************************************
   * DwCViewPicker
   *
   * a little bar that lets you switch between the different views
   * (i.e. recordsTable, mapView, fieldsView)
   ***************************************************************************/

  $.DwCViewPicker = function(element, options) {

    this.options = {};

    element.data('DwCViewPicker', this);

    this.init = function(element, options) {

      this.options = $.extend({}, $.DwCViewPicker.defaultOptions, options);
      this.element = element;

      this.defaultView = this.options.defaultView
      this.buttons = this.options.buttons;
      this.onButtonClick = this.options.onButtonClick;

      setupPicker(this);

    }


  /***************************************************************************
   * DwCViewPicker - Begin Public Functions
   ***************************************************************************/

    // add a button, or update the button settings if it
    // already exists
    this.setButton = function(button_name, button_info) {
      if (this.buttons.hasOwnProperty(button_name)) {
        var button = this.element.find('.DwCViewPicker_' + button_name);

        // keep any old options (that are not being overridden)
        this.buttons[button_name] = $.extend({}, this.buttons[button_name], button_info);

        if (button.length != 0) {
          // unbind the click event
          button.unbind('click');
        
          // bind the new (or same) click event if one is specified
          this.bindButtonClick(this, button, button_name, button_info);
        }
      }
    }

    // show the given view (identified by its button name)
    // and hide all other views
    this.showView = function(view_name) {
      // loop through each button hiding/showing the appropriate view(s)
      $.each(this.buttons, function(name, button_info) {
        var view = button_info['view'];

        if (view) {
          // show the specified view
          if (name == view_name) {
            // if the view has a native "show()" command, use it
            if (typeof(view.show) == 'function') { view.show(); }
            // if not, call a generic JQuery "show()" on it
            else { view.element.show(); }
          }
          // hide all other views
          else {
            // if the view has a native "hide()" command, use it
            if (typeof(view.hide) == 'function') { view.hide(); }
            // if not, call a generic JQuery "hide()" on it
            else { view.element.hide(); }
          }
        }
      });
    }


  /***************************************************************************
   * DwCViewPicker - Final Initialization Call
   ***************************************************************************/

    this.init(element, options);

  };


  /***************************************************************************
   * DwCViewPicker - Namespace Declaration
   ***************************************************************************/

  $.fn.DwCViewPicker = function(options) {
    return this.each(function() {
      (new $.DwCViewPicker($(this), options));
    });
  };


  /***************************************************************************
   * DwCViewPicker - Default Options
   ***************************************************************************/

  $.DwCViewPicker.defaultOptions = {
    defaultView: "RecordsTableButton",
    onButtonClick: null,
    buttons: {
      "RecordsTableButton": {
        "view": null 
      },
      "MapViewButton": {
        "view": null
      },
      "FieldsViewButton": {
        "view": null
      }
    }
  };


  /***************************************************************************
   * DwCViewPicker - Begin Private Functions
   ***************************************************************************/

  function setupPicker(obj) {

    // style-ize the container
    obj.element.addClass('DwCViewPicker_Container');

    // add our buttons (as defined by the "buttons" option)
    $.each(obj.buttons, function(name, button_info) {
      var button = $('<div></div>');

      // add the generic button class
      button.addClass('DwCViewPicker_Button');
      // add a unique button class
      button.addClass('DwCViewPicker_' + name);

      // add click events
      bindButtonClick(obj, button, name, button_info);

      // add the button to the container
      obj.element.append(button);
    });

    // initially, show only the default view, hide all others
    if (obj.buttons &&
        obj.defaultView &&
        obj.buttons.hasOwnProperty(obj.defaultView)) {
      obj.showView(obj.defaultView);
    }
    // if there is no default, or if the default doesn't exist
    // simpy show the first one that was defined
    else {
      if (obj.buttons) {
        $.each(obj.buttons, function(name, button_info) {
          obj.showView(name);
          return false;
        });
      }
    }
    
  }


  function bindButtonClick(obj, button, button_name, button_info) {
    button.click(function() {
      // show the corresponding view and hide the other views
      obj.showView(button_name);

      // if a click function has been defined
      if (typeof(button_info['click']) == 'function') {
        if (button_info['click'](obj, button_info['view'])) {
          // if the button's click callback returns true,
          // pass it off to the global button click callback
          if (typeof(obj.onButtonClick) == 'function') {
            obj.onButtonClick(obj, button_info['view']);
          }
        }
      }
      else if (typeof(obj.onButtonClick) == 'function') {
      }
    });
  }




  /***************************************************************************
   * DwCContextMenu
   *
   * The Right-Click menu used to control various DwC objects and functions
   ***************************************************************************/

  $.DwCContextMenu = function(element, options) {

    this.options = {};

    element.data('DwCContextMenu', this);

    this.init = function(element, options) {

      this.options = $.extend({}, $.DwCContextMenu.defaultOptions, options);
      this.element = element;

      this.groups = options.groups

      // we need an overlay to handle off-menu clicks while
      // the menu is active
      this.overlay = options.overlay;
      if (this.overlay == null)
      {
        this.overlay = createMenuOverlay();
      }

      prepareMenu(this);
      bindMenuEvents(this);
      buildMenu(this);
    }


  /***************************************************************************
   * DwCContextMenu - Begin Public Functions
   ***************************************************************************/

    this.showMenu = function(e) {
      var element = this.element;
      var overflow;
      this.element.css({position: 'absolute', left: e.pageX, top: e.pageY});
      this.overlay.css({width: $(document).width() + 'px', height: $(document).height() + 'px'});
      this.overlay.show();
      // use a fade-in animation
      this.element.fadeIn(function() {
        element.show();
      });
    }


    this.hideMenu = function() {
      element = this.element;
      // use a fade-out animation
      element.fadeOut(function() {
        element.hide();
      });
      this.overlay.hide();
    }


    this.itemOn = function(group, item) {
      var item = this.groups[group]['items'][item];
      item['element'].addClass('DwCContextMenu_ItemOn');
      item['on'] = true;
    }


    this.itemOff = function(group, item) {
      var item = this.groups[group]['items'][item];
      item['element'].removeClass('DwCContextMenu_ItemOn');
      item['on'] = false;
    }


    // loop through all items and make sure that they are properly tagged
    // (or not tagged) with the appropriate CSS class
    this.refreshItemsOnOff = function() {
      var obj = this; // handle on object intance for callback functions
      $.each(obj.groups, function(group_name, group) {
        $.each(group['items'], function(item_name, item) {
          if (item['on'] == true) {
            item['element'].addClass('DwCContextMenu_ItemOn');
          } else {
            item['element'].removeClass('DwCContextMenu_ItemOn');
          }
        });
      });
    }


  /***************************************************************************
   * DwCContextMenu - Final Initialization Call
   ***************************************************************************/

    this.init(element, options);

  };


  /***************************************************************************
   * DwCContextMenu - Namespace Declaration
   ***************************************************************************/

  $.fn.DwCContextMenu = function(options) {
    return this.each(function() {
      (new $.DwCContextMenu($(this), options));
    });
  };


  /***************************************************************************
   * DwCContextMenu - Default Options
   ***************************************************************************/

  $.DwCContextMenu.defaultOptions = {
    groups: {},
    overlay: null
  };


  /***************************************************************************
   * DwCContextMenu - Begin Private Functions
   ***************************************************************************/

  function prepareMenu(obj) {
    obj.element.addClass('DwCContextMenu');
    obj.element.css('display', 'none');
  }


  function bindMenuEvents(obj) {
    obj.element.bind('contextmenu', function(e) {
      obj.hideMenu();
      return false;
    });

    obj.overlay.bind('contextmenu', function(e) {
      obj.hideMenu();
      return false;
    });

    obj.overlay.click(function(e) {
      obj.hideMenu();
      return false;
    });
  }


  function buildMenu(obj) {
    $.each(obj.groups, function(group_id, group) {
      var group_element = $('<ul class="DwCContextMenu_Group"></ul>');
      group_element.attr('DwCContextMenu_Group', group_id);
      obj.element.append(group_element);

      // display the group header, if requested
      if (!('displayLabel' in group)
          || group['displayLabel'] == true) {
        header = $('<li class="DwCContextMenu_GroupHeader"></li>');
        header.attr('dwccontextmenu_group', group_id);
        header.text(group['label']);
        group_element.append(header);
      }

      // add each of the group's items to the menu
      var is_first = true;
      var last_item_element = null;
      $.each(group['items'], function(item_id, item) {
        var item_element = $('<li class="DwCContextMenu_Item"></li>');
        item_element.attr('dwccontextmenu_item', item_id);
        item_element.text(item['label']);

        // add a special class to the first item in the group
        if (is_first) {
          item_element.addClass('DwCContextMenu_FirstItem');
          is_first = false;
        }

        // if this item is flagged as "on", set a special class
        if ('on' in item && item['on']) {
          item_element.addClass('DwCContextMenu_ItemOn');
        }

        // bind custom click event (if specified)
        if (item['click'] != null) {
          item_element.click(function() {
            obj.hideMenu();
            return item['click']($(this));
          });
        // if no click event was specified, just close the menu
        } else {
          item_element.click(function() {
            obj.hideMenu();
            return false;
          });
        }

        last_item_element = item_element;
        group_element.append(item_element);

        // cache/index a handler to the index to avoid overhead of searching later
        item['element'] = item_element;
      });

      // add a special class to the last item in the group
      last_item_element.addClass('DwCContextMenu_LastItem');

      // cache/index a handler to the group to avoid the overhead of searching later
      group['element'] = group_element;

    });

  }

  function createMenuOverlay() {
    var overlay = $('<div class="DwCMenuOverlay"></div>');
    // set the dimensions of the overlay to cover the entire page
    overlay.css({
      width: $(document).width() + 'px',
      height: $(document).height() + 'px',
      position: 'absolute',
      left: '0px',
      top: '0px',
      backgroundColor: 'transparent',
      display: 'none'
    });

    // keep the overlay hidden until we need it
    overlay.hide();

    overlay.appendTo(document.body);
    return overlay;
  }


  // returns "true" if the value is numeric, false if not
  function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  // takes a string and escapes any SOLR special characters
  function solrEscapeValue(str) {
    var esc_str = '';

    // make sure that the value is a string
    str = str.toString();

    for (var i=0; i<str.length; i++) {
      if (str[i] in solrSpecialCharacters) {
        esc_str += solrEscapeCharacter;
      }
      esc_str += str[i];
    }

    return esc_str;
  }

  // all special characters that need to be escaped in a SOLR value
  // note, we only use the keys, the values don't actually matter
  var solrSpecialCharacters = {
    '-': '-',
    '+': '+',
    '&': '&',
    '|': '|',
    '!': '!',
    '(': '(',
    ')': ')',
    '{': '{',
    '}': '}',
    '[': '[',
    ']': ']',
    '^': '^',
    '"': '"',
    '~': '~',
    '*': '*',
    '?': '?',
    ':': ':',
    '\\': '\\'
  };

  // the character used to escape special characters in SOLR values
  var solrEscapeCharacter = '\\';

})(jQuery);
