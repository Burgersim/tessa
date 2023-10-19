const Airtable = require('airtable');
const base = new Airtable({apiKey: process.env.AIRTABLE_APIKEY}).base('appPbaz3LFYZxj5hZ');

function createLocaleCompareRecords(entry) {
    return new Promise(function(resolve, reject) {
        base('tbleZBk2M0S77Fsvs').create([{
            fields: {
                "fld74EZL68vUOQtKJ": entry.locale,
                "fldg20Pcvm95hyPnK": entry.type,
                "fld5AnemKv76YYUyW": entry.id,
                "fldaShFpZcADtxQFx": entry.title,
                "fld4QyKcnZYF4oqH4": entry.subHeading,
                "fld1OAPcNm6n1MmkK": entry.teaser,
                "fldv5kOaxa9Pjf5x3": entry.description,
                "flda584A2SuInHvad": entry.startDate,
                "fldKsYr93RKwBfmTz": entry.endDate,
                "fldnmjScckcfbGIyj": entry.created,
                "fld9hIal8wk2Q7FHd": entry.master,
                "fldrRiVNHtUufi7BY": entry.status,
                "fld9YalxZShygBa9z": entry.hasEssence,
                "fld2qbgSsuK5Bgqjm": entry.spaces,
                "fldjd4NZdqzbxoBJP": entry.published,
                "fldlRWfuV7MirJHyi": entry.standalone,
                "fldQx7Ntd0gWoqTCK": entry.parents,
                "fldHmFzeI2jSHFZNK": entry.children,
                "fldHDhZd2BcdEdaWM": entry.videoEssence
            }
        }], {typecast: true}, function(err) {
            if (err) {
                console.error(err);
                reject(err);
            }
            resolve("successfully created record")
        });

    });
}


module.exports = createLocaleCompareRecords;