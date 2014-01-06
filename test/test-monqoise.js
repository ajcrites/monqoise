var should = require("should"),
    monqoisePackage = require("../src/monqoise"),
    Q = require("q")
;
monqoise = new monqoisePackage.Monqoise;

describe("monqoise", function () {
    before(function (done) {
        monqoise.connect(process.env.MONQOISE_TEST_URI).done(function () {
            done();
        });
    });

    // This is done purely as a smoke test
    describe("connect", function () {
        it("should connect", function (done) {
            should.exist(monqoise.dbc);
            monqoise.dbc.collection("foo").drop(function () {
                monqoise.dbc.collection("bar").drop(function () {
                    done();
                });
            });
        });
    });

    describe("CRUD", function () {
        it("should create a record", function (done) {
            monqoise.collection("foo").insert({bar: "baz"}).done(function (result) {
                result[0].bar.should.equal("baz");
                done();
            });
        });

        it("should find created a single record", function (done) {
            monqoise.collection("foo").find({bar: "baz"}).toArray().done(function (result) {
                result[0].bar.should.equal("baz");
                done();
            });
        });

        it("should find multiple created records", function (done) {
            dfd = Q.defer();
            monqoise.collection("foo").insert({bar: "baz"}).done(function () {
                dfd.resolve();
            });

            dfd.promise.done(function () {
                monqoise.collection("foo").find({bar: "baz"}).toArray().done(function (result) {
                    result.length.should.equal(2);
                    done();
                });
            });
        });

        it("should not find a nonextant record", function (done) {
            monqoise.collection("foo").find({bar: "no such bar"}).toArray().done(function (result) {
                result.length.should.equal(0);
                done();
            });
        });
    });

    describe("fail", function () {
        it("should implement fail method", function (done) {
            monqoise.dbc.collection("bar").ensureIndex({a: 1}, {unique: true}, function () {
                monqoise.collection("bar").insert({a: "bar"}).done(function () {
                    monqoise.collection("bar").insert({a: "bar"}).fail(function (err) {
                        should.exist(err);
                        done();
                    });
                });
            });
        });
    });

    describe("Chain", function () {
        it("should chain then method", function (done) {
            monqoise.collection("foo").find({bar: "baz"}).toArray().then(function (result) {
                should.exist(result);
                result.length.should.equal(2);
                return "chained";
            }).done(function (arg) {
                arg.should.equal("chained");
                done();
            });
        });

        it("should respond to multiple then method", function (done) {
            var promise = monqoise.collection("foo").find({bar: "baz"}).toArray();

            promise.done(function () {
                promise.done(function (resu) {
                    should.exist(resu);
                    done();
                });

                return arguments;
            });
        });
    });

    describe("Insert Options", function () {
        it("should allow options argument for insert", function (done) {
            monqoise.collection("foo").insert({doc: "shock"}, {checkKeys: false}).done(function (results) {
                results[0].doc.should.equal("shock");
                done();
            });
        });

        it("should insert multiple records", function (done) {
            monqoise.collection("foo").insert([{doc: "more"}, {doc: "docs"}]).done(function (results) {
                results.length.should.equal(2);
                done();
            });
        });
    });

    describe("Find Options", function () {
        it("should allow no argument for find", function (done) {
            monqoise.collection("bar").find().toArray().done(function (results) {
                results.length.should.equal(1);
                done();
            });
        });
    });

    describe("No connection handling", function () {
        it("should throw an exception for collection with no DB", function (done) {
            var monqoise = new monqoisePackage.Monqoise;

            try {
                monqoise.collection("foo");
            }
            catch (err) {
                should.exist(err);
                done();
            }
        });
    });

    describe("findOne", function () {
        it("should work with findOne", function (done) {
            monqoise.collection("foo").findOne().done(function (result) {
                should.exist(result);
                done();
            });
        });
    });
});
