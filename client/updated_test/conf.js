// conf.js

// if running admin or dev, register the test user first
var HtmlReporter = require('protractor-html-screenshot-reporter');

var reporter=new HtmlReporter({
    baseDirectory: './protractor-test-result', // a location to store screen shots.
    docTitle: 'Protractor Reporter',
    docName:    'protractor-tests-report.html'
});

exports.config = {
  seleniumAddress: 'http://localhost:4444/wd/hub',
  specs: [
    'register.js',
    'upload_1.js',
    'scenario_1.js',
    'upload_2.js',
    'scenario_2.js',
    'upload_3.js',
    'match.js',
    'print.js',
    'logout.js',
    'med_view.js',
    'med_new.js',
    'dev_register.js',
    'dev_login.js',
    'dev_client.js',
    'dev_logout.js',
    'admin_register.js',
    'admin_login.js',
    'admin_client.js',
    'admin_logout.js'],
  suites: {
    populate: ['register.js','upload_1.js', 'chart.js','upload_2.js','upload_3.js','logout.js'],
    scenarios: ['login.js','scenario_1.js','scenario_2.js','match.js','logout.js'],
    medications: ['login.js','med_view.js', 'med_new.js','logout.js'],
    original_demo: ['register.js', 'upload_1.js','chart.js', 'scenario_1.js', 'upload_2.js', 'scenario_2.js', 'upload_3.js', 'match.js', 'print.js', 'logout.js'],
    dev: ['dev_login.js','dev_client.js', 'dev_logout.js'],
    admin: ['admin_login.js','admin_client.js', 'admin_logout.js']
  },
  capabilities: {
    browserName: 'firefox'
  },
  onPrepare: function() {
    jasmine.getEnv().addReporter(reporter);
  }
}