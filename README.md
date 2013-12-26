# Mongoise -- Mongo Promise library

[![Build Status](https://travis-ci.org/ajcrites/mongoise.png)](https://travis-ci.org/ajcrites/mongoise)

Pronounce as "mong-oise," although "mongo-iss" may
make more sense.

This library creates a very simple promise wrapper
around the default Node Mongo client allowing it
to be used with promise-like syntax.

Mongoise implements its own `Deferred` and `Promise`
objects that do not adhere to the
[Promises/A+ specification](http://promises-aplus.github.io/promises-spec/).

Instead, Mongoise has an implementation that is similar
to the [`jQuery` Deferred Object](http://api.jquery.com/category/deferred-object/).

## API

Mongoise exposes its own API for MongoClient connection,
the MongoClient itself, a Collection API that uses mongoise
promises, and a Deferred API.

### Normal Usage

Use mongoise to connect to the DB via the `connect` method.
This method returns a promise, and you can continue
from there.

```javascript
var mongoise = require("mongoise"),
    promise = mongoise.connect(MONGODB_URI);
promise.done(function (dbc) {
    // dbc is the database connection
});
promise.fail(function (err) {
    // err is a DB connection error
});

// You can also chain methods,
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
