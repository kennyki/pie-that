/* Adapted from https://gist.github.com/ecmendenhall/3740896#file-loadjasmine-js */
document.addEventListener("DOMContentLoaded", function () {
	loadJasmine();
});

function loadJasmine() {
	var jasmineEnv = jasmine.getEnv();
	var htmlReporter = new jasmine.HtmlReporter();

	jasmineEnv.updateInterval = 1000;
	jasmineEnv.addReporter(htmlReporter);

	jasmineEnv.specFilter = function(spec) {
		return htmlReporter.specFilter(spec);
	};

	jasmineEnv.execute();
}