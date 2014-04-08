(function() {

	var fn = function() {
		// define class
		var BookmarkParser = function BookmarkParser() {
			return this;
		};

		BookmarkParser.prototype = {

			EXCLUDES: {
				"Bookmarks bar": true,
				"undefined": true,
				"Other bookmarks": true,
				"Mobile bookmarks": true
			},

			URL_FILTERS: [
				// starts with chrome (case-insensitive)
				/^chrome/i
			],

			boards: [],

			parse: function parse(callback) {
				var $this = this;
				
				// it's an async process
				chrome.bookmarks.getTree(function(nodes) {
					// start!
					var root = nodes[0];

					$this.createBoard(root);
					$this.processBoards();

					if (typeof(callback) == "function") {
						callback($this.boards);
					}
				});
			},

			createBoard: function createBoard(node, parentBoard) {
				var board = {
					name: this.getBoardName(node, parentBoard),
					links: []
				};

				this.boards.push(board);

				this.createLinks(node, board);
			},

			createLinks: function createLinks(node, board) {
				var links = board.links;
				var children = node.children;

				if (!children || children.length == 0) {
					return links;
				}

				children.forEach(function(child) {
					var isChildAFolder = (child.children && child.children.length != 0);

					if (isChildAFolder) {
						// recurring call
						this.createBoard(child, board);

					} else if (child.url && this.isUrlValid(child.url)) {
						// only add if child URL is valid
						links.push({
							title: this.removeNewLines(child.title),
							url: child.url
						});
					}
				}, this);
			},

			isUrlValid: function isUrlValid(url) {
				// invert the result of some
				var valid = !this.URL_FILTERS.some(function(filter) {
					if (url.match(filter)) {
						// exit
						return true;
					}
				}, this);

				return valid;
			},

			getBoardName: function getBoardName(node, board) {
				// let user choose, perhaps
				var name = (this.EXCLUDES[node.title] ? "" : this.removeNewLines(node.title));

				// exclude "Bookmarks bar" and others from being part of the name
				if (board && board.name && !this.EXCLUDES[board.name]) {
					name = board.name + " > " + name
				}

				return name;
			},

			removeNewLines: function removeNewLines(str) {
				// TODO: should just do HTML sanitize
				return str.replace(/(\r\n|\n|\r|<br>)/gm, " ");
			},

			processBoards: function processBoards() {
				var boards = this.boards;
				var boardByName = {};

				boards.forEach(function(board, i) {
					// default name
					if (!board.name) {
						board.name = "To be defined";
					}

					var name = board.name;
					var existingBoard = boardByName[name];

					if (existingBoard) {
						// merge by:
						// concat the links
						existingBoard.links.push.apply(existingBoard.links, board.links);
						// remove the board located at later index
						boards.splice(i, 1);

					} else {
						boardByName[name] = board;
					}

				}, this);
			}

		};

		return BookmarkParser;
	};

	fn["$inject"] = [];

	pieThat.factory("BookmarkParser", fn);

})();