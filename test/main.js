var should = require("should"),
    mongoise = require("../src/main"),
    MongoClient = require("mongodb").MongoClient,
    dbc
;

describe("Mongoise", function () {
    before(function (done) {
        MongoClient.connect(process.env.MONGOISE_TEST_URI, function (err, db) {
            if (err) {
                console.log("Unable to connect to database. Make sure you have"
                    + "MongoDB configured -- " + err);
            }
            else {
                db.collection("mongoise").drop(function () {
                    dbc = db;
                    done();
                });
            }
        });
    });

    // This is done purely as a smoke test
    describe("connect", function () {
        it("should connect", function (done) {
            should.exist(dbc);
            done();
        });
    });
});
