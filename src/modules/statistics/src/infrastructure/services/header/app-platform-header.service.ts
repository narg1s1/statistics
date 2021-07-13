import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { assign, cloneDeep } from 'lodash-es';

import { PePlatformHeaderConfig, PePlatformHeaderItem, PePlatformHeaderService } from '@pe/platform-header';

@Injectable({
  providedIn: 'platform',
})
export class PlatformHeaderService extends PePlatformHeaderService {

  config$: Observable<PePlatformHeaderConfig> = null;
  routeChanged$: Subject<string> = new Subject<string>();
  closeButtonClicked$: Subject<void> = new Subject<void>();
  previousUrlForBackChanged$: Subject<string> = new Subject<string>();

  /** Used to change current micro base url
   * If user clicks on something that need to show short header
   * This changing previousUrl so user could come back to the right place if he clicks 'Close"
   */
  previousUrl: string;

  private configData$: BehaviorSubject<PePlatformHeaderConfig> = new BehaviorSubject(null);

  constructor() {
    super();

    this.config$ = this.configData$;
    this.previousUrlForBackChanged$.asObservable().pipe(
      tap((url) => {
        this.previousUrl = url;
      }),
    ).subscribe();
  }

  get config(): PePlatformHeaderConfig {
    return this.configData$.getValue();
  }

  /** @deprecated use setConfig(...) instead */
  set config(config: PePlatformHeaderConfig) {
    this.configData$.next(config);
  }

  setConfig(config: PePlatformHeaderConfig) {
    this.configData$.next(config);
  }

  assignConfig(config: PePlatformHeaderConfig) {
    const data = cloneDeep(this.configData$.getValue());
    assign(data, config);
    this.configData$.next(data);
  }

  setShortHeader(shortHeaderTitleItem: PePlatformHeaderItem): void {
    const config: PePlatformHeaderConfig = this.config;
    config.shortHeaderTitleItem = shortHeaderTitleItem;
    config.isShowShortHeader = true;
    config.currentMicroBaseUrl = this.previousUrl || config.currentMicroBaseUrl;
    this.configData$.next({ ...config });
  }

  setFullHeader(): void {
    const config: PePlatformHeaderConfig = this.configData$.getValue();
    config.shortHeaderTitleItem = null;
    config.isShowShortHeader = false;
    this.configData$.next({ ...config });
  }

  assignAppPlatformMenu(): void {}
}
