export const DOM_TYPES = {
    TEXT: "text",
    ELEMENT: "element",
    FRAGMENT: "fragment",
} as const;

export type DOMType = typeof DOM_TYPES[keyof typeof DOM_TYPES]; // "TEXT" | "ELEMENT" | "FRAGMENT"

export interface TextNode {
    type: typeof DOM_TYPES.TEXT;
    value: string;
}

export interface ElementNode {
    type: typeof DOM_TYPES.ELEMENT;
    tag: string;
    props: Record<string, unknown>;
    children: Node[];
}

export interface FragmentNode {
    type: typeof DOM_TYPES.FRAGMENT;
    children: Node[];
}

export type Node = TextNode | ElementNode | FragmentNode;

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

export function hString(str: string): TextNode {
    return {
        type: DOM_TYPES.TEXT,
        value: str,
    }
}

export function hFragment(vNodes: (Node | string | null | undefined)[]): FragmentNode {
    return {
        type: DOM_TYPES.FRAGMENT,
        children: mapTextNodes(withoutNulls(vNodes)),
    }
}

export function withoutNulls<T>(arr: (T | null | undefined)[]): T[] {
    return arr.filter((item): item is T => item != null);
}

export function mapTextNodes(children: (Node | string)[]): Node[] {
    return children.map((child) => typeof child == "string" ? hString(child) : child);
}

const tree: Node = h('div', { id: 'root' }, [
  h('h1', {}, ['Hello World']),
  h('input', { type: 'text', placeholder: 'Tape ici' }),
  hFragment([
    h('p', {}, ['Paragraphe dans un fragment']),
    hString('Texte brut dans fragment'),
  ]),
]);

console.log(tree);
