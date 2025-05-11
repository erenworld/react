import { withoutNulls } from "./utils/arrays";

export const DOM_TYPES = {
    TEXT: "text",
    ELEMENT: "element",
    FRAGMENT: "fragment"
};

/**
 * Script that creates hypertext (an element)
 * @param {*} tag 
 * @param {*} props 
 * @param {*} children 
 **/
function h(tag, props = {}, children = []) {
    return {
        tag,
        props,
        children: mapTextNodes(withoutNulls(children)),
        type: DOM_TYPES.ELEMENT
    }
}
