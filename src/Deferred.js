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
     * Wrapper for `.fulfill`
     */
    resolve: function () {
        this.fulfill("resolved", this.promise.dones, this.promise.fails, "data", arguments);
    },

    /**
     * Reject promises -- this is an unsuccessful action
     * Wrapper for `.fulfill`
     */
    reject: function () {
        this.fulfill("rejected", this.promise.fails, this.promise.dones, "error", arguments);
    },

    /**
     * Set the deferred as either resolved or rejected and complete callbacks
     * @argument "resolved"/"rejected"
     * @argument Array of callbacks to fire
     * @argument Array of callbacks to resolve (opposite of completeStack)
     *  * Resolving just means that their promises get set to the same status
     *  * and chained callbacks may be fired depending on their type
     * @argument "data"/"error
     * @argument Arguments to resolve/reject with
     */
    fulfill: function (status, completeStack, resolveStack, dataType, args) {
        if ("pending" !== this.status) {
            throw "Deferred has already completed.  Cannot set " + status + " again";
        }
        this.status = status;
        this.promise.status = status;
        this.promise[dataType] = Array.prototype.slice.call(args);
        completeStack.forEach(function (data) {
            this.promise.complete(data, this.promise[dataType]);
        }.bind(this));
        resolveStack.forEach(function (data) {
            this.promise.resolveChain(data, this.promise[dataType]);
        }.bind(this));
    },
};

var Promise = function (dfd) {
    // Success callbacks
    this.dones = [];

    // Failure callback
    this.fails = [];

    // Success data
    this.data = null;

    // Error data
    this.error = null;

    // Done for comparison for checking status when deferred is alrady fulfilled
    this.status = "pending";
};

Promise.prototype = {
    /**
     * Sets up callback chain
     * @argument callback (empty function is used if none is provided)
     * @argument Chain to apply the callback to
     * @argument Resolve if current status matches the provided
     * @argument data to pass to the callbacks in the stack
     */
    chain: function (cb, stack, statusCheck, completeData) {
        var dfd = new Deferred;

        if (typeof cb !== "function") {
            cb = function () {};
        }

        stack.push({
            cb: cb,
            dfd: dfd
        });

        if (statusCheck === this.status) {
            this.complete({
                cb: cb,
                dfd: dfd
            }, completeData);
        }

        return dfd.promise;
    },

    // Wrapper for `.chain` for success callbacks
    done: function () {
        return this.chain(arguments[0], this.dones, "resolved", this.data);
    },

    // Wrapper for `.chain` for failure callbacks
    fail: function () {
        return this.chain(arguments[0], this.fails, "rejected", this.error);
    },

    /**
     * Called either by the Deferred or this Promise itself when the Deferred
     * is fulfilled.  This is calledk on all callbacks in the appropriate
     * stack.  The Deferred attached to the callback (used for chaining
     * promises) must also be fulfilled with the same status.
     *
     * Return value of the current callback is applied as the return argument
     * to chained callbacks
     */
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
