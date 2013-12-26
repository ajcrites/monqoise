var Promise = function () {
    this.thencb = [];
    this.failcb = [];
};

Promise.prototype = {
    then: function (then, fail) {
        var dfd = new Deferred;

        this.thencb.push({
            cb: then,
            dfd: dfd
        })

        if (fail) {
            this.failcb.push({
                cb: fail,
                dfd: dfd
            });
        }

        if ("resolved" === this.status) {
            this.resolve({
                cb: then,
                dfd: dfd
            }, this.data)
        }
        else if ("rejected" === this.status) {
            this.resolve({
                cb: fail,
                dfd: dfd
            }, this.error);
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
    this.promise = new Promise;
};

Deferred.prototype = {
    promise: null,
    resolve: function (data) {
        var promise = this.promise;
        promise.data = data;
        promise.status = "resolved";
        promise.thencb.forEach(function (cbdata) {
            promise.resolve(cbdata, data);
        });
    },

    reject: function (error) {
        var promise = this.promise;
        promise.error = error;
        promise.status = "rejected";
        promise.failcb.forEach(function (cbdata) {
            promise.resolve(cbdata, error);
        });
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

