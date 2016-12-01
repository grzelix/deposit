"use strict";
var bankAccountsKey = "accounts";

var getdb = function() {    
    var settings = require("./../settings.json");
    var Store = require("jfs");
    var db = new Store("db/" + settings.storeFile + "baccounts.json");
    return db;
};

exports.bankAccountProfit = function(id) {
    var dic = require("./../db/staticdata.json");    
    var bankAccountProfit = {};
    if (id) {
        var db = getdb();
        var bankAccounts = db.getSync(bankAccountsKey);
        var _ = require("underscore")._;
        bankAccountProfit = _.chain(bankAccounts).filter(function(n) { return n.id == parseInt(id); }).first().value();
    }
    
    var viewModel = {
        title: "Bank accounts",
        banks: dic.banks,
        owners: dic.owners,
        bankAccountProfit: bankAccountProfit
    }; 

    return viewModel;
};

exports.update = function(bankAccountProfit) {    
    var _ = require("underscore")._;
    
    var baProfitId = parseInt(bankAccountProfit.Id);
    bankAccountProfit.profit = parseFloat(bankAccountProfit.profit);
    var db = getdb();
    var bankAccounts = db.getSync(bankAccountsKey);
    var o = _.filter(bankAccounts, function(n) {
        return n.id !== baProfitId;
    });

    if (Object.prototype.toString.call(bankAccounts) !== "[object Array]") {
        bankAccounts = [];
    }

    o.push(bankAccountProfit);

    db.delete(bankAccountsKey, function() {
        db.save(bankAccountsKey, o);
    });
};

exports.insert = function(bankAccountProfit) {
    
    var db = getdb();
    bankAccountProfit.profit = parseFloat(bankAccountProfit.profit);

    var bankAccounts = db.getSync(bankAccountsKey);
    if (Object.prototype.toString.call(bankAccounts) !== "[object Array]") {
        bankAccounts = [];
    }

    bankAccountProfit.id = bankAccounts.length + 1;
    bankAccounts.push(bankAccountProfit);

    db.delete(bankAccountsKey, function() {
        db.save(bankAccountsKey, bankAccounts);
    });
};

exports.getAccountProfit = function(){
    var db = getdb();    
    var bankAccounts = db.getSync(bankAccountsKey);
    return bankAccounts;
};

exports.getWidgetsValue = function (){    
    var _ = require("underscore")._;
    var db = getdb();
    var bankAccounts = db.getSync(bankAccountsKey);
    var o = _.chain(bankAccounts).reduce(function(sum, row) { return sum + row.profit;}, 0).value();
    return {Profit: o.toFixed(2)};  
};


exports.profitByMonth = function(){
    
    var _ = require("underscore")._;
    var db = getdb();
    var bankAccounts = db.getSync(bankAccountsKey);
    var moment = require("moment");
    
    var grouper = function(row) {
        return moment(row.date, "YYYY-MM-DD").format("YYYY-MM");
    };
    
    var summer = function(rows) {
        return rows.reduce(function(sum, row) {
            return sum + parseFloat(row.profit);
        }, 0);
    };
        
    var o = _.chain(bankAccounts)
        .groupBy(grouper)
        .sortBy(function (rows){ return moment(rows[0].date, "YYYY-MM-DD").unix()})
        .map(function(rows) {
             return {
                 label: moment(rows[0].date, "YYYY-MM-DD").locale("pl").format("MMMM YYYY"), 
                 x: moment(rows[0].date, "YYYY-MM-DD").month() + (moment(rows[0].date, "YYYY-MM-DD").year() - 2015) * 12,
                 y: summer(rows)
             };
         })
         .value();
    
    return o;
}