
# We will build a reconciliation algorithmm

## For Svelte users, Virtual DOM is pure overhead
How Svelte can be fast when it doesn’t use a virtual DOM?

In many frameworks, you build an app by creating render() functions, like this simple React component:

```javascript
function HelloMessage(props) {
	return <div className="greeting">Hello {props.name}</div>;
}
```

## You can do the same thing without JSX...

```javascript
function HelloMessage(props) {
	return React.createElement('div', { className: 'greeting' }, 'Hello ', props.name);
}
```

But the result is the same — an object representing how the page should now look. That object is the virtual DOM. Every time your app’s state updates (for example when the name prop changes), you create a new one. The framework’s job is to reconcile the new one against the old one, to figure out what changes are necessary and apply them to the real DOM.

## So... is the virtual DOM slow?
You can’t apply changes to the real DOM without first comparing the new virtual DOM with the previous snapshot.

## Svelte power
```
if (changed.name) {
	text.data = name;
}
```
Unlike traditional UI frameworks, Svelte is a compiler that knows at build time how things could change in your app, rather than waiting to do the work at run time.

## Why do frameworks use the virtual DOM ?
It’s important to understand that virtual DOM isn’t a feature. Virtual DOM is valuable because it allows you to build apps without thinking about state transitions, with performance that is generally good enough. That means less buggy code, and more time spent on creative tasks instead of tedious ones.

## Browser DOM vs Virtual DOM
Le DOM réel est manipulé par le navigateur. Modifier le DOM directement est lent (coût de reflow, repaint, etc.).
Le virtual DOM est une représentation légère du DOM en JavaScript (sous forme d’objets).
Quand ton état change, React ne met pas immédiatement à jour le vrai DOM. Il met à jour le vDOM, puis décide quoi faire dans le vrai DOM.

**The reconciliation algorithm** 
It's the process that decides what changes need to be made to the browser’s DOM to reflect the changes in the virtual DOM.

## Features

1. A virtual DOM abstraction
2. A reconciliation algorithm that updates the browser’s DOM
3. A component-based architecture in which each component does the following:
    1. Holds its own state
    2. Manages its own lifecycle
    3. Re-renders itself and its children when their states change
    4. An SPA router that updates the URL in the browser’s address bar withouT reloading the page
    5. Slots for rendering content inside a component
    6. HTML templates that are compiled into JavaScript render functions
    7. Server-side rendering
    8. A browser extension that debugs the framework

### Stateful components
The application will no longer need to hold the entire state; state will be split among components instead.
Pure functions will turn into classes that implement a render() method, and each component will be its own little application with its own lifecycle.

### Subcomponents
You’ll add support for subcomponents, which allow you to split the application into smaller pieces. A component can pass information to its children via props, which are similar to the arguments of a function. Components can also communicate with their parents via events to which the parent can subscribe.

### Lifecycle hooks
You’ll add lifecycle hooks to the components. These hooks make it possible to execute
code at certain moments, such as when the component is mounted into the DOM. An
example lifecycle hook might fetch data from a remote server when the component
is mounted.

_Most frameworks use single-file components (SFCs)_

The files can also be **minified—made smaller** by removing whitespace and comments and by giving variables shorter names. The process of turning the application’s source code into the files that are shipped to the users is called **building**.

### An application can be built in many ways, resulting in a wide variety of bundle formats. Here, I’ll explain a build process that encapsulates some of the most common practices.

Building the application involves a few steps
- The template compiler transforms the template for each component into JavaScript code. This code, executed in the browser, creates the component’s view.
- The components’ code, split into multiple files, is transformed and bundled
into a single JavaScript file, app.bundle.js. (For larger applications, it’s common
to have more than one bundle and to lazy-load them—that is, load them only
when they’ll become visible to the user.)
- The third-party code used by the application is bundled into a single JavaScript
file, vendors.bundle.js. This file includes the code for the framework itself,
along with other third-party libraries
- The CSS code in the components is extracted and bundled into a single CSS file:
bundle.css.

```
**app.bundle.js** with the application’s code
**vendors.bundle.js** with the third-party code
bundle.css with the application’s CSS
index.html—the HTML file that will be served to the user
```

