/**
 * 
 */

//core modules
var http = require('http');
var path = require('path');
//3rd party modules
var express = require('express');
var app = express();

var consolidate = require('consolidate');
var swig = require('swig');

//system modules
var integrations = require('./integrations.js');

var drywall = require('./my_drywall.js');

//starting integration
integrations.enable_multiple_view_folders_in_express();

app.configure(function() {
    
    //http headers
    app.disable('x-powered-by');
    
    app.use(flash());
    
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    // cookies and sessions
    app.use(express.cookieParser());
    app.use(express.session());
    //directories
    app.set('base_dir', __dirname);
    
    //public paths
    app.use('/assets',express.static(path.join(__dirname, '/assets')));
    app.use(express.static(path.join(__dirname, '/drywall/public')));// for drywall assets paths
    app.use(express.static(path.join(__dirname, '/public')));
    
    //views and rendering
    app.set('views', [__dirname + '/',  __dirname + '/drywall/views']);
    app.set('view engine', 'html');
    app.engine('html', consolidate.swig); //app.engine('html', swig.renderFile);
    app.engine('jade', consolidate.jade);
    
    //server settings
    app.set('port', 3000);
    
    //environment
    app.use(express.logger('dev'));
    if ('development' == app.get('env')) { // development only
        app.use(express.errorHandler());
    }
    app.configure('development', function(){
        app.use(express.errorHandler());
    });
    
});

app = drywall.integrate_drywall(app, express);

//these configurations must be after drywall integrations
app.configure(function(){
    //routing
    app.set('strict routing', true);
    app.use(app.router);//this should be after define public paths
    app.use(slash());//this should be after app.router
});



//Handling 404 
app.use(function(req, res, next){
    res.status(404);
    // respond with html page
    if (req.accepts('html')) {
        res.render('./pages/404.html', { url: req.url });
        return;
    }
    // respond with json
    if (req.accepts('json')) {
        res.send({ error: 'Not found' });
        return;
    }
    // default to plain-text. send()
    res.type('txt').send('Not found');
});

//Starting HTTP Server
app.listen(app.get('port'), function(){
    console.log('Listening at ' + app.get('port'));
});
