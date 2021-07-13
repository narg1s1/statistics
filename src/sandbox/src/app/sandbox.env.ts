import { Injectable } from '@angular/core';

import { EnvService } from '@pe/common';

@Injectable()
export class SandboxEnv implements EnvService {
  get businessId(): string {
    return '2382ffce-5620-4f13-885d-3c069f9dd9b4';
  }

  get businessData(): any {
    return {
      themeSettings: {
        theme: 'default',
      },
    };
  }
}
