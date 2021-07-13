import { Injectable, Optional } from '@angular/core';
import { Router } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { BehaviorSubject, Subject } from 'rxjs';

import { MediaUrlPipe } from '@pe/media';
import { PeAuthService } from '@pe/auth';
import { PePlatformHeaderConfig, PePlatformHeaderService } from '@pe/platform-header';
import { PePlatformHeaderItem } from '@pe/platform-header/platform-header.types';

@Injectable({ providedIn: 'root' })
export class StatisticsHeaderService {
  businessData: any;
  contactHref: string = 'mailto:support@payever.de?subject=Contact%20payever';
  feedbackHref: string = 'mailto:support@payever.de?subject=Feedback%20for%20the%20payever-Team';
  isShowBusinessItemText: boolean = true;
  isSubheaderMode: boolean = false;

  destroyed$: Subject<void> = new Subject<void>();
  isInitialized: boolean = false;

  get businessLogo(): string {
    if (!this.businessData) {
      return;
    }
    return this.mediaUrlPipe.transform(this.businessData.logo, 'images');
  }

  isSidebarActiveStream$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  isSidebarActive$ = this.isSidebarActiveStream$.asObservable();

  public get isSidebarActive(): boolean {
    return this.isSidebarActiveStream$.value;
  }

  public set isSidebarActive(v: boolean) {
    this.isSidebarActiveStream$.next(v);
  }

  constructor(
    private router: Router,
    private mediaUrlPipe: MediaUrlPipe,
    private authService: PeAuthService,
    @Optional() private platformHeaderService: PePlatformHeaderService,
  ) {}

  init(): void {
    this.setHeaderConfig();
  }

  setHeaderConfig(): void {
    const isShortHeader: boolean = this.platformHeaderService.config?.isShowShortHeader;
    const shortHeaderTitleItem: PePlatformHeaderItem = this.platformHeaderService.config?.shortHeaderTitleItem;
    const config: PePlatformHeaderConfig = {
      isShowSubheader: false,
      mainDashboardUrl: 'statistics/list', //this.router.createUrlTree(['business', this.listEnvService.getSlug(), 'products', 'list']).toString(),
      currentMicroBaseUrl: 'statistics', //this.router.createUrlTree(['business', this.listEnvService.getSlug(), 'products', 'list']).toString(),
      isShowShortHeader: false,
      isShowDataGridToggleComponent: true,
      showDataGridToggleItem: {
        onClick: this.onToggleSidebar.bind(this),
      },
      isShowMainItem: false,
      mainItem: {
        title: `Statistics`,
      },
      isShowCloseItem: true,
      closeItem: {
        title: 'Back to apps',
        icon: '#icon-apps-apps',
        showIconBefore: true,
        iconType: 'vector',
        iconSize: '14px',
      },
      leftSectionItems: [],
      rightSectionItems: [
        {
          icon: '#icon-apps-header-notification',
          iconSize: this.isSubheaderMode ? '28px' : '24px',
          iconType: 'vector',
          onClick: this.onNotificationsClick,
        },
        {
          icon: '#icon-apps-header-search',
          iconSize: this.isSubheaderMode ? '28px' : '24px',
          iconType: 'vector',
          onClick: this.onSearchClick,
        },
        {
          icon: '#icon-apps-header-hamburger',
          iconSize: this.isSubheaderMode ? '28px' : '24px',
          iconType: 'vector',
          children: [
            {
              icon: '#icon-switch_profile',
              iconSize: '20px',
              iconType: 'vector',
              title: 'Switch Business',
              onClick: this.onSwitchBusinessClick,
            },
            {
              icon: '#icon-commerceos-user-20',
              iconSize: '20px',
              iconType: 'vector',
              title: 'Personal Information',
              onClick: this.openPersonalProfile,
            },
            {
              icon: '#icon-add-business',
              iconSize: '20px',
              iconType: 'vector',
              title: 'Add Business',
              onClick: this.onAddBusinessClick,
            },
            {
              icon: '#icon-log_out',
              iconSize: '20px',
              iconType: 'vector',
              title: 'Log Out',
              onClick: this.onLogOut,
            },
            {
              icon: '#icon-contact',
              iconSize: '20px',
              iconType: 'vector',
              title: 'Contact',
              onClick: this.onContactClick,
            },
            {
              icon: '#icon-feedback',
              iconSize: '20px',
              iconType: 'vector',
              title: 'Feedback',
              onClick: this.onFeedbackClick,
            },
          ],
        },
      ],
      businessItem: {
        title: this.businessData?.name || '',
        icon: this.businessData?.logo || '#icon-account-circle-24',
        iconSize: '16px',
        iconType: 'vector',
      },
      isShowBusinessItem: true,
      isShowBusinessItemText: true,
    };

    this.platformHeaderService.setConfig(config);
  }

  onToggleSidebar() {
    this.isSidebarActiveStream$.next(!this.isSidebarActiveStream$.value);
  }

  onSearchClick = () => {
    console.warn('No such method, check CommerceOs');
  };

  onNotificationsClick = () => {
    console.warn('No such method, check CommerceOs');
  };

  onSwitchBusinessClick = () => {
    this.router.navigate(['switcher/profile']);
  };

  onLogOut = () => {
    this.authService.logout().subscribe();
  };

  onAddBusinessClick = () => {
    this.router.navigate(['switcher/add-business']);
  };

  openPersonalProfile = () => {
    this.router.navigate(['/personal']);
  };

  onContactClick = () => {
    window.open(this.contactHref);
  };

  onFeedbackClick = () => {
    window.open(this.feedbackHref);
  };

  onMainItemClick = () => {
    console.warn('No such method, check CommerceOs');
  };
}
