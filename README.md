# Mongoise -- Mongo Promise library

[![Build Status](https://travis-ci.org/ajcrites/mongoise.png)](https://travis-ci.org/ajcrites/mongoise)

This library creates a very simple promise wrapper
around the default Node Mongo client allowing it
to be used with promise-like syntax.

Mongoise implements its own `Deferred` and `Promise`
objects that do not currently adhere to the
[Promises/A+ specification](http://promises-aplus.github.io/promises-spec/),
but this should be handled in the future.
