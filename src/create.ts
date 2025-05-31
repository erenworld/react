import { mountDOM, destroyDOM } from './dom.ts'
import { Dispatcher } from './dispatcher.ts'
import type { Node } from './dom.ts'

export function createApp<State>(params: {
    state: State;
    view: (state: State, emit: (eventName: string, payload: any) => void) => Node;
    reducers: Record<string, (state: State, payload: any) => State>;
}): {
    mount: (el: HTMLElement | DocumentFragment) => void;
    unmount: () => void;
} {
    let parentEl: HTMLElement | DocumentFragment | null = null;
    let vdom: Node | null = null;

    const dispatcher = new Dispatcher();
    const subscriptions: (() => void)[] = [];

    function renderApp(): void {
        if (vdom) {
            destroyDOM(vdom);
        }
        vdom = params.view(params.state, emit);
        if (parentEl && vdom) {
            mountDOM(parentEl, vdom);
        }
    }

    function emit(eventName: string, payload: any): void {
        dispatcher.dispatch(eventName, payload);
    }

    subscriptions.push(dispatcher.afterEveryCommand(renderApp));

    for (const actionName in params.reducers) {
        const reducer = params.reducers[actionName];
        const unsubscribe = dispatcher.subscribe(actionName, (payload: any) => {
            if (reducer) {
                params.state = reducer(params.state, payload);
            }
        });
        subscriptions.push(unsubscribe);
    }

    return {
        mount(_parentEl: HTMLElement | DocumentFragment) {
            parentEl = _parentEl;
            renderApp();
        },
        unmount() {
            if (vdom) {
                destroyDOM(vdom);
                vdom = null;
            }
            subscriptions.forEach(unsub => unsub());
            subscriptions.length = 0;
            parentEl = null;
        }
    };
}
