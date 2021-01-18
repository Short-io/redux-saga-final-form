import { useDispatch } from 'react-redux';
import { takeEvery } from 'redux-saga/effects';

const pendingCallbacks = new Map<string, { callback: Function, toClear: string}>();

export function useListener(startActionType: string, resolveActionType: string, rejectActionType: string) {
    const dispatch = useDispatch();
    return (payload: any) => {
        return new Promise((resolve, reject) => {
            pendingCallbacks.set(resolveActionType, {
                callback: resolve,
                toClear: rejectActionType,
            });
            pendingCallbacks.set(rejectActionType, {
                callback: reject,
                toClear: resolveActionType,
            });
            dispatch({
                type: startActionType,
                payload
            });
        })
    };
}

function *handleEvent(action: any) {
    const cbInfo = pendingCallbacks.get(action.type)!;
    pendingCallbacks.delete(cbInfo.toClear)
    cbInfo.callback();
}

export function* finalFormSaga() {
    yield takeEvery((action: any) => !!pendingCallbacks.get(action.type), handleEvent);
}