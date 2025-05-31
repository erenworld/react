import { mountDOM, destroyDOM, Dispatcher } from '../h.ts'
import type { Node } from '../h.ts'

export function createApp<State>(params: {
    state: State;
    view: (state: State, emit: (eventName: string, payload: string) => void) => Node;
}, reducers: Record<string, (state: State, payload: string) => State>): {
    mount: (el: HTMLElement | DocumentFragment) => void;
    unmount: () => void;
} {
    let parentEl: HTMLElement | DocumentFragment | null = null;
    let vdom: Node | null = null;

    const dispatcher = new Dispatcher();
    const subscriptions: (() => void)[] = [];

    // Fonction pour re-render l'app
    function renderApp(): void {
        if (vdom) {
            destroyDOM(vdom);
        }
        vdom = params.view(params.state, emit);
        if (parentEl && vdom) {
            mountDOM(parentEl, vdom);
        }
    }
    // Permet d'émettre un événement (dispatch)
    function emit(eventName: string, payload: string): void {
        dispatcher.dispatch(eventName, payload);
    }

    subscriptions.push(dispatcher.afterEveryCommand(renderApp));

    // Souscrire aux reducers
    for (const actionName in reducers) {
        const reducer = reducers[actionName];
        const unsubscribe = dispatcher.subscribe(actionName, (payload: string) => {
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
    }
}
