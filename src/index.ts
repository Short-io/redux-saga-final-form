import { useDispatch, useStore } from 'react-redux';
import { Middleware, Dispatch } from 'redux'

interface CbInfo {
    callback: Function;
    toClear: string;
}

const storeMap = new WeakMap<Dispatch, Map<string, CbInfo[]>>();

export function useListener(startActionType: string, resolveActionType: string, rejectActionType: string, setPayload?: (payload: any) => Object) {
    const dispatch = useDispatch();
    return (payload: any) => {
        const action = {
            type: startActionType,
            payload: setPayload?.(payload) ?? payload
        };
        if (!storeMap.has(dispatch)) {
            storeMap.set(dispatch, new Map())
        }
        const pendingCallbacks = storeMap.get(dispatch)!;

        return new Promise((resolve, reject) => {
            if (!pendingCallbacks.has(resolveActionType)) {
                pendingCallbacks.set(resolveActionType, []);
            }
            if (!pendingCallbacks.has(rejectActionType)) {
                pendingCallbacks.set(rejectActionType, []);
            }
            pendingCallbacks.get(resolveActionType)!.push({
                callback: resolve,
                toClear: rejectActionType,
            });
            pendingCallbacks.get(rejectActionType)!.push({
                callback: reject,
                toClear: resolveActionType,
            });
            dispatch(action);
        })
    };
}


export const handleListeners: Middleware = (store) => {
  return next => action => {
    const pendingCallbacks = storeMap.get(store.dispatch)!;
    if (pendingCallbacks) {
        const cbInfos = pendingCallbacks.get(action.type)!;
          if (cbInfos) {
            for (const cbInfo of cbInfos) {
                pendingCallbacks.delete(cbInfo.toClear)
                cbInfo.callback(action.payload);
            }
        }
    }

    return next(action)
  }
}
