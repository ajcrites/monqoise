# Monqoise -- Mongo Promise library built off of Q

This is a fork of the (now killed) Mongoise project that
uses Q as its deferred library.

[![Build Status](https://travis-ci.org/ajcrites/monqoise.png)](https://travis-ci.org/ajcrites/monqoise)

Pronounce as "mawnk-oise," although "mawkno-iss" may
make more sense.

This library creates a very simple promise wrapper
around the default Node Mongo client allowing it
to be used with promises syntax.

## Usage

### Normal Usage

You can use monqoise to connect to the DB via the `connect`
method.  This method returns a promise, and you can
continue from there.

```javascript
var monqoisePackage = require("monqoise"),
    monqoise = new monqoisePackage.Monqoise,
    promise = monqoise.connect(MONGODB_URI);

promise.then(function (dbc) {
    // dbc is the database connection
});
promise.fail(function (err) {
    // err is a DB connection error
});

// You can also chain callbacks as with Q
// even directly to the `.connect` call
promise.then(function (dbc) {}).fail(function (err) {});
```

Once monqoise is connected, you can use the collection
API to do normal MongoDB operations using promises.

```javascript
var users = monqoise.collection("users");
users.insert(query).then(function (result) {
    // result is the inserted value
}).fail(function (err) {
    // err is an error with the insert
});
```

If you already have a `MongoClient` connection available,
you can pass this as an argument to the `Monqoise`
constructor and skip the `connect` step.

```javascript
MongoClient.connect(MONGODB_URI, function (err, dbc) {
    if (err) {
        throw err;
    }
    else {
        monqoise = new monqoise.Monqoise(dbc);
    }
});
```

### Calling MongoDB Methods

`Monqoise` implements all methods according to the
Node MongoDB [Collection](http://mongodb.github.io/node-mongodb-native/api-generated/collection.html)
and [Cursor](http://mongodb.github.io/node-mongodb-native/api-generated/cursor.html)
APIs.  You can call these methods identically to how you
would call them with `mongodb`.

***However***, the `Monqoise` objects automatically add
the callback to create the promise that you can chain
to.  This means that **you should omit the callback
argument** from all MongoDB method calls and instead rely
on the promise API.  Specifically, `Q.npost` is called
on the cursor/collection instance for the given function
and provided arguments.

In case you actually need to communicate using MongoClient
directly, you can create your own or simply access the
`dbc` property on the `Monqoise` object.
It is an unwrapped MongoClient instance.

## API

Monqoise exposes its own API for MongoClient connection,
the MongoClient itself, and collection/cursor APIs that
also use promises.

### `Monqoise`

The `Monqoise` has several methods and the `dbc` MongoDB
connection property.  Only methods intended for external
use are explained.

#### `connect`

* Arguments
 * connection URL
* Return
 * `Promise`

Connect to the MongoDB for the provided URL.  This also
sets up the Monqoise object for using database-reliant
methods.

#### `collection`

* Arguments
 * collection name
* Return
 * `Collection`

If you attempt to return a connection and no dbc is
available, Monqoise will throw an error.

### `Collection`

The `Collection` instance exposes all of the methods of the
[Node MongoDB Collection](http://mongodb.github.io/node-mongodb-native/api-generated/collection.html)
and can be used almost identically.

**Note:** You should **leave off the callback** argument
when calling a method on the collection instance.  Most
methods return a `promise` that you can call `then` and
`fail` on instead.

A comparison of the MongoDB route vs. Monqoise would be:

```javascript
mongoDbCollection.insert(document, function (err, done) {
    if (err) {
        errorCondition(err);
    }
    else {
        successCondition(done);
    }
});

monqoiseCollection.insert(document)
    .then(successCondition)
    .fail(errorCondition)
```

The above will function identically.

Since `Collection` simply wraps the MongoDB methods, you
can use all other arguments as you would.  *Only* the
callback handling is changed.

#### `.find`
The `.find` methods return a `Cursor` instead of a promise.
These methods are different, and **you can safely pass
callbacks to them**.

### `.aggregate`
The MongoDB `.aggregate` method allows you to create a
cursor based on the arguments you provide.  If you do
create one, Monqoise's `Collection` will return a `Cursor`
Otherwise, it will return a `Promise` that you can use
normally.

### `Cursor`
Some MongoDB methods return a cursor object.  The
Monqoise `Cursor` instance is simply a wrapper for the
[Node MongoDB Cursor](http://mongodb.github.io/node-mongodb-native/api-generated/cursor.html),
and you can call identical methods.

As with `Collection`, **you should leave off the callback
argument** for most methods and instead chain
success/failure callbacks to the promise that is returned.

### `.rewind`, `.stream`, `.isClosed`
These methods do not require a callback and return their
values instantly.  If you call them on `Cursor`, it will
return the intended value and *not* a promise object.

## TODO
* Add more tests, especially for methods with weird
 behavior like `.find` and `.aggregate`
