import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { floor } from 'lodash';
import { BehaviorSubject, ReplaySubject, Subscription } from 'rxjs';
import { delay, map, skip, switchMap, takeUntil, tap } from 'rxjs/operators';

import {
  AppThemeEnum,
  EnvironmentConfigInterface,
  EnvService,
  MenuSidebarFooterData,
  PeDataGridButtonItem,
  PeDataGridFilterItems,
  PeDataGridListOptions,
  PeDataGridSortByAction,
  PeDataGridSortByActionIcon,
  PeFilterContainsEnum,
  PE_ENV,
  TreeFilterNode,
} from '@pe/common';
import { PeDataGridComponent, PeDataGridSidebarService } from '@pe/data-grid';
import { TranslateService } from '@pe/i18n-core';
import { PeOverlayWidgetService } from '@pe/overlay-widget';
import { PePlatformHeaderConfig, PePlatformHeaderService } from '@pe/platform-header';
import { PeDateTimePickerExtendedService } from '@pe/ui';

import { ActualPeStatisticsApi, PeWidgetService, ucfirst } from '../../infrastructure';
import { PeStatisticsSingleSelectedAction } from '../../interfaces/statistics.interface';
import { sizeOptions } from '../../overlay/form/statistics-form.component';
import { PeStatisticsOverlayComponent } from '../../overlay/statistics-overlay.component';

import * as moment from 'moment';

