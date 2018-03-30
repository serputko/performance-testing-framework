import { MetricsPanelCtrl } from 'app/plugins/sdk';
import $ from 'jquery';
import angular from 'angular';
import kbn from 'app/core/utils/kbn';

import * as FileExport from 'app/core/utils/file_export';
import DataTable from './libs/datatables.net/js/jquery.dataTables.min.js';

// this is needed for basic datatables.net theme
//import './libs/datatables.net-dt/css/jquery.dataTables.min.css!';

// See this for styling https://datatables.net/manual/styling/theme-creator

/*
Dark Theme Basic uses these values

table section border: #242222 rgb(36,34,34)
row/cell border: #141414 rgb(20,20,20)
row background: #1F1D1D  rgb(31,29,29)
row selected color:  #242222 rgb(36,34,34)
control text: #1FB2E5 rgb(31,178,229)
control text: white  (dataTables_paginate)
paging active button: #242222 rgb(36,34,34)
paging button hover: #111111 rgb(17,17,17)

with these modifications:
.dataTables_wrapper .dataTables_paginate .paginate_button {
  color: white
}
table.dataTable tfoot th {
  color: #1FB2E5;
  font-weight: bold; }


Light Theme Basic uses these values

table section border: #ECECEC rgb(236,236,236)
row/cell border: #FFFFFF rgb(255,255,255)
row background: #FBFBFB  rgb(251,251,251)
row selected color:  #ECECEC rgb(236,236,236)
control text: black
paging active button: #BEBEBE
paging button hover: #C0C0C0

with these modifications:
.dataTables_wrapper .dataTables_paginate .paginate_button.current, .dataTables_wrapper .dataTables_paginate .paginate_button.current:hover {
  color: #1fb2e5 !important;
table.dataTable tfoot th {
  color: #1FB2E5;
  font-weight: bold; }
*/

import './css/panel.css!';
// themes attempt to modify the entire page, this "contains" the styling to the table only
import './css/datatables-wrapper.css!';

import {
  transformDataToTable,
  transformers
} from './transformers';

import { DatatableRenderer } from './renderer';

const panelDefaults = {
  targets: [{}],
  transform: 'timeseries_to_columns',
  rowsPerPage: 5,
  showHeader: true,
  styles: [
    {
      type: 'date',
      pattern: 'Time',
      dateFormat: 'YYYY-MM-DD HH:mm:ss',
      },
    {
      unit: 'short',
      type: 'number',
      decimals: 2,
      colors: ["rgba(245, 54, 54, 0.9)", "rgba(237, 129, 40, 0.89)", "rgba(50, 172, 45, 0.97)"],
      colorMode: null,
      pattern: '/.*/',
      thresholds: [],
      }
    ],
  columns: [],
  scroll: false,
  scrollHeight: 'default',
  fontSize: '100%',
  sort: {
    col: 0,
    desc: true
  },
  datatableTheme: 'basic_theme',
  themeOptions: {
    light: './css/datatable-light.css',
    dark:  './css/datatable-dark.css'
  },
  rowNumbersEnabled: false,
  infoEnabled: true,
  searchEnabled: true,
  showCellBorders: false,
  showRowBorders: true,
  hoverEnabled: true,
  orderColumnEnabled: true,
  compactRowsEnabled: false,
  stripedRowsEnabled: true,
  lengthChangeEnabled: true,
  datatablePagingType: 'simple_numbers',
  pagingTypes: [
    {
      text: 'Page number buttons only',
      value: 'numbers',
    },
    {
      text: "'Previous' and 'Next' buttons only",
      value: 'simple'
    },
    {
      text: "'Previous' and 'Next' buttons, plus page numbers",
      value: 'simple_numbers'
    },
    {
      text: "'First', 'Previous', 'Next' and 'Last' buttons",
      value: 'full'
    },
    {
      text: "'First', 'Previous', 'Next' and 'Last' buttons, plus page numbers",
      value: 'full_numbers'
    },
    {
      text: "'First' and 'Last' buttons, plus page numbers",
      value: 'first_last_numbers'
    }
  ],
  themes: [
    {
      value: 'basic_theme',
      text: 'Basic',
      disabled: false,
    },
    {
      value: 'bootstrap_theme',
      text: 'Bootstrap',
      disabled: true,
    },
    {
      value: 'foundation_theme',
      text: 'Foundation',
      disabled: true,
    },
    {
      value: 'themeroller_theme',
      text: 'ThemeRoller',
      disabled: true,
    }
  ]

};

