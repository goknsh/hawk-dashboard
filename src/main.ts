import './polyfills.ts';

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';
import { environment } from './environments/environment';
import { AppModule } from './app/';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule);


// console.log(`\r\n  _                          \r\n | |                         \r\n | |__  _   _ _ __   ___     \r\n | \'_ \\| | | | \'_ \\ \/ _ \\    \r\n | | | | |_| | |_) |  __\/  _ \r\n |_| |_|\\__, | .__\/ \\___| (_)\r\n         __\/ | |             \r\n        |___\/|_|             \r\n\r\n\r\nDo not mess arround here, and **do not** paste anything anyone tells you to here.\r\n\r\n`);