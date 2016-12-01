var finance = (function(){
  var initBarChart = function (url, url2, container, container2) {
    $.when($.getJSON(url), $.getJSON(url2)).then(function(res1, res2) {
       var res = [];
       for (var index = 0; index < res1[0].data.length; index++) {
           var i1 = res1[0].data[index];
           for (var index2 = 0; index2 < res2[0].data.length; index2++) {
               if (res2[0].data[index2].x === i1.x) {
                   res.push({x: i1.x, label: i1.label, y: i1.y + res2[0].data[index2].y});
               }               
           }                   
       }
       
        var chart1 = new CanvasJS.Chart(container,
        {
            title:{ text: "Profit by Month" },
            axisX: { labelAngle: -50 },
            data: [{ dataPoints: res }]
        }); 
                
        var chart2 = new CanvasJS.Chart(container2,
        {
            title:{ text: "Profit by Month" },
            axisX: { labelAngle: -50 },
            data: [{ type: "stackedColumn", dataPoints: res1[0].data },
                { type: "stackedColumn", dataPoints: res2[0].data }]
        });  
        
        chart1.render();
        chart2.render();
      });
  };
return {
    initBarChart: initBarChart
};

})();

$(function () {  
    finance.initBarChart("/bankaccount/profitByMonth", "/deposit/profitByMonth", "profitByMonth", "profitByMonth2");
    $.when( $.getJSON("/bankaccount/getWidgetsValue"), $.getJSON("/deposit/getWidgetsValue")).then(function (resp1, resp2) {
        $("#profitAccountSpan").html(resp1[0].data.Profit.replace(/(\d)(?=(\d{3})+\.)/g, "$1 ") + " PLN");
        $("#profitDepositSpan").html(resp2[0].data.Profit.replace(/(\d)(?=(\d{3})+\.)/g, "$1 ") + " PLN");
        
      var profit = parseFloat(resp1[0].data.Profit) + parseFloat(resp2[0].data.Profit);
        $("#profitSpan").html(profit.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1 ") + " PLN");
    }); 

});
