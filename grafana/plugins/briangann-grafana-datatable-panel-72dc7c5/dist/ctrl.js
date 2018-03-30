'use strict';

System.register(['app/plugins/sdk', 'jquery', 'angular', 'app/core/utils/kbn', 'app/core/utils/file_export', './libs/datatables.net/js/jquery.dataTables.min.js', './css/panel.css!', './css/datatables-wrapper.css!', './transformers', './renderer'], function (_export, _context) {
  "use strict";

  var MetricsPanelCtrl, $, angular, kbn, FileExport, DataTable, transformDataToTable, transformers, DatatableRenderer, _createClass, _get, panelDefaults, DatatablePanelCtrl;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  return {
    setters: [function (_appPluginsSdk) {
      MetricsPanelCtrl = _appPluginsSdk.MetricsPanelCtrl;
    }, function (_jquery) {
      $ = _jquery.default;
    }, function (_angular) {
      angular = _angular.default;
    }, function (_appCoreUtilsKbn) {
      kbn = _appCoreUtilsKbn.default;
    }, function (_appCoreUtilsFile_export) {
      FileExport = _appCoreUtilsFile_export;
    }, function (_libsDatatablesNetJsJqueryDataTablesMinJs) {
      DataTable = _libsDatatablesNetJsJqueryDataTablesMinJs.default;
    }, function (_cssPanelCss) {}, function (_cssDatatablesWrapperCss) {}, function (_transformers) {
      transformDataToTable = _transformers.transformDataToTable;
      transformers = _transformers.transformers;
    }, function (_renderer) {
      DatatableRenderer = _renderer.DatatableRenderer;
    }],
    execute: function () {
      _createClass = function () {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }

        return function (Constructor, protoProps, staticProps) {
          if (protoProps) defineProperties(Constructor.prototype, protoProps);
          if (staticProps) defineProperties(Constructor, staticProps);
          return Constructor;
        };
      }();

      _get = function get(object, property, receiver) {
        if (object === null) object = Function.prototype;
        var desc = Object.getOwnPropertyDescriptor(object, property);

        if (desc === undefined) {
          var parent = Object.getPrototypeOf(object);

          if (parent === null) {
            return undefined;
          } else {
            return get(parent, property, receiver);
          }
        } else if ("value" in desc) {
          return desc.value;
        } else {
          var getter = desc.get;

          if (getter === undefined) {
            return undefined;
          }

          return getter.call(receiver);
        }
      };

      panelDefaults = {
        targets: [{}],
        transform: 'timeseries_to_columns',
        rowsPerPage: 5,
        showHeader: true,
        styles: [{
          type: 'date',
          pattern: 'Time',
          dateFormat: 'YYYY-MM-DD HH:mm:ss'
        }, {
          unit: 'short',
          type: 'number',
          decimals: 2,
          colors: ["rgba(245, 54, 54, 0.9)", "rgba(237, 129, 40, 0.89)", "rgba(50, 172, 45, 0.97)"],
          colorMode: null,
          pattern: '/.*/',
          thresholds: []
        }],
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
          dark: './css/datatable-dark.css'
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
        pagingTypes: [{
          text: 'Page number buttons only',
          value: 'numbers'
        }, {
          text: "'Previous' and 'Next' buttons only",
          value: 'simple'
        }, {
          text: "'Previous' and 'Next' buttons, plus page numbers",
          value: 'simple_numbers'
        }, {
          text: "'First', 'Previous', 'Next' and 'Last' buttons",
          value: 'full'
        }, {
          text: "'First', 'Previous', 'Next' and 'Last' buttons, plus page numbers",
          value: 'full_numbers'
        }, {
          text: "'First' and 'Last' buttons, plus page numbers",
          value: 'first_last_numbers'
        }],
        themes: [{
          value: 'basic_theme',
          text: 'Basic',
          disabled: false
        }, {
          value: 'bootstrap_theme',
          text: 'Bootstrap',
          disabled: true
        }, {
          value: 'foundation_theme',
          text: 'Foundation',
          disabled: true
        }, {
          value: 'themeroller_theme',
          text: 'ThemeRoller',
          disabled: true
        }]

      };

      _export('DatatablePanelCtrl', DatatablePanelCtrl = function (_MetricsPanelCtrl) {
        _inherits(DatatablePanelCtrl, _MetricsPanelCtrl);

        function DatatablePanelCtrl($scope, $injector, $http, $location, uiSegmentSrv, annotationsSrv) {
          _classCallCheck(this, DatatablePanelCtrl);

          var _this2 = _possibleConstructorReturn(this, (DatatablePanelCtrl.__proto__ || Object.getPrototypeOf(DatatablePanelCtrl)).call(this, $scope, $injector));

          _this2.pageIndex = 0;
          _this2.table = null;
          _this2.dataRaw = [];
          _this2.transformers = transformers;
          _this2.annotationsSrv = annotationsSrv;
          _this2.uiSegmentSrv = uiSegmentSrv;
          // editor

          _this2.addColumnSegment = uiSegmentSrv.newPlusButton();
          _this2.fontSizes = ['80%', '90%', '100%', '110%', '120%', '130%', '150%', '160%', '180%', '200%', '220%', '250%'];
          _this2.colorModes = [{
            text: 'Disabled',
            value: null
          }, {
            text: 'Cell',
            value: 'cell'
          }, {
            text: 'Value',
            value: 'value'
          }, {
            text: 'Row',
            value: 'row'
          }, {
            text: 'Row Column',
            value: 'rowcolumn'
          }];
          _this2.columnTypes = [{
            text: 'Number',
            value: 'number'
          }, {
            text: 'String',
            value: 'string'
          }, {
            text: 'Date',
            value: 'date'
          }, {
            text: 'Hidden',
            value: 'hidden'
          }];
          _this2.unitFormats = kbn.getUnitFormats();
          _this2.dateFormats = [{
            text: 'YYYY-MM-DD HH:mm:ss',
            value: 'YYYY-MM-DD HH:mm:ss'
          }, {
            text: 'MM/DD/YY h:mm:ss a',
            value: 'MM/DD/YY h:mm:ss a'
          }, {
            text: 'MMMM D, YYYY LT',
            value: 'MMMM D, YYYY LT'
          }];
          // this is used from bs-typeahead and needs to be instance bound
          _this2.getColumnNames = function () {
            if (!_this2.table) {
              return [];
            }
            return _.map(_this2.table.columns, function (col) {
              return col.text;
            });
          };

          if (_this2.panel.styles === void 0) {
            _this2.panel.styles = _this2.panel.columns;
            _this2.panel.columns = _this2.panel.fields;
            delete _this2.panel.columns;
            delete _this2.panel.fields;
          }
          _.defaults(_this2.panel, panelDefaults);

          System.config({
            paths: {
              "datatables.net": _this2.getPanelPath() + "libs/datatables.net/js/jquery.dataTables.min",
              "datatables.net-bs": _this2.getPanelPath() + "libs/datatables.net-bs/js/dataTables.bootstrap.min",
              "datatables.net-jqui": _this2.getPanelPath() + "libs/datatables.net-jqui/js/dataTables.jqueryui.min",
              "datatables.net-zf": _this2.getPanelPath() + "libs/datatables.net-zf/js/dataTables.foundation.min"
            }
          });

          // basic datatables theme
          // alternative themes are disabled since they affect all datatable panels on same page currently
          switch (_this2.panel.datatableTheme) {
            case 'basic_theme':
              System.import(_this2.getPanelPath() + 'libs/datatables.net-dt/css/jquery.dataTables.min.css!');
              if (grafanaBootData.user.lightTheme) {
                System.import(_this2.getPanelPath() + _this2.panel.themeOptions.light + '!css');
              } else {
                System.import(_this2.getPanelPath() + _this2.panel.themeOptions.dark + "!css");
              }
              break;
            case 'bootstrap_theme':
              System.import(_this2.getPanelPath() + 'libs/datatables.net-bs/js/dataTables.bootstrap.min.js');
              System.import(_this2.getPanelPath() + 'libs/bootstrap/dist/css/prefixed-bootstrap.min.css!');
              System.import(_this2.getPanelPath() + 'libs/datatables.net-bs/css/dataTables.bootstrap.min.css!');
              if (!grafanaBootData.user.lightTheme) {
                System.import(_this2.getPanelPath() + 'css/prefixed-bootstrap-slate.min.css!');
              }
              break;
            case 'foundation_theme':
              System.import(_this2.getPanelPath() + 'libs/datatables.net-zf/js/dataTables.foundation.min.js');
              System.import(_this2.getPanelPath() + 'libs/foundation/css/prefixed-foundation.min.css!');
              System.import(_this2.getPanelPath() + 'libs/datatables.net-zf/css/dataTables.foundation.min.css!');
              break;
            case 'themeroller_theme':
              System.import(_this2.getPanelPath() + 'libs/datatables.net-jqui/js/dataTables.jqueryui.min.js');
              System.import(_this2.getPanelPath() + 'libs/datatables.net-jqui/css/dataTables.jqueryui.min.css!');
              System.import(_this2.getPanelPath() + 'css/jquery-ui-smoothness.css!');
              break;
            default:
              System.import(_this2.getPanelPath() + 'libs/datatables.net-dt/css/jquery.dataTables.min.css!');
              if (grafanaBootData.user.lightTheme) {
                System.import(_this2.getPanelPath() + _this2.panel.themeOptions.light + '!css');
              } else {
                System.import(_this2.getPanelPath() + _this2.panel.themeOptions.dark + "!css");
              }
              break;
          }
          _this2.dataLoaded = true;
          _this2.http = $http;
          _this2.events.on('data-received', _this2.onDataReceived.bind(_this2));
          _this2.events.on('data-error', _this2.onDataError.bind(_this2));
          _this2.events.on('data-snapshot-load', _this2.onDataReceived.bind(_this2));
          _this2.events.on('init-edit-mode', _this2.onInitEditMode.bind(_this2));
          _this2.events.on('init-panel-actions', _this2.onInitPanelActions.bind(_this2));
          return _this2;
        }

        _createClass(DatatablePanelCtrl, [{
          key: 'onInitPanelActions',
          value: function onInitPanelActions(actions) {
            actions.push({
              text: 'Export CSV',
              click: 'ctrl.exportCsv()'
            });
          }
        }, {
          key: 'onInitEditMode',
          value: function onInitEditMode() {
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
        }, {
          key: 'getPanelPath',
          value: function getPanelPath() {
            var panels = grafanaBootData.settings.panels;
            var thisPanel = panels[this.pluginId];
            //
            // For Grafana < 4.6, the system loader preprends publib to the url, add a .. to go back one level
            if (thisPanel.baseUrl.startsWith("publib")) return '../' + thisPanel.baseUrl + '/';else {
              // Grafana >= 4.6, webpack is used, need to fix the path for imports
              if (thisPanel.baseUrl.startsWith("public")) {
                return thisPanel.baseUrl.substring(7) + '/';
              } else {
                // this should never happen, but just in case, append a slash to the url
                return thisPanel.baseUrl + '/';
              }
            }
          }
        }, {
          key: 'issueQueries',
          value: function issueQueries(datasource) {
            this.pageIndex = 0;
            if (this.panel.transform === 'annotations') {
              this.setTimeQueryStart();
              return this.annotationsSrv.getAnnotations({
                dashboard: this.dashboard,
                panel: this.panel,
                range: this.range
              }).then(function (annotations) {
                return {
                  data: annotations
                };
              });
            }
            return _get(DatatablePanelCtrl.prototype.__proto__ || Object.getPrototypeOf(DatatablePanelCtrl.prototype), 'issueQueries', this).call(this, datasource);
          }
        }, {
          key: 'onDataError',
          value: function onDataError(err) {
            this.dataRaw = [];
            this.render();
          }
        }, {
          key: 'onDataReceived',
          value: function onDataReceived(dataList) {
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
        }, {
          key: 'render',
          value: function render() {
            this.table = transformDataToTable(this.dataRaw, this.panel);
            this.table.sort(this.panel.sort);
            this.panel.emptyData = this.table.rows.length === 0 || this.table.columns.length === 0;
            return _get(DatatablePanelCtrl.prototype.__proto__ || Object.getPrototypeOf(DatatablePanelCtrl.prototype), 'render', this).call(this, this.table);
          }
        }, {
          key: 'getPanelHeight',
          value: function getPanelHeight() {
            // panel can have a fixed height set via "General" tab in panel editor
            var tmpPanelHeight = this.panel.height;
            if (typeof tmpPanelHeight === 'undefined' || tmpPanelHeight === "") {
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
            tmpPanelHeight = tmpPanelHeight.replace("px", "");
            // convert to numeric value
            var actualHeight = parseInt(tmpPanelHeight);
            return actualHeight;
          }
        }, {
          key: 'exportCsv',
          value: function exportCsv() {
            var renderer = new DatatableRenderer(this.panel, this.table, this.dashboard.isTimezoneUtc(), this.$sanitize);
            FileExport.exportTableDataToCsv(renderer.render_values());
          }
        }, {
          key: 'link',
          value: function link(scope, elem, attrs, ctrl) {
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
            ctrl.events.on('render', function (renderData) {
              data = renderData || data;
              if (data) {
                renderPanel();
              }
              ctrl.renderingCompleted();
            });
          }
        }, {
          key: 'showCellBordersChanged',
          value: function showCellBordersChanged() {
            if (this.panel.showCellBorders) {
              this.panel.showRowBorders = false;
            }
            this.render();
          }
        }, {
          key: 'themeChanged',
          value: function themeChanged() {
            //console.log(this.panel.datatableTheme);
            this.render();
          }
        }, {
          key: 'transformChanged',
          value: function transformChanged() {
            this.panel.columns = [];
            this.render();
          }
        }, {
          key: 'removeColumn',
          value: function removeColumn(column) {
            this.panel.columns = _.without(this.panel.columns, column);
            this.render();
          }
        }, {
          key: 'getColumnOptions',
          value: function getColumnOptions() {
            var _this3 = this;

            if (!this.dataRaw) {
              return this.$q.when([]);
            }
            var columns = this.transformers[this.panel.transform].getColumns(this.dataRaw);
            var segments = _.map(columns, function (c) {
              return _this3.uiSegmentSrv.newSegment({
                value: c.text
              });
            });
            return this.$q.when(segments);
          }
        }, {
          key: 'addColumn',
          value: function addColumn() {
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
        }, {
          key: 'addColumnStyle',
          value: function addColumnStyle() {
            var columnStyleDefaults = {
              unit: 'short',
              type: 'number',
              decimals: 2,
              colors: ["rgba(245, 54, 54, 0.9)", "rgba(237, 129, 40, 0.89)", "rgba(50, 172, 45, 0.97)"],
              colorMode: null,
              pattern: '/.*/',
              dateFormat: 'YYYY-MM-DD HH:mm:ss',
              thresholds: []
            };
            this.panel.styles.push(angular.copy(columnStyleDefaults));
          }
        }, {
          key: 'removeColumnStyle',
          value: function removeColumnStyle(style) {
            this.panel.styles = _.without(this.panel.styles, style);
          }
        }, {
          key: 'setUnitFormat',
          value: function setUnitFormat(column, subItem) {
            column.unit = subItem.value;
            this.render();
          }
        }, {
          key: 'invertColorOrder',
          value: function invertColorOrder(index) {
            var ref = this.panel.styles[index].colors;
            var copy = ref[0];
            ref[0] = ref[2];
            ref[2] = copy;
            this.render();
          }
        }]);

        return DatatablePanelCtrl;
      }(MetricsPanelCtrl));

      _export('DatatablePanelCtrl', DatatablePanelCtrl);

      DatatablePanelCtrl.templateUrl = 'partials/template.html';
    }
  };
});
//# sourceMappingURL=ctrl.js.map
