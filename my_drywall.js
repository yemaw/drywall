//modified version of original drywall app.js to integrate with existing application
exports.integrate_drywall = function (app, express){
    
    var config = require('./drywall/config'),
    mongoStore = require('connect-mongo')(express),
    path = require('path'),
    passport = require('passport'),
    mongoose = require('mongoose');

    //setup mongoose
    app.db = mongoose.createConnection(config.mongodb.uri);
    app.db.on('error', console.error.bind(console, 'mongoose connection error: '));
    app.db.once('open', function () {
      //and... we have a data store
    });
    
    //config data models
    require('./drywall/models')(app, mongoose);
    
    //setup the session store
    app.sessionStore = new mongoStore({ url: config.mongodb.uri });
    
    //config express in all environments
    app.configure(function(){
      //settings
      //app.disable('x-powered-by');
      //app.set('strict routing', true);
      //app.set('views', __dirname + '/drywall/views');
      //app.set('view engine', 'jade');
      app.set('project-name', config.projectName);
      app.set('company-name', config.companyName);
      app.set('system-email', config.systemEmail);
      app.set('crypto-key', config.cryptoKey);
      app.set('require-account-verification', config.requireAccountVerification);
    
      //smtp settings
      app.set('smtp-from-name', config.smtp.from.name);
      app.set('smtp-from-address', config.smtp.from.address);
      app.set('smtp-credentials', config.smtp.credentials);
    
      //twitter settings
      app.set('twitter-oauth-key', config.oauth.twitter.key);
      app.set('twitter-oauth-secret', config.oauth.twitter.secret);
      
      //github settings
      app.set('github-oauth-key', config.oauth.github.key);
      app.set('github-oauth-secret', config.oauth.github.secret);
      
      //facebook settings
      app.set('facebook-oauth-key', config.oauth.facebook.key);
      app.set('facebook-oauth-secret', config.oauth.facebook.secret);
      
      app.use(passport.initialize());
      app.use(passport.session());
      //app.use(app.router);
      
      //error handler
      app.use(require('./drywall/views/http/index').http500);
      
      //global locals
      app.locals.projectName = app.get('project-name');
      app.locals.copyrightYear = new Date().getFullYear();
      app.locals.copyrightName = app.get('company-name');
      app.locals.cacheBreaker = 'br34k-01';
    });
    
    //config express in dev environment
    /*app.configure('development', function(){
        app.use(express.errorHandler());
    });*/
    
    //setup passport
    require('./drywall/passport')(app, passport);
    
    //route requests
    require('./drywall/routes')(app, passport);
    
    //setup utilities
    app.utility = {};
    app.utility.sendmail = require('./drywall/node_modules/drywall-sendmail');
    app.utility.slugify = require('./drywall/node_modules/drywall-slugify');
    app.utility.workflow = require('./drywall/node_modules/drywall-workflow');
    
    return app;
}