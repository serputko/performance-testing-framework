import $ from 'jquery';
import kbn from 'app/core/utils/kbn';
import moment from 'moment';
import DataTable from './libs/datatables.net/js/jquery.dataTables.min.js';

export class DatatableRenderer {
  constructor(panel, table, isUtc, sanitize) {
    this.formatters = [];
    this.colorState = {};
    this.panel = panel;
    this.table = table;
    this.isUtc = isUtc;
    this.sanitize = sanitize;
  }

  /**
   * Given a value, return the color corresponding to the threshold set
   * @param  {[Float]} value [Value to be evaluated]
   * @param  {[Array]} style [Settings containing colors and thresholds]
   * @return {[String]}       [color]
   */
  getColorForValue(value, style) {
    if (!style.thresholds) {
      return null;
    }
    for (var i = style.thresholds.length; i > 0; i--) {
      if (value >= style.thresholds[i - 1]) {
        return style.colors[i];
      }
    }
    return _.first(style.colors);
  }

  // to determine the overall row color, the index of the threshold is needed
  getColorIndexForValue(value, style) {
    if (!style.thresholds) {
      return null;
    }
    for (var i = style.thresholds.length; i > 0; i--) {
      if (value >= style.thresholds[i - 1]) {
        return i;
      }
    }
    return 0;
  }

  /**
   * [defaultCellFormatter description]
   * @param  {[type]} v     [description]
   * @param  {[type]} style [description]
   * @return {[type]}       [description]
   */
  defaultCellFormatter(v, style, column) {
    if (v === null || v === void 0 || v === undefined || column === null) {
      return '';
    }
    if (_.isArray(v)) {
      v = v.join(', ');
    }
    if (style && style.sanitize) {
      return this.sanitize(v);
    }
    else if (style && style.link && style.url && column.text === style.column) {
      return '<a href="' + style.url.replace('{}', v) + '" target="_blank">' + v + '</a>';
    }
    else if (style && style.link) {
      return '<a href="' + v + '" target="_blank">' + v + '</a>';
    }
    else {
      return _.escape(v);
    }
  }

  /**
   * [createColumnFormatter description]
   * @param  {[type]} style  [description]
   * @param  {[type]} column [description]
   * @return {[type]}        [description]
   */
  createColumnFormatter(style, column) {
    if (!style) {
      return this.defaultCellFormatter;
    }
    if (style.type === 'hidden') {
      return v => {
        return undefined;
      };
    }
    if (style.type === 'date') {
      return v => {
        if (v === undefined || v === null) {
          return '-';
        }
        if (_.isArray(v)) {
          v = v[0];
        }
        var date = moment(v);
        if (this.isUtc) {
          date = date.utc();
        }
        return date.format(style.dateFormat);
      };
    }
    if (style.type === 'number') {
      let valueFormatter = kbn.valueFormats[column.unit || style.unit];
      return v => {
        if (v === null || v === void 0) {
          return '-';
        }
        if (_.isString(v)) {
          return this.defaultCellFormatter(v, style, column);
        }
        if (style.colorMode) {
          this.colorState[style.colorMode] = this.getColorForValue(v, style);
        }
        return valueFormatter(v, style.decimals, null);
      };
    }
    return (value) => {
      return this.defaultCellFormatter(value, style, column);
    };
  }

  /**
   * [formatColumnValue description]
   * @param  {[type]} colIndex [description]
   * @param  {[type]} value    [description]
   * @return {[type]}          [description]
   */
  formatColumnValue(colIndex, value) {
    if (this.formatters[colIndex]) {
      return this.formatters[colIndex](value);
    }

    for (let i = 0; i < this.panel.styles.length; i++) {
      let style = this.panel.styles[i];
      let column = this.table.columns[colIndex];
      var regex = kbn.stringToJsRegex(style.pattern);
      if (column.text.match(regex)) {
        this.formatters[colIndex] = this.createColumnFormatter(style, column);
        return this.formatters[colIndex](value);
      }
    }

    this.formatters[colIndex] = this.defaultCellFormatter;
    return this.formatters[colIndex](value);
  }

