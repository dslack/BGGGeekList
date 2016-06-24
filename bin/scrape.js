var Xray    = require('x-ray'),
    _       =   require('lodash'),
    request	=	require('request'),
    fs      = require('fs-extra'),
    Q       =   require('q');
var x = Xray();

var log = console.log;
//Can't see a way to get the booth #.. so, I'll have to scrape the site to get that information...

//First, I'll need to get the page #s so that I can scrape all N pages



var listOfPublishers = null,
    publisherAndNotes = null;
try {
    listOfPublishers = fs.readJSONSync('./publishers.json');
} catch(e) {
    log("No publishers.json found yet");
    listOfPublishers = null;
}

try {
    publisherAndNotes = fs.readJSONSync('./publisherNotes.json');
} catch(e) {
    log("No publishersNotes.json found yet");
    publisherAndNotes = null;
}

var urls = {
    main: 'https://boardgamegeek.com/geeklist/198728/gen-con-2016-preview',
    byPage: 'https://boardgamegeek.com/geeklist/198728/gen-con-2016-preview/page/',
    titles: 'https://boardgamegeek.com/geeklist/198728/gen-con-2016-preview?titlesonly=1'
};

/** Dev Mode */
/*
var html = fs.readFileSync('./scrap.html');
urls.main = html;*/


var RE = {
    max: /.(\d+).*/,
    publisher: /\/boardgamepublisher\/(\d+)\/.*/,
    newline: /(\r\n|\n|\r)/gm,
    tabs: /(\t)/gm
};


//getTotalPages(html)

function ScrapePublisherNotes() {
    log("*** Start Scrapping BGG")
    if (!listOfPublishers) {
        //need to get that list the first time...
        log("*** Cache Initial List of Publishers")
        return getListOfPublishers().then(writeListOfPublishers)
            .then(startScrapping)
    }
    else {

        return startScrapping();
    }
}

module.exports = ScrapePublisherNotes;


/**
 * Runs the full retrieval after any Null checks for the publishers.json file.
 * @returns {*}
 */
function startScrapping(){

    //now that we have the list of publishers, we want to compare that to the list from the live DB..
    return Q.Promise(function(resolve, reject){
        getListOfPublishers()
            .then(compareCachedPublishers)
            .then(function(different){
                if (different || publisherAndNotes === null) {
                    //we can keep going...
                    log("*** Retrieve Publisher Notes From BGG");
                   retrievePublishersAndNotes().then(resolve);
                } else {
                    //If no difference, we want to return the cached publisherAndNotes
                    log("*** Publisher List hasn't changed");
                    resolve(publisherAndNotes);
                }
            });
    })
}

/**
 * Returns List of Publishers from the Titles page
 * @returns {*}
 */
function getListOfPublishers(){
    log("*** Get List of Publishers");
    var titles = urls.titles;
    return Q.Promise(function(resolve, reject){
        x(titles, [".geeklist_publisher a@href"])(function(err, pubLinks){
            var pubIds = [];
            _.each(pubLinks, function(pubLink) {
                pubIds.push(extractPublisherId(pubLink));
            });
            pubIds.sort();
            resolve({publishers:pubIds});

        })
    });
}

/**
 * We compare the publishers retrieved from the TItles only page to the one stored in cache, and resolve if different
 * Maybe a bit dangerous, because if they are different, we write out the JSON file here
 * @param publishers
 * @returns {*}
 */
function compareCachedPublishers(publishers) {
    return Q.Promise(function(resolve, reject){
        if (!publishers.publishers.equals(listOfPublishers.publishers)) {
            //now, we need to update the list of publishers json...
            writeListOfPublishers(publishers).then(function(){
                resolve(true);
            });
        } else {
            resolve(false);
        }
    })
}

/**
 * Writes out publishers.json file
 * @param publishers
 * @returns {*}
 */
function writeListOfPublishers(publishers) {
    return Q.Promise(function(resolve, reject){
        fs.writeJsonSync('publishers.json', publishers);
        listOfPublishers = publishers;
        resolve();
    });
}

/**
 * Starts process to get all the Publishers and their Notes using the scraping..
 * This will also go through all the current pages from the GeekList
 * @returns {*}
 */
function retrievePublishersAndNotes(){
    return Q.Promise(function(resolve, reject){
        getTotalPages()
            .then(retrieveForEachPage)
            .then(function(results){
                writePublisherAndNotes(results).then(function(){
                    resolve(results);
                })
            });
    });
}

/**
 * Gets the Total Pages from the pagination widget on BGG
 * @returns {*}
 */
function getTotalPages() {
    return Q.Promise(function (resolve, reject) {
        x(urls.main, {pageNumbers: x('div.pager', ['a'])})
        (function (err, pages) {
            var totalPages = getMax(pages.pageNumbers);

            resolve(totalPages);
        });
    });
}

/**
 * Based on the total pages, we will request them all, then scrape them for details
 * @param totalPages
 * @returns {*}
 */
function retrieveForEachPage(totalPages){
    return Q.Promise(function(resolve, reject){
        var count = 0;
        var promises = [];
        for (count = 0; count <= totalPages; count++) {
            promises.push(getPage(count)
                .then(getPublisherAndNotes));
        }

        Q.all(promises).then(function(results){
            //should be an array of 2 dim. array.. so, just need to flatten...
            resolve(_.flatten(results));
        })
    });
}

/**
 * Writes out the publisher and notes to the publisherNotes.json file
 * @param results
 */
function writePublisherAndNotes(results){
    return Q.Promise(function(resolve, reject){
        fs.writeJson('publisherNotes.json', results, function(err) {
            if (err){
                reject();
            } else {
                resolve();
            }
        })
    });
}


/**
 * Finds the items that correspond to the publisher section, and gets its innerHTML
 * @param html
 * @returns {*}
 */
function getPublisherAndNotes(html) {
    return Q.Promise(function(resolve, reject) {
        x(html, ["#item@html"]) (function(err, items){
            var promises = [];
            _.each(items, function(item){
                promises.push(getNotes(item));
            });

            Q.all(promises).then(resolve);
        });
    });
}

/**
 * Retrieves the Notes from the raw HTML of the item
 * @param item
 * @returns {*}
 */
function getNotes(item) {
    return Q.Promise(function(resolve, reject) {
        //console.log(item);
        x(item, {
            publisher: "div.fl>a@href",
            notes: "dd.listbypubright@html"
        }) (function(err, pubDetails){
            pubDetails.publisher = extractPublisherId(pubDetails.publisher);
            pubDetails.notes = cleanUpNotes(pubDetails.notes);
            resolve(pubDetails);
        })
    });
}

/**
 * Extracts the publishers ID from the URL
 * @param publisher
 * @returns {*}
 */
function extractPublisherId(publisher){
    var results = RE.publisher.exec(publisher);
    if (results) {
        return results[1];
    } else {
        return -1;
    }
}

function cleanUpNotes(notes) {
    notes = notes.replace(RE.newline, "<br>");
    notes = notes.replace(RE.tabs, "");
    return notes;
}

/**
 * Returns the MAX number from the pagination list
 * @param pages
 * @returns {number}
 */
function getMax(pages) {
    var max = 0;
    _.each(pages, function(page){
        try {
            var ex = RE.max.exec(page);
            if (ex) {
                ex = parseInt(ex[1]);
            } else {
                ex = 0;
            }
            if (ex > max) {
                max = ex;
            }
        }
        catch(e) {
            console.error(e);
        }
    });
    return max;
}
    //.write('out.json');

/**
 * Retrieves the page using the request service
 * @param pageNumber
 * @returns {*}
 */
function getPage(pageNumber){
    return Q.Promise(function(resolve, reject){
        request.get(urls.byPage+pageNumber, function(error,response,body){
            resolve(body);
        })
    });
}

Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;
        }
        else if (this[i] != array[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
}