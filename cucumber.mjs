export default {
  default: {
    import: [
      'dist/hooks.js',
      'dist/steps/**/*.js'
    ],
    publishQuiet: true,
    format: [
      'progress',
      'html:reports/report.html',
      'json:reports/report.json'
    ],
    paths: ['features/**/*.feature'],
    parallel: 1,
    timeout: 60_000
  }
};
