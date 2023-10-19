const getRecordsFromRbtvPas = require("./getRecordsFromRbtvPas");
const getRecordsFromCrepo = require("./getRecordsFromCrepo");
const createRbtvRecords = require("./createRbtvRecords");

async function rbtvPas() {

    let start = Date.now()
    let time = "No new Assets"
    let crepoArray = []
    let airtableArray = []

    await Promise.all([
        getRecordsFromRbtvPas(),
        getRecordsFromCrepo()
    ]).then(res => {
        airtableArray = res[0]
        crepoArray = res[1]
    })

    for (let i = 0; i < airtableArray.length; i++) {
        for (let j = 0; j < crepoArray.length; j++) {
            if (airtableArray[i].toLowerCase() === (crepoArray[j].shortId.toLowerCase() + ":" + crepoArray[j].locale.toLowerCase())) {
                //console.warn("Found Record")
                crepoArray.splice(j, 1)
            }

        }
    }

    //Airtable records are created in chunks of 10 max records at once
    let i,j, temporary, chunk = 10;
    for (i = 0,j = crepoArray.length; i < j; i += chunk) {
        temporary = crepoArray.slice(i, i + chunk);
        await createRbtvRecords(temporary)
    }

    let end = Date.now()

    if (crepoArray.length > 0)
        time = "Time: " + (end - start) + " ms"
    if(crepoArray.length === 0)
        time = "No new Assets"

    return time
}

module.exports = rbtvPas;