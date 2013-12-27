var should = require("should"),
    mongoise = require("../src/mongoise")
;

describe("Deferred", function () {
    describe("complete without chain", function () {
        it("should execute then after resolve", function (done) {
            var dfd = new mongoise.Deferred;

            dfd.promise.done(function (arg) {
                arg.should.equal("foo");
                done();
            });

            dfd.resolve("foo");
        });

        it("should execute before resolve", function (done) {
            var dfd = new mongoise.Deferred;

            dfd.resolve("bar");

            dfd.promise.done(function (arg) {
                arg.should.equal("bar");
                done();
            });
        });


        it("should allow multiple resolve arguments", function (done) {
            var dfd = new mongoise.Deferred;

            dfd.resolve("foo", "bar");

            dfd.promise.done(function () {
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
                err.should.contain("Cannot set resolve");
            }

            try {
                dfd.reject();
            }
            catch (err) {
                err.should.contain("Cannot set reject");
                done();
            }
        });
    });

    describe("complete with chain", function () {
        it("should chain then to fail", function (done) {
            var dfd = new mongoise.Deferred;

            dfd.promise.fail(function () {
                arguments.length.should.equal(0);
            }).done(function (arg) {
                arg.should.equal("foo");
                done();
            });

            dfd.resolve("foo");
        });

        it("should chain fail to then", function (done) {
            var dfd = new mongoise.Deferred;

            dfd.promise.done(function () {
                arguments.length.should.equal(0);
            }).fail(function (arg) {
                arg.should.equal("foo");
                done();
            });

            dfd.reject("foo");
        });

        it("should chain then to then", function (done) {
            var dfd = new mongoise.Deferred;

            dfd.promise.done(function () {
                return "foo"
            }).done(function (arg) {
                arg.should.equal("foo");
                done();
            });

            dfd.resolve();
        });

        it("should chain fail to fail", function (done) {
            var dfd = new mongoise.Deferred;

            dfd.promise.fail(function () {
                return "foo"
            }).fail(function (arg) {
                arg.should.equal("foo");
                done();
            });

            dfd.reject();
        });

        describe("allow empty callbacks", function () {
            it("should allow empty done", function (done) {
                var dfd = new mongoise.Deferred;

                dfd.promise.fail().done().done(function (arg) {
                    should.not.exist(arg);
                    done();
                });

                dfd.resolve("foo");
            });

            it("should allow empty fail", function (done) {
                var dfd = new mongoise.Deferred;

                dfd.promise.done().fail().fail(function (arg) {
                    should.not.exist(arg);
                    done();
                });

                dfd.reject("foo");
            });
        });
    });
});

