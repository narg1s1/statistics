import { Portal } from '@angular/cdk/portal';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostBinding,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { Router } from '@angular/router';

import { AppThemeEnum, EnvService } from '@pe/common';

import { environment } from '../../environments/environment';
import { globalPalette } from '../../styles/palette';
import { AbstractComponent } from '../shared/abstract/abstract.component';
import { SandboxSettingsService } from '../shared/settings/settings.service';

@Component({
  selector: 'peb-sandbox-root',
  templateUrl: './root.component.html',
  styleUrls: ['./root.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SandboxRootComponent extends AbstractComponent implements OnInit, OnDestroy {
  customToolsPortal: Portal<any> = null;
  devMode: boolean = !environment.production;
  body: HTMLElement = document.body;
  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData?.themeSettings?.theme]
    : AppThemeEnum.default;

  constructor(
    public router: Router,
    public cdr: ChangeDetectorRef,
    private settingsService: SandboxSettingsService,
    private envService: EnvService,
    private elementRef: ElementRef,
  ) {
    super();
  }

  @HostBinding('class.front-page')
  get classFrontPage(): boolean {
    return this.router.url === '/';
  }

  ngOnInit(): void {
    this.body.classList.add(this.theme);
    this.setGlobalPalette();
  }

  openSettings(): void {
    this.settingsService.open();
  }

  openViewerDialog(): void {}

  setGlobalPalette(): void {
    const thisCmpElement: HTMLElement = this.elementRef.nativeElement;

    Object.entries(globalPalette).forEach(([key, value]) => {
      thisCmpElement.style.setProperty(`--${key}`, value);
    });
  }

  ngOnDestroy() {
    this.body.classList.remove(this.theme);
  }
}
