var Q		=	require('q'),
	request	=	require('request'),
	xml2js	=	require('xml2js'),
	_		=	require('lodash'),
	Common	=	require('./common'),
	moment	=	require('moment');
	
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
				if (_.startsWith(body,'Saving filename')) {
					reject(new Error("Geeklist was not downloaded..."));
					return;
				}
				resolve(body);
			}
		});
	})
};

GeekList.transformData = function(body) {
	return Common.transformData(body);
};


GeekList.reorder = function (data) {
	console.log("-- Reorganizing List");
	return Q.Promise(function(resolve, reject){
		var items = data.geeklist.item;
		items = _.sortBy(items, function(n){
			var dt = moment(n.$.postdate, "ddd, DD MMM YYYY HH:mm:ss +0000")
			n.formattedPostDate = dt.toISOString();
			return dt.unix();
		}).reverse();
		resolve(items);
	});
};

GeekList.stripResultsData = function(items) {
	console.log("-- Stripping Results Data");
	return Q.when(_.map(items, function(item){
		return {id: item.$.id, objectid: item.$.objectid, objectname: item.$.objectname, mainpublisher: item.$.publisherid, postdate: item.formattedPostDate, subtype: item.$.subtype, body: item.body};
	}));
};

module.exports = GeekList;