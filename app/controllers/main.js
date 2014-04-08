(function() {

	var fn = function($scope, BookmarkParser) {
		// default
		$scope.boards = [];

		$scope.getLinkCount = function getLinkCount(board) {
			return board.links.length;
		};

		var bookmarkParser = new BookmarkParser();

		bookmarkParser.parse(function(boards) {
			// need this to handle async change
			// benefits of $scope.$apply(fn): http://jimhoskins.com/2012/12/17/angularjs-and-apply.html
			$scope.$apply(function() {
				$scope.boards = boards;
			});
		});
	};

	fn["$inject"] = ["$scope", "BookmarkParser"];

	pieThat.controller("MainController", fn);

})();