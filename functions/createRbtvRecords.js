const Airtable = require('airtable');
const base = new Airtable({apiKey: process.env.AIRTABLE_APIKEY}).base('appi46qkdijweFxaE');

function createRbtvRecords(recordArray) {
    return new Promise(function(resolve, reject) {
        let formattedArray = []
        for (let entry of recordArray) {
            formattedArray.push(
                {
                    fields: {
                        "fldFB8JYIfWOO1TVd": entry.locale,
                        "fld0kKgmbxNdHZ0qy": entry.type,
                        "fldkt8k7GKyJpkUSs": entry.geoblockedIn,
                        "fldsdTbAuM647ixMQ": entry.publishedDate,
                        "fldBu4cIRtRzcW5N2": entry.shortId,
                        "fldr2YO70f59J0NWf": entry.title,
                        "fldDopGR2pZAWYM3T": entry.subHeading,
                        "fldg5SMD14Gimismw": entry.label,
                        "fldjWrEDLYqOgYr1o": entry.teaser,
                        "flde2qYEbEaxLI79e": entry.description,
                        "fld5cPaCfVSU8f9Z4": entry.vin,
                        "flddVCIkfntQBBP78": entry.uriSlug,
                        "fldIOTJmavRcUB54O": entry.previewClip,
                        "fldk6irwJ2NOd3HRb": entry.descriptionLanguage,
                        "fldjsX9vapbMVKE5x": entry.teaserLanguage
                    }
                }
            )
        }


        base('tbl6BAH5gJqJ5Z1i1').create(formattedArray, function(err) {
            if (err) {
                console.error(err);
                reject(err);
            }
            resolve("successfully created records")
        });

    });
}


module.exports = createRbtvRecords;