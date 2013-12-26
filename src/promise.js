var Promise = function (dfd) {
    this.thencb = [];
    this.failcb = [];
    this.dfd = dfd;
};

Promise.prototype = {
    then: function () {
        var self = this;

        Array.prototype.forEach.call(arguments, function (arg) {
            self.thencb.push({
                cb: arg,
                dfd: self.dfd
            });
        });

        if ("resolved" === self.status) {
            Array.prototype.forEach.call(arguments, function (arg) {
                self.resolve({
                    cb: arg,
                    dfd: self.dfd
                });
            });
        }

        return self.dfd.promise;
    },

    fail: function () {
        var self = this;

        Array.prototype.forEach.call(arguments, function (arg) {
            self.failcb.push({
                cb: arg,
                dfd: dfd
            });
        });

        if ("rejected" === self.status) {
            Array.prototype.forEach.call(arguments, function (arg) {
                self.resolve({
                    cb: arg,
                    dfd: dfd
                });
            });
        }

        return dfd.promise;
    },

    resolve: function (data, result) {
        setTimeout(function () {
            var res = data.cb(result);

            if (res instanceof Promise) {
                data.dfd.bind(res);
            }
            else {
                data.dfd.resolve(res);
            }
        }, 0);
    }
};

Deferred = function () {
    this.promise = new Promise(this);
};

Deferred.prototype = {
    promise: null,
    resolve: function (data) {
        var promise = this.promise;
        promise.data = data;
        promise.status = "resolved";
        while (cb = promise.thencb.shift()) {
            promise.resolve(cb, data);
        }
    },

    reject: function (error) {
        var promise = this.promise;
        promise.error = error;
        promise.status = "rejected";
        while (cb = promise.failcb.shift()) {
            promise.resolve(cb, error);
        }
    },

    bind: function (promise) {
        var self = this;

        promise.then(function (res) {
            self.resolve(res);
        }, function (err) {
            self.reject(err);
        });
    }
};

exports.Promise = Promise;
exports.Deferred = Deferred;
