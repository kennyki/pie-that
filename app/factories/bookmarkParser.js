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

			boards: [],

			parse: function parse(callback) {
				var $this = this;
				
				// it's an async process
				chrome.bookmarks.getTree(function(nodes) {
					// start!
					var root = nodes[0];

					$this.createBoard(root);

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
						this.createBoard(child, board);
					} else {
						links.push({
							title: this.removeNewLines(child.title),
							url: child.url
						});
					}
				}, this);
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
			}

		};

		return BookmarkParser;
	};

	fn["$inject"] = [];

	pieThat.factory("BookmarkParser", fn);

})();