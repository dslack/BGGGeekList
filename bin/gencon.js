var Q		=	require('q'),
	moment	=	require('moment'),
	_		=	require('lodash');

var GenCon = {};

GenCon.reorder = function (data) {
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

GenCon.stripResultsData = function(items) {
	console.log("-- Stripping Results Data");
	return Q.when(_.map(items, function(item){
		return {id: item.$.id, objectid: item.$.objectid, objectname: item.$.objectname, mainpublisher: item.$.publisherid, postdate: item.formattedPostDate, subtype: item.$.subtype, body: item.body};
	}));
};

module.exports = GenCon;