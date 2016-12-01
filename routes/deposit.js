
module.exports = function(app) {   
    var data = require('../middleware/data.js');

    // deposit page
    app.get('/deposit', function(req, res) {
        res.render('deposit', data.viewModelDeposit())
    });    
    
    // deposit page
    app.get('/deposit/new', function(req, res) {
        res.render('deposit/new', data.viewModelDeposit())
    });

   app.get('/deposit/newby/:id', function(req, res) {
        res.render('deposit/new', data.viewModelDepositBy(req.params.id))
    });
    
        // deposit page
    app.get('/deposit/new/:id', function(req, res) {
        res.render('deposit/new', data.viewModelDeposit(req.params.id))
    });    
    
    app.get('/deposit/new/:id/end', function(req, res) {
        res.render('deposit/new', data.viewModelDepositAllParams(req.params.id))
    });
    
        // deposit page
    app.get('/deposit/dashboard', function(req, res) {
        res.render('deposit/dashboard', { title: 'About Me.  ' })
    });

    app.get('/deposit/grid/:id', function (req, res, next) {
        data.deletebyid(req.params.id);
        res.redirect('/deposit/grid');
    });
        // deposit page
    app.get('/deposit/grid', function(req, res) {
        res.render('deposit/grid', { title: 'About Me.  ' })
    });

    app.post('/deposit/new', function (req, res, next) {
        var deposit = req.body;
        if(deposit.id != 0){
            data.update(deposit);
            if(deposit.nextPeriod){
                res.redirect('/deposit/newby/'+ deposit.id);
                return;
            }
        }else{
            data.insert(deposit);
        }
        res.redirect('/deposit/grid');
    });
    
    app.post('/deposit/getactivedeposits', function (req, res, next) {
        var c = {};
        c.data = data.getActiveDeposits();
        res.json(c);
    });
    
    app.post('/deposit/gethistorydeposits', function (req, res, next) {
        var c = {};
        c.data = data.getHistoryDeposits();
        res.json(c);
    });
    
    app.get('/deposit/getamountbyowner',function (req, res, next) {
        var c = {};
        c.data = data.getAmountByOwner();
        res.json(c);
    });
    
    
    app.get('/deposit/getamountbybank',function (req, res, next) {
        var c = {};
        c.data = data.getAmountByBank();
        res.json(c);
    });
    
    app.get('/deposit/getAreaChart',function (req, res, next) {
        var c = {};
        c.data = data.getAreaChart();
        res.json(c);
    });
    
    app.get('/deposit/profitArea',function (req, res, next) {
        var c = {};
        c.data = data.getProfitAreaData();
        res.json(c);
    });
    
    app.post('/deposit/getAreaChart',function (req, res, next) {
        var postData = req.body;
        var c = {};
        c.data = data.getAreaChart(postData.owner, postData.bank);
        res.json(c);
    });
    
    app.get('/deposit/profitbydeposit', function (req, res, next) {
        var c = {};
        c.data = data.getProfitByDeposit();
        res.json(c);
    });
    
    app.get('/deposit/profitbydeposit2', function (req, res, next) {
        var c = {};
        var result = data.getProfitByDeposit2();
        c.data = result.data;
        c.sum = result.sumProfit;
        c.sumFull = result.sumFullProfit;
        res.json(c);
    });
    
    
    app.get('/deposit/getGanttData', function (req, res, next) {
        var c = {};
        c.data = data.getGanttData();
        res.json(c);
    });
    
    app.get('/deposit/getWidgetsValue', function (req, res, next) {
        var c = {};
        c.data = data.getWidgetsValue();
        res.json(c);
    });
    
    app.get('/deposit/profitByMonth', function (req, res, next) {
        var c = {};
        c.data = data.profitByMonth();
        res.json(c);
    });
    
}

