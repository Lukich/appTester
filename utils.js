window.A8Tester = {
	xpathParser: function(path, doc) {
		function resolveNS() {
			return "http://www.w3.org/1999/xhtml";
		}
		return doc.evaluate(path, doc, resolveNS, 9, null).singleNodeValue;;
	},

	findElement: function(path, doc) {
		var el = null;
		el = this.xpathParser(path, doc);
		return el;
	}
}