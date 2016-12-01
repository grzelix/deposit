var bankAccountProfit = (function() {

  var initBarChart = function (url, container) {
    $.getJSON(url, function(result) {
       
      var chart = new CanvasJS.Chart(container,
      {
        title:{ text: "Profit by Month" },
        data: [{ dataPoints: result.data }]
      });  
     
      chart.render();
      });
  };
  
  return {
   initBarChart: initBarChart
  };
  
})();

$(function() {
  $.getJSON("/bankaccount/getWidgetsValue", function(result) {
      $("#profitSpan").text(result.data.Profit + " PLN");
    });
    
    bankAccountProfit.initBarChart("/bankaccount/profitByMonth", "profitByMonth");

});