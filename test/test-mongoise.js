var should = require("should"),
    mongoise = require("../src/mongoise")
;

describe("Mongoise", function () {
    before(function (done) {
        mongoise.connect(process.env.MONGOISE_TEST_URI).done(function () {
            done();
        });
    });

    // This is done purely as a smoke test
    describe("connect", function () {
        it("should connect", function (done) {
            should.exist(mongoise.dbc);
            mongoise.dbc.collection("foo").drop(function () {
                mongoise.dbc.collection("bar").drop(function () {
                    done();
                });
            });
        });
    });

    describe("CRUD", function () {
        it("should create a record", function (done) {
            mongoise.collection("foo").insert({bar: "baz"}).done(function (result) {
                result[0].bar.should.equal("baz");
                done();
            });
        });

        it("should find created a single record", function (done) {
            mongoise.collection("foo").find({bar: "baz"}).done(function (result) {
                result.bar.should.equal("baz");
                done();
            });
        });

        it("should find multiple created records", function (done) {
            var dfd = new mongoise.Deferred();
            mongoise.collection("foo").insert({bar: "baz"}).done(function () {
                dfd.resolve();
            });

            dfd.promise.done(function () {
                mongoise.collection("foo").find({bar: "baz"}).done(function (result) {
                    result.length.should.equal(2);
                    done();
                });
            });
        });
    });

    describe("fail", function () {
        it("should implement fail method", function (done) {
            mongoise.dbc.collection("bar").ensureIndex({a: 1}, {unique: true}, function () {
                mongoise.collection("bar").insert({a: "bar"}).done(function () {
                    mongoise.collection("bar").insert({a: "bar"}).fail(function (err) {
                        should.exist(err);
                        done();
                    });
                });
            });
        });
    });

    describe("Chain", function () {
        it("should chain then method", function (done) {
            mongoise.collection("foo").find({bar: "baz"}).done(function (result) {
                should.exist(result);
                result.length.should.equal(2);
                return "chained";
            }).done(function (arg) {
                arg.should.equal("chained");
                done();
            });
        });

        it("should respond to multiple then method", function (done) {
            var dfd = mongoise.collection("foo").find({bar: "baz"});

            dfd.done(function () {
                dfd.done(function (resu) {
                    should.exist(resu);
                    done();
                });

                return arguments;
            });
        });
    });
});
