var methods,
    Q = require("q"),
    monqoise = require("./monqoise"),
    Cursor = function (cursor) {

    if (!cursor) {
        throw "Cursor argument is not a cursor value.  Method call does not "
            + "seem to return a cursor";
    }
    this.cursor = cursor;
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
        return monqoise.argumentInvoke(this.cursor, func, arguments);
    };
});

module.exports = Cursor;