export class DatatablePanelCtrl extends MetricsPanelCtrl {

  constructor($scope, $injector, $http, $location, uiSegmentSrv, annotationsSrv) {
    super($scope, $injector);

    this.pageIndex = 0;
    this.table = null;
    this.dataRaw = [];
    this.transformers = transformers;
    this.annotationsSrv = annotationsSrv;
    this.uiSegmentSrv = uiSegmentSrv;
    // editor

    this.addColumnSegment = uiSegmentSrv.newPlusButton();
    this.fontSizes = ['80%', '90%', '100%', '110%', '120%', '130%', '150%', '160%', '180%', '200%', '220%', '250%'];
    this.colorModes = [
      {
        text: 'Disabled',
        value: null
      },
      {
        text: 'Cell',
        value: 'cell'
      },
      {
        text: 'Value',
        value: 'value'
      },
      {
        text: 'Row',
        value: 'row'
      },
      {
        text: 'Row Column',
        value: 'rowcolumn'
      },
    ];
    this.columnTypes = [
      {
        text: 'Number',
        value: 'number'
      },
      {
        text: 'String',
        value: 'string'
      },
      {
        text: 'Date',
        value: 'date'
      },
      {
        text: 'Hidden',
        value: 'hidden'
      }
    ];
    this.unitFormats = kbn.getUnitFormats();
    this.dateFormats = [
      {
        text: 'YYYY-MM-DD HH:mm:ss',
        value: 'YYYY-MM-DD HH:mm:ss'
      },
      {
        text: 'MM/DD/YY h:mm:ss a',
        value: 'MM/DD/YY h:mm:ss a'
      },
      {
        text: 'MMMM D, YYYY LT',
        value: 'MMMM D, YYYY LT'
      },
    ];
    // this is used from bs-typeahead and needs to be instance bound
    this.getColumnNames = () => {
      if (!this.table) {
        return [];
      }
      return _.map(this.table.columns, function(col) {
        return col.text;
      });
    };

    if (this.panel.styles === void 0) {
      this.panel.styles = this.panel.columns;
      this.panel.columns = this.panel.fields;
      delete this.panel.columns;
      delete this.panel.fields;
    }
    _.defaults(this.panel, panelDefaults);

    System.config({
        paths: {
            "datatables.net": this.getPanelPath() + "libs/datatables.net/js/jquery.dataTables.min",
            "datatables.net-bs" : this.getPanelPath() + "libs/datatables.net-bs/js/dataTables.bootstrap.min",
            "datatables.net-jqui" : this.getPanelPath() + "libs/datatables.net-jqui/js/dataTables.jqueryui.min",
            "datatables.net-zf" : this.getPanelPath() + "libs/datatables.net-zf/js/dataTables.foundation.min",
        }
    });

    // basic datatables theme
    // alternative themes are disabled since they affect all datatable panels on same page currently
    switch (this.panel.datatableTheme) {
      case 'basic_theme':
        System.import(this.getPanelPath() +  'libs/datatables.net-dt/css/jquery.dataTables.min.css!');
        if (grafanaBootData.user.lightTheme) {
          System.import(this.getPanelPath() + this.panel.themeOptions.light + '!css');
        } else {
          System.import(this.getPanelPath() + this.panel.themeOptions.dark + "!css");
        }
        break;
      case 'bootstrap_theme':
        System.import(this.getPanelPath() + 'libs/datatables.net-bs/js/dataTables.bootstrap.min.js');
        System.import(this.getPanelPath() + 'libs/bootstrap/dist/css/prefixed-bootstrap.min.css!');
        System.import(this.getPanelPath() + 'libs/datatables.net-bs/css/dataTables.bootstrap.min.css!');
        if (!grafanaBootData.user.lightTheme) {
          System.import(this.getPanelPath() + 'css/prefixed-bootstrap-slate.min.css!');
        }
        break;
      case 'foundation_theme':
        System.import(this.getPanelPath() + 'libs/datatables.net-zf/js/dataTables.foundation.min.js');
        System.import(this.getPanelPath() + 'libs/foundation/css/prefixed-foundation.min.css!');
        System.import(this.getPanelPath() + 'libs/datatables.net-zf/css/dataTables.foundation.min.css!');
        break;
      case 'themeroller_theme':
        System.import(this.getPanelPath() +  'libs/datatables.net-jqui/js/dataTables.jqueryui.min.js');
        System.import(this.getPanelPath() +  'libs/datatables.net-jqui/css/dataTables.jqueryui.min.css!');
        System.import(this.getPanelPath() +  'css/jquery-ui-smoothness.css!');
        break;
    default:
        System.import(this.getPanelPath() +  'libs/datatables.net-dt/css/jquery.dataTables.min.css!');
        if (grafanaBootData.user.lightTheme) {
          System.import(this.getPanelPath() + this.panel.themeOptions.light + '!css');
        } else {
          System.import(this.getPanelPath() + this.panel.themeOptions.dark + "!css");
        }
        break;
    }
    this.dataLoaded = true;
    this.http = $http;
    this.events.on('data-received', this.onDataReceived.bind(this));
    this.events.on('data-error', this.onDataError.bind(this));
    this.events.on('data-snapshot-load', this.onDataReceived.bind(this));
    this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
    this.events.on('init-panel-actions', this.onInitPanelActions.bind(this));
  }