  /**
   * [generateFormattedData description]
   * @param  {[type]} rowData [description]
   * @return {[type]}         [description]
   */
  generateFormattedData(rowData) {
    let formattedRowData = [];
    for (var y = 0; y < rowData.length; y++) {
      let row = this.table.rows[y];
      let cellData = [];
      //cellData.push('');
      for (var i = 0; i < this.table.columns.length; i++) {
        let value = this.formatColumnValue(i, row[i]);
        if (value === undefined) {
          this.table.columns[i].hidden = true;
        }
        cellData.push(this.formatColumnValue(i, row[i]));
      }
      if (this.panel.rowNumbersEnabled) {
        cellData.unshift('rowCounter');
      }
      formattedRowData.push(cellData);
    }
    return formattedRowData;
  }

  getStyleForColumn(columnNumber) {
    let colStyle = null;
    for (let i = 0; i < this.panel.styles.length; i++) {
      let style = this.panel.styles[i];
      let column = this.table.columns[columnNumber];
      if (column === undefined) break;
      var regex = kbn.stringToJsRegex(style.pattern);
      if (column.text.match(regex)) {
        colStyle = style;
        break;
      }
    }
    return colStyle;
  }

  getCellColors(colorState, columnNumber, cellData) {
    var items = cellData.split(/(\s+)/);
    // only color cell if the content is a number?
    var bgColor = null;
    var bgColorIndex = null;
    var color = null;
    var colorIndex = null;
    let colStyle = null;
    let value = null;
    // check if the content has a numeric value after the split
    if (!isNaN(items[0])) {
      // run value through threshold function
      value = parseFloat(items[0].replace(",", "."));
      colStyle = this.getStyleForColumn(columnNumber);
    }
    if (colStyle !== null) {
      // check color for either cell or row
      if ((colorState.cell) || (colorState.row) || (colorState.rowcolumn)){
        // bgColor = _this.colorState.cell;
        bgColor = this.getColorForValue(value, colStyle);
        bgColorIndex = this.getColorIndexForValue(value, colStyle);
        color = 'white';
      }
      // just the value color is set
      if (colorState.value) {
        //color = _this.colorState.value;
        color = this.getColorForValue(value, colStyle);
        colorIndex = this.getColorIndexForValue(value, colStyle);
      }
    }
    return {
      bgColor: bgColor,
      bgColorIndex: bgColorIndex,
      color: color,
      colorIndex: colorIndex
    };
  }

  getColumnAlias(columnName) {
    // default to the columnName
    var columnAlias = columnName;
    if (this.panel.columnAliases !== undefined) {
      for (let i = 0; i < this.panel.columnAliases.length; i++) {
        if (this.panel.columnAliases[i].name === columnName) {
          columnAlias = this.panel.columnAliases[i].alias;
          break;
        }
      }
    }
    return columnAlias;
  }

  getColumnWidthHint(columnName) {
    // default to the columnName
    var columnWidth = '';
    if (this.panel.columnWidthHints !== undefined) {
      for (let i = 0; i < this.panel.columnWidthHints.length; i++) {
        if (this.panel.columnWidthHints[i].name === columnName) {
          columnWidth = this.panel.columnWidthHints[i].width;
          break;
        }
      }
    }
    return columnWidth;
  }

  /**
   * Construct table using Datatables.net API
   *  multiple types supported
   * timeseries_to_rows (column 0 = timestamp)
   * timeseries_to_columns
   * timeseries_aggregations - column 0 is the metric name (series name, not a timestamp)
   * annotations - specific headers for this
   * table
   * json (raw)
   * columns[x].type === "date" then set columndefs to parse the date, otherwise leave it as default
   * convert table.columns[N].text to columns formatted to datatables.net format
   * @return {[Boolean]} True if loaded without errors
   */
  render() {
    const tableHolderId = '#datatable-panel-table-' + this.panel.id;
    try {
      if ($.fn.dataTable.isDataTable(tableHolderId)) {
        var aDT = $(tableHolderId).DataTable();
        aDT.destroy();
        $(tableHolderId).empty();
      }
    }
    catch(err) {
      console.log("Exception: " + err.message);
    }

    if (this.panel.emptyData) {
      return;
    }
    var columns = [];
    var columnDefs = [];
    var _this = this;
    var rowNumberOffset = 0;
    if (this.panel.rowNumbersEnabled) {
      rowNumberOffset = 1;
      columns.push({
        title: '',
        type: 'number'
      });
      columnDefs.push(
        {
            "searchable": false,
            "orderable": false,
            "targets": 0,
            "width": "1%",
        });
    }
    for (let i = 0; i < this.table.columns.length; i++) {
      var columnAlias = this.getColumnAlias(this.table.columns[i].text);
      var columnWidthHint = this.getColumnWidthHint(this.table.columns[i].text);
      // NOTE: the width below is a "hint" and will be overridden as needed, this lets most tables show timestamps
      // with full width
      /* jshint loopfunc: true */
      columns.push({
        title: columnAlias,
        type: this.table.columns[i].type,
        width: columnWidthHint
      });
        columnDefs.push(
          {
            "targets": i + rowNumberOffset,
            "createdCell": function (td, cellData, rowData, row, col) {
              // hidden columns have null data
              if (cellData === null) return;
              // set the fontsize for the cell
              $(td).css('font-size', _this.panel.fontSize);
              // undefined types should have numerical data, any others are already formatted
              let actualColumn = col;
              if (_this.panel.rowNumbersEnabled) {
                actualColumn -= 1;
              }
              if (_this.table.columns[actualColumn].type !== undefined) return;
              // for coloring rows, get the "worst" threshold
              var rowColor = null;
              var color = null;
              var rowColorIndex = null;
              var rowColorData = null;
              if (_this.colorState.row) {
                // run all of the rowData through threshold check, get the "highest" index
                // and use that for the entire row
                if (rowData === null) return;
                rowColorIndex = -1;
                rowColorData = null;
                rowColor = _this.colorState.row;
                // this should be configurable...
                color = 'white';
                for (let columnNumber = 0; columnNumber < _this.table.columns.length; columnNumber++) {
                  // only columns of type undefined are checked
                  if (_this.table.columns[columnNumber].type === undefined) {
                    rowColorData = _this.getCellColors(_this.colorState, columnNumber, rowData[columnNumber + rowNumberOffset]);
                    if (rowColorData.bgColorIndex !== null) {
                      if (rowColorData.bgColorIndex > rowColorIndex) {
                        rowColorIndex = rowColorData.bgColorIndex;
                        rowColor = rowColorData.bgColor;
                      }
                    }
                  }
                }
                // style the entire row (the parent of the td is the tr)
                // this will color the rowNumber and Timestamp also
                $(td.parentNode).children().css('color', color);
                $(td.parentNode).children().css('background-color', rowColor);
              }

              if (_this.colorState.rowcolumn) {
                // run all of the rowData through threshold check, get the "highest" index
                // and use that for the entire row
                if (rowData === null) return;
                rowColorIndex = -1;
                rowColorData = null;
                rowColor = _this.colorState.rowcolumn;
                // this should be configurable...
                color = 'white';
                for (let columnNumber = 0; columnNumber < _this.table.columns.length; columnNumber++) {
                  // only columns of type undefined are checked
                  if (_this.table.columns[columnNumber].type === undefined) {
                    rowColorData = _this.getCellColors(_this.colorState, columnNumber, rowData[columnNumber + rowNumberOffset]);
                    if (rowColorData.bgColorIndex !== null) {
                      if (rowColorData.bgColorIndex > rowColorIndex) {
                        rowColorIndex = rowColorData.bgColorIndex;
                        rowColor = rowColorData.bgColor;
                      }
                    }
                  }
                }
                // style the rowNumber and Timestamp column
                // the cell colors will be determined in the next phase
                if (_this.table.columns[0].type !== undefined) {
                  var children = $(td.parentNode).children();
                  var aChild = children[0];
                  $(aChild).css('color', color);
                  $(aChild).css('background-color', rowColor);
                  // the 0 column contains the row number, if they are enabled
                  // then the above just filled in the color for the row number,
                  // now take care of the timestamp
                  if (_this.panel.rowNumbersEnabled) {
                    aChild = children[1];
                    $(aChild).css('color', color);
                    $(aChild).css('background-color', rowColor);
                  }
                }
              }

              // Process cell coloring
              // Two scenarios:
              //    1) Cell coloring is enabled, the above row color is skipped
              //    2) RowColumn is enabled, the above row color is process, but we also
              //    set the cell colors individually
              var colorData = _this.getCellColors(_this.colorState, actualColumn, cellData);
              if ((_this.colorState.cell) || (_this.colorState.rowcolumn)){
                if (colorData.color !== undefined) {
                  $(td).css('color', colorData.color);
                }
                if (colorData.bgColor !== undefined) {
                  $(td).css('background-color', colorData.bgColor);
                }
              } else if (_this.colorState.value) {
                if (colorData.color !== undefined) {
                  $(td).css('color', colorData.color);
                }
              }
            }
          }
        );
    }

    try {
      var should_destroy = false;
      if ( $.fn.dataTable.isDataTable( '#datatable-panel-table-' + this.panel.id )) {
        should_destroy = true;
      }
      if (should_destroy) {
        var destroyedDT = $('#datatable-panel-table-' + this.panel.id).DataTable();
        destroyedDT.destroy();
        $('#datatable-panel-table-' + this.panel.id).empty();
      }
    }
    catch(err) {
      console.log("Exception: " + err.message);
    }
    // sanity check
    // annotations come back as 4 items in an array per row. If the first row content is undefined, then modify to empty
    // since datatables.net throws errors
    if (this.table.rows[0].length === 4) {
      if (this.table.rows[0][0] === undefined) {
        // detected empty annotations
        this.table.rows = [];
      }
    }
    // pass the formatted rows into the datatable
    var formattedData = this.generateFormattedData(this.table.rows);

    if (this.panel.rowNumbersEnabled) {
      // shift the data to the right
    }
    var panelHeight = this.panel.panelHeight;
    let orderSetting = this.panel.sortByColumnsData;
    //if (this.panel.rowNumbersEnabled) {
    //  // when row numbers are enabled, show them ascending
    //  orderSetting = [[0, 'asc']];
    //}

    var tableOptions = {
      "lengthMenu": [ [5, 10, 25, 50, 75, 100, -1], [5, 10, 25, 50, 75, 100, "All"] ],
      searching: this.panel.searchEnabled,
      info: this.panel.infoEnabled,
      lengthChange: this.panel.lengthChangeEnabled,
      scrollCollapse: false,
      scrollX: true,
      stateSave: true,
      dom: 'Bfrtip',
      buttons: [
        'copy', 'excel', 'csv', 'pdf', 'print'
      ],
      select: {
        style: 'os'
      },
      data: formattedData,
      columns: columns,
      columnDefs: columnDefs,
      "search": {
        "regex": true
      },
      order: orderSetting
    };
    if (this.panel.scroll) {
      tableOptions.paging = false;
      tableOptions.scrollY = panelHeight;
    } else {
      tableOptions.paging = true;
      tableOptions.pagingType = this.panel.datatablePagingType;
    }
    var $datatable = $(tableHolderId);
    var newDT = $datatable.DataTable(tableOptions);

    // hide columns that are marked hidden
    for (let i = 0; i < this.table.columns.length; i++) {
      if (this.table.columns[i].hidden) {
        newDT.column( i + rowNumberOffset ).visible( false );
      }
    }

    // enable compact mode
    if (this.panel.compactRowsEnabled) {
      $datatable.addClass( 'compact' );
    }
    // enable striped mode
    if (this.panel.stripedRowsEnabled) {
      $datatable.addClass( 'stripe' );
    }
    if (this.panel.hoverEnabled) {
      $datatable.addClass( 'hover' );
    }
    if (this.panel.orderColumnEnabled) {
      $datatable.addClass( 'order-column' );
    }
    // these two are mutually exclusive
    if (this.panel.showCellBorders) {
      $datatable.addClass( 'cell-border' );
    } else {
      if (this.panel.showRowBorders) {
        $datatable.addClass( 'row-border' );
      }
    }
    if (!this.panel.scroll) {
      // set the page size
      if (this.panel.rowsPerPage !== null) {
        newDT.page.len( this.panel.rowsPerPage ).draw();
      }
    }
    // function to display row numbers
    if (this.panel.rowNumbersEnabled) {
      newDT.on( 'order.dt search.dt', function () {
        newDT.column(0, {search:'applied', order:'applied'}).nodes().each( function (cell, i) {
            cell.innerHTML = i+1;
        } );
      } ).draw();
    }
  }

  render_values() {
      let rows = [];

      for (var y = 0; y < this.table.rows.length; y++) {
        let row = this.table.rows[y];
        let new_row = [];
        for (var i = 0; i < this.table.columns.length; i++) {
          new_row.push(this.formatColumnValue(i, row[i]));
        }
        rows.push(new_row);
      }
      return {
          columns: this.table.columns,
          rows: rows,
      };
  }
}
