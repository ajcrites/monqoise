var
    MongoClient = require("mongodb").MongoClient,
    Deferred = require("./Deferred"),
    Collection = require("./Collection")
;

var Mongoise = function (dbc) {
    this.dbc = dbc;
};

Mongoise.prototype = {
    connect: function (uri) {
        var promise = this.callMethodWithDeferred(MongoClient, "connect", [uri])
        promise.done(function (dbc) { this.dbc = dbc; }.bind(this));
        return promise;
    },

    collection: function (name) {
        if (!this.dbc || !this.dbc.collection) {
            throw "Mongoise instance does not have a database connection or "
                + "the provided connection is not a MongoClient instance conneciton";
        }
        return new Collection(name, this);
    },

    callMethodWithDeferred: function (object, methodName, args) {
        var dfd = new Deferred;

        // args should be an Arguments object
        // ensure that it is an array so it will work with apply
        args = Array.prototype.slice.call(args);
        args.push(function (err, result) {
            if (err) {
                dfd.reject(err);
            }
            else {
                dfd.resolve(result);
            }
        });

        // Method should be called with the context of the caller
        object[methodName].apply(object, args);

        return dfd.promise;
    },
};

exports.Mongoise = Mongoise;
exports.Deferred = Deferred;
