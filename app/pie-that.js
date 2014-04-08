(function() {

	var PieThat = function PieThat(root) {
		if (!root || !root.children || root.children.length == 0) {
			console.error("Invalid root!");
			return;
		}

		root.children.forEach(this.createBoard, this);
	};

	PieThat.prototype = {

		EXCLUDES: {
			"Bookmarks bar": true,
			"undefined": true,
			"Other bookmarks": true,
			"Mobile bookmarks": true
		},

		boards: [],

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
			return str.replace(/(\r\n|\n|\r|<br>)/gm, " ");
		}

	};

	document.addEventListener('DOMContentLoaded', function () {
		var mainDiv = document.getElementById("main");

		chrome.bookmarks.getTree(function(nodes) {
			var pieThat = new PieThat(nodes[0]);

			// mainDiv.innerHTML = JSON.stringify(pieThat.boards, null, "\t");
		});
	});

})();