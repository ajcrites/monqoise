/**
 * Deferred implementation
 */
Deferred = function () {
    this.promise = new Promise;
    // Used to ensure that a Deferred's status is not changed twice
    this.status = "pending";
    this.data = null;
};

Deferred.prototype = {
    /**
     * Resolve promises -- this is a successful action
     */
    resolve: function () {
        if ("pending" !== this.status) {
            throw "Deferred has already completed.  Cannot resolve again";
        }
        this.status = "resolved";
        this.promise.status = "resolved";
        this.promise.data = Array.prototype.slice.call(arguments);

        // Complete success callbacks
        this.promise.dones.forEach(function (data) {
            this.promise.complete(data, this.promise.data);
        }.bind(this));

        // Force resolution of failure callbacks as these may
        // have chained success callbacks
        this.promise.fails.forEach(function (data) {
            this.promise.resolveChain(data, this.promise.data);
        }.bind(this));
    },

    // TODO may be able to consolidate this with the resolve method above,
    // to which it is similar
    reject: function () {
        if ("pending" !== this.status) {
            throw "Deferred has already completed.  Cannot reject again";
        }
        this.status = "rejected";
        this.promise.status = "rejected";
        this.promise.error = Array.prototype.slice.call(arguments);
        this.promise.fails.forEach(function (data) {
            this.promise.complete(data, this.promise.error);
        }.bind(this));
        this.promise.dones.forEach(function (data) {
            this.promise.resolveChain(data, this.promise.error);
        }.bind(this));
    },
};

var Promise = function (dfd) {
    // Success callbacks
    this.dones = [];

    // Failure callback
    this.fails = [];

    this.data = null;

    this.error = null;

    this.status = "pending";
};

Promise.prototype = {
    done: function () {
        var cb,
            dfd = new Deferred;

        if (0 === arguments.length) {
            cb = function () {};
        }
        else {
            cb = arguments[0];
        }

        this.dones.push({
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

    fail: function () {
        var cb,
            dfd = new Deferred;

        if (0 === arguments.length) {
            cb = function () {};
        }
        else {
            cb = arguments[0];
        }

        this.fails.push({
            cb: cb,
            dfd: dfd
        });

        if ("rejected" === this.status) {
            this.complete({
                cb: cb,
                dfd: dfd
            }, this.error);
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
    },

    /**
     * This method passes down the resolution/rejection to chained
     * promises without executing the callback
     *
     * It should be used when this callback does not match the
     * success/failure of chained callbacks
     */
    resolveChain: function (data, datum) {
        if ("resolved" === this.status) {
            data.dfd.resolve.apply(data.dfd, datum);
        }
        else {
            data.dfd.reject.apply(data.dfd, datum);
        }
    }
};

module.exports = Deferred;
