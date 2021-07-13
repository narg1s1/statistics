import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, of, ReplaySubject } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';

import { TranslationLoaderService } from '@pe/i18n-core';

import { StatisticsHeaderService } from '../../infrastructure';

@Component({
  selector: 'pe-statistics',
  templateUrl: './statistics-root.component.html',
  styleUrls: ['./statistics-root.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeStatisticsComponent implements OnInit, OnDestroy {
  protected destroyed$ = new ReplaySubject<boolean>();
  translationsReady$ = new BehaviorSubject(false);
  constructor(
    private headerService: StatisticsHeaderService,
    private translationLoaderService: TranslationLoaderService,
  ) {}

  ngOnInit(): void {
    this.headerService.init();

    this.initTranslations();
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  private initTranslations(): void {
    this.translationLoaderService
      .loadTranslations(['statistics-app', 'filters-app'])
      .pipe(
        catchError((err) => {
          console.warn('Cant load translations for domains', ['statistics-app', 'filters-app'], err);
          return of(true);
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe(() => {
        this.translationsReady$.next(true);
      });
  }
}
