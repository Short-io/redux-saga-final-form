redux-saga-final-form
=====================

> Simple integration between react-final-form and redux-saga

This module is created as a replacement for unsupported redux-promise-listener or react-redux-promise-listener

## Installation

```bash
npm install --save redux-saga-final-form
```
or
```bash
yarn add redux-saga-final-form
```


## Usage



```javascript
export const SettingsComponent = () => {
    const formListener = useListener(DOMAIN_SAVE_SETTINGS, DOMAIN_SAVE_SETTINGS_SUCCESS, DOMAIN_SAVE_SETTINGS_ERROR);
    return <Form initialValues={initialValues} onSubmit={formListener} validate={validate}>
        ...
    </Form>
```

and in your sagas:

```javascript
import { finalFormSaga } from 'redux-saga-final-form'; 

const sagaMiddleware = createSagaMiddleware();
...
sagaMiddleware.run(finalFormSaga);
```

