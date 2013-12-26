var Promise = function (dfd) {
    // Then callbacks
    this.thens = [];

    // Fail callback
    this.fails = [];

    // Deferred object
    this.dfd = dfd;
};

Promise.prototype = {
    then: function (cb) {
        this.thens.push({
            cb: cb,
            dfd: this.dfd
        });

        if ("resolved" === this.dfd.status) {
            this.resolve({
                cb: cb,
                dfd: this.dfd
            }, this.dfd.data);
        }

        return this.dfd.promise();
    },

    resolve: function (data, result) {
        data.cb.apply(this, result);
    }
};

module.exports = Promise;
