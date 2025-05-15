"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DOM_TYPES = void 0;
exports.h = h;
exports.hString = hString;
exports.hFragment = hFragment;
exports.withoutNulls = withoutNulls;
exports.mapTextNodes = mapTextNodes;
exports.DOM_TYPES = {
    TEXT: "text",
    ELEMENT: "element",
    FRAGMENT: "fragment",
};
function h(tag, props, children) {
    if (props === void 0) { props = {}; }
    if (children === void 0) { children = []; }
    return {
        tag: tag,
        props: props,
        children: mapTextNodes(withoutNulls(children)),
        type: exports.DOM_TYPES.ELEMENT,
    };
}
function hString(str) {
    return {
        type: exports.DOM_TYPES.TEXT,
        value: str,
    };
}
function hFragment(vNodes) {
    return {
        type: exports.DOM_TYPES.FRAGMENT,
        children: mapTextNodes(withoutNulls(vNodes)),
    };
}
/*
When we
use conditional rendering (rendering nodes only when a condition is met), some children may
be null in the array, which means that they shouldn’t be rendered. We want
to remove these null values from the array of children.
*/
function withoutNulls(arr) {
    return arr.filter(function (item) { return item != null; });
}
function mapTextNodes(children) {
    return children.map(function (child) { return typeof child == "string" ? hString(child) : child; });
}
var tree = h('div', { id: 'root' }, [
    h('h1', {}, ['Hello World']),
    h('input', { type: 'text', placeholder: 'Tape ici' }),
    hFragment([
        h('p', {}, ['Paragraphe dans un fragment']),
        hString('Texte brut dans fragment'),
    ]),
]);
console.log(tree);
