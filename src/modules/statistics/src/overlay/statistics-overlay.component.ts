import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, SkipSelf } from '@angular/core';
import { delay, takeUntil, tap } from 'rxjs/operators';
import { ReplaySubject } from 'rxjs';

import { PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { TranslateService } from '@pe/i18n-core';

import { PeWidgetService } from '../infrastructure';

@Component({
  selector: 'peb-statistics-overlay',
  templateUrl: './statistics-overlay.component.html',
  styleUrls: ['./statistics-overlay.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeStatisticsOverlayComponent implements OnDestroy {
  readonly destroyed$ = new ReplaySubject<boolean>();
  edit = false;

  constructor(
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: any,
    private cdr: ChangeDetectorRef,
    public widgetService: PeWidgetService,
    private translateService: TranslateService,
  ) {
    this.overlayConfig.onSave$
      .pipe(
        tap((onSave) => {
          if (this.widgetService.currentPage === 0 && onSave) {
            this.widgetService.viewType = widgetService.widgetType.DetailedNumbers;
          }
          if (this.widgetService.currentPage === 0 && onSave === false) {
            this.widgetService.overlayRef.close();
          }
          if (onSave === true && this.widgetService.currentPage < 3) {
            if (widgetService?.selectedApp) {
              this.widgetService.currentPage += 1;
              this.overlayConfig.onSaveSubject$.next(null);
            }
          }
          if (onSave === false && this.widgetService.currentPage > 0) {
            this.widgetService.currentPage -= 1;
            this.overlayConfig.onSaveSubject$.next(null);
          }
          if (widgetService.currentPage === 3) {
            setTimeout(() => {
              overlayConfig.doneBtnTitle = translateService.translate('statistics.action.done');
            });
          }
          if (widgetService.currentPage < 3) {
            setTimeout(() => {
              overlayConfig.doneBtnTitle = translateService.translate('statistics.action.next');
            });
          }
        }),
        delay(100),
        tap(() => {
          this.cdr.detectChanges();
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
