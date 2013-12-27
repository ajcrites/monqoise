var
    MongoClient = require("mongodb").MongoClient,
    Deferred = require("./Deferred"),
    Collection = require("./Collection")
;

var Mongoise = function (dbc) {
    this.dbc = dbc;
};

Mongoise.prototype = {
    /**
     * Create MongoClient connection with the provided URI
     * @return Promise
     */
    connect: function (uri) {
        var promise = this.callMethodWithDeferred(MongoClient,
            MongoClient.connect, [uri])
        promise.done(function (dbc) { this.dbc = dbc; }.bind(this));
        return promise;
    },

    /**
     * Create a Mongoise Collection of the provided name
     * This communicates with the MongoDB Collection API internally
     */
    collection: function (name) {
        if (!this.dbc || !this.dbc.collection) {
            throw "Mongoise instance does not have a database connection or "
                + "the provided connection is not a MongoClient instance conneciton";
        }
        return new Collection(name, this);
    },

    /**
     * Magical method -- at least where the magic happens.
     * @argument Context object that the method is applied to
     * @argument Function to call
     * @argument Array of arguments to pass to the method
     *
     * This works under the assumption that the method takes a callback
     * argument and calls it with two arguments.  In order: an error that
     * should be null if nothing when wrong, and some kind of result data
     */
    callMethodWithDeferred: function (object, method, args) {
        var dfd = new Deferred;

        // `args` will likely be an Arguments object
        // Ensure that it is an array so we can push to it
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
        method.apply(object, args);

        return dfd.promise;
    },
};

exports.Mongoise = Mongoise;
exports.Deferred = Deferred;
