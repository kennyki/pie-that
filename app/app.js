var pieThat = angular.module("pieThat", ["ngRoute", "ui.bootstrap"]);

(function() {

	pieThat.config(function($routeProvider) {
		$routeProvider
			.when("/", {
				templateUrl: "app/views/main.html",
				controller: "MainController"
			})
			.otherwise({
				redirectTo: "/"
			});
	});

})();