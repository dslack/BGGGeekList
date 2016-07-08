var Q		=	require('q'),
	request	=	require('request'),
	xml2js	=	require('xml2js'),
	Common	=	require('./common'),
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
	var filteredItems = _.filter(items, function(item){
		return item.subtype != 'boardgamepublisher';
	});
	return Q.when(_.map(filteredItems, function(item){
		return item.objectid;
	}));
}

function retrieveGames(gameIds){
	console.log("Retrieving Games From BGG");
	return Q.Promise(function(resolve, reject){
		//need to split this out into smaller requests...
		var promises = [];
		while (gameIds.length > 0) {
			promises.push(queryForGames(gameIds.splice(0,200)));
		}

		Q.all(promises).done(function(results){
			var final = {boardgames: {boardgame: []}};
			_.each(results, function(result){
				final.boardgames.boardgame = _.concat(final.boardgames.boardgame, result.boardgames.boardgame);
			});
			resolve(final);
		});

		/*var params = gameIds.join(',');
		request.get(url+params, function(error, response,body){
			if (error) {
				reject(new Error(error));
			} else {
				resolve(body);
			}
		})*/
	});
}

function queryForGames(gameIds) {
	var params = gameIds.join(',');
	return Q.Promise(function(resolve, reject) {
		request.get(url + params, function (error, response, body) {
			if (error) {
				reject(new Error(error));
			} else {
				Common.transformData(body).then(function( data){
					resolve(data);
				}).catch(function(err) {
					reject(err);
				});
			}
		})
	});
}

function stripGamesData(data) {
	//we only need some of the data.. the file gets too big otherwise...
	console.log("Stripping Game Data");
	var newData = _.map(data.boardgames.boardgame, function(game){
		return {yearPublished: game.yearpublished, objectid: game.$.objectid, description: game.description, publishers: game.boardgamepublisher, designers: game.boardgamedesigner}
	});
	return Q.when({boardgames: newData});
}

module.exports = Games;