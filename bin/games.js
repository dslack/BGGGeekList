var Q		=	require('q'),
	request	=	require('request'),
	xml2js	=	require('xml2js'),
	_		=	require('lodash');
	
var parser = xml2js.parseString;

var url = 'https://www.boardgamegeek.com/xmlapi/boardgame/';

var Games = {
	getGameIds : getGameIds,
	retrieveGames : retrieveGames,
	stripGamesData : stripGamesData
};

function getGameIds(items) {
	console.log("Retrieving Game Ids");
	return Q.when(_.map(items, function(item){
		return item.objectid;
	}));
}

function retrieveGames(gameIds){
	console.log("Retrieving Games From BGG");
	return Q.Promise(function(resolve, reject){
		var params = gameIds.join(',');
		request.get(url+params, function(error, response,body){
			if (error) {
				reject(new Error(error));
			} else {
				resolve(body);
			}
		})
	});
}

function stripGamesData(data) {
	//we only need some of the data.. the file gets too big otherwise...
	console.log("Stripping Game Data")
	var newData = _.map(data.boardgames.boardgame, function(game){
		return {objectid: game.$.objectid, description: game.description, publishers: game.boardgamepublisher, designers: game.boardgamedesigner}
	});
	return Q.when({boardgames: newData});
}

module.exports = Games;