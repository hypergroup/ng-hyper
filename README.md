ng-hyper
========

[hyper+json](https://github.com/hypergroup/hyper-json) client tools for [angular.js](http://angularjs.org/)

Installation
------------

Component:

```sh
$ component install hypergroup/ng-hyper
```

Usage
-----

Add `ng-hyper` as a dependency of your angular app.

```js
angular.module('my-app', ['ng-hyper']);
```

Building ng-hyper (optional)
------------
```sh
$ npm install
$ make build
```

Running tests
------------

By default, tests are run against AngularJS 1.0.8.

```sh
$ make tests
```

To switch AngularJS version, override the NG_VERSION variable with a different value, e.g.

```sh
$ make tests NG_VERSION=1.1.0
```

Components
----------

### Directives

#### hyper

`hyper` binds the value at the path to the scope. The name of the bound value defaults to the last property in the path.

```html
<div data-hyper=".users">
  <!-- 'users' is now available in this scope -->
</div>
```

If a name other than the last property in the path is needed use `as`.

```html
<div data-hyper=".users as usersList">
  <!-- 'usersList' is now available in this scope -->
</div>
```

`hyper` should always be used when passing data into an angular directive.

```html
<div data-hyper=".account">
  <!--
  BAD!!!
  names.first may be in the reponse right now but the server may change it in the future!
  -->
  <span data-ng-bind="account.names.first"></span>

  <!--
  GOOD!!!
  by using the data provided by 'hyper' the client will be future proof
  -->
  <span data-hyper="account.names.first" data-ng-bind="first"></span>
</div>
```

`hyper` directives may be nested as needed.

```html
<ul data-hyper=".users">
  <li data-ng-repeat="user in users">
    <span data-hyper="user.name" data-ng-bind="name"></span>
    <span>likes</span>
    <ul class="likes" data-hyper="user.likes">
      <li data-ng-repeat="like in likes">
        <span data-hyper="like.name" data-ng-bind="name"></span>
      </li>
    </ul>
  </li>
</ul>
```

Multiple values may be bound on a single element with a comma separated list.

```html
<div data-hyper=".users, .posts, .status as currentStatus">
  <!-- 'users', 'posts' and 'currentStatus' are now available in this scope -->
</div>
```

Because it becomes very verbose to use `hyper` before passing data to non-hyper directives `ng-hyper` provides some additional directives.

#### hyper-bind

Instead of using a combination of `hyper` and `ng-bind` use `hyper-bind` instead.

```html
<div data-hyper=".account">
  <!-- more verbose -->
  <span data-hyper="account.name" data-ng-bind="name"></span>

  <!-- less verbose -->
  <span data-hyper-bind="account.name"></span>
</div>
```

#### hyper-link

`TODO`

```html
<ul data-hyper=".users">
  <li data-ng-repeat="user in users">
    <a data-hyper-link="/users/:user" data-hyper-bind="user.name"></a>
  </li>
</ul>
```

#### hyper-form

`TODO`

```html
<div data-hyper=".account">
  <form data-hyper-form="account">
    <!-- 'inputs' is now available in the scope -->
  </form>
</div>
```

#### hyper-input

`TODO`

```html
<div data-hyper=".account">
  <form data-hyper-form="account">
    <div data-ng-repeat="input in inputs">
      <input data-hyper-input="input" />
    </div>
  </form>
</div>
```

#### hyper-img

Instead of using a combination of `hyper` and `ng-src` use `hyper-img` instead.

```html
<div data-hyper=".account">
  <!-- more verbose -->
  <img data-hyper="account.image.src" data-ng-src="{{src}}"></img>

  <!-- less verbose -->
  <img data-hyper-img="account.image"></img>
</div>
```

#### hyper-redirect

`TODO`

```html
<div data-hyper-redirect="/users/:.account"></div>
```

### Services

#### hyper

#### hyperPath

#### hyperLink

#### hyperLinkFormatter

#### hyperBackend

#### hyperHttpEmitter

#### hyperStatus

### Controllers

#### hyper

Concepts
--------

### Hypermedia

`ng-hyper` uses the hypermedia type [hyper+json](https://github.com/hypergroup/hyper-json). It is recommended reading the spec before using `ng-hyper`.

This toolset can most accurately be thought of as a 'hypermedia transformer' that takes one hypermedia format (hyper+json) and converts into another (HTML), similar to [XSLT](http://en.wikipedia.org/wiki/XSLT) (only much simpler).

### Path traversal

`ng-hyper` makes it easy to consume hyper+json apis by wrapping traversal of links and properties in a consistent syntax. The path syntax is represented by the 'dot notation'.

Consider the following set of resources:

```json
{
  "href": "/",
  "status": "ok",
  "users": {
    "href": "/users"
  }
}

{
  "href": "/users",
  "collection": [
    {"href": "/users/1"},
    {"href": "/users/2"},
    {"href": "/users/3"}
  ]
}

{
  "href": "/users/1",
  "name": "Cameron"
}

{
  "href": "/users/2",
  "name": "Mike"
}

{
  "href": "/users/3",
  "name": "Tim"
}
```

Values are easily accessed as properties and links are traversed:

```
.status
// 'ok'

.users
// [{href: ...}, ...]

.users.0.name
// 'Cameron'

.users.1.name
// 'Mike'
```

Paths starting with `.` signify starting at the root document. If a path uses a resource as its context, paths without `.`s refers to the given context.

Consider the following resources:

```json
{
  "href": "/users/1",
  "name": "Cameron",
  "friends": [
    {"href": "/users/2"},
    {"href": "/users/3"}
  ]
}

{
  "href": "/users/2",
  "name": "Mike"
}

{
  "href": "/users/3",
  "name": "Tim"
}
```

Using `/users/1` as the context resource the following paths will yield the proceeding results:

```
name
// 'Cameron'

friends
// [{href: ...}, ...]

friends.0.name
// Mike

friends.1.name
// Tim
```

Because the syntax is unaware of links it makes it easy to embed/extract resources from parent resources.

Consider the following resource:

```json
{
  "href": "/",
  "likes": [
    {"name": "hot-dogs"},
    {"name": "toasters"},
    {"name": "spoons"}
  ]
}
```

At the moment this resource is a standalone resource. The list of likes can be accessed with:

```
likes
// [{'name': 'hot-dogs'}, ...]

likes.0.name
// 'hot-dogs'

likes.1.name
// 'toasters'
```

Suppose the server has decided to split out the likes into their own resources, to make is easier to count the number of total likes of a particular item. This would result in the following resources:

```json
{
  "href": "/",
  "likes": [
    {"href": "/likes/hot-dogs"},
    {"href": "/likes/toasters"},
    {"href": "/likes/spoons"}
  ]
}

{
  "href": "/likes/hot-dogs",
  "count": 3
}

{
  "href": "/likes/toasters",
  "count": 9
}

{
  "href": "/likes/spoons",
  "count": 4
}
```

The previously used paths continue to work because `ng-hyper` transparently follows links until it finds the property.

```
likes
// [{'name': 'hot-dogs'}, ...]

likes.0.name
// 'hot-dogs'

likes.0.count
// 3

likes.1.name
// 'toasters'
```

Now suppose the server decided, for caching reasons, it would be better to split the collection of likes from the root resource into its own:

```json
{
  "href": "/",
  "likes": {
    "href": "/likes"
  }
}

{
  "href": "/likes",
  "collection": [
    {"href": "/likes/hot-dogs"},
    {"href": "/likes/toasters"},
    {"href": "/likes/spoons"}
  ]
}

{
  "href": "/likes/hot-dogs",
  "count": 3
}

{
  "href": "/likes/toasters",
  "count": 9
}

{
  "href": "/likes/spoons",
  "count": 4
}
```

As before, the client will continue to work.
