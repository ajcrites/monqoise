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

        this.Cursor = function (query) {
            this.query = query;
        }

        this.Cursor.prototype = {
            toArray: function () {
                var dfd = new Deferred;
                this.query.toArray(function (err, result) {
                    if (err) {
                        dfd.reject(err);
                    }
                    else {
                        dfd.resolve(result);
                    }
                });

                return dfd.promise;
            }
        }
    };

    self.Collection.prototype = {
        insert: function (query) {
            var collection,
                dfd = new Deferred,
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
            return new this.Cursor(this.mongoise.dbc.collection(this.name).find(query));
        },
    };
};

module.exports = new mongoise();
