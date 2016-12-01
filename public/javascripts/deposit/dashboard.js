var deposit = (function() {

  var areaChart = function(result) {
    var res = [];
    for (var i = 0; i < result.data.length; i++) {
      res.push({
        x: new Date(result.data[i].x),
        y: result.data[i].y
      });
    }

    var areaChart = new CanvasJS.Chart("areaChart", {
      title: {
        text: "Growth of Deposits in General"
      },
      zoomEnabled: true,
      animationEnabled: true,
      axisY: {
        title: "Amount in deposits",
        interlacedColor: "#F0FFFF",
        tickColor: "azure",
        titleFontColor: "rgb(0,75,141)",
      },
      axisX: {
        valueFormatString: "DD-MMM",
        interval: 14,
        intervalType: "day",
        labelAngle: -50,
        labelFontColor: "rgb(0,75,141)",
        stripLines: [{
          value: new Date(),
          color: "#d8d8d8",
          showOnTop: true
        }]
      },

      data: [{
          indexLabelFontColor: "darkSlateGray",
          name: "views",
          type: "stepLine",
          color: "rgba(0,75,141,0.7)",
          markerSize: 8,
          dataPoints: res
        }

      ]
    });
    areaChart.render();
  };

  var createAreaChart = function() {
    $.getJSON("/deposit/getAreaChart", function(result) {
      areaChart(result);
    });
  };

  var updateAreaChart = function(data) {
    $.post("/deposit/getAreaChart", data, function(result) {
      areaChart(result);
    }, "json");
  };

  var initPaczek = function(url, idContainer, titlepart) {

    $.getJSON(url, function(result) {

      var chart = new CanvasJS.Chart(idContainer, {
        title: {
          text: "Deposits by " + titlepart
        },
        data: [{
          type: "doughnut",
          dataPoints: result.data
        }]
      });

      chart.render();

    });
  };

  var initStackedBar = function(url, container) {
    $.getJSON(url, function(result) {

      var res = [];
      for (var i = 0; i < result.data.length; i++) {

        res.push({
          type: "stackedBar",
          dataPoints: result.data[i]
        });
      }

      var chart = new CanvasJS.Chart(container, {
        title: {
          text: "Profit in general and till curreny day. [" + result.sumFull + "] (" + result.sum + ")"
        },
        data: res
      });

      chart.render();
    });
  };


  var gantChart = function() {
    $.getJSON("/deposit/getGanttData", function(result) {
      var chart = new CanvasJS.Chart("gantChart", {
        title: {
          text: "Active deposits on timeline.",
        },
        axisY: {
          includeZero: false,
          title: "Dates (as number)",
          labelAngle: -50,
          stripLines: [{
              value: new Date().getTime() / 10e9,
              label: new Date().toISOString().slice(0, 10),
              color: "orange",
              thickness: 3,
              showOnTop: true
            }]
            //interval: 10,
        },
        axisX: {
          //interval:10,
          title: "Id of deposit.",
        },
        data: [{
          type: "rangeBar",
          indexLabelPlacement: "inside",
          //showInLegend: true,
          //yValueFormatString: "YYYY",
          //indexLabel: "{z}",
          //legendText: "Department wise Min and Max Salary",
          dataPoints: result.data
        }]
      });
      chart.render();
    });
  };
  
  var initProfitArea = function(url, container){
     $.getJSON(url, function(result) {
     var res = [];
        for (var i = 0; i < result.data.length; i++) {
          res.push({
            x: new Date(result.data[i].x),
            y: result.data[i].y
          });
        }
          
      var chart = new CanvasJS.Chart(container, {
          zoomEnabled:true,
          title: {
              text: "Step Area Chart Demo"
          },
          data: [{
              type: "line",
              dataPoints: res
          }]
      });
      
      chart.render();
     });
  };
  
  var initBarChart = function (url, container) {
    $.getJSON(url, function(result) {
       
      var chart = new CanvasJS.Chart(container,
      {
        title:{
          text: ""
        },
        axisX: {
          labelAngle: -50
        },
        data: [{
          dataPoints: result.data
        }]
      });  
     
      chart.render();
      });
  };

  return {
    initPaczek: initPaczek,
    initStackedBar: initStackedBar,
    createAreaChart: createAreaChart,
    gantChart: gantChart,
    updateAreaChart: updateAreaChart,
    initProfitArea: initProfitArea,
    initBarChart: initBarChart
  };
})();

$(function() {
  deposit.createAreaChart();
  deposit.initPaczek("/deposit/getamountbyowner", "ownerPieChartContainer", "owner");
  deposit.initPaczek("/deposit/getamountbybank", "bankPieChartContainer", "bank");
  deposit.initStackedBar("/deposit/profitbydeposit2", "stackedBar2");
  deposit.initProfitArea("/deposit/profitArea", "profitAreaChart");
  deposit.gantChart();
  deposit.initBarChart("/deposit/profitByMonth", "profitByMonth");

  $("#filter").on("click", function() {
    var data = {
      owner: $("input[name=owner]:checked").val(),
      bank: $("input[name=bank]:checked").val()
    };
    deposit.updateAreaChart(data);
  });

  $("#reset").on("click", function() {
    $("input[name=owner]").prop("checked", false);
    $("input[name=bank]").prop("checked", false);
    deposit.createAreaChart();
  });



  $.getJSON("/deposit/getWidgetsValue", function(result) {
    $("#profitSpan").text(result.data.Profit + " PLN");
    $("#depositsSpan").text(result.data.AllDeposits + " PLN");
    $("#dayProfit").text(result.data.DayProfit + " PLN");
    $("#estimatedProfitSpan").text(result.data.EstimatedProfit + " PLN");
    $("#dayToEndSpan").text(result.data.DayToEnd + " Days");
    $("#averagePercSpan").text(result.data.AveragePercentage + " %");
  });

});