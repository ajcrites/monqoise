var
    MongoClient = require("mongodb").MongoClient,
    Deferred = require("./Deferred"),
    Collection = require("./Collection")
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
        return new Collection(name, self);
    };
};

module.exports = new mongoise();
