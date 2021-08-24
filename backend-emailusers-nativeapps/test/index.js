/**
 * TEST RUNNER
 *
 */

//OVERRIDE the enviroment into testing
process.env.NODE_ENV = 'testing'
const cli = require("../lib/consoleStyle");
require('dotenv').config()

// Application logic for the test runner
_app = {};

// Container for the tests
_app.tests = {};

_app.tests.unit = require('./units')
//_app.tests.api = require('./api')


//Count all the tests
_app.countTests = function () {
  let counter = 0;
  for (const key in _app.tests) {
    if (Object.hasOwnProperty.call(_app.tests, key)) {
      const subTests = _app.tests[key];
      for (const testName in subTests) {
        if (Object.hasOwnProperty.call(subTests, testName)) {
          counter++;
        }
      }
    }
  }
  return counter;
};

//This is the logic for  the test runner
_app.runTests = function () {
  let errors = [];
  let successes = 0;
  const limit = _app.countTests(); 
  let counter = 0;
  
for (const key in _app.tests) {
    
    if (Object.hasOwnProperty.call(_app.tests, key)) {
      const subTest = _app.tests[key];
      for (const testName in subTest) {
        
        if (Object.hasOwnProperty.call(subTest, testName)) {
          (function () {
            const testValue = subTest[testName];
            //Call the test
            try {
              testValue(function (params) {
                //if it calls back without throwing, then it succeded. log in green
                console.log("\x1b[32m%s\x1b[0m", testName);
                counter++;
                successes++;
                if (counter === limit) {
                  _app.produceTestReport(limit, successes, errors); 
                }
              });
            } catch (error) {
              //if it throws it failed
              errors.push({
                name: testName,
                error: error,
              });
              console.log(
                "\x1b[31m%s\x1b[0m", testName );
              counter++;
              if (counter === limit) {
                _app.produceTestReport(limit, successes, errors);
              }
            }
          })();
        }
      }
    }
  }
}

//Produce a test outcome report
_app.produceTestReport = function (limit, successes, errors) {
  // datos para el titulo formateado en consola
  const testStatsObject = {
    "Total tests": limit,
    Pass: successes,
    Fail: errors.length,
  };
  cli.renderObjectStyle("BEGIN TEST REPORT", testStatsObject, 32);

  //if there are errors print them in red
  if (errors.length > 0) {
    const failedTestsObject = {};
    errors.forEach((e) => {
      failedTestsObject[e.name] = e.error;
      
    });
    cli.renderObjectStyle("BEGIN ERROR DETAILS", failedTestsObject, 31);
    
  }
// end the test
  cli.renderObjectStyle('END OF TESTS',{})
  //for integration tests, exit the app
  process.exit(0)
};

// RUN
_app.runTests()