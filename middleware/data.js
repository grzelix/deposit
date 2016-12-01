/*jshint node:true */
"use strict";

var viewModel = function(id){
    var dic = require("./../db/staticdata.json")
    
    var moment = require("moment");
    var today = moment();
    var a = {};
    a.title = "Deposits";
    a.banks = dic.banks;
    a.owners = dic.owners;

    if (id) {
        var db = getdb();
        var deposits = db.getSync("deposits");
        var _ = require("underscore")._;
        var o = _.filter(deposits, function(n) {
            return n.id == id;
        });
        a.deposit = o[0];

    } else {
        a.deposit = {};
        a.deposit.title = "Lokata Negocjowalna";
        a.deposit.perc = 1.5;
        a.deposit.amount = 1000;
        a.deposit.startDate = today.format("YYYY-MM-DD");
        a.deposit.endDate = today.add(1, 'd').format("YYYY-MM-DD");
        a.deposit.id = 0;
    }

    return a;
}

exports.viewModelDeposit = function(id) {
    return viewModel(id)
};

exports.viewModelDepositBy = function(id){

    var x = viewModel(id);
    x.deposit.id = 0;
    x.deposit.active = true;
    x.deposit.amount = (parseFloat(x.deposit.profit) + parseFloat(x.deposit.amount)).toFixed(2);
    x.deposit.profit = 0;
    var moment = require("moment");
    var startDate = moment(x.deposit.startDate, "YYYY-MM-DD");
    var endDate = moment(x.deposit.endDate, "YYYY-MM-DD");
    x.deposit.startDate = startDate.add(1, 'd').format("YYYY-MM-DD");
    x.deposit.endDate = endDate.add(1, 'd').format("YYYY-MM-DD");
    return x;
}

exports.viewModelDepositAllParams = function(id){
    
    var a = viewModel(id);
    
    a.deposit.active = false;
    
    var startDate = Date.parse(a.deposit.startDate);
    var endDate = Date.parse(a.deposit.endDate);
    var curProfit = profitBetweenDates(startDate, endDate, parseFloat(a.deposit.amount), parseFloat(a.deposit.perc));
    a.deposit.profit = curProfit;
    return a;
}

var getdb = function() {
    
    var settings = require("./../settings.json");
    var Store = require("jfs");
    var db = new Store("db/" + settings.storeFile + "deposits.json");
    return db;
};

var getActiveDeposits = function() {
    
    var _ = require("underscore")._;
    var db = getdb();
    var deposits = db.getSync("deposits");
    var o = _.filter(deposits, function(n) {
        return n.active;
    });
    return o;
};

exports.update = function(deposit) {
    
    var _ = require("underscore")._;
    var db = getdb();
    deposit.active = deposit.active === "on";
    var deposits = db.getSync("deposits");
    var o = _.filter(deposits, function(n) {
        return n.id != deposit.id;
    });

    if (Object.prototype.toString.call(deposits) !== "[object Array]") {
        deposits = [];
    }

    o.push(deposit);

    db.delete("deposits");
    db.saveSync("deposits", o);
};

exports.insert = function(deposit) {
    
    var db = getdb();

    var deposits = db.getSync("deposits");
    if (Object.prototype.toString.call(deposits) !== "[object Array]") {
        deposits = [];
    }
    deposit.active = true;
    deposit.id = deposits.length + 1;
    deposits.push(deposit);

    db.delete("deposits", function() {
        db.save("deposits", deposits,function(err){
            return;
        });
    });
};

exports.getActiveDeposits = function() {
    
    var o = getActiveDeposits();
    return o;
};

exports.getHistoryDeposits = function() {
    
    var _ = require("underscore")._;
    var db = getdb();
    var deposits = db.getSync("deposits");
    var o = _.filter(deposits, function(n) {
        return n.active === false;
    });
    return o;
};

exports.deletebyid = function(id) {
    
    var LINQ = require("node-linq").LINQ;
    var db = getdb();
    var deposits = db.getSync("deposits");
    var idAsInt = parseInt(id);
    var queryResult = new LINQ(deposits)
        .Where(function(o) {
            return o.id !== idAsInt;
        })
        .ToArray();

    db.delete("deposits", function() {
        db.save("deposits", queryResult);
    });
};

exports.getAmountByOwner = function() {
    
    var _ = require("underscore")._;
    var deposits = getActiveDeposits();
    var grouper = function(row) {
        return row.owner;
    };
    var summer = function(rows) {
        return rows.reduce(function(sum, row) {
            return sum + parseFloat(row.amount);
        }, 0);
    };
    var o = _.chain(deposits)
        .groupBy(grouper)
        .map(function(rows) {
            return {
                indexLabel: rows[0].owner,
                y: summer(rows)
            };
        })
        .value();

    return o;
};

