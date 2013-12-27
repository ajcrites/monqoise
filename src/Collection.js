var methods,
    Cursor = require("./Cursor");

var Collection = function (name, mongoise) {
    this.name = name;
    this.mongoise = mongoise;
    this.collection = this.mongoise.dbc.collection(this.name);
};

Collection.prototype.createDeferredArg = function (method, args) {
    var dfd = new this.mongoise.Deferred;

    args = Array.prototype.slice.call(args);
    args.push(function (err, result) {
        if (err) {
            dfd.reject(err);
        }
        else {
            dfd.resolve(result);
        }
    });

    method.apply(this.collection, args);

    return dfd.promise;
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
        return this.createDeferredArg(this.collection[func], arguments);
    };
});

Collection.prototype.aggregate = function () {
    var dfd;
    // TODO there may be a better method for checking if a cusor
    // will be returned
    if (arguments.length >= 2 && arguments[1].hasOwnProperty("cursor")) {
        return this.cursor(this.collection.aggregate, arguments);
    }
    else {
        return this.createDeferredArg(this.collection.aggregate, arguments);
    }
}

methods = ["find", "findOne"]
methods.forEach(function(func) {
    Collection.prototype[func] = function () {
        return this.cursor(this.collection[func], arguments);
    };
});

module.exports = Collection;