  onInitPanelActions(actions) {
      actions.push({
        text: 'Export CSV',
        click: 'ctrl.exportCsv()'
      });
    }

  // setup the editor
  onInitEditMode() {
    // determine the path to this plugin
    var panels = grafanaBootData.settings.panels;
    var thisPanel = panels[this.pluginId];
    var thisPanelPath = thisPanel.baseUrl + '/';
    // add the relative path to the partial
    var optionsPath = thisPanelPath + 'partials/editor.options.html';
    this.addEditorTab('Options', optionsPath, 2);
    var datatableOptionsPath = thisPanelPath + 'partials/datatables.options.html';
    this.addEditorTab('Datatable Options', datatableOptionsPath, 3);
  }

  getPanelPath() {
    var panels = grafanaBootData.settings.panels;
    var thisPanel = panels[this.pluginId];
    //
    // For Grafana < 4.6, the system loader preprends publib to the url, add a .. to go back one level
    if (thisPanel.baseUrl.startsWith("publib"))
      return '../' + thisPanel.baseUrl + '/';
    else {
      // Grafana >= 4.6, webpack is used, need to fix the path for imports
      if (thisPanel.baseUrl.startsWith("public")) {
        return thisPanel.baseUrl.substring(7) + '/';
      }
      else {
        // this should never happen, but just in case, append a slash to the url
        return thisPanel.baseUrl + '/';
      }
    }
  }

  issueQueries(datasource) {
    this.pageIndex = 0;
    if (this.panel.transform === 'annotations') {
      this.setTimeQueryStart();
      return this.annotationsSrv.getAnnotations({
          dashboard: this.dashboard,
          panel: this.panel,
          range: this.range
        })
        .then(annotations => {
          return {
            data: annotations
          };
        });
    }
    return super.issueQueries(datasource);
  }

  onDataError(err) {
    this.dataRaw = [];
    this.render();
  }

  onDataReceived(dataList) {
    this.dataRaw = dataList;
    this.pageIndex = 0;

    // automatically correct transform mode based on data
    if (this.dataRaw && this.dataRaw.length) {
      if (this.dataRaw[0].type === 'table') {
        this.panel.transform = 'table';
      } else {
        if (this.dataRaw[0].type === 'docs') {
          this.panel.transform = 'json';
        } else {
          if (this.panel.transform === 'table' || this.panel.transform === 'json') {
            this.panel.transform = 'timeseries_to_rows';
          }
        }
      }
    }
    this.render();
  }

  render() {
    this.table = transformDataToTable(this.dataRaw, this.panel);
    this.table.sort(this.panel.sort);
    this.panel.emptyData = this.table.rows.length === 0 ||
                           this.table.columns.length === 0;
    return super.render(this.table);
  }

