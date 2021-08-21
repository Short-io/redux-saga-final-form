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

in your form component

```javascript
import { useListener } from 'redux-saga-final-form';
import { Form } from "react-final-form";

export const MyComponent = () => {
    const formListener = useListener(SUBMIT_START_ACTION, SUBMIT_SUCCESS_ACTION, SUBMIT_FAIL_ACTION);
    return (
        <Form
            onSubmit={formListener}
            render={(formRenderProps) => (
                <form onSubmit={formRenderProps.handleSubmit}>
                    ...
                </form>
            )}
        />
    );
};
```

SUBMIT_START_ACTION example:

```javascript
export const submitStatrAction = (payload: { formField1: string }) => ({
    type: SUBMIT_START_ACTION
    payload
});
```

