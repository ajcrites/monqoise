# Monqoise -- Mongo Promise library built off of Q

***NOTE:*** This documentation needs to be updated

This is a fork of the (now killed) Mongoise project that
uses Q as its deferred library.

[![Build Status](https://travis-ci.org/ajcrites/monqoise.png)](https://travis-ci.org/ajcrites/monqoise)

Pronounce as "mawnk-oise," although "mawkno-iss" may
make more sense.

This library creates a very simple promise wrapper
around the default Node Mongo client allowing it
to be used with promise-like syntax.

The `Deferred` object is not very feature complete.
A much more complete promises library is the
[q library](https://npmjs.org/package/q), which is also
available as an npm package.  If you want to do anything
more sophisticated than simple done/fail callbacks and
chaining, you should use a separate API.  Using
`Deferred` directly is generally not needed either.

## Usage

### Normal Usage

Use mongoise to connect to the DB via the `connect` method.
This method returns a promise, and you can continue
from there.

```javascript
var mongoisePackage = require("mongoise"),
    mongoise = new mongoisePackage.Mongoise,
    promise = mongoise.connect(MONGODB_URI);

promise.done(function (dbc) {
    // dbc is the database connection
});
promise.fail(function (err) {
    // err is a DB connection error
});

// You can also chain callbacks
// even directly to the `.connect` call
promise.done(function (dbc) {}).fail(function (err) {});
```

Once mongoise is connected, you can use the collection
API to do normal MongoDB operations using promises.

```javascript
var users = mongoise.collection("users");
users.insert(query).done(function (result) {
    // result is the inserted value
}).fail(function (err) {
    // err is an error with the insert
});
```

If you already have a `MongoClient` connection available,
you can pass this as an argument to the `Mongoise`
constructor and skip the `connect` step.

```javascript
MongoClient.connect(MONGODB_URI, function (err, dbc) {
    if (err) {
        throw err;
    }
    else {
        mongoise = new mongoise.Mongoise(dbc);
    }
});
```

### Calling MongoDB Methods

`Mongoise` implements all methods according to the
Node MongoDB [Collection](http://mongodb.github.io/node-mongodb-native/api-generated/collection.html)
and [Cursor](http://mongodb.github.io/node-mongodb-native/api-generated/cursor.html)
APIs.  You can call these methods identically to how you
would call them with `mongodb`.

***However***, the `Mongoise` objects automatically add
the callback to create the promise that you can chain
to.  This means that **you should omit the callback
argument** from all MongoDB method calls and instead rely
on the promise API.

In case you actually need to communicate using MongoClient
directly, you can create your own or simply access the
`dbc` property on the `Mongoise` object.  It is an unwrapped
MongoClient instance.

### Using Mongoise `Deferred`
The mongoise package exposes a `Deferred` object that you
can use separately.  A `Deferred` instance has `reject`
and `resolve` methods as well as a `promise` property.

Most calls to Mongoise collection/cursor instances return
a `promise` instance -- **specifically methods that take
callbacks**.  The resolution/rejection of the Deferred
is handled internally.

```javascript
// Using a deferred yourself
var dfd = new mongoisePackage.Deferred,

dfd.promise.done(function () {
    // success callback
}).fail(function () {
    // failure callback
});

if (some_success_condition) {
    // You can pass multiple arguments to the callback
    dfd.resolve(success, arguments)
}
else {
    dfd.reject(failure, arguments);
}
```

### Chaining
You can chain success and failure callbacks.  Success and
failure callbacks have no particular meaning when chained
to one another -- they are resolved separately.  When a
**success callback is chained to a success callback** (or
a failure callback is chained to a failure callback), the
argument for the chained callback is the return value
of the callback to which it is chained.

If that sounds confusing, here is an example:

```javascript
var dfd = new mongoisePackage.Deferred,
    promise = dfd.promise;
promise
    .done(function (arg) {
        // arg will be `foo`

        // use "bar" as argument of chained method
        return "bar"
    })
    .done(function (arg) {
        // arg will be `bar`
    });

// Arguments passed to *first* method in the chain
dfd.resolve("foo");
```

## API

Mongoise exposes its own API for MongoClient connection,
the MongoClient itself, a Collection API that uses mongoise
promises, and a Deferred API.

### `Promise`

The `Promise` API is critical, and the functional part of
Mongoise.  A `Promise` instance is returned from most
MongoDB methods that take callbacks.

#### `.done`
The `done` method adds a success callback to the Promise.
When its `Deferred` is *resolved* (i.e. the intended action
completes successfully), any callbacks applied to the
promise via `done` are fired.

Any callbacks added with `fail` are *not* fired.

#### `.fail`
Functionally the same as `done`, but used to add error
callbacks.  When the Promise's `Deferred` is *rejected*
(i.e. the intended action completes unsuccessfully),
any callbacks applied to the promise via `fail` are fired.

Any callbacks added with `done` are *not* fired.

#### Chaining
The `.fail` and `.done` methods both return a promise.
Although this is technically a separate promise, it will
be fulfilled at the same time as its creator's deferred
is fulfilled.

This means that if you chain `.done` to `.fail` and the
Deferred is *resolved*, the `.done` callback will still
fire even though the `.fail` callback will not.

```javascript
var dfd = new mongoisePackage.Deferred;
    promise = dfd.promise;

// It is okay to resolve the deferred *before*
// the callback methods are attached.
// They will still fire
dfd.resolve();

promise
    .fail(function () {
        // I am not fired
    })
    .done(function () {
        // I am fired
    })
    .fail(function () {
        // I am not fired
    })
    .done(function () {
        // I am fired
    })
```

### `Mongoise`

The `Mongoise` has several methods and the `dbc` MongoDB
connection property.  Only methods intended for external
use are explained.

#### `connect`

* Arguments
 * connection URL
* Return
 * `Promise`

Connect to the MongoDB for the provided URL.  This also
sets up the Mongoise object for using database-reliant
methods.

#### `collection`

* Arguments
 * collection name
* Return
 * `Collection`

### `Collection`

The `Collection` instance exposes all of the methods of the
[Node MongoDB Collection](http://mongodb.github.io/node-mongodb-native/api-generated/collection.html)
and can be used almost identically.

**Note:** You should **leave off the callback** argument
when calling a method on the collection instance.  Most
methods return a `promise` that you can call `done` and
`fail` on instead.

A comparison of the MongoDB route vs. Mongoise would be:

```javascript
mongoDbCollection.insert(document, function (err, done) {
    if (err) {
        errorCondition(err);
    }
    else {
        successCondition(done);
    }
});

mongoiseCollection.insert(document)
    .fail(errorCondition)
    .done(successCondition)
```

The above will function identically.

Since `Collection` simply wraps the MongoDB methods, you
can use all other arguments as you would.  *Only* the
callback handling is changed.

#### `.find` and `.findOne`
The `.find` and `.findOne` methods return a `Cursor`
instead of a promise.  These methods are different, and
**you can safely pass callbacks to them**.

### `.aggregate`
The MongoDB `.aggregate` method allows you to create a
cursor based on the arguments you provide.  If you do
create one, Mongoise's `Collection` will return a `Cursor`
Otherwise, it will return a `Promise` that you can use
normally.

### `Cursor`
Some MongoDB methods return a cursor object.  The
Mongoise `Cursor` instance is simply a wrapper for the
[Node MongoDB Cursor](http://mongodb.github.io/node-mongodb-native/api-generated/cursor.html),
and you can call identical methods.

As with `Collection`, **you should leave off the callback
argument** for most methods and instead chain
success/failure callbacks to the promise that is returned.

### `.rewind`, `.stream`, `.isClosed`
These methods do not require a callback and return their
values instantly.  If you call them on `Cursor`, it will
return the intended value and *not* a promise object.

### `Deferred`

#### `.resolve`, `.reject`
These function more or less identically.  When you call
`.resolve`, all success callbacks chained to the Deferred's
promise will be fired.  If you call `reject`, the same
occurs for the failure callbacks.

Once a `Deferred` has been rejected or resolved, you cannot
reject or resolve it again.  Attempting to do so will
throw an error.

You can pass multiple arguments to `.resolve` and `.reject`.
The arguments for the first callback in the chain will
will be these same arguments.

## TODO
* Implement `.then`
* In general, follow popular promise implementations closer
* Add more tests, especially for methods with weird
 behavior like `.find` and `.aggregate`
