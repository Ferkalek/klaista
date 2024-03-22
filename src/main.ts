import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { environment } from './environments/environment';
import { setConfig, setListId, setKey } from './app/common/app-config';

// https://sudobird.com/blog/tech/mdx/fetch-and-load-configuration-before-angular-starts

async function initialize() {
  if (environment.production) {
    enableProdMode();
  }

  const appModuleContainer = await import('./app/app.module');
  platformBrowserDynamic()
    .bootstrapModule(appModuleContainer.AppModule)
    .catch((err) => console.error(err));
}

const searchParams = new URLSearchParams(window.location.search);
const listId = searchParams.get('listId');

if (listId) {
  setConfig({
    options: {
      query: { listId },
    },
  });

  setListId(listId);

  initialize();
} else {
  fetch(`${environment.baseUrl}/getKey`)
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('Not Found');
    })
    .then(async ({ key }) => {
      setConfig({
        options: {
          query: { key },
        },
      });

      setKey(key);
    })
    .catch((err) => console.error('error', err))
    .finally(initialize);
}
