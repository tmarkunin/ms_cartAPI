var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
// Mongoose Models
var Product = require('./models/product');

console.log("CartAPI started");
 
// necessary for running APIs locally
var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
 
  // intercept OPTIONS method
  if ('OPTIONS' == req.method) {
    res.send(200);
  }
  else {
    next();
  }
};
 
app.use(allowCrossDomain);
 
// configure app to use bodyParser()
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
 
// MongoDB - used by all services
if(process.env.VCAP_SERVICES){
	var services = JSON.parse(process.env.VCAP_SERVICES);
  if(services.mongodb) {
    uri = services.mongodb[0].credentials.url;
  }
	else if (services['compose-for-mongodb']){
  	
  	uri = services['compose-for-mongodb'][0].credentials.uri;
  } else {
    uri = process.env.MONGO_URI;
  }
} else {
	uri = process.env.MONGO_URI;
}
console.log("URI: " + uri);

mongoose.connect(uri);
 
// Set up /api router
var router = express.Router();
 
// middleware to use for all requests (JSON)
router.use(function(req, res, next) {
		var body = JSON.stringify(req.body);
    console.log('[Request] '+req.method+' ' + req.url + ' - Body: ' + body);
    next();
});
 
 
/* MONGOOSE Schema Goes Here */
 
/* ------------------------------------------------------------------------
-- A P I  C O D E ---------------------------------------------------------
------------------------------------------------------------------------ */
 

router.route('/cart').get(function(req, res) {
	Product.find({ inCart: true }, function(err, products) {
		if (err)
			res.send(err);
		res.json(products);
	});
});

router.route('/cart/count').get(function(req, res) {
	Product.count({ inCart: true }, function(err, count){
		res.json({ count: count });
	});
});

router.route('/checkout/verifyPayment').put(function(req, res) {
	var now = new Date();
	var currentMonth = now.getMonth();
	var currentYear = now.getFullYear();

	if (currentYear > req.body.year || (currentYear === req.body.year && currentMonth > req.body.month) ) {
		return res.json({"status": "expired"});
	}

	// order processed, clear the cart.
	Product.update({ inCart: true }, { $set: { inCart: false } }, { multi: true });

	res.json({"status": "verified"});
});
 
/* ------------------------------------------------------------------------
-- S T A R T   S E R V E R ------------------------------------------------
------------------------------------------------------------------------ */
 
app.use('/api', router);
 
// get the app environment from Cloud Foundry
var port = process.env.PORT || 8080;
 
// start server on the specified port and binding host
app.listen(port, function() {
 console.log("server starting on port: " + port);
});