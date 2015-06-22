//https://www.boardgamegeek.com/xmlapi/geeklist/184821

var	request	=	require('request'),
	xml2js	=	require('xml2js'),
	_		=	require('lodash'),
	fs		=	require('fs-extra'),
	moment	=	require('moment'),
	schedule=	require('node-schedule');


	var express = require('express');
	var app = express();	


	app.set('port', (process.env.PORT || 5000));
	app.use(express.static(__dirname + '/app'));

	app.get('/', function(request, response) {
	  response.send("app/index.html");
	});

	app.listen(app.get('port'), function() {
  		console.log('Node app is running on port', app.get('port'));
	});

	var parser = xml2js.parseString;

	var j = schedule.scheduleJob('0 */2 * * *', function(){
    	request.get('https://www.boardgamegeek.com/xmlapi/geeklist/184821', transformData);
    	console.log('Retrieved New List');
	});

	function transformData(error, response, body) {
		parser(body, reorder);	
	}

	function reorder(error, xml) {
		var items = xml.geeklist.item;
		items = _.sortBy(items, function(n){
			var dt = moment(n.$.postdate, "ddd, DD MMM YYYY HH:mm:ss +0000")
			n.formatedPostDate = dt.toISOString();
			return dt.unix();
		}).reverse();
		fs.writeJSON('app/results.json', {refreshed: moment().toISOString(), items: items}, function(err){
			if (err) {
				console.error(err);
			}
		});
	}
