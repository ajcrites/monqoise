var
    MongoClient = require("mongodb").MongoClient,
    Collection = require("./Collection"),
    Q = require("q")
;

var Monqoise = function (dbc) {
    this.dbc = dbc;
};

Monqoise.prototype = {
    /**
     * Create MongoClient connection with the provided URI
     * @return Promise
     */
    connect: function (uri) {
        return Q.ninvoke(MongoClient, "connect", uri).then(function (dbc) {
            this.dbc = dbc;
        }.bind(this));
    },

    /**
     * Create a Monqoise Collection of the provided name
     * This communicates with the MongoDB Collection API internally
     */
    collection: function (name) {
        if (!this.dbc || !this.dbc.collection) {
            throw "Monqoise instance does not have a database connection or "
                + "the provided connection is not a MongoClient instance connection";
        }
        return new Collection(name, this.dbc);
    },
};

exports.Monqoise = Monqoise;
exports.argumentInvoke = function (object, func, args) {
    if (args.length > 0) {
        return Q.npost(object, func, Array.prototype.slice.call(args));
    }
    else {
        return Q.npost(object, func);
    }
};
