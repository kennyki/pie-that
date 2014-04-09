(function() {

	var fn = function($scope, $modalInstance, boards) {
		// for display
		$scope.boardsJSON = JSON.stringify(boards, null, 4);

		$scope.close = function close() {
			$modalInstance.close("cancel");
		};
	};

	fn["$inject"] = ["$scope", "$modalInstance", "boards"];

	pieThat.controller("ImportController", fn);

})();