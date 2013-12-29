var methods,
    Cursor = function (cursor, mongoise) {

    if (!cursor) {
        throw "Cursor argument is not a cursor value.  Method call does not "
            + "seem to return a cursor";
    }
    this.cursor = cursor;
    this.mongoise = mongoise;
};

methods = ["rewind", "stream", "isClosed"];
methods.forEach(function (func) {
    Cursor.prototype[func] = function () {
        return this.cursor.apply(this.cursor, arguments);
    };
});

methods = ["toArray", "each", "count", "sort", "limit", "maxTimeMS",
"setReadPreference", "skip", "batchSize", "nextObject", "explain", "close"];

methods.forEach(function (func) {
    Cursor.prototype[func] = function () {
        return this.mongoise.callMethodWithDeferred(this.cursor,
            this.cursor[func], arguments);
    };
});

module.exports = Cursor;
