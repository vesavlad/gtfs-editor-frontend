# gtfseditor-ui

## Project setup
```
npm install
```

Create virtual environement file at root place with name `.env.development` with content:
```
NODE_ENV=development

VUE_APP_BASE_URL=http://endpoint_to_api

VUE_APP_MAPBOX_TOKEN=<your_mapbox_token>

VUE_APP_I18N_LOCALE=es
VUE_APP_I18N_FALLBACK_LOCALE=en
VUE_APP_I18N_SUPPORTED_LOCALE=en,es
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production

Before to create production files we need to add `.env.production` file with content:
```
NODE_ENV=production

VUE_APP_BASE_URL=http://production_endpoint_to_api

VUE_APP_MAPBOX_TOKEN=<your_mapbox_token>

VUE_APP_I18N_LOCALE=es
VUE_APP_I18N_FALLBACK_LOCALE=en
VUE_APP_I18N_SUPPORTED_LOCALE=en,es
```

After that run:
```
npm run build -- --mode production
```
All arguments before -- are considered npm arguments and arguments after -- are passed to vue-cli-service (that's we need).

### Run your unit tests
```
npm run test:unit
```

### Run your end-to-end tests
```
npm run test:e2e
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
