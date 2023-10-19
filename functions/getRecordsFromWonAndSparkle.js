const fetchWonData = require("./getRecordsFromWon");
const fetchSparkleData = require("./getRecordsFromSparkle");
//const convert = require('xml-js')


async function fetchStvData() {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
        console.log('starting fetchStvData function')
        await fetchWonData().then((async res => {
            //console.log("WonDataArray: " + res)
            await fetchSparkleData(res).then((res) => {
                //console.log("Result of fetchWonData: " + res)
                resolve(res)
            })
        })).catch((err) => {if(err) reject(err)})
    })

}

function sanitizeSparkleData(item) {
    let sanitizedItem = {}
    item.forEach(entry => {
        sanitizedItem[entry.fieldKey] = entry.fieldValue
    })
    return sanitizedItem
}

module.exports = {
    fetchStvData: fetchStvData
}

