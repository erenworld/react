import { DOM_TYPES } from "./utils/constants";

export interface TextNode {
    type: typeof DOM_TYPES.TEXT;
    value: string;
    el?: Text;
}

export interface ElementNode {
    type: typeof DOM_TYPES.ELEMENT;   
    tag: string;                        
    props: Record<string, unknown>;     
    children: Node[];
    el?: HTMLElement;
    listeners?: Record<string, EventListener>;
}

export interface FragmentNode {
    type: typeof DOM_TYPES.FRAGMENT;
    children: Node[];  
    el?: DocumentFragment;
}

export type Node = TextNode | ElementNode | FragmentNode;


/**
 * Creates an element node with its tag, properties and children.
 * Filters null children and converts strings to text nodes.
 *
 * @param tag - HTML tag name (e.g., 'div', 'span')
 * @param props - Element attributes and properties
 * @param children - List of children (nodes, strings, null or undefined)
 * @returns An ElementNode object representing the virtual DOM element
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
 * Creates a text node from a string.
 *
 * @param str - The string to convert to a text node
 * @returns A TextNode object representing the text
 */
export function hString(str: string): TextNode {
    return {
        type: DOM_TYPES.TEXT,
        value: str,
    }
}

/**
 * Creates a fragment node from a list of children,
 * filtering null values and converting strings to text nodes.
 *
 * @param vNodes - Array of children that can contain Node, string, null or undefined
 * @returns A FragmentNode object with cleaned and typed children
 */
export function hFragment(vNodes: (Node | string | null | undefined)[]): FragmentNode {
    return {
        type: DOM_TYPES.FRAGMENT,
        children: mapTextNodes(withoutNulls(vNodes)),
    }
}

/**
 * Filters an array by removing null and undefined elements.
 *
 * @param arr - Array that can contain values of type T, null or undefined
 * @returns An array containing only non-null elements of type T
 */
export function withoutNulls<T>(arr: (T | null | undefined)[]): T[] {
    return arr.filter((item): item is T => item != null);
}

/**
 * Converts strings to text nodes in a children array.
 * 
 * This function traverses the children array containing elements of type
 * Node or string. If an element is a string, it transforms it into a
 * TextNode via the hString function. Objects already of type Node are left unchanged.
 *
 * @param children - Array of children containing Node or string elements
 * @returns A new array where all strings have been converted to text nodes
 */
export function mapTextNodes(children: (Node | string)[]): Node[] {
    return children.map((child) => typeof child == "string" ? hString(child) : child);
}

/**
 * Mounts a virtual DOM node to a real DOM parent element.
 * Recursively creates and appends DOM elements based on the virtual node type.
 *
 * @param parentEl - The parent DOM element or document fragment to mount to
 * @param vNodes - The virtual DOM node to mount
 */
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

/**
 * Creates a real DOM text node from a virtual text node.
 *
 * @param vNode - The virtual text node to create
 * @param parentEl - The parent DOM element to append to
 */
function createTextNode(vNode: TextNode, parentEl: HTMLElement | DocumentFragment) {
    const textNode = document.createTextNode(vNode.value);
    vNode.el = textNode;
    parentEl.append(textNode);
}

/**
 * Creates a real DOM document fragment from a virtual fragment node.
 *
 * @param vNode - The virtual fragment node to create
 * @param parentEl - The parent DOM element to append to
 */
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

/**
 * Creates a real DOM element from a virtual element node.
 *
 * @param vNode - The virtual element node to create
 * @param parentEl - The parent DOM element to append to
 */
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

/**
 * Adds properties, attributes, and event listeners to a DOM element.
 *
 * @param el - The DOM element to add properties to
 * @param props - The properties object containing attributes and event listeners
 * @param vNode - The virtual element node for storing listener references
 */
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

/**
 * Adds a single event listener to a DOM element.
 *
 * @param eventName - The name of the event to listen for
 * @param handler - The event handler function
 * @param el - The DOM element to attach the listener to
 * @returns The event handler function that was added
 */
function addEventListener(
    eventName: string,
    handler: EventListener,
    el: HTMLElement
): EventListener {
    el.addEventListener(eventName, handler);
    return handler;
}

/**
 * Adds multiple event listeners to a DOM element.
 *
 * @param listeners - Object mapping event names to handler functions
 * @param el - The DOM element to attach listeners to
 * @returns Object mapping event names to the added handler functions
 */
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

/**
 * Removes multiple event listeners from a DOM element.
 *
 * @param listeners - Object mapping event names to handler functions
 * @param el - The DOM element to remove listeners from
 */
function removeEventListeners(
    listeners: Record<string, EventListener>,
    el: HTMLElement
) {
    Object.entries(listeners).forEach(([eventName, handler]) => {
        el.removeEventListener(eventName, handler);
    });
}

/**
 * Sets CSS classes on a DOM element.
 *
 * @param el - The DOM element to set classes on
 * @param className - The class name(s) as string or array of strings
 */
function setClass(el: HTMLElement, className: string | string[]) {
    if (Array.isArray(className)) {
        el.classList.add(...className);
    } else if (typeof className === "string") {
        el.className = className;
    }
}

/**
 * Sets a CSS style property on a DOM element.
 *
 * @param el - The DOM element to set the style on
 * @param property - The CSS property name
 * @param value - The CSS property value
 */
function setStyle(el: HTMLElement, property: string, value: string) {
    el.style.setProperty(property, value);
}

function removeStyle(el: HTMLElement, property: string) {
    el.style.removeProperty(property);
}

/**
 * Sets multiple attributes on a DOM element, including classes and styles.
 *
 * @param el - The DOM element to set attributes on
 * @param attrs - Object containing attribute names and values
 */
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

/**
 * Sets a single attribute on a DOM element.
 * Handles data attributes and removes null attributes.
 *
 * @param el - The DOM element to set the attribute on
 * @param attributeName - The name of the attribute
 * @param attributeValue - The value of the attribute, or null to remove it
 */
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

/**
 * Removes an attribute from a DOM element.
 *
 * @param el - The DOM element to remove the attribute from
 * @param attributeName - The name of the attribute to remove
 */
function removeAttribute(el: HTMLElement, attributeName: string) {
    el.removeAttribute(attributeName);
}

/**
 * Destroys a virtual DOM node and removes it from the real DOM.
 * Recursively destroys all children and cleans up event listeners.
 *
 * @param vNodes - The virtual DOM node to destroy
 */
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

/**
 * Removes a text node from the DOM.
 *
 * @param vNode - The virtual text node to remove
 */
function removeTextNode(vNode: TextNode) {
    if (vNode.el && vNode.el.parentNode) {
        vNode.el.parentNode.removeChild(vNode.el);
    }
    delete vNode.el;
}

/**
 * Removes an element node from the DOM, including its children and event listeners.
 *
 * @param vNode - The virtual element node to remove
 */
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

function removeFragmentNode(vNodes: FragmentNode) {
    vNodes.children.forEach(destroyDOM);
}
