import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import {
  AppstoreOutline,
  BellOutline,
  CheckCircleOutline,
  ClockCircleOutline,
  CloseCircleOutline,
  DownOutline,
  EditOutline,
  MenuOutline,
  MoreOutline,
  PlusOutline,
  SearchOutline,
  UserOutline,
} from '@ant-design/icons-angular/icons';
import { NZ_I18N, en_US } from 'ng-zorro-antd/i18n';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { appRoutes } from './app.routes';

registerLocaleData(en);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes),
    provideAnimationsAsync(),
        provideZonelessChangeDetection(),
    provideNzIcons([
      AppstoreOutline,
      BellOutline,
      CheckCircleOutline,
      ClockCircleOutline,
      CloseCircleOutline,
      DownOutline,
      EditOutline,
      MenuOutline,
      MoreOutline,
      PlusOutline,
      SearchOutline,
      UserOutline,
    ]),
    {
      provide: NZ_I18N,
      useValue: en_US,
    },
  ],
};
