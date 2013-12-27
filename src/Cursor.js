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
        var dfd = new this.mongoise.Deferred;

        args = Array.prototype.slice.call(arguments);
        args.push(function (err, result) {
            if (err) {
                dfd.reject(err);
            }
            else {
                dfd.resolve(result);
            }
        });

        this.cursor[func].apply(this.cursor, args);

        return dfd.promise;
    };
});

module.exports = Cursor;