@Component({
  selector: 'pe-statistics-grid',
  templateUrl: './statistics-grid.component.html',
  styleUrls: ['./statistics-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PeStatisticsGridComponent implements OnInit, OnDestroy {
  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData?.themeSettings?.theme]
    : AppThemeEnum.default;
  widgetFilters = [];

  constructor(
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    private envService: EnvService,
    private overlayWidgetService: PeOverlayWidgetService,
    private dataGridSidebarService: PeDataGridSidebarService,
    private fb: FormBuilder,
    private apiService: ActualPeStatisticsApi,
    public headerService: PePlatformHeaderService,
    public widgetService: PeWidgetService,
    private dateTimePickerExtended: PeDateTimePickerExtendedService,
    private cdr: ChangeDetectorRef,
    private translateService: TranslateService,
    private renderer: Renderer2,
  ) {
    this.localBussinessId = this.envService.businessId;
  }

  @ViewChild('dataGridComponent') set setDataGrid(dataGrid: PeDataGridComponent) {
    if (dataGrid?.showFilters$) {
      dataGrid.showFilters$.subscribe((value) => {
        if (value === null) {
          this.showSideNav$.next(true);
        } else if (value !== this.showSideNav$.value) {
          this.showSideNav$.next(value);
        }
      });
    }
  }

  set showSidebar(value: boolean) {
    this.showSideNav$.next(value);
  }
  readonly destroyed$ = new ReplaySubject<boolean>();
  private subscriptions$: Subscription = new Subscription();

  widgets;
  localBussinessId;

  showTopNav$ = new BehaviorSubject<boolean>(false);
  showSideNav$ = new BehaviorSubject<boolean>(true);
  refreshSubject$ = new BehaviorSubject(true);
  readonly refresh$ = this.refreshSubject$.asObservable();
  editMode$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  showSidebar$ = this.showSideNav$.asObservable().pipe(delay(10));

  formGroup: FormGroup;

  treeHeaderActive = false;
  showEditBtn = false;

  selectedDashboard;

  categories = [];

  sideNavActionRail: MenuSidebarFooterData = {
    menuItems: [
      {
        title: this.translateService.translate('statistics.action.add_dashboard'),
        onClick: () => {
          this.onAddDashboard();
        },
      },
    ],
  };

  gridOptions: PeDataGridListOptions = {
    nameTitle: this.translateService.translate('statistics.filters.time_range'),
    customFieldsTitles: [],
  };

  filterItems: PeDataGridFilterItems[] = [
    {
      value: 'Calendar',
      label: this.translateService.translate('statistics.filters.time_range'),
      callback: (event, option) => {
        if (option === 'Calendar') {
          this.openDateTimePicker(event);
        }
      },
    },
    {
      value: 'currency',
      label: this.translateService.translate('statistics.filters.currency'),
    },
  ];

  public addWidget: PeStatisticsSingleSelectedAction[] = [
    {
      label: this.translateService.translate('statistics.action.add_widget'),
      callback: () => {
        this.onAddWidgetClick();
      },
    },
  ];

  sideNavTree: any = {
    a: [],
    b: [
      {
        id: 'today',
        name: this.translateService.translate('statistics.sidebar.calendar.today'),
        children: null,
        noToggleButton: true,
        image: `${this.env.custom.cdn}/icons/calendar-icon.svg`,
        data: {
          isFolder: true,
          isCalendar: true,
        },
      },
      {
        id: 'last week',
        name: this.translateService.translate('statistics.sidebar.calendar.last_week'),
        children: null,
        noToggleButton: true,
        image: `${this.env.custom.cdn}/icons/calendar-icon.svg`,
        data: {
          isFolder: true,
          isCalendar: true,
        },
      },
      {
        id: 'last month',
        name: this.translateService.translate('statistics.sidebar.calendar.last_month'),
        children: null,
        noToggleButton: true,
        image: `${this.env.custom.cdn}/icons/calendar-icon.svg`,
        data: {
          isFolder: true,
          isCalendar: true,
        },
      },
    ],
    c: [],
  };

  topNavOptions: PeDataGridButtonItem[] = [
    {
      title: this.translateService.translate('statistics.action.add_widget'),
      onClick: () => {
        this.onAddWidgetClick();
      },
      children: null,
    },
  ];
  sortByActions: PeDataGridSortByAction[] = [
    {
      label: 'Name',
      callback: () => {},
      icon: PeDataGridSortByActionIcon.Name,
    },
    {
      label: 'Ascending',
      callback: () => {},
      icon: PeDataGridSortByActionIcon.Ascending,
    },
    {
      label: 'Descending',
      callback: () => {},
      icon: PeDataGridSortByActionIcon.Descending,
    },
    {
      label: 'Date',
      callback: () => {},
      icon: PeDataGridSortByActionIcon.Date,
    },
  ];

  widgets$ = this.widgetService.widgets$;
  gridCols = 7;

  searchItems = [];

  @HostListener('window:resize', ['$event'])
  onResize($event) {
    this.setGridCols();
  }

  setGridCols() {
    const gridWidth = window.innerWidth - 302;
    const cols = gridWidth / 146;
    let numberOfCols = floor(cols);
    if (numberOfCols % 2 !== 0) {
      numberOfCols -= 1;
    }

    this.gridCols = numberOfCols;
  }

  ngOnInit(): void {
    this.widgetService.widgetFilters$
      .pipe(
        skip(1),
        tap((filters) => {
          this.apiService.getWidgets(this.widgetService.currentDashboard?.id).subscribe((val: any) => {
            if (filters.length !== 0) {
              this.widgetService.webSocket.close();
              this.widgetService.webSocket = new WebSocket(this.env.backend.statisticsWs);
            }
            const widgets = val.map((widget: any) => {
              return {
                widgetSettings: widget.widgetSettings.reduce((accu: any, setting: any) => [...accu, ...setting]),
                id: widget._id,
                viewType: widget.viewType,
                size: widget.size ?? this.widgetService.widgetSize.Large,
                edit: false,
              };
            });

            if (filters.length !== 0) {
              const filteredWidgets = widgets.filter((widget) => {
                const isFiltered = [];

                widget.widgetSettings.forEach((settings) => {
                  settings.forEach((setting) => {
                    filters.forEach((filter) => {
                      if (filter?.filter === 'channel') {
                        if (setting?.type === 'filter') {
                          if (setting?.value?.name === 'channel') {
                            if (filter?.searchText === setting?.value?.value) {
                              isFiltered.push(true);
                            } else {
                              isFiltered.push(false);
                            }
                          }
                        }
                      }
                      if (filter?.filter === 'calendar') {
                        if (setting?.type === 'dateTimeRelative') {
                          if (filter?.searchText === setting?.value) {
                            isFiltered.push(true);
                          } else {
                            isFiltered.push(false);
                          }
                        }
                      }
                      if (filter?.filter === 'Time frame') {
                        if (filter?.searchText?.filter) {
                          if (setting?.type === 'dateTimeRelative') {
                            if (filter?.searchText?.filter === setting?.value) {
                              isFiltered.push(true);
                            } else {
                              isFiltered.push(false);
                            }
                          }
                        } else {
                          if (setting?.type === 'dateTimeFrom') {
                            if (moment(setting?.value).isAfter(moment(filter?.searchText?.start))) {
                              isFiltered.push(true);
                            } else {
                              isFiltered.push(false);
                            }
                          }
                          if (setting?.type === 'dateTimeTo') {
                            if (filter?.searchText?.end !== null) {
                              if (moment(setting?.value).isBefore(moment(filter?.searchText?.end))) {
                                isFiltered.push(true);
                              } else {
                                isFiltered.push(false);
                              }
                            }
                          }
                        }
                      }
                      if (filter?.filter === 'currency') {
                        if (setting?.type === 'filter') {
                          if (setting?.value?.name === 'currency') {
                            if (setting?.value?.value === filter.searchText) {
                              isFiltered.push(true);
                            } else {
                              isFiltered.push(false);
                            }
                          }
                        }
                      }
                    });
                  });
                });

                if (isFiltered.length === 0) {
                  return false;
                }

                return isFiltered.every(value => value);
              });

              this.widgetService.widgets = filteredWidgets;
            } else {
              this.widgetService.widgets = widgets;
            }
          });
        }),
      )
      .subscribe();
    this.addFooterOptions(true);
    this.getWidgetTypeAndSize();
    this.getDimensionsAndMetric();
    this.headerService.assignConfig({
      isShowDataGridToggleComponent: true,
      showDataGridToggleItem: {
        onClick: () => {
          this.showSidebar = !this.showSideNav$.value;
        },
      },
    } as PePlatformHeaderConfig);
    this.setGridCols();
    this.formGroup = this.fb.group({
      tree: [[]],
      toggle: [false],
    });
    this.categories.push({
      title: this.translateService.translate('statistics.sidebar.subtitle_my'),
      tree: [...this.sideNavTree.a],
      editMode: false,
    });
    this.categories.push({
      title: this.translateService.translate('statistics.sidebar.subtitle_calendar'),
      tree: [...this.sideNavTree.b],
      editMode: false,
    });
    this.getDashboards();
    this.getWidgetData();
  }

  getWidgetData() {
    this.apiService
      .getWidgetData()
      .pipe(
        tap((widgetData: { channels: string[]; paymentMethods: string[] }) => {
          this.widgetService.appChannels = widgetData?.channels.map((channel) => {
            const label = ucfirst(channel.replace(/_/g, ' '));
            return { label, value: channel };
          });
          this.widgetService.paymentMethods = widgetData?.paymentMethods.map((paymentMethod) => {
            const label = ucfirst(paymentMethod.replace(/_/g, ' '));
            return { label, value: paymentMethod };
          });
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    if (this.subscriptions$) {
      this.subscriptions$.unsubscribe();
    }
  }

  nodeRenamed(e) {
    this.apiService
      .editDashboardName(e.id, { name: e.name })
      .pipe(
        tap((_) => {
          this.getDashboards();

          this.sideNavActionRail.menuItems = [
            {
              title: this.translateService.translate('statistics.action.add_dashboard'),
              onClick: () => {
                this.onAddDashboard();
              },
            },
          ];
        }),
      )
      .subscribe();
  }

  onSearchChanged(e) {
    this.searchItems = [...this.searchItems, e];

    this.widgetService.widgetFilters = [...this.widgetService.widgetFilters, e];
  }

  onSearchRemove(e) {
    this.searchItems.splice(e, 1);
    const widgets = this.widgetService.widgetFilters;
    widgets.splice(e, 1);
    this.widgetService.widgetFilters = widgets;
  }

  filterWidgets(searchItems) {
    const { filter, contains, searchText } = searchItems;
    const widgets = this.widgetService.widgets.filter((widget) => {
      let isFiltered = false;
      widget.widgetSettings.forEach((settings) => {
        settings.forEach((setting) => {
          if (setting?.type === 'filter') {
            if (setting?.value.name === filter) {
              if (setting?.value.value === searchText) {
                isFiltered = true;
              }
            }
          }
        });
      });

      if (contains === 0) {
        return isFiltered;
      }

      return !isFiltered;
    });

    return widgets;
  }

  openDateTimePicker(event: MouseEvent) {
    const dialogRef = this.dateTimePickerExtended.open(event, { theme: this.theme });
    dialogRef.afterClosed.subscribe((dateTimeObject) => {
      const datePicked = dateTimeObject.range;
      const filter = dateTimeObject.filter;

      this.widgetService.widgetFilters = [
        ...this.widgetService.widgetFilters,
        {
          filter: 'Time frame',
          contains: PeFilterContainsEnum.Contains,
          searchText: { filter, start: datePicked?.start, end: datePicked?.end },
        },
      ];

      this.searchItems = [
        ...this.searchItems,
        {
          filter: 'Time frame',
          contains: 0,
          searchText:
            datePicked.end !== null
              ? `${moment(datePicked.start).format('DD.MM.YYYY')} - ${moment(datePicked.end).format('DD.MM.YYYY')}`
              : `${moment(datePicked.start).format('DD.MM.YYYY')}`,
        },
      ];
      this.cdr.detectChanges();
    });
  }

  getGraphView(size) {
    return sizeOptions.find(sizeOption => sizeOption.size === size)?.graphView;
  }

  onAddWidgetClick() {
    this.widgetService.currentPage = 0;
    const onSaveSubject$ = new BehaviorSubject(null);
    const data = {};
    const headerConfig = {
      onSaveSubject$,
      title: this.translateService.translate('statistics.overlay_titles.add_widget'),
      backBtnTitle: this.translateService.translate('statistics.action.back'),
      backBtnCallback: () => {
        onSaveSubject$.next(false);
      },
      doneBtnTitle: this.translateService.translate('statistics.action.next'),
      doneBtnCallback: () => {
        onSaveSubject$.next(true);
      },
      onSave$: onSaveSubject$.asObservable(),
      theme: this.theme,
    } as any;
    this.widgetService.overlayRef = this.overlayWidgetService.open({
      data,
      headerConfig,
      component: PeStatisticsOverlayComponent,
    });
  }

  nodeClick(e) {
    const timeFilter = e.filter(item => item?.data?.isCalendar);
    const appsFilters = e.filter(app => app?.data?.isApps === true).map(item => item.id);
    this.selectedDashboard = e.filter(dashboard => dashboard?.data?.isDashboard === true)[0];
    if (this.selectedDashboard?.id) {
      if (this.selectedDashboard?.id !== this.widgetService.currentDashboard?.id) {
        this.getSelectedDashboard(this.selectedDashboard?.id);
        return;
      }
    }
    if (timeFilter.length === 0) {
      this.widgetFilters = this.widgetFilters.filter(filter => filter.filter !== 'calendar');
    }

    if (timeFilter.length !== 0) {
      if (timeFilter[0]?.id === 'today') {
        this.widgetFilters = this.widgetFilters.filter(filter => filter.filter !== 'calendar');
        this.widgetFilters = [
          ...this.widgetFilters,
          {
            filter: 'calendar',
            contains: PeFilterContainsEnum.Contains,
            searchText: 'today',
          },
        ];
      }
      if (timeFilter[0]?.id === 'last week') {
        this.widgetFilters = this.widgetFilters.filter(filter => filter.filter !== 'calendar');
        this.widgetFilters = [
          ...this.widgetFilters,
          {
            filter: 'calendar',
            contains: PeFilterContainsEnum.Contains,
            searchText: 'last week',
          },
        ];
      }
      if (timeFilter[0]?.id === 'last month') {
        this.widgetFilters = this.widgetFilters.filter(filter => filter.filter !== 'calendar');
        this.widgetFilters = [
          ...this.widgetFilters,
          {
            filter: 'calendar',
            contains: PeFilterContainsEnum.Contains,
            searchText: 'last month',
          },
        ];
      }
    }

    if (appsFilters.length !== 0) {
      this.widgetFilters = this.widgetFilters.filter(filter => filter.filter !== 'channel');
      appsFilters.forEach((element) => {
        this.widgetFilters = [
          ...this.widgetFilters,
          {
            filter: 'channel',
            contains: PeFilterContainsEnum.Contains,
            searchText: element,
          },
        ];
      });
    }

    if (appsFilters.length === 0) {
      this.widgetService.widgetFilters = this.widgetService.widgetFilters.filter(
        filter => filter.filter !== 'channel',
      );
    }

    this.widgetService.widgetFilters = this.widgetFilters;
  }

  addFooterOptions(doAdd: boolean) {
    if (doAdd) {
      this.sideNavActionRail.menuItems.push(
        ...[
          {
            title: this.translateService.translate('statistics.action.rename_dashboard'),
            onClick: () => {
              const dashboard = this.formGroup;

              if (dashboard.value.tree.length === 1 && dashboard.value.tree[0].data.isDashboard) {
                const dashboardIndex = this.categories[0].tree.indexOf(dashboard.value.tree[0]);
                this.categories[0].tree[dashboardIndex].editing = true;
              }
            },
          },
          {
            title: this.translateService.translate('statistics.action.delete_dashboard'),
            onClick: () => {
              const dashboard = this.formGroup;

              if (dashboard.value.tree.length === 1 && dashboard.value.tree[0].data.isDashboard) {
                const dashboardIndex = this.categories[0].tree.indexOf(dashboard.value.tree[0]);
                const currentDashboard = this.categories[0].tree[dashboardIndex];

                this.apiService
                  .deleteDashboardName(currentDashboard.id)
                  .pipe(
                    tap((_) => {
                      this.getDashboards();
                    }),
                  )
                  .subscribe();
              }
            },
            color: '#eb4653',
          },
        ],
      );
    } else {
      this.sideNavActionRail.menuItems = [
        {
          title: this.translateService.translate('statistics.action.add_dashboard'),
          onClick: () => {
            this.onAddDashboard();
          },
        },
      ];
    }
  }

  getSelectedDashboard(dashboardId) {
    this.apiService
      .getDashboardsById(dashboardId)
      .pipe(
        switchMap((dashboard: any) => {
          this.widgetService.currentDashboard = {
            id: dashboard._id,
            name: dashboard.name,
            children: [],
            noToggleButton: true,
            image: `${this.env.custom.cdn}/icons/apps-icon.svg`,
            data: {
              isDashboard: true,
              isFolder: true,
            },
          };
          return this.apiService.getWidgets(dashboardId);
        }),
        tap((widgets: any[]) => {
          this.widgetService.webSocket.close();
          this.widgetService.webSocket = new WebSocket(this.env.backend.statisticsWs);
          this.apiService.getWidgetData().subscribe((widgetData: { channels: string[] }) => {
            this.sideNavTree.c = [];
            widgetData?.channels.forEach((channel, index) => {
              const label = ucfirst(channel.replace(/_/g, ' '));
              this.sideNavTree.c.push({
                id: channel,
                name: label,
                children: null,
                noToggleButton: true,
                image: `${this.env.custom.cdn}/icons/apps-icon.svg`,
                data: {
                  isFolder: true,
                  isApps: true,
                },
              });
            });

            this.categories[2] = {
              title: this.translateService.translate('statistics.sidebar.subtitle_apps'),
              tree: [...this.sideNavTree.c],
              editMode: false,
            };

            this.categories[1] = {
              title: this.translateService.translate('statistics.sidebar.subtitle_calendar'),
              tree: [...this.sideNavTree.b],
              editMode: false,
            };

            this.cdr.detectChanges();
          });
          this.widgetService.widgets = [];
          this.widgetService.widgets = widgets.map((widget: any) => {
            return {
              id: widget._id,
              widgetSettings: widget.widgetSettings.reduce((accu: any, setting: any) => [...accu, ...setting]),
              createdAt: widget.createdAt,
              updatedAt: widget.updatedAt,
              viewType: widget.viewType,
              size: widget.size ?? this.widgetService.widgetSize.Large,
              edit: false,
            };
          });
        }),
      )
      .subscribe();
  }

  getDashboards(): void {
    const dashboards$ = this.apiService.getDashboards();
    const sideNavDashboardOptions$ = dashboards$.pipe(
      map((res: any[]) => {
        const data = res.map((item: any) => {
          const tile: TreeFilterNode = {
            id: item._id,
            name: item.name,
            children: [],
            noToggleButton: true,
            image: `${this.env.custom.cdn}/icons/apps-icon.svg`,
            data: {
              isDashboard: true,
              isFolder: true,
            },
          };
          return tile;
        });
        return data;
      }),
    );
    const dashboardExistenceCheck$ = dashboards$.pipe(
      switchMap((dashboards: any[]) => {
        const doesHaveDashboards = dashboards.find(dashboard => dashboard.business._id === this.localBussinessId);
        if (!doesHaveDashboards) {
          return this.apiService
            .createSingleDashboard({
              name: this.translateService.translate('statistics.action.initial_dashboard'),
            })
            .pipe(
              tap(res => console.log(res)),
              switchMap((dashboard: any) => {
                this.widgetService.currentDashboard = dashboard;
                return this.apiService.getWidgets(this.widgetService.currentDashboard?.id);
              }),
            );
        }
        return this.apiService.getWidgets(dashboards[0]._id);
      }),
      tap((widgets: any[]) => {
        this.apiService.getWidgetData().subscribe((widgetData: { channels: string[] }) => {
          widgetData?.channels.forEach((channel) => {
            const label = ucfirst(channel.replace(/_/g, ' '));
            this.sideNavTree.c.push({
              id: channel,
              name: label,
              children: null,
              noToggleButton: true,
              image: `${this.env.custom.cdn}/icons/apps-icon.svg`,
              data: {
                isFolder: true,
                isApps: true,
              },
            });
          });

          this.categories.push({
            title: this.translateService.translate('statistics.sidebar.subtitle_apps'),
            tree: [...this.sideNavTree.c],
            editMode: false,
          });
          this.cdr.detectChanges();
        });
        if (this.widgetService.webSocket) {
          this.widgetService.webSocket.close();
        }
        this.widgetService.webSocket = new WebSocket(this.env.backend.statisticsWs);
        this.widgetService.widgets = widgets.map((widget: any) => {
          return {
            id: widget._id,
            widgetSettings: widget.widgetSettings.reduce((accu: any, setting: any) => [...accu, ...setting]),
            createdAt: widget.createdAt,
            updatedAt: widget.updatedAt,
            viewType: widget.viewType,
            size: widget.size ?? this.widgetService.widgetSize.Large,
            edit: false,
          };
        });
      }),
    );

    this.subscriptions$.add(
      sideNavDashboardOptions$
        .pipe(
          tap((x) => {
            this.widgetService.currentDashboard = x[0];
            this.formGroup.get('tree').patchValue([this.widgetService.currentDashboard]);
          }),
          tap(x => (this.categories[0].tree = x)),
        )
        .subscribe(),
    );

    dashboardExistenceCheck$.subscribe();
  }

  onClickToEdit(event, widget) {
    if (widget.edit === false) {
      const widgetIndex = this.widgetService.widgets.indexOf(widget);
      const newWidgets = this.widgetService.widgets;
      newWidgets[widgetIndex].edit = true;
      this.widgetService.widgets = newWidgets;
      this.cdr.detectChanges();
    } else {
      const widgetIndex = this.widgetService.widgets.indexOf(widget);
      const newWidgets = this.widgetService.widgets;
      newWidgets[widgetIndex].edit = false;
      this.widgetService.widgets = newWidgets;
      this.cdr.detectChanges();
    }
  }

  onAddDashboard() {
    this.apiService
      .createSingleDashboard({ name: this.translateService.translate('statistics.action.new_dashboard') })
      .pipe(
        tap((x: any) => {
          this.categories[0].tree = [
            ...this.categories[0].tree,
            {
              id: x._id,
              name: x.name,
              editing: true,
              children: [],
              noToggleButton: true,
              image: `${this.env.custom.cdn}/icons/apps-icon.svg`,
              data: {
                isDashboard: true,
                isFolder: true,
              },
            },
          ];

          this.cdr.detectChanges();
        }),
      )
      .subscribe();
  }

  getWidgetTypeAndSize() {
    this.apiService
      .getWidgetTypeData()
      .pipe(
        tap((res: any) => {
          this.widgetService.widgetSize = res.widgetSize.reduce((accu, item) => {
            accu[item] = item.toLowerCase();
            return { ...accu };
          }, {});

          this.widgetService.widgetType = res.widgetType.reduce((accu, item) => {
            accu[item] = item;
            return { ...accu };
          }, {});
        }),
      )
      .subscribe();
  }

  getDimensionsAndMetric() {
    this.apiService
      .getDimensions()
      .pipe(
        tap((res: any) => {
          this.widgetService.dimensionTypes = res.reduce((accu, item) => {
            accu[item.name] = item.name;
            return { ...accu };
          }, {});
        }),
      )
      .subscribe();
    this.apiService
      .getMetrics()
      .pipe(
        tap((res: any) => {
          this.widgetService.metricTypes = res;
        }),
      )
      .subscribe();
  }

  onEditDashboard() {}

  onToggleSidebar() {
    this.dataGridSidebarService.toggleFilters$.next();
  }
}
