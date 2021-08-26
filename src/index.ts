import { useDispatch, useStore } from 'react-redux';
import { Middleware, Dispatch } from 'redux'

interface CbInfo {
    callback: Function;
    toClear: string;
}

export function useListener(startActionType: string, resolveActionType: string, rejectActionType: string, setPayload?: (payload: any) => Object) {
    const dispatch = useDispatch();
    return (payload: any) => {
        return new Promise((resolve, reject) => {
            const action = {
                type: startActionType,
                payload: setPayload?.(payload) ?? payload,
                meta: {
                    final_form_promise: {
                        resolve, reject
                    },
                    final_form_resolve: resolveActionType,
                    final_form_reject: rejectActionType,
                }
            };
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
            callback: action.meta.final_form_promise.resolve,
            toClear: action.meta.final_form_reject,
        })
        pendingCallbacks.get(action.meta.final_form_reject)?.push({
            callback: action.meta.final_form_promise.reject,
            toClear: action.meta.final_form_resolve
        });
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
