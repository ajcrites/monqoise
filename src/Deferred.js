var Promise = require("./Promise");

Deferred = function () {
    this.promises = [];
    this.status = "pending";
    this.data = null;
};

Deferred.prototype = {
    promise: function () {
        var promise = new Promise(this);
        this.promises.push(promise);
        return promise;
    },

    resolve: function () {
        if ("pending" !== this.status) {
            throw "Deferred has already completed.  Cannot resolve again";
        }
        this.status = "resolved";
        this.data = Array.prototype.slice.call(arguments);
        this.promises.forEach(function (promise) {
            promise.thens.forEach(function (data) {
                promise.resolve(data, this.data);
            }.bind(this));
        }.bind(this));
    },
};

module.exports = Deferred;
