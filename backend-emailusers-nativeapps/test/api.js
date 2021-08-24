/**
 * Integrating the whole app to the test
 *
 */
// as the app doesnt run sincronously, we give time to up the server to run the tests
const timeOut= 50
//Dependencies
const app = require("../index");
const { dotEnvReader } = require("../lib/dotEnvReader");
const assert = require("assert");
const http = require("http");
const config = require("../config");

// HOLDER
const api = {};

//HELPERS
const helpers = {};

helpers.makeGetRequest = function (path, callback) {
  //Configure the request details
  const requestDetails = {
    protocol: "http:",
    hostname: "localhost",
    port: config.httpPort,
    method: "GET",
    path: path,
    headers: {
      "Content-Type": "application/json",
    },
  };

  //Send the request
  const req = http.request(requestDetails, function (res) {
    console.log(res.statusCode);
  
    callback(res);
  
  });

  req.on("error", function (err) {
    console.log(err);
  
  });
  req.on("finish", function () {
  
  });
  req.end();


};

api["app.init doesn´t throw on start"] = function (done) {
    assert.doesNotThrow(function () {
      dotEnvReader(app.init, function (err) {
        done();
      });
    }, TypeError);
};

api["/ping should respond to GET with 200"] = function (done) {
  setTimeout(() => {
    helpers.makeGetRequest("/ping", function (res) {
    
      assert.strictEqual(res.statusCode, 200);
    
      done();
    });
  }, timeOut);
};

api["/api/users should respond to GET with 400"] = function (done) {
  setTimeout(() => {
    helpers.makeGetRequest("/ping", function (res) {
    
      assert.strictEqual(res.statusCode, 200);
    
      done();
    });
  }, timeOut);
};

// request to random path?
api["A random path should respond to GET with 404"] = function (done) {
  setTimeout(() => {
    helpers.makeGetRequest("/this/path/shouldnt/exist", function (res) {
      assert.strictEqual(res.statusCode, 404);
      done();
    });
  }, timeOut);
};

//EXPORT the tests to the runner
module.exports = api;
