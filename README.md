# Atrament

`atrament-web` is a browser build of `atrament-core`, a framework for choice-based games, built around `inkjs`. 

If you want to make customized Atrament build, check out [atrament-core](https://github.com/technix/atrament-core).

If you are looking for example of a web application based on Atrament, check out [atrament-preact-ui](https://github.com/technix/atrament-preact-ui).

## Installation

```npm install @atrament/web```

or

```<script src="https://unpkg.com/@atrament/web@1.2.0/umd/atrament.js"></script>```

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

- loader: fetch
- persistent: [localForage](https://github.com/localForage/localForage)
- state: [nanostores](https://github.com/nanostores/nanostores)
- sound: [howler.js](https://github.com/goldfire/howler.js)


## LICENSE

Atrament is distributed under MIT license.

Copyright (c) 2023 Serhii "techniX" Mozhaiskyi
