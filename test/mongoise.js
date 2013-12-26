var should = require("should"),
    mongoise = require("../src/mongoise"),
    MongoClient = require("mongodb").MongoClient,
    dbc
;

describe("Mongoise", function () {
    before(function (done) {
        mongoise.connect(process.env.MONGOISE_TEST_URI).then(function () {
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
            mongoise.collection("foo").insert({bar: "baz"}).then(function (result) {
                result[0].bar.should.equal("baz");
                done();
            });
        });

        it("should find created a single record", function (done) {
            mongoise.collection("foo").find({bar: "baz"}).then(function (result) {
                result.bar.should.equal("baz");
                done();
            });
        });

        it("should find multiple created records", function (done) {
            var dfd = new mongoise.Deferred();
            mongoise.collection("foo").insert({bar: "baz"}).then(function () {
                dfd.resolve();
            });

            dfd.promise.then(function () {
                mongoise.collection("foo").find({bar: "baz"}).then(function (result) {
                    result.length.should.equal(2);
                    done();
                });
            });
        });
    });

    describe("fail", function () {
        it("should implement fail method", function (done) {
            mongoise.dbc.collection("bar").ensureIndex({a: 1}, {unique: true}, function () {
                mongoise.collection("bar").insert({a: "bar"}).then(function () {
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
            mongoise.collection("foo").find({bar: "baz"}).then().then(function (result) {
                should.exist(result);
                result.length.should.equal(2);
                done();
            });
        });

        it("should respond to multiple then method", function (done) {
            var dfd = mongoise.collection("foo").find({bar: "baz"});

            dfd.then(function () {
                dfd.then(function (resu) {
                    should.exist(resu);
                    done();
                });

                return arguments;
            });
        });
    });
});
