import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken='pk.eyJ1IjoidGVkZHliYXIiLCJhIjoiY2xtcGN3dm5qMThtOTJ6cGIzdnJrd2Q4aCJ9.8qEkTrEMpcYA5GZ5KaIisA';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
