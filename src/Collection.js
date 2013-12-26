Cursor = require("./Cursor");

var Collection = function (name, mongoise) {
    this.name = name;
    this.mongoise = mongoise;
};

Collection.prototype = {
    insert: function (query) {
        var collection,
            dfd = new this.mongoise.Deferred,
            args = [query];

        if (arguments[1]) {
            args.push(arguments[1]);
        }

        args.push(function (err, result) {
            if (err) {
                dfd.reject(err);
            }
            else {
                dfd.resolve(result);
            }
        });

        collection = this.mongoise.dbc.collection(this.name);
        collection.insert.apply(collection, args);

        return dfd.promise;
    },

    find: function (query) {
        var dfd = new Deferred;
        return new Cursor(this.mongoise.dbc.collection(this.name).find(query), this.mongoise);
    },
};

module.exports = Collection;
