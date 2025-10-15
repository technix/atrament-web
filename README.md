# Atrament

`atrament-web` is a browser build of `atrament-core`, a framework for choice-based games, built around `inkjs`. 

If you want to make customized Atrament build, check out [atrament-core](https://github.com/technix/atrament-core).

If you are looking for example of a web application based on Atrament, check out [atrament-web-ui](https://github.com/technix/atrament-web-ui).

## Installation

```npm install @atrament/web```

or

```<script src="https://unpkg.com/@atrament/web@2.1.3/umd/atrament.js"></script>```

## Usage

Initialization and game start:
```
import atrament from '@atrament/web';

atrament.init({
    applicationID: 'your-application-id',
    settings: {}
});

await atrament.game.init('/path/to', 'inkfile.ink.json');
await atrament.game.start();
atrament.game.continueStory();
```

State in components:

```
import { useStore } from '@nanostores/preact';

const gameState = useStore(atrament.store);
```

## API Documentation

See [Atrament core documentation](https://github.com/technix/atrament-core/blob/master/README.md).

## Components

- loader: fetch + fflate/jszip
- persistent: [localForage](https://github.com/localForage/localForage) / Neutralinojs storage
- state: [nanostores](https://github.com/nanostores/nanostores)
- sound: [howler.js](https://github.com/goldfire/howler.js)
- platform: web / Neutralinojs

## LICENSE

Atrament is distributed under MIT license.

Copyright (c) 2023 Serhii "techniX" Mozhaiskyi

Made with the support of the [Interactive Fiction Technology Foundation](https://iftechfoundation.org/)

<img src="https://iftechfoundation.org/logo.svg" width="200px">