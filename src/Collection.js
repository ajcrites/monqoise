var methods,
    Cursor = require("./Cursor");

var Collection = function (name, mongoise) {
    this.name = name;
    this.mongoise = mongoise;
    this.collection = this.mongoise.dbc.collection(this.name);
};

Collection.prototype.cursor = function (method, args) {
    return new Cursor(method.apply(this.collection, args), this.mongoise);
}

methods = ["insert", "remove", "save", "update", "distinct", "count", "findAndModify",
"findAndRemove", "createIndex", "ensureIndex", "indexInformation", "dropIndex",
"dropAllIndexes", "reIndex", "mapReduce", "group", "options", "isCapped",
"indexExists", "geoNear", "geoHaystackSearch", "indexes", "stats"];
methods.forEach(function (func) {
    Collection.prototype[func] = function () {
        return this.mongoise.callMethodWithDeferred(this.collection,
            this.collection[func], arguments);
    };
});

Collection.prototype.aggregate = function () {
    // TODO there may be a better method for checking if a cusor
    // will be returned
    if (arguments.length >= 2 && arguments[1].hasOwnProperty("cursor")) {
        return this.cursor(this.collection.aggregate, arguments);
    }
    else {
        return this.mongoise.callMethodWithDeferred(this.collection,
            this.collection.aggregate, arguments);
    }
}

methods = ["find", "findOne"]
methods.forEach(function(func) {
    Collection.prototype[func] = function () {
        return this.cursor(this.collection[func], arguments);
    };
});

module.exports = Collection;