### Statically served
When a file is **statically served**, the server doesn’t need to do anything before sending it to the user. The _server simply reads the file from disk and sends it._ By contrast, when the application is rendered on the server, the _server generates the HTML file before sending it to the user’s browser._

### SPA
The server responds with a mostly empty HTML file that’s used to load the application’s JavaScript and CSS files. Then the framework uses the Document API to create and update the application’s view.
A router makes sure that the entire application isn’t reloaded when the user navigates to a different URL; rather, the view is updated to show the new content. The router also updates the URL in the browser’s
address bar to give the user a nice experience. 

The view of an SPA is created dynamically by the framework’s JavaScript code.
The framework JavaScript code (living in the vendors bundle) finds the components
defined in the application’s code that need to be rendered and creates the application’s view. This initial rendering is called mounting the application.

1. The first render happens when the framework mounts the app.
2. Framework reads the view’s components.
3. Framework creates the HTML programmatically.
4. The framework creates the application’s view using the Document API. The Document API allows HTML elements to be created programmatically through JavaScript. 

### What happens when the user interacts with the application?
The framework handles the event and updates the view accordingly.

Only the parts that change in the HTML are patched (re-rendered)

### Patching
The framework is responsible for updating only the parts of the HTML that need to be updated. This process is called patching the DOM.

A single change that the framework makes in the DOM is called a **patch**. The process of updating the view to reflect the changes in the application’s state is called **patching the DOM.**

### Making changes in the document is expensive
Making changes in the document is expensive, so a well-implemented framework minimizes the number of changes to the document required to make it reflect the updates.

_By expensive, I mean that the browser needs to repaint and reflow the document to reflect the changes a process that consumes resources._

