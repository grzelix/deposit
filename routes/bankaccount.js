module.exports = function(app) {
	var data = require('../middleware/bankaccount.js');

	app.get('/bankaccount', function(req, res) {
		res.render('bankaccount/new', data.bankAccountProfit())
	});

	app.get('/bankaccount/new', function(req, res) {
		res.render('bankaccount/new', data.bankAccountProfit())
	});	
	
    app.get('/bankaccount/new/:id', function(req, res) {
        res.render('bankaccount/new', data.bankAccountProfit(req.params.id))
    });

	app.post('/bankaccount/new', function(req, res, next) {
		var deposit = req.body;
		if (deposit.id != 0) {
			data.update(deposit);
		} else {
			data.insert(deposit);
		}
		res.redirect('/bankaccount/grid');
	});
	
	app.get('/bankaccount/grid', function(req, res) {
		res.render('bankaccount/grid', {title: "Bank accounts profit." })
	});
	
	app.post('/bankaccounts/getaccountsprofit', function(req, res) {
		  var c = {};
        c.data = data.getAccountProfit();
        res.json(c);
		
	});
	
	app.get('/bankaccount/dashboard', function(req, res) {
		res.render('bankaccount/dashboard', {title: "Bank accounts profit." })
	});	
		
	 app.get('/bankaccount/getWidgetsValue', function (req, res, next) {
        var c = {};
        c.data = data.getWidgetsValue();
        res.json(c);
    });
	
	app.get('/bankaccount/profitByMonth', function (req, res, next) {
        var c = {};
        c.data = data.profitByMonth();
        res.json(c);
    });
}