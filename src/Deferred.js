var Promise = require("./Promise");

Deferred = function () {
    this.promise = new Promise;
    this.status = "pending";
    this.data = null;
};

Deferred.prototype = {
    resolve: function () {
        if ("pending" !== this.status) {
            throw "Deferred has already completed.  Cannot resolve again";
        }
        this.status = "resolved";
        this.promise.status = "resolved";
        this.promise.data = Array.prototype.slice.call(arguments);
        this.promise.thens.forEach(function (data) {
            this.promise.complete(data, this.promise.data);
        }.bind(this));
    },

    reject: function () {
        if ("pending" !== this.status) {
            throw "Deferred has already completed.  Cannot reject again";
        }
        this.status = "rejected";
        this.promise.status = "rejected";
        this.promise.data = Array.prototype.slice.call(arguments);
        this.promise.fails.forEach(function (data) {
            this.promise.complete(data, this.promise.data);
        });
    },
};

var Promise = function (dfd) {
    // Then callbacks
    this.thens = [];

    // Fail callback
    this.fails = [];

    this.data = null;

    this.status = "pending";
};

Promise.prototype = {
    then: function (cb) {
        var dfd = new Deferred;

        this.thens.push({
            cb: cb,
            dfd: dfd
        });

        if ("resolved" === this.status) {
            this.complete({
                cb: cb,
                dfd: dfd
            }, this.data);
        }

        return dfd.promise;
    },

    complete: function (data, result) {
        var result = data.cb.apply(this, result);
        if ("resolved" === this.status) {
            data.dfd.resolve(result);
        }
        else {
            data.dfd.reject(result);
        }
    }
};


module.exports = Deferred;
