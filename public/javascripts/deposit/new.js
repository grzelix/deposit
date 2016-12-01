"use strict"; 
var deposit = (function() {
	var initDate = function() {
		$("#startDate").datepicker({
			firstDay: 1,
			dateFormat: "yy-mm-dd"
		});
		$("#endDate").datepicker({
			firstDay: 1,
			dateFormat: "yy-mm-dd"
		});
	};
	
	var changeDate = function(elemId, delta){
		var dateValue = $.datepicker.parseDate("yy-mm-dd", $(elemId).val()); 
		dateValue.setDate(dateValue.getDate() + delta);
		var dateAsString = $.datepicker.formatDate('yy-mm-dd', dateValue);
		$(elemId).val(dateAsString);
	};
	
	var calcDynamicValues = function(){
		var amount = parseFloat($("#amount").val());
		var profit = parseFloat($("#profit").val());
		$("#endDepositValue").val((amount+profit).toFixed(2));

		var perc = parseFloat($("#perc").val());
		var startDate = new Date($("#startDate").val());
		var endDate = new Date($("#endDate").val());
		var oneDay = 24*60*60*1000;
		var diffDays = Math.round(Math.abs((endDate.getTime() - startDate.getTime())/(oneDay)));
		var profitBeforeTax = diffDays/365 * perc/100 * amount;
		var tax = profitBeforeTax * 0.19;
		var res = profitBeforeTax - Math.ceil(tax * 100) /100;

		$("#estimatedProfit").val(res.toFixed(2));
	};
	
	var initButtons = function(){
		$("#timub_m").click(function(){
			$("input[value=T-mobilebankowe]").attr("checked","checked");
			$("input[value=Martyna]").attr("checked","checked");
		});
		$("#timub_k").click(function(){
			$("input[value=T-mobilebankowe]").attr("checked","checked");
			$("input[value=Krzysztof]").attr("checked","checked");
		});
		
		$("#prevDate").click(function(){
			changeDate("#startDate", -1);
			changeDate("#endDate", -1);
		});
		
		$("#nextDate").click(function(){
			changeDate("#startDate", 1);
			changeDate("#endDate", 1);
		});

		$("#profit, #amount, #perc, #starDate, #endDate").change(function(){
			calcDynamicValues();
		});
	};

	return {
		initDate: initDate,
		initButtons: initButtons,
		calcDynamicValues: calcDynamicValues
	};

})();

$(function() {
	deposit.initDate();
	deposit.initButtons();
	deposit.calcDynamicValues();
});