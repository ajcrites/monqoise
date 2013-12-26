var
    promise = require("./promise"),
    MongoClient = require("mongodb").MongoClient,
    Promise = promise.Promise,
    Deferred = promise.Deferred
;

var mongoise = function () {
    var self = this;

    self.dbc = null;

    self.connect = function (uri) {
        var dfd = new Deferred;

        MongoClient.connect(uri, function (err, dbc) {
            if (err) {
                dfd.reject(err);
            }
            else {
                self.dbc = dbc;
                dfd.resolve(dbc);
            }
        });

        return dfd.promise;
    };

    self.collection = function (name) {
        return new self.Collection(name, self);
    };

    self.Collection = function (name, mongoise) {
        var collection = this;
        collection.name = name;

        collection.insert = function (query) {
            var dfd = new Deferred;
            mongoise.dbc.collection(collection.name).insert(query, function (err, result) {
                if (err) {
                    dfd.reject(err);
                }
                else {
                    dfd.resolve(result);
                }
            });

            return dfd.promise;
        };
    }
};

module.exports = new mongoise();
