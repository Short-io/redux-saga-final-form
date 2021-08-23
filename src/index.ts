import { useDispatch } from 'react-redux';
import { Middleware } from 'redux'

const pendingCallbacks = new Map<string, { callback: Function, toClear: string}>();

export function useListener(startActionType: string, resolveActionType: string, rejectActionType: string, setPayload?: (payload: any) => Object) {
    const dispatch = useDispatch();
    return (payload: any) => {
        const action = {
            type: startActionType,
            payload: setPayload?.(payload) ?? payload
        };
        return new Promise((resolve, reject) => {
            pendingCallbacks.set(resolveActionType, {
                callback: resolve,
                toClear: rejectActionType,
            });
            pendingCallbacks.set(rejectActionType, {
                callback: reject,
                toClear: resolveActionType,
            });
            dispatch(action);
        })
    };
}


export const handleListeners: Middleware = ({ getState }) => {
  return next => action => {
    const cbInfo = pendingCallbacks.get(action.type)!;
    if (cbInfo) {
        pendingCallbacks.delete(cbInfo.toClear)
        cbInfo.callback(action.payload);
    }

    return next(action)
  }
}
