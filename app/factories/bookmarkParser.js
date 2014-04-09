(function() {

	var fn = function() {
		/**
		 * A utility that makes use of chrome's bookmarks API to
		 * parse all bookmarks (folder and links)
		 */
		var BookmarkParser = function BookmarkParser() {
			return this;
		};

		BookmarkParser.prototype = {

			/**
			 * To be excluded from boards
			 */
			EXCLUDES: {
				"Bookmarks bar": true,
				"undefined": true,
				"Other bookmarks": true,
				"Mobile bookmarks": true
			},

			/**
			 * To be excluded from links
			 */
			URL_FILTERS: [
				// starts with chrome (case-insensitive)
				/^chrome/i
			],

			boards: [
				/*
					{
						name: "Pie",
						isBoard: true,
						selected: false,
						links: [
							{
								name: "Pie wants to build a global enterprise software firm in Singapore",
								url: "www.techinasia.com/forget-silicon-valley-pie-build-global-enterprise-software-firm-singapore/",
								isLink: true,
								selected: false
							}
						]
					}
				*/
			],

			/**
			 * Start parsing.
			 *
			 * @param: callback (Function) will receive an array of board objects
			 */
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

			/**
			 * Create a board object and its links. Will push into the instance's boards property.
			 *
			 * @param: node (BookmarkTreeNode) the chrome's bookmark node.
			 * @param: parentBoard (BookmarkTreeNode) the parent folder node (optional).
			 */
			createBoard: function createBoard(node, parentBoard) {
				var board = {
					name: this.getBoardName(node, parentBoard),
					isBoard: true,
					selected: false,
					links: []
				};

				this.boards.push(board);

				this.createLinks(node, board);
			},

			/**
			 * Create links within a board object. Will do a recurring call to create board if a child is folder.
			 *
			 * @param: node (BookmarkTreeNode) the chrome's bookmark node.
			 * @param: board (Object) the board.
			 */
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
							name: this.removeNewLines(child.title),
							url: child.url,
							isLink: true,
							selected: false
						});
					}
				}, this);
			},

			/**
			 * Test a URL against out filters.
			 *
			 * @param: url (String) the URL to test.
			 */
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

			/**
			 * Create a board name based on the node's title.
			 * Will append " > " if this node is a child of another board.
			 *
			 * @param: node (BookmarkTreeNode) the chrome's bookmark node.
			 * @param: board (Object) the board (optional).
			 */
			getBoardName: function getBoardName(node, board) {
				// let user choose, perhaps
				var name = (this.EXCLUDES[node.title] ? "" : this.removeNewLines(node.title));

				// exclude "Bookmarks bar" and others from being part of the name
				if (board && board.name && !this.EXCLUDES[board.name]) {
					name = board.name + " > " + name
				}

				return name;
			},

			/**
			 * Remove new lines from a string (to be JSON-valid).
			 *
			 * @param: str (String) the string.
			 */
			removeNewLines: function removeNewLines(str) {
				// TODO: should just do HTML sanitize
				return str.replace(/(\r\n|\n|\r|<br>)/gm, " ");
			},

			/**
			 * Ensure that we don't have duplicated boards.
			 */
			processBoards: function processBoards() {
				var boards = this.boards;
				var boardByName = {};

				boards.forEach(function(board, i) {
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