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
                done();
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
    });
});
