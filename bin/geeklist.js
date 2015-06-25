var Q		=	require('q'),
	request	=	require('request'),
	xml2js	=	require('xml2js');
	
var parser = xml2js.parseString;

var url = 'https://www.boardgamegeek.com/xmlapi/geeklist/';

var GeekList = {};

GeekList.getGeekList = function(geeklistId){
	console.log("Retrieving Geeklist "+geeklistId);
	return Q.Promise(function(resolve, reject){
		request.get(url+geeklistId, function(error, response,body){
			if (error) {
				reject(new Error(error));
			} else {
				resolve(body);
			}
		});
	})
}

GeekList.transformData = function(body) {
	console.log("-- Transforming Data");
	return Q.Promise(function(resolve, reject){
		parser(body, function(error, xml){
			if (error) {
				reject(new Error(error));
			} else {
				resolve(xml);
			}
		});
	});
}


module.exports = GeekList;