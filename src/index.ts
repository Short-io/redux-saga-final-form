import { useDispatch, useStore } from 'react-redux';
import { Middleware, Dispatch } from 'redux'

interface CbInfo {
    callback: Function;
    toClear: string;
}

let promiseCounter = 1;

const promiseMap = new Map<number, {
    resolve: Function,
    reject: Function,
}>()

export function useListener(startActionType: string, resolveActionType: string, rejectActionType: string, setPayload?: (payload: any) => Object) {
    const dispatch = useDispatch();
    return (payload: any) => {
        return new Promise((resolve, reject) => {
            const promiseId = promiseCounter ++;
            const action = {
                type: startActionType,
                payload: setPayload?.(payload) ?? payload,
                meta: {
                    final_form_promise: promiseId,
                    final_form_resolve: resolveActionType,
                    final_form_reject: rejectActionType,
                }
            };
            promiseMap.set(promiseId, {resolve, reject})
            dispatch(action);
        });
    };
}


export const handleListeners: Middleware = () => {
  const pendingCallbacks = new Map<string, CbInfo[]>();
  return next => action => {
    if (action.meta?.final_form_promise) {
        if (!pendingCallbacks.has(action.meta.final_form_resolve)) {
            pendingCallbacks.set(action.meta.final_form_resolve, []);
        }
        if (!pendingCallbacks.has(action.meta.final_form_reject)) {
            pendingCallbacks.set(action.meta.final_form_reject, []);
        }
        pendingCallbacks.get(action.meta.final_form_resolve)!.push({
            callback: promiseMap.get(action.meta.final_form_promise)!.resolve,
            toClear: action.meta.final_form_reject,
        })
        pendingCallbacks.get(action.meta.final_form_reject)?.push({
            callback: promiseMap.get(action.meta.final_form_promise)!.reject,
            toClear: action.meta.final_form_resolve
        });
        promiseMap.delete(action.meta.final_form_promise)
    }

    const cbInfos = pendingCallbacks.get(action.type)!;
        if (cbInfos) {
        for (const cbInfo of cbInfos) {
            pendingCallbacks.delete(cbInfo.toClear)
            cbInfo.callback(action.payload);
        }
    }

    return next(action)
  }
}