exports.getAmountByBank = function() {
    
    var _ = require("underscore")._;
    var deposits = getActiveDeposits();
    var grouper = function(row) {
        return row.bank;
    };
    var summer = function(rows) {
        return rows.reduce(function(sum, row) {
            return sum + parseFloat(row.amount);
        }, 0);
    };
    var o = _.chain(deposits)
        .groupBy(grouper)
        .map(function(rows) {
            return {
                indexLabel: rows[0].bank,
                y: summer(rows)
            };
        })
        .value();

    return o;
};

var profitBetweenDates = function(date1, date2, amount, percentage) {
    
    var timeDiff = Math.abs(date2 - date1);
    var days = Math.ceil(timeDiff / (1000 * 3600 * 24));

    var profit = amount * percentage * 0.01 * days / 365;
    var tax = Math.ceil((profit * 0.19)*100)/100;
    return parseFloat((profit-tax).toFixed(2));
};

var numberDays = function(date1, date2) {
    
    var timeDiff = Math.abs(date2 - date1);
    var days = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return days;
};

exports.getProfitByDeposit = function() {
    
    var o = getActiveDeposits();
    var today = new Date().getTime();

    var currentProfit = [];
    var fullProfit = [];

    for (var i = 0; i < o.length; i++) {

        if (Date.parse(o[i].endDate) < today) {
            continue;
        }
        
        var startDate = Date.parse(o[i].startDate);
        var endDate = Date.parse(o[i].endDate);
        var curProfit = profitBetweenDates(startDate, today, parseFloat(o[i].amount), parseFloat(o[i].perc));
        currentProfit.push({
            x: i,
            y: curProfit,
            label: o[i].id + " " + startDate + " " + endDate
        });

        var profit = profitBetweenDates(startDate, endDate, parseFloat(o[i].amount), parseFloat(o[i].perc));
        fullProfit.push({
            x: i,
            y: profit - curProfit,
            label: o[i].id + " " + startDate + " " + endDate
        });
    }

    return [currentProfit, fullProfit];
};

exports.getProfitByDeposit2 = function() {
    
    var o = getActiveDeposits();
    var fin = require("fincalc");

    var today = new Date().getTime();

    var currentProfit = [];
    var fullProfit = [];
    var sumOfCurrentProfit = 0;
    var sumOfFullProfit = 0;

    var index = 0;
    for (var i = 0; i < o.length; i++) {
        if (Date.parse(o[i].endDate) < today) {
            continue;
        }
        
        var startDate = Date.parse(o[i].startDate);
        var endDate = Date.parse(o[i].endDate);
        var days = numberDays(startDate, today);
        var curProfit = fin(days * parseFloat(o[i].amount) * parseFloat(o[i].perc) * 0.01 * 0.81 / 365);
        sumOfCurrentProfit += curProfit;
        days = numberDays(startDate, endDate);

        var profit = fin(days * parseFloat(o[i].amount) * parseFloat(o[i].perc) * 0.01 * 0.81 / 365);
        
        currentProfit.push({
            x: index,
            y: curProfit,
            label: o[i].startDate + " " + o[i].endDate + " [" + profit + "] (" + o[i].id + ")"
        });

        sumOfFullProfit += profit;
        fullProfit.push({
            x: index,
            y: profit - curProfit,
            label: o[i].startDate + " " + o[i].endDate + " [" + profit + "] (" + o[i].id + ")"
        });
        index++;
    }

    return {
        sumProfit: sumOfCurrentProfit.toFixed(2),
        sumFullProfit: sumOfFullProfit.toFixed(2),
        data: [currentProfit, fullProfit]
    };
};


exports.getAreaChart = function(owner, bank) {
    
    var db = getdb();
    var _ = require("underscore")._;
    var deposits = db.getSync("deposits");
    if (owner) {
        deposits = _.filter(deposits, function(n) {
            return n.owner == owner;
        });
    }
    if (bank) {
        deposits = _.filter(deposits, function(n) {
            return n.bank == bank;
        });
    }

    var moment = require("moment");
    var startDate = moment().subtract(6, "M").toDate();
    var endDate = moment().add(6, "M").toDate();

    var result = [];
    while (startDate <= endDate) {

        var o = _.filter(deposits, function(n) {
            return startDate.getTime() >= Date.parse(n.startDate) && Date.parse(n.endDate) > startDate.getTime();
        });
        var sum = _.reduce(o, function(sum, row) {
            return sum + parseFloat(row.amount);
        }, 0);

        result.push({
            x: new Date(startDate.getTime()),
            y: sum
        });

        startDate.setDate(startDate.getDate() + 1);
    }

    var res = [];
    res.push(result[0]);
    for (var i = 1; i < result.length; i++) {

        if (result[i - 1].y === result[i].y) {
            continue;
        }
        res.push(result[i]);
    }
    res.push(result[result.length - 1]);

    return res;
};

