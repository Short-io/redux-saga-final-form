import { useDispatch, useStore } from 'react-redux';
import { Middleware, Store } from 'redux'

interface CbInfo {
    callback: Function;
    toClear: string;
}

const storeMap = new WeakMap<Store, Map<string, CbInfo[]>>();

export function useListener(startActionType: string, resolveActionType: string, rejectActionType: string, setPayload?: (payload: any) => Object) {
    const dispatch = useDispatch();
    const store = useStore();
    return (payload: any) => {
        const action = {
            type: startActionType,
            payload: setPayload?.(payload) ?? payload
        };
        if (!storeMap.has(store)) {
            storeMap.set(store, new Map())
        }
        const pendingCallbacks = storeMap.get(store)!;

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
    const pendingCallbacks = storeMap.get(store as any)!;
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
