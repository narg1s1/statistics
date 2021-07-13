import { PortalModule as CdkPortalModule } from '@angular/cdk/portal';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxIndexedDBModule } from 'ngx-indexed-db';
import { MatMomentDateModule } from '@angular/material-moment-adapter';

import { MediaModule, MediaUrlPipe, MEDIA_ENV } from '@pe/media';
import { OverlayWidgetModule } from '@pe/overlay-widget';
import { PePlatformHeaderModule, PePlatformHeaderService, PlatformHeaderFakeService } from '@pe/platform-header';
import { EnvService, PebTranslateService } from '@pe/common';
import { I18nModule } from '@pe/i18n';

import { HttpRequestInterceptor, PE_STATISTICS_API_PATH } from '../../../modules/statistics/src/infrastructure';
import { MockEditorDatabaseConfig } from '../dev/editor.idb-config';
import { SandboxTranslateService } from '../dev/sandbox-translate.service';
import { AddWidgetComponent } from './add-widget/add-widget.component';
import { COS_ENV, PeEnvInitializer, PeEnvProvider } from './env.provider';
import { SandboxRootComponent } from './root/root.component';
import { SandboxEnv } from './sandbox.env';
import { SandboxRouting } from './sandbox.routing';

declare var PayeverStatic: any;

PayeverStatic.IconLoader.loadIcons(['statistics', 'commerceos']);

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSelectModule,
    CdkPortalModule,
    SandboxRouting,
    NgxIndexedDBModule.forRoot(MockEditorDatabaseConfig),
    MediaModule.forRoot({}),
    I18nModule.forRoot(),
    PePlatformHeaderModule,
    OverlayWidgetModule,
    MatDatepickerModule,
    MatMomentDateModule,
  ],
  declarations: [SandboxRootComponent, AddWidgetComponent],
  providers: [
    MediaUrlPipe,
    FormBuilder,
    {
      provide: PePlatformHeaderService,
      useClass: PlatformHeaderFakeService,
    },
    {
      provide: EnvService,
      useClass: SandboxEnv,
    },
    {
      provide: PebTranslateService,
      useClass: SandboxTranslateService,
    },
    {
      provide: PE_STATISTICS_API_PATH,
      useValue: 'https://statistics-backend.test.devpayever.com',
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpRequestInterceptor,
      multi: true,
    },
    {
      provide: MEDIA_ENV,
      useFactory: (env: any) => ({ custom: env.custom, backend: env.backend }),
      deps: [COS_ENV],
    },
    PeEnvProvider,
    PeEnvInitializer,
  ],
  bootstrap: [SandboxRootComponent],
})
export class SandboxModule {}
