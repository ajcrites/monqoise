var should = require("should"),
    mongoisePackage = new require("../src/mongoise")
;
Deferred = mongoisePackage.Deferred;
mongoise = new mongoisePackage.Mongoise;

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
            mongoise.collection("foo").find({bar: "baz"}).toArray().done(function (result) {
                result[0].bar.should.equal("baz");
                done();
            });
        });

        it("should find multiple created records", function (done) {
            var dfd = new Deferred;
            mongoise.collection("foo").insert({bar: "baz"}).done(function () {
                dfd.resolve();
            });

            dfd.promise.done(function () {
                mongoise.collection("foo").find({bar: "baz"}).toArray().done(function (result) {
                    result.length.should.equal(2);
                    done();
                });
            });
        });

        it("should not find a nonextant record", function (done) {
            mongoise.collection("foo").find({bar: "no such bar"}).toArray().done(function (result) {
                result.length.should.equal(0);
                done();
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
            mongoise.collection("foo").find({bar: "baz"}).toArray().done(function (result) {
                should.exist(result);
                result.length.should.equal(2);
                return "chained";
            }).done(function (arg) {
                arg.should.equal("chained");
                done();
            });
        });

        it("should respond to multiple then method", function (done) {
            var promise = mongoise.collection("foo").find({bar: "baz"}).toArray();

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
            mongoise.collection("foo").insert({doc: "shock"}, {checkKeys: false}).done(function (results) {
                results[0].doc.should.equal("shock");
                done();
            });
        });

        it("should insert multiple records", function (done) {
            mongoise.collection("foo").insert([{doc: "more"}, {doc: "docs"}]).done(function (results) {
                results.length.should.equal(2);
                done();
            });
        });
    });

    describe("Find Options", function () {
        it("should allow no argument for find", function (done) {
            mongoise.collection("bar").find().toArray().done(function (results) {
                results.length.should.equal(1);
                done();
            });
        });
    });

    describe("No connection handling", function () {
        it("should throw an exception for collection with no DB", function (done) {
            var mongoise = new mongoisePackage.Mongoise;

            try {
                mongoise.collection("foo");
            }
            catch (err) {
                should.exist(err);
                done();
            }
        });
    });
});
