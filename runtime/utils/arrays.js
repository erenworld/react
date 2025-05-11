import { DOM_TYPES } from "../h";

/**
 * Removes all `null` and `undefined` values from an array.
 *
 * @param {Array} array - The array to filter.
 * @returns {Array} A new array without null or undefined values.
 */
export function withoutNulls(array) {
    return array.filter((item) => item != null);
}

/**
 * Converts string elements within an array into text virtual nodes.
 * This allows developers to pass plain strings as children, which are
 * automatically converted to virtual text nodes.
 *
 * Example:
 * Instead of writing:
 *   h('div', {}, [hString('Hello'), hString('World')])
 * You can write:
 *   h('div', {}, ['Hello', 'World'])
 *
 * @param {Array} children - An array of child nodes or strings.
 * @returns {Array} An array of virtual nodes.
 */
function mapTextNodes(children) {
    return children.map((child) =>
        typeof child === "string" ? hString(child) : child
    );
}

/**
 * Creates a virtual text node.
 *
 * @param {string} str - The text content.
 * @returns {Object} A virtual text node object.
 */
export function hString(str) {
    return {
        type: DOM_TYPES.TEXT,
        value: str 
    };
}

/**
 * Creates a virtual fragment node.
 * A fragment groups multiple child nodes without rendering an actual DOM element.
 * Useful when returning multiple sibling elements from a component or function.
 *
 * @param {Array} vNodes - An array of virtual nodes or strings.
 * @returns {Object} A virtual fragment node.
 */
export function hFragment(vNodes) {
    return {
        type: DOM_TYPES.FRAGMENT,
        children: mapTextNodes(withoutNulls(vNodes))
    };
}
