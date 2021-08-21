import { useDispatch, useStore } from 'react-redux';
import { takeEvery } from 'redux-saga/effects';

export function useListener(startActionType: string, resolveActionType: string, rejectActionType: string, setPayload?: (payload: any) => Object) {
    const dispatch = useDispatch();
    const store = useStore();
    return (payload: any) => {
        const action = {
            type: startActionType,
            payload: setPayload?.(payload) ?? payload
        };
        return new Promise((resolve, reject) => {
            const unsubscribe = store.subscribe((action) => {
                if (action.type === resolveActionType.toString()) {
                    unsubscribe()
                    resolve(action.payload);
                };
                if (action.type === rejectActionType.toString()) {
                    unsubscribe();
                    reject(action.payload);
                }
            });
            dispatch(action);
        })
    };
}
