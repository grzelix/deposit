
module.exports = function(app) {
    var data = require('../middleware/data.js');

    // home page
    app.get('/', function(req, res) {        
        res.render('index', { title: 'Home Page.  ', layout: 'layout.jade' })
    });

    // chat area
    app.get('/chat', function(req, res) {
        res.render('chat', { title: 'Chat with Me!  ' })
    });    
        
    // about page
    app.get('/about', function(req, res) {
        res.render('about', { title: 'About Me.  ' })
    });
}
