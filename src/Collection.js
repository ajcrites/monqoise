var methods,
    Q = require("q"),
    Cursor = require("./Cursor"),
    monqoise = require("./monqoise")
;

var Collection = function (name, dbc) {
    this.name = name;
    this.collection = dbc.collection(this.name);
};

Collection.prototype.cursor = function (method, args) {
    return new Cursor(method.apply(this.collection, args));
}

/**
 * Methods that require a callback and return a document, status, etc.
 * Anything except a cursor
 */
methods = ["insert", "remove", "save", "update", "distinct", "count", "findAndModify",
"findAndRemove", "createIndex", "ensureIndex", "indexInformation", "dropIndex",
"dropAllIndexes", "reIndex", "mapReduce", "group", "options", "isCapped",
"indexExists", "geoNear", "geoHaystackSearch", "indexes", "stats"];
methods.forEach(function (func) {
    Collection.prototype[func] = function () {
        return monqoise.argumentInvoke(this.collection, func, arguments);
    };
});

/**
 * Methods that may return a cursor depending upon the arguments
 */
methods = ["aggregate", "findOne"];
methods.forEach(function (func) {
    Collection.prototype[func] = function () {
        // TODO there may be a better method for checking if a cusor
        // will be returned
        if (arguments.length >= 2 && arguments[1].hasOwnProperty("cursor")) {
            return this.cursor(this.collection[func], arguments);
        }
        else {
            return monqoise.argumentInvoke(this.collection, func, arguments);
        }
    }
});

/**
 * Methods that return a cursor
 */
methods = ["find"]
methods.forEach(function(func) {
    Collection.prototype[func] = function () {
        return this.cursor(this.collection[func], arguments);
    };
});

module.exports = Collection;
