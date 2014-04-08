(function() {

	document.addEventListener('DOMContentLoaded', function () {
		var postBtn = document.getElementById("post-btn");

		postBtn.addEventListener("click", function(e) {
			postBtn.className = postBtn.className.replace("btn-primary", "btn-warning");
			postBtn.innerHTML = "Oops.. not supported here.<br/>Get the <a href='https://chrome.google.com/webstore/detail/post-to-pie/gnlhgkjknhcjbejgaaekdfbhgkediiff' target='_blank'>official extension!</a>";
		});

		var importBtn = document.getElementById("import-btn");

		importBtn.addEventListener("click", function(e) {
			chrome.tabs.create({
				url: "../pie-that/pie-that.html"
			});
		});
	});

})();