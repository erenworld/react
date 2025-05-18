// test.ts
import { h, hFragment, mountDOM } from './h.ts';

const app = document.getElementById('app');
if (!app) throw new Error("Element #app not found");

const vnode = h('div', { id: 'hello', class: ['box'] }, [
  h('h2', {}, ['Hello Virtual DOM']),
  h('p', {}, ['Rendered via Bun + TypeScript']),
]);

const fragment = hFragment([
  h('p', {}, ['Fragment 1']),
  h('p', {}, ['Fragment 2']),
]);

const section = hFragment([
    h('h2', {}, ['Very important news']),
    h('p', {}, ['such news, many importance, too fresh, wow']),
    h(
      'a',
      {
        href: 'https://en.wikipedia.org/wiki/Doge_(meme)',
      },
      ['Doge!'],
    ),
])

mountDOM(app, section);
