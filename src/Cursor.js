Cursor = function (cursor, mongoise) {
    this.cursor = cursor;
    this.mongoise = mongoise;
};

Cursor.prototype = {
    toArray: function () {
        var dfd = new this.mongoise.Deferred;
        this.cursor.toArray(function (err, result) {
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

module.exports = Cursor;
