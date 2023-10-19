//import moment from "moment";
const Airtable = require('airtable');
const base = new Airtable({apiKey:process.env.AIRTABLE_APIKEY}).base('appi46qkdijweFxaE');



function getRecordsFromRbtvPas(){
    return new Promise(function(resolve, reject){

        let recordArray = [];

        base('tbl6BAH5gJqJ5Z1i1').select({
            //view: "viwhuGNd3jEZHOJhI",
            filterByFormula: `IF(DATETIME_DIFF(NOW(), CREATED_TIME(), 'days') < 5, "1", "")`,
            returnFieldsByFieldId: true,
            fields: ['fldBu4cIRtRzcW5N2', 'fldFB8JYIfWOO1TVd'],
            view: 'viwIq1Dq0E38eiLck'
        }).eachPage(function page(records, fetchNextPage) {
            // This function (`page`) will get called for each page of records.

            records.forEach(function(record) {
                recordArray.push(record.get('fldBu4cIRtRzcW5N2').toLowerCase() + ":" + record.get('fldFB8JYIfWOO1TVd'));
            });

            // To fetch the next page of records, call `fetchNextPage`.
            // If there are more records, `page` will get called again.
            // If there are no more records, `done` will get called.
            fetchNextPage();

        }, function done(err) {
            if (err) { console.error(err); reject(err); }
            resolve(recordArray);
        });
    });
}

module.exports = getRecordsFromRbtvPas;