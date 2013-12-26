var
    MongoClient = require("mongodb").MongoClient,
    Deferred = require("./Deferred")
;

var mongoise = function () {
    var self = this;

    self.Deferred = Deferred;

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
        this.name = name;
        this.mongoise = mongoise;
    };

    self.Collection.prototype = {
        insert: function (query) {
            var dfd = new Deferred;
            this.mongoise.dbc.collection(this.name).insert(query, function (err, result) {
                if (err) {
                    dfd.reject(err);
                }
                else {
                    dfd.resolve(result);
                }
            });

            return dfd.promise;
        },

        find: function (query) {
            var dfd = new Deferred;
            this.mongoise.dbc.collection(this.name).find(query).toArray(function (err, result) {
                if (err) {
                    dfd.reject(err);
                }
                else {
                    // TODO should probably be a setting of some kind
                    if (1 === result.length) {
                        dfd.resolve(result[0]);
                    }
                    else if (0 === result.length) {
                        dfd.resolve(null);
                    }
                    else {
                        dfd.resolve(result);
                    }
                }
            });

            return dfd.promise;
        }
    };
};

module.exports = new mongoise();