exports.getProfitAreaData = function(){
    var db = getdb();
    var _ = require("underscore")._;
    var deposits = db.getSync("deposits");
    
    deposits = _.filter(deposits, function (d) {return d.active === false;});
    
     var grouper = function(row) {
        return row.endDate;
    };
    
    var summer = function(rows) {
        return rows.reduce(function(sum, row) {
            return sum + parseFloat(row.profit);
        }, 0);
    };
    
    var o = _.chain(deposits)
        .groupBy(grouper)
        .map(function(rows) {
            return {
                x: Date.parse(rows[0].endDate),
                y: summer(rows)
            };
        })
        .value();
     
     var sortedList = _.sortBy(o, function(v) { return v.x; });

    var res = [];
    var sum = 0;
    for (var index = 0; index < sortedList.length; index++) {
        sum+=sortedList[index].y;
        res.push({x: sortedList[index].x, y: sum});        
    }
    console.log(sum);
    return res;
}

exports.getGanttData = function() {
    
    var o = getActiveDeposits();
    var res = [];
    for (var i = 0; i < o.length; i++) {
        res.push({
            x: i,
            y: [Date.parse(o[i].startDate) / 10e9, Date.parse(o[i].endDate) / 10e9],
            label: o[i].startDate + " " + o[i].endDate + " (" + o[i].id + ")"
        });
    }
    return res;
};

var daysToFinishNextDeposit = function() {

    var _ = require("underscore")._;
    var moment = require("moment");
    var today = moment();
    var active = getActiveDeposits();
    var minDays = _.reduce(active, function(memo, o){
         var diff = moment(o.endDate, "YYYY-MM-DD").diff(today, "days");
         return diff > 0 && memo > diff ? diff : memo;
         }, 10e9);
    return minDays;
};

exports.getWidgetsValue = function() {
    
    var _ = require("underscore")._;
    var fin = require("fincalc");
    var db = getdb();
    var deposits = db.getSync("deposits");
    var profit = _.reduce(deposits, function(memo, o){ var p = parseFloat(o.profit);  return memo + (isNaN(p) ? 0.0 : p) }, 0);
    profit = profit.toFixed(2);

    var activeDeposits = _.filter(deposits, function(n) {
        return n.active;
    });

    var activeDepositsValue = 0;
    var averagePercentage = 0.0;
    var dayProfit = 0;
    var estimatedProfit = 0;
    for (var i = 0; i < activeDeposits.length; i++) {
        dayProfit += fin(parseFloat(activeDeposits[i].amount) * parseFloat(activeDeposits[i].perc) * 0.01 * 0.81 * 1 / 365);
        var startDate = Date.parse(activeDeposits[i].startDate);
        var endDate = Date.parse(activeDeposits[i].endDate);
        var days = numberDays(startDate, endDate);

        estimatedProfit += fin(days * parseFloat(activeDeposits[i].amount) * parseFloat(activeDeposits[i].perc) * 0.01 * 0.81 / 365);
        if (_.isUndefined(activeDeposits[i].amount) === false) {
            activeDepositsValue += parseFloat(activeDeposits[i].amount);
            averagePercentage += parseFloat(activeDeposits[i].amount) * parseFloat(activeDeposits[i].perc);
        }
    }

    averagePercentage = (averagePercentage/activeDepositsValue).toFixed(2)
    activeDepositsValue = activeDepositsValue.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1 ");
    var result = {
        Profit: profit,
        AllDeposits: activeDepositsValue,
        DayProfit: dayProfit.toFixed(2),
        EstimatedProfit: estimatedProfit.toFixed(2),
        DayToEnd: daysToFinishNextDeposit(),
        AveragePercentage: averagePercentage
    };

    return result;
};


exports.profitByMonth = function(){
    
    var _ = require("underscore")._;
    var db = getdb();
    var deposits = db.getSync("deposits");
    var moment = require("moment");
    
    var grouper = function(row) {
        return moment(row.endDate, "YYYY-MM-DD").format("YYYY-MM");
    };
    
    var summer = function(rows) {
        return rows.reduce(function(sum, row) {
            return sum + parseFloat(row.profit);
        }, 0);
    };
        
    var o = _.chain(deposits)
        .filter(function(n) { return n.active === false;})
        .groupBy(grouper)
        .sortBy(function (rows){ return moment(rows[0].endDate, "YYYY-MM-DD").unix()})
        .map(function(rows) {
             return {
                 label: moment(rows[0].endDate, "YYYY-MM-DD").locale("pl").format("MMMM YYYY"), 
                 x: moment(rows[0].endDate, "YYYY-MM-DD").month() + (moment(rows[0].endDate, "YYYY-MM-DD").year() - 2015) * 12,
                 y: summer(rows)
             };
         })
         .value();
    
    return o;
}