  getPanelHeight() {
    // panel can have a fixed height set via "General" tab in panel editor
    var tmpPanelHeight = this.panel.height;
    if ((typeof tmpPanelHeight === 'undefined') || (tmpPanelHeight === "")) {
      // grafana also supplies the height, try to use that if the panel does not have a height
      tmpPanelHeight = String(this.height);
      if (typeof tmpPanelHeight === 'undefined') {
        // height still cannot be determined, get it from the row instead
        tmpPanelHeight = this.row.height;
        if (typeof tmpPanelHeight === 'undefined') {
          // last resort - default to 250px (this should never happen)
          tmpPanelHeight = "250";
        }
      }
    }
    // replace px
    tmpPanelHeight = tmpPanelHeight.replace("px","");
    // convert to numeric value
    var actualHeight = parseInt(tmpPanelHeight);
    return actualHeight;
  }

  exportCsv() {
    var renderer = new DatatableRenderer(this.panel, this.table, this.dashboard.isTimezoneUtc(), this.$sanitize);
    FileExport.exportTableDataToCsv(renderer.render_values());
  }

  link(scope, elem, attrs, ctrl) {
    var data;
    var panel = ctrl.panel;
    var formatters = [];
    var _this = this;

    /**
     * [renderPanel description]
     * @return {[type]} [description]
     */
    function renderPanel() {
      var renderer = new DatatableRenderer(panel, ctrl.table, ctrl.dashboard.isTimezoneUtc(), ctrl.$sanitize);
      renderer.render();
      _this.dataLoaded = true;
    }

    ctrl.panel.panelHeight = this.getPanelHeight();
    ctrl.events.on('render', function(renderData) {
      data = renderData || data;
      if (data) {
        renderPanel();
      }
      ctrl.renderingCompleted();
    });
  }

  // editor methods
  //
  // cell and row borders cannot both be set at the same time
  showCellBordersChanged() {
    if (this.panel.showCellBorders) {
      this.panel.showRowBorders = false;
    }
    this.render();
  }

  themeChanged() {
    //console.log(this.panel.datatableTheme);
    this.render();
  }

  transformChanged() {
    this.panel.columns = [];
    this.render();
  }
  removeColumn(column) {
    this.panel.columns = _.without(this.panel.columns, column);
    this.render();
  }

  getColumnOptions() {
    if (!this.dataRaw) {
      return this.$q.when([]);
    }
    var columns = this.transformers[this.panel.transform].getColumns(this.dataRaw);
    var segments = _.map(columns, (c) => this.uiSegmentSrv.newSegment({
      value: c.text
    }));
    return this.$q.when(segments);
  }

  addColumn() {
    var columns = transformers[this.panel.transform].getColumns(this.dataRaw);
    var column = _.find(columns, {
      text: this.addColumnSegment.value
    });

    if (column) {
      this.panel.columns.push(column);
      this.render();
    }

    var plusButton = this.uiSegmentSrv.newPlusButton();
    this.addColumnSegment.html = plusButton.html;
    this.addColumnSegment.value = plusButton.value;
  }

  addColumnStyle() {
      var columnStyleDefaults = {
        unit: 'short',
        type: 'number',
        decimals: 2,
        colors: ["rgba(245, 54, 54, 0.9)", "rgba(237, 129, 40, 0.89)", "rgba(50, 172, 45, 0.97)"],
        colorMode: null,
        pattern: '/.*/',
        dateFormat: 'YYYY-MM-DD HH:mm:ss',
        thresholds: [],
      };
      this.panel.styles.push(angular.copy(columnStyleDefaults));
  }
  removeColumnStyle(style) {
    this.panel.styles = _.without(this.panel.styles, style);
  }
  setUnitFormat(column, subItem) {
    column.unit = subItem.value;
    this.render();
  }
  invertColorOrder(index) {
    var ref = this.panel.styles[index].colors;
    var copy = ref[0];
    ref[0] = ref[2];
    ref[2] = copy;
    this.render();
  }
}
DatatablePanelCtrl.templateUrl = 'partials/template.html';
