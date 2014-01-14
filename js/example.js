angular.module('ng-hyper-example', ['ng-hyper'])
  .config(function($provide) {
    $provide.value('hyperHttpRoot', 'api/index.json');
  });