Pour créer l'arborescence de rendu, le navigateur procède à peu près comme suit:
1. En commençant par la racine de l'arborescence DOM, parcourez chaque nœud visible.
    1. Certains nœuds ne sont pas visibles (par exemple, les balises de script, les balises méta, etc.) et sont omis, car ils ne sont pas reflétés dans la sortie affichée.
    2. Certains nœuds sont masqués à l'aide de CSS et sont également exclus de l'arborescence de rendu. Par exemple, le nœud span (dans l'exemple ci-dessus) est absent de l'arborescence de rendu, car une règle explicite définit la propriété "display: none" sur celui-ci.
2. Pour chaque nœud visible, recherchez les règles CSSOM correspondantes appropriées et appliquez-les.
3. Émettez des nœuds visibles avec du contenu et leurs styles calculés.

Remarque : Notez que **visibility: hidden e**st différent de **display: none**. Le premier rend l'élément invisible, mais il occupe toujours de l'espace dans la mise en page (c'est-à-dire qu'il est affiché sous la forme d'une zone vide), tandis que le second (display: none) supprime complètement l'élément de l'arborescence de rendu, de sorte qu'il est invisible et ne fait pas partie de la mise en page.

## Why useState and setState
React makes this virtual DOM comparison every time a
component changes the state, using either setState() or the useState() hook’s
mechanism.

## Navigating among routes
When the user clicks a link, the framework’s router prevents the default
behavior of reloading the page; instead, it renders the component that’s configured
for the new route. The router is also in charge of changing the URL to reflect the new route.
Framework replaces the current view with the new one.

## Just a single HTML page
An SPA works with a single HTML file in which the HTML markup code is updated
programmatically by the framework, so new HTML pages aren’t requested to the server.
**SPAs are called single-page applications because a single HTML file is involved** 

# SSR - server side rendering
When the user navigates to a different route, the browser requests a new HTML page from the server instead of updating the HTML markup programmatically.

 the framework doesn’t need to use the Document API to generate it programmatically. But the HTML coming from the server lacks the event handlers defined in the application code, so the application doesn’t respond to user interactions. This situation is where the hydration process comes into play.



Hydration is the process by which the framework matches HTML elements with their corresponding virtual DOM nodes and attaches event handlers to make the HTML markup interactive in the browser. T



- Browser loads .js and .css files. 

- Framework hydrates the components.

- Application and vendor bundles are loaded into the browser.



Only the parts that change in the HTML are patched (re-rendered).

Framework executes the event handlers defined in the application.

Framework patches the parts of the HTML that change



In the case of SPAs, the server isn’t involved in the process. With SSRs, pages are generated in the server.

### State
The state is the information the application keeps track of that makes it look and behave the way it does at a particular moment.


## Separation of concerns 
Separation of concerns means splitting the code so that the parts that carry out different responsibilities are separated, which helps the developer understand and maintain the code.

### Benefits of this approach
- **Developer productivity** : The application developer doesn’t need to write DOM manipulation code; instead, they can focus on the application logic. They have to write less code, which enables them to ship the application faster.

- **Code maintainability** : The DOM manipulation and application logic aren’t
mixed, which makes the code more succinct and easier to understand.

- **Framework performance** : The framework author, who’s likely to understand how to produce efficient DOM-manipulation code better than the application developer does, can optimize how the DOM is manipulated to make the framework more performant.

## Virtual DOM
The word virtual describes something that isn’t real but mimics something that is. A
virtual machine (VM), for example, is software written to mimic the behavior of a real
machine—hardware. A VM gives you the impression that you’re running a real
machine, but it’s software running on top of your computer’s hardware.

The nodes in the actual DOM are heavy objects that have hundreds of properties,
whereas the virtual nodes are lightweight objects that contain only the information
needed to render the view. Virtual nodes are cheap to create and manipulate.

#### Three types of Nodes
- Text nodes : They represent text content.
- Element nodes : The most common type of node, they represent HTML elements that have a tag name, such as 'div' or 'p'.
- Fragment nodes : They represent a collection of nodes that don’t have a parent node until they are attached to the DOM

```javascript
<form action="/login" class="login-form">
    <input type="text" name="user" />
    <input type="password" name="pass" />
    <button>Log in</button>
</form>

{
    type: "element",
    tag: "form",
    props: { action: "/login", class: "login-form" },
    children: [
        {
            type: "element",
            tag: "input",
            props: { type: "text", name: "user" }
        },
        {
            type: "element",
            tag: "input",
            props: { type: "password", name: "pass" }
        },
         {
            type: "element",
            tag: "button",
            props: { on: { click: () => login() } },
            children: [
                {
                    type: "text",
                    value: "Log in"
                }
            ]
        }
    ]
}
```

Every node has a type (text or element).
1. The tag - name of the HTML element.
2. Props - The attributes of the HTML element, including the event handlers inside an on property.
3. Children - The ordered children of the HTML element. If the children array is absent from the node, the element is a leaf node

## Conditional rendering: Removing null values
the withoutNulls() and mapTextNodes() functions. When we use conditional rendering (rendering nodes only when a condition is met), some children may be null in the array, which means that they shouldn’t be rendered. We want to remove these null values from the array of children.

## The view in two parts
You split the view into parts, each of which we call a component. Components are the cornerstone of frontend frameworks; they allow us to break a large application into smaller, more manageable pieces, each of which is in charge of a specific part of the view.

## What is a component ?
A component in your framework is a mini application of its own. It has its own internal state and lifecycle, and it’s in charge of rendering part of the view. It communicates with the rest of the application, emitting events and receiving props (data passed
to the component from the outside), re-rendering its view when a new set of props is
passed to it.

Each time the state changes, the virtual DOM should be reevaluated, and the framework needs to update the real DOM accordingly.

If new virtual node is added --> change the state

## Props
The arguments passed to a component are known as props, as I’ve already mentioned.

In this first version of the framework, components are functions that
generate the virtual DOM for part of the application’s view

## App component
The App() component is the root of the tree.

If a component returns more than a parent node, it needs to wrap it inside a fragment.

## Fragment virtual nodes
- Fragment virtual nodes consist of an array of children virtual nodes.
- Fragment virtual nodes are useful when a component returns a list of virtual nodes without a parent node. The DOM—and, by extension, the virtual DOM is a tree data structure. Every level of the tree (except the root) must have a parent node, so a fragment node can be used to group a list of virtual nodes.

## What is mounting?
Given a virtual DOM tree, you want your framework to create the real DOM tree from it and attach it to the browser’s document.
You implement this code in the framework so that the developers who use it don’t need to use the Document API themselves. You’ll implement this process in the **mountDOM()** function.

```javascript
mountDOM(virtualDom, parentElementBody) {}
```

When the mountDOM() function creates each DOM node for the virtual DOM, it needs to save a reference to the real DOM node in the virtual node under the el property (el for element)
The reconciliation algorithm that you’ll write uses this reference to know what DOM nodes to update.

if the node includes _event listeners_, the mountDOM() function saves a reference to the event **listener** in the virtual node under the listeners property

```javascript
const vdom = h('form', { class: 'login-form', action: 'login' }, [
h('input', { type: 'text', name: 'user' }),
h('input', { type: 'password', name: 'pass' }),
h('button', { on: { click: login } }, ['Login'])
])

mountDOM(vdom, document.body)
```

## Different types of virtual nodes require different DOM nodes to be created

1. A virtual node of type text requires a Text node to be created (via the _document.createTextNode()_ method)
2. A virtual node of type element requires an Element node to be created (via the _document.createElement()_ method).

## addEventListener
This method is available because an element node is an instance of the EventTarget interface.


Who is the heaviest and why? DOM or Virtual DOM
The nodes in the actual DOM are heavy objects that have hundreds of properties,
whereas the virtual nodes are lightweight objects that contain only the information
needed to render the view.


When a new to-do item is added to
the state, the virtual DOM is reevaluated, and the DOM is updated with the new to-do.

---
To add an event listener to an element node, you call its addEventListener() method
(http://mng.bz/Xql6). This method is available because an element node is an
instance of the EventTarget interface

---
It’s important to understand that when you’re manipulating the DOM through code, you’re working with
DOM nodes—instances of the HTMLElement class. These instances have properties
that you can set in code, as with any other JavaScript object

---
<p id="toto">Hello, world!</p>
p.id = 'bar'
<p id="bar">Hello, world!</p>
In a nutshell, HTMLElement instances (such as the <p> element, which is an instance of
the HTMLParagraphElement class) have properties that correspond to the attributes
that are rendered in the HTML markup

---
The **classList** property returns an object—a DOMTokenList (http://mng.bz/
g7nE), to be specific—that comes in handy when you want to add, remove, or toggle
classes on an element. A DOMTokenList object has an add() method (http://mng
.bz/eE6v) that takes multiple class names and adds them to the element. If you had a
<div> element like
<div></div>
div.classList.add('foo', 'bar', 'baz')
<div class="foo bar baz"></div>
or
div.className = 'foo bar baz'

---
The style property
(http://mng.bz/p1e8) of an HTMLElement instance is a CSSStyleDeclaration object



## State manager
1. how does the application developer instruct the framework how to update the state when a particular event is
dispatched ?

2. how does the state manager execute those instructions ? 

If the application developer wants to update the state when a particular event is dispatched, first they need to determine what that event means in terms of the application domain. Then the developer maps the event to a command that the framework can understand. A command is a request to do something, as opposed to an event,
which is a notification of something that has happened. These commands ask the framework to update the state; they are expressed in the domain language of the application

### Events vs commands
An **event** is a notification of something that has happened. “A button was clicked,” “A key was pressed,” and “A network request was completed” are examples of events. Events don’t ask the framework or application to do anything; they’re simply notifications with some additional information. Event names are usually framed in past tense: 'button-clicked', 'key-pressed', 'network-request-completed', and so on.

A **command** is a request to do something in a particular context. “Add todo,” “Edit todo,” and “Remove todo” are three examples of commands. Commands are written in imperative tense because they’re requests to do something: 'add-todo', 'edittodo', 'remove-todo', and so on.

Click the Add button. - add-todo


## reduce() function 
A function that, given the current state and the payload of a command, returns a new, updated state

```typescript
    reduce(currentState, commandPayload) = new State
```

A reducer, in our context, is a function that takes the current state and a payload (the command’s data) and returns a new updated state. 

# How does the state manager know which reducer function to execute when a command is dispatched?
Something has to map the commands to the reducer functions. We’ll call
this mechanism a dispatcher; it’s the state manager’s central piece.

# Consumer
Consumer is the technical term for a function that accepts a single parameter—the command’s payload, in this case—and returns no value

```
    consume(payload): void

    function removeTodoHandler(todoIndex) {
        // calls the removeTodo() reducer function to update the state
        state = removeTodo(state, todoIndex)
    }
```

subscribe(), dispatch()


A command is a request to do something, as opposed to an event,
which is a notification of something that has happened.
