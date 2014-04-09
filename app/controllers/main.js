(function() {

	var fn = function($scope, BookmarkParser, $modal) {
		// default
		$scope.boards = [];
		$scope.count = {
			boards: 0,
			links: 0
		};

		/**
		 * Get count of links of a board.
		 *
		 * @param: board (Object) the board.
		 */
		$scope.getLinkCount = function getLinkCount(board) {
			return board.links.length;
		};

		/**
		 * Check/uncheck a board. Will check child links.
		 *
		 * @param: board (Object) the board.
		 * @param: force (Boolean) toggle if undefined, otherwise force check/uncheck (optional).
		 *
		 * @return Status of operation.
		 */
		$scope.toggleBoard = function toggleBoard(board, force) {
			var success = $scope.toggleSelection(board, force);

			if (!success) {
				return false;
			}

			var boardSelection = board.selected;

			// apply to all child links
			board.links.forEach(function(link) {
				// don't go through toggleLink
				// and wil ignore result of the toggling
				$scope.toggleSelection(link, boardSelection);
			});

			return true;
		};

		/**
		 * Check/uncheck a link. Will try to check parent board before proceeding.
		 *
		 * @param: link (Object) the link.
		 * @param: board (Object) the board.
		 * @param: force (Boolean) toggle if undefined, otherwise force check/uncheck (optional).
		 *
		 * @return Status of operation.
		 */
		$scope.toggleLink = function toggleLink(link, board, force) {
			if (board && !board.selected) {
				// select board if it isn't
				// don't go through toggleBoard
				var success = $scope.toggleSelection(board, true);

				if (!success) {
					// if you cannot toggle the board, you cannot toggle the link
					return false;
				}
			}
			
			return $scope.toggleSelection(link, force);
		};

		/**
		 * Check/uncheck am item (board/link). Requires item to have a name.
		 *
		 * @param: item (Object) the board/link.
		 * @param: force (Boolean) toggle if undefined, otherwise force check/uncheck (optional).
		 *
		 * @return Status of operation.
		 */
		$scope.toggleSelection = function toggleSelection(item, force) {
			if (!item.selected && !item.name) {
				console.warn("An item must have name to be selected");
				return false;
			}

			// original state
			var oldState = item.selected;

			// can force selection
			item.selected = (typeof(force) != "undefined" ? !!force : !item.selected);

			if (item.selected != oldState) {
				// guess type
				var collectionName = (item.isBoard ? "boards" : "links");
				var countOperation = (item.selected ? "increase" : "decrease") + "Count";

				$scope[countOperation](collectionName);
			}

			return true;
		};

		/**
		 * Increase count of a collection.
		 *
		 * @param: collectionName (String) boards/links.
		 */
		$scope.increaseCount = function increaseCount(collectionName) {
			$scope.count[collectionName]++;
		};

		/**
		 * Decrease count of a collection.
		 *
		 * @param: collectionName (String) boards/links.
		 */
		$scope.decreaseCount = function decreaseCount(collectionName) {
			$scope.count[collectionName]--;
		};

		/**
		 * Awesome trick to prevent checkboxes from being checked ;-)
		 * Adapted from http://stackoverflow.com/a/17091107/940030
		 */
		$scope.onToggle = function onToggle($event, success) {
			if (!success) {
				$event.stopPropagation && $event.stopPropagation();
				$event.preventDefault && $event.preventDefault();
				$event.cancelBubble = true;
				$event.returnValue = false;
			}
		};

		/**
		 * TODO: Need access to Pie's Rest API..
		 */
		$scope.startImport = function startImport() {
			var dialog = $modal.open({
				// starts from root
				templateUrl: "app/views/import.html",
				controller: "ImportController",
				resolve: {
					// pass the built boards in
					boards: function() {
						return $scope.build();
					}
				}
			});
		};

		/**
		 * Construct clean data.
		 *
		 * @return Data to import.
		 */
		$scope.build = function build() {
			var builtBoards = [];

			$scope.boards.forEach(function(board) {
				if (!board.selected) {
					return;
				}

				var builtBoard = {
					name: board.name,
					// TODO: change all reference of "links" to "posts" and "link" to "post"
					posts: []
				};

				builtBoards.push(builtBoard);

				board.links.forEach(function(post) {
					if (!post.selected) {
						return;
					}

					var builtPost = {
						name: post.name,
						url: post.url
					};

					builtBoard.posts.push(builtPost);
				});
			});

			return builtBoards;
		};

		// =============================================
		// Start parsing!!
		// =============================================
		var bookmarkParser = new BookmarkParser();

		bookmarkParser.parse(function(boards) {
			// need this to handle async change
			// benefits of $scope.$apply(fn): http://jimhoskins.com/2012/12/17/angularjs-and-apply.html
			$scope.$apply(function() {
				$scope.boards = boards;
			});
		});
	};

	fn["$inject"] = ["$scope", "BookmarkParser", "$modal"];

	pieThat.controller("MainController", fn);

})();