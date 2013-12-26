var should = require("should"),
    mongoise = require("../src/mongoise")
;

describe("Deferred", function () {
    describe("resolve multi without chain", function () {
        it("should execute then after resolve", function (done) {
            var dfd = new mongoise.Deferred;

            dfd.promise().then(function (arg) {
                arg.should.equal("foo");
                done();
            });

            dfd.resolve("foo");
        });

        it("should execute before resolve", function (done) {
            var dfd = new mongoise.Deferred;

            dfd.resolve("bar");

            dfd.promise().then(function (arg) {
                arg.should.equal("bar");
                done();
            });
        });


        it("should allow multiple resolve arguments", function (done) {
            var dfd = new mongoise.Deferred;

            dfd.resolve("foo", "bar");

            dfd.promise().then(function () {
                arguments.length.should.equal(2);
                done();
            });
        });

        it("should not allow resolve / change state twice", function (done) {
            var dfd = new mongoise.Deferred;

            dfd.resolve();

            try {
                dfd.resolve();
            }
            catch (err) {
                err.should.contain("resolve again");
            }

            try {
                dfd.reject();
            }
            catch (err) {
                err.should.contain("reject again");
                done();
            }
        });

        it("should allow then chaining", function (done) {
            var dfd = new mongoise.Deferred;

            dfd.promise().then(function (arg) {
                arg.should.equal("foo");
                return "bar";
            }).then(function (arg) {
                arg.should.equal("bar");
                done();
            });

            dfd.resolve("foo");
        });
    });
});

