import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { PeOverlayRef } from '@pe/overlay-widget';

@Injectable({ providedIn: 'root' })
export class PeWidgetService {
  public currentPage = 0;
  public currentDashboard: any = null;
  private widgetsSubject$ = new BehaviorSubject([]);
  widgets$ = this.widgetsSubject$.asObservable();
  get widgets() {
    return this.widgetsSubject$.getValue();
  }
  set widgets(value: any[]) {
    this.widgetsSubject$.next(value);
  }

  private fieldFormsSubject$ = new BehaviorSubject({});
  fieldForms$ = this.fieldFormsSubject$.asObservable();
  get fieldForms() {
    return this.fieldFormsSubject$.getValue();
  }
  set fieldForms(value: any) {
    this.fieldFormsSubject$.next(value);
  }

  viewTypeSubject$ = new BehaviorSubject(null);
  viewType$ = this.viewTypeSubject$.asObservable();
  get viewType() {
    return this.viewTypeSubject$.getValue();
  }
  set viewType(value: string) {
    this.viewTypeSubject$.next(value);
  }

  selectedWidgetSizeSubject$ = new BehaviorSubject(null);
  selectedWidgetSize$ = this.selectedWidgetSizeSubject$.asObservable();
  get selectedWidgetSize() {
    return this.selectedWidgetSizeSubject$.getValue();
  }
  set selectedWidgetSize(value: string) {
    this.selectedWidgetSizeSubject$.next(value);
  }

  overlayRefSubject$ = new BehaviorSubject(null);
  overlayRef$ = this.overlayRefSubject$.asObservable();
  get overlayRef() {
    return this.overlayRefSubject$.getValue();
  }
  set overlayRef(value: PeOverlayRef) {
    this.overlayRefSubject$.next(value);
  }

  selectedAppSubject$ = new BehaviorSubject(null);
  get selectedApp() {
    return this.selectedAppSubject$.getValue()?.id;
  }
  set selectedApp(value) {
    this.selectedAppSubject$.next(value);
  }

  private appChannelsSubject$ = new BehaviorSubject([]);
  appChannels$ = this.appChannelsSubject$.asObservable();
  get appChannels() {
    return this.appChannelsSubject$.getValue();
  }
  set appChannels(value: any[]) {
    this.appChannelsSubject$.next(value);
  }

  private paymentMethodsSubject$ = new BehaviorSubject([]);
  paymentMethods$ = this.paymentMethodsSubject$.asObservable();
  get paymentMethods() {
    return this.paymentMethodsSubject$.getValue();
  }
  set paymentMethods(value) {
    this.paymentMethodsSubject$.next(value);
  }

  private metricTypesSubject$ = new BehaviorSubject(null);
  metricTypes$ = this.metricTypesSubject$.asObservable();
  get metricTypes() {
    return this.metricTypesSubject$.getValue();
  }
  set metricTypes(value) {
    this.metricTypesSubject$.next(value);
  }

  private dimensionTypesSubject$ = new BehaviorSubject(null);
  dimensionTypes$ = this.dimensionTypesSubject$.asObservable();
  get dimensionTypes() {
    return this.dimensionTypesSubject$.getValue();
  }
  set dimensionTypes(value) {
    this.dimensionTypesSubject$.next(value);
  }

  private widgetSizeSubject$ = new BehaviorSubject(null);
  widgetSize$ = this.widgetSizeSubject$.asObservable();
  get widgetSize() {
    return this.widgetSizeSubject$.getValue();
  }
  set widgetSize(value) {
    this.widgetSizeSubject$.next(value);
  }

  private widgetTypeSubject$ = new BehaviorSubject(null);
  widgetType$ = this.widgetTypeSubject$.asObservable();
  get widgetType() {
    return this.widgetTypeSubject$.getValue();
  }
  set widgetType(value) {
    this.widgetTypeSubject$.next(value);
  }

  private webSocketSubject$ = new BehaviorSubject<WebSocket>(null);
  webSocket$ = this.webSocketSubject$.asObservable();
  get webSocket() {
    return this.webSocketSubject$.getValue();
  }
  set webSocket(value) {
    this.webSocketSubject$.next(value);
  }

  private widgetFiltersSubject$ = new BehaviorSubject([]);
  widgetFilters$ = this.widgetFiltersSubject$.asObservable();
  get widgetFilters() {
    return this.widgetFiltersSubject$.getValue();
  }
  set widgetFilters(value) {
    this.widgetFiltersSubject$.next(value);
  }
}
