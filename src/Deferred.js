var Promise = function () {
    this.thens = [];
    this.fails = [];
};

Promise.prototype = {
    status: "pending",

    then: function (cb) {
        var defer = new Deferred;

        this.thens.push({
            cb: cb,
            defer: defer
        });

        if ("resolved" === this.status) {
            this.complete({
                cb: cb,
                defer: defer
            }, this.data);
        }

        return defer.promise;
    },

    fail: function (cb) {
        var defer = new Defer;

        this.fails.push({
            cb: cb,
            defer: defer
        });

        if ("rejected" === this.status) {
            this.complete({
                cb: cb,
                defer: defer
            });
        }

        return defer.promise;
    },

    complete: function (data, result) {
        var res = data.cb.apply(this, result);
        data.defer.resolve(res);
    }
};

var Deferred = function () {
    this.promise = new Promise();
};

Deferred.prototype = {
    resolve: function (data) {
        var promise = this.promise;
        promise.data = data;
        promise.status = "resolved";
        promise.thens.forEach(function(callbackData) {
            promise.complete(callbackData, data);
        });
    },

    reject: function (error) {
        var promise = this.promise;
        promise.error = error;
        promise.status = "rejected";
        promise.fails.forEach(function(callbackData) {
            promise.complete(callbackData, error);
        });
    },
};

module.exports = Deferred;
