var methods,
    Cursor = function (cursor, mongoise) {
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
        return this.mongoise.callMethodWithDeferred(this.cursor, func, arguments);
    };
});

module.exports = Cursor;
