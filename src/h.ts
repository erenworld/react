
const DOM_TYPES = {
    TEXT: "text",
    ELEMENT: "element",
    FRAGMENT: "fragment",
} as const;

type DOMType = typeof DOM_TYPES[keyof typeof DOM_TYPES];

interface TextNode {
    type: typeof DOM_TYPES.TEXT;
    value: string;
    el?: Text;
}

interface ElementNode {
    type: typeof DOM_TYPES.ELEMENT;   
    tag: string;                        
    props: Record<string, unknown>;     
    children: Node[];
    el?: HTMLElement;
    listeners?: Record<string, EventListener>;
}

interface FragmentNode {
    type: typeof DOM_TYPES.FRAGMENT;
    children: Node[];  
    el?: DocumentFragment;
}

type Node = TextNode | ElementNode | FragmentNode;

type MountableElement = HTMLElement | DocumentFragment;

/**
 * Crée un nœud élément avec son tag, ses propriétés et ses enfants.
 * Filtre les enfants nuls et convertit les chaînes en nœuds texte.
 *
 * @param tag - Nom de la balise HTML (ex: 'div', 'span').
 * @param props - Attributs et propriétés de l'élément.
 * @param children - Liste des enfants (nœuds, chaînes, null ou undefined).
 * @returns Un objet `ElementNode` représentant l’élément DOM virtuel.
 */
export function h(
    tag: string,
    props: Record<string, unknown> = {},
    children: (Node | string | null | undefined)[] = []
): ElementNode {
    return {
        tag,
        props,
        children: mapTextNodes(withoutNulls(children)),
        type: DOM_TYPES.ELEMENT,
    };
}

/**
 * Crée un nœud texte à partir d'une chaîne de caractères.
 *
 * @param str - La chaîne à convertir en nœud texte.
 * @returns Un objet `TextNode` représentant le texte.
 */
export function hString(str: string): TextNode {
    return {
        type: DOM_TYPES.TEXT,
        value: str,
    }
}

/**
 * Crée un nœud fragment à partir d'une liste d'enfants,
 * en filtrant les valeurs nulles et en convertissant les chaînes en nœuds texte.
 *
 * @param vNodes - Tableau d'enfants pouvant contenir des `Node`, `string`, `null` ou `undefined`.
 * @returns Un objet `FragmentNode` avec des enfants nettoyés et typés.
 */
export function hFragment(vNodes: (Node | string | null | undefined)[]): FragmentNode {
    return {
        type: DOM_TYPES.FRAGMENT,
        children: mapTextNodes(withoutNulls(vNodes)),
    }
}

/**
 * Filtre un tableau en supprimant les éléments `null` et `undefined`.
 *
 * @param arr - Tableau pouvant contenir des valeurs de type T, null ou undefined.
 * @returns Un tableau ne contenant que les éléments non nuls de type T.
 */
export function withoutNulls<T>(arr: (T | null | undefined)[]): T[] {
    return arr.filter((item): item is T => item != null);
}

/**
 * Convertit les chaînes de caractères en nœuds texte dans un tableau d'enfants.
 *
 * Cette fonction parcourt le tableau `children` contenant des éléments de type
 * `Node` ou `string`. Si un élément est une chaîne de caractères, elle le
 * transforme en un `TextNode` via la fonction `hString`. Les objets déjà de type
 * `Node` sont laissés inchangés.
 *
 * @param children - Tableau d'enfants contenant des `Node` ou des `string`.
 * @returns Un nouveau tableau où toutes les chaînes ont été converties en nœuds texte.
 */
export function mapTextNodes(children: (Node | string)[]): Node[] {
    return children.map((child) => typeof child == "string" ? hString(child) : child);
}

export function mountDOM(parentEl: HTMLElement | DocumentFragment, vNodes: Node) {
    switch (vNodes.type) {
        case DOM_TYPES.TEXT: {
            createTextNode(vNodes, parentEl);
            break;
        }
        case DOM_TYPES.ELEMENT: {
            createElementNode(vNodes, parentEl);
            break;
        }
        case DOM_TYPES.FRAGMENT: {
            createFragmentNode(vNodes, parentEl);
            break;
        }
        default: {
            throw new Error(`Can't mount DOM of type`);
        }
    }
}

function createTextNode(vNode: TextNode, parentEl: HTMLElement | DocumentFragment) {
    const textNode = document.createTextNode(vNode.value);
    vNode.el = textNode;
    parentEl.append(textNode);
}

function createFragmentNode(
    vNode: FragmentNode,
    parentEl: HTMLElement | DocumentFragment
    ) {
    const fragment = document.createDocumentFragment();

    for (const child of vNode.children) {
        mountDOM(fragment, child);
    }
    vNode.el = fragment;
    parentEl.append(fragment);
}

function createElementNode(
    vNode: ElementNode,
    parentEl: HTMLElement | DocumentFragment,
) {
    const { tag, props, children } = vNode;
    const element = document.createElement(tag);

    addProps(element, props, vNode);
    vNode.el = element;

    for (const child of children) {
        mountDOM(element, child);
    }
    parentEl.append(element);
}

type Props = {
    on?: Record<string, EventListener>;
    class?: string | string[];
    style?: Record<string, string>
    [key: string]: unknown;
}

function addProps(
    el: HTMLElement,
    props: Props,
    vNode: ElementNode
) {
    const { on: events = {}, ...attrs } = props;

    if (typeof events === "object" && events !== null) {
        vNode.listeners = addEventListeners(events, el);
    }
    setAttributes(el, attrs);
}

type ListenerMap = Record<string, EventListener>;

function addEventListener(
    eventName: string,
    handler: EventListener,
    el: HTMLElement
): EventListener {
    el.addEventListener(eventName, handler);
    return handler;
}

function addEventListeners(listeners: ListenerMap, el: HTMLElement): ListenerMap {
    const addedListeners: ListenerMap = {};

    Object.entries(listeners).forEach(([eventName, handler]) => {
        if (typeof handler === "function") {
            const listener = addEventListener(eventName, handler, el);
            addedListeners[eventName] = listener;
        }
    });
    return addedListeners;
}

function setClass(el: HTMLElement, className: string | string[]) {
    if (Array.isArray(className)) {
        el.classList.add(...className);
    } else if (typeof className === "string") {
        el.className = className;
    }
}

function setStyle(el: HTMLElement, property: string, value: string) {
    el.style.setProperty(property, value);
}

function removeStyle(el: HTMLElement, property: string) {
    el.style.removeProperty(property);
}

function setAttributes(
    el: HTMLElement,
    attrs: Record<string, unknown>
) {
    const { class: className, style, ...otherAttrs } = attrs;

    if (className) {
        setClass(el, className as string | string[]);
    }
    if (style && typeof style === "object" && style !== null) {
        Object.entries(style).forEach(([prop, value]) => {
            setStyle(el, prop, value);
        });
    }
    for (const [name, value] of Object.entries(otherAttrs)) {
        setAttribute(el, name, value as string | null);
    }
}

function setAttribute(
    el: HTMLElement,
    attributeName: string,
    attributeValue: string | null
) {
    if (attributeValue === null) {
        removeAttribute(el, attributeName);
    } else if (attributeName.startsWith("data-")) {
        el.setAttribute(attributeName, attributeValue);
    } else {
        (el as any)[attributeName] = attributeValue;
    }
}

function removeAttribute(el: HTMLElement, attributeName: string) {
    el.removeAttribute(attributeName);
}

// destroyDOM
export function destroyDOM(vNodes: Node) {
    const { type } = vNodes;

    switch (type) {
        case DOM_TYPES.TEXT: {
            removeTextNode(vNodes);
            break;
        }
        case DOM_TYPES.ELEMENT: {
            removeElementNode(vNodes);
            break;
        }
        case DOM_TYPES.FRAGMENT: {
            removeFragmentNode(vNodes);
            break;
        }
        default: {
            throw new Error("Can't destroy DOM type");
        }
    }
    delete vNodes.el;
}

function removeTextNode(vNode: TextNode) {
    if (vNode.el && vNode.el.parentNode) {
        vNode.el.parentNode.removeChild(vNode.el);
    }
    delete vNode.el;
}

function removeElementNode(vNode: ElementNode) {
    const { el, children, listeners } = vNode;

    if (el && el.parentNode) {
        el.parentNode.removeChild(el);
    }
    children.forEach(destroyDOM);
    if (listeners && vNode.el instanceof HTMLElement) {
        removeEventListeners(listeners, vNode.el);
        delete vNode.listeners;
    }
}

function removeEventListeners(
    listeners: Record<string, EventListener>,
    el: HTMLElement
) {
    Object.entries(listeners).forEach(([eventName, handler]) => {
        el.removeEventListener(eventName, handler);
    });
}

function removeFragmentNode(vNodes: FragmentNode) {
    vNodes.children.forEach(destroyDOM);
}
