"use strict"; 
var bankaccount = (function() {
	var initDate = function() {
		$("#date").datepicker({
			firstDay: 1,
			dateFormat: "yy-mm-dd"
		});;
	};

	return {
		initDate: initDate
	};

})();

$(function() {
	bankaccount.initDate();
});