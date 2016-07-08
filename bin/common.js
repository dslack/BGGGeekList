var Q		=	require('q'),
    xml2js	=	require('xml2js');
var parser = xml2js.parseString;

var Common = {
    transformData: transformData
};

function transformData(body) {
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

module.exports = Common;