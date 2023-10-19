const { XMLParser } = require("fast-xml-parser");
const parser = new XMLParser();
const moment = require("moment/moment");
const axios = require("axios");
const {CookieJar}= require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');


async function convertWonData(data){
    console.log("convertWon data function started")
    let resultArray = [];
    const dateMinus1D = moment.utc().subtract(1, 'day').toISOString();
    const date = moment.utc().toISOString()

    let jsonBody = parser.parse(data)
    //console.log("JsonBody: " + JSON.stringify(jsonBody, null, 4))
    //console.log(jsonBody.items.asset.length)
    //console.log("Element 0: " + JSON.stringify(jsonBody.items.asset[0], null, 4) + "=================================================================================\n\n")
    jsonBody.items.asset.forEach(element => {
            //console.log(new Date(element.metadata.startDate) + " < " + now)
            //console.log(element.metadata.startDate.substring(0, 10))
            //console.log("Asset Id: " + element.assetId, "| VIN: " + element.vin,  "| Start Date: " + element.metadata.startDate + " | Playable Start Date: " + element.metadata.playableStartDate + "\n")

            if (element.metadata.startDate.substring(0, 10) === dateMinus1D.substring(0, 10) || element.metadata.startDate.substring(0, 10) === date.substring(0, 10))
                //console.log("element pushed")
                resultArray.push({
                    "assetId": element.assetId,
                    "title": "",
                    "type": "",
                    "vin": element.vin,
                    "dawn": element.metadata.startDate,
                    "sparkleDawn": "",
                    "dusk": element.metadata.endDate,
                    "sparkleDusk": "",
                    "sunrise": element.metadata.playableStartDate,
                    "sparkleSunrise": "",
                    "sunset": element.metadata.playableEndDate,
                    "sparkleSunset": "",
                    "discrepancy": []
                })
            //if(new Date(element.metadata.startDate) < now)
            //console.log("\n{\n" + "   " + element.assetId
            //    + "\n   " + element.vin
            //    + "\n   " + "Dawn: " + element.metadata.startDate
            //    + "\n   " + "Dusk: " + element.metadata.endDate
            //    + "\n   " + "Sunrise: " + element.metadata.playableStartDate
            //    + "\n   " + "Sunset: " + element.metadata.playableEndDate)
        }
    )

    //console.log("=====================JSON BODY============================")
    //console.log(JSON.stringify(jsonBody, null, 5));
    //console.log("=====================RESULT ARRAY============================")
    //console.log("Length: " + resultArray.length)
    //console.log(JSON.stringify(resultArray, null, 2))
    //console.log("Result Element 0" + JSON.stringify(resultArray[0], null, 2) + "=========================================\n\n")
    //let uniqueApiArray = [...new Set(resultArray)]
    let uniqueArray = [];
    resultArray.forEach((element) => {
        if (!uniqueArray.some(object => object.assetId === element.assetId)) {
            uniqueArray.push(element);
        } else
            console.log(" ===== found same ===== ")
    });
    console.log("\n\n ===== resultArray Length: " + resultArray.length)


    return uniqueArray;

}

// eslint-disable-next-line no-unused-vars
function capitalizeFirstLetter(string){
    return string.charAt(0).toUpperCase() + string.slice(1);
}

async function fetchWonData() {
    console.log("fetch Won Data function started")
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
        const jar = new CookieJar();
        jar
            .getSetCookieStrings('RB_BasicAuth=LWVJ1Zn63IC94yTfPN3vnQ==;', 'BIGipServerrb-p_won-wonrestapi_http_pool=!q0jOX5NlDknx92j9hllZ3r8Zs1McEJVon9q4drzHAah6XY8qOxqt4XdMMS8MDtAyh8LVwmKzZ869C/ih2SE1VJ77r2v9nF0DWZERZN6x2ZXnSg==')
        //console.log(jar)
        const client = wrapper(axios.create({jar}))
        // eslint-disable-next-line no-unused-vars
        //const now = new Date();
        const date = moment.utc().toISOString()
        const dateFormatted = moment(date).format('YYYYMMDD')
        const dateMinus1D = moment.utc().subtract(1, 'day').toISOString();
        const dateMinus1DFormatted = moment(dateMinus1D).format('YYYYMMDD')
        //let returnArray = [];
        console.log(dateMinus1D)
        console.log("Date 1 for Query: " + dateMinus1DFormatted)
        console.log(date)
        console.log("Date 2 for Query: " + dateFormatted)

        let headers = {
            'Accept': 'application/xml',
            'Accept-Charset': 'UTF-8',
            'Cookie': 'RB_BasicAuth=LWVJ1Zn63IC94yTfPN3vnQ==; BIGipServerrb-p_won-wonrestapi_http_pool=!q0jOX5NlDknx92j9hllZ3r8Zs1McEJVon9q4drzHAah6XY8qOxqt4XdMMS8MDtAyh8LVwmKzZ869C/ih2SE1VJ77r2v9nF0DWZERZN6x2ZXnSg==',
        };

        let yesterdayPromise = new Promise(async function (resolve, reject) {
            console.log("starting yesterday request")
            await client.get(`https://won.redbullmediahouse.com/wonrestapi/platformcheck?searchParameters=eq(dateSelection,${dateMinus1DFormatted})%3Beq(channelSelection,STVVISIBLE)`, {
                headers: headers,
                auth: {
                    'user': process.env.WON_USER,
                    'pass': process.env.WON_PASSWORD
                },
                withCredentials: true
            }).then(async res => {
                //console.log(await convertWonData(res.data))
                //let parsedArray = JSON.parse(convert.xml2json(res.data, {compact: true, spaces: 2}))
                //console.log("Won Response: " + JSON.stringify(parsedArray, null, 2))
                //console.log("WON yesterday answer: \n" + res.data)
                await convertWonData(res.data).then(res => {
                    console.log("yesterday request done")
                    resolve(res);
                })
            }).catch((err) => {
                if (err) {
                    console.error(err)
                    reject(err)
                }
            })
        })

        let todayPromise = new Promise(async function (resolve, reject) {
            //console.log("starting today request")
            await client.get(`https://won.redbullmediahouse.com/wonrestapi/platformcheck?searchParameters=eq(dateSelection,${dateFormatted})%3Beq(channelSelection,STVVISIBLE)`, {
                headers: headers,
                auth: {
                    'user': process.env.WON_USER,
                    'pass': process.env.WON_PASSWORD
                },
                withCredentials: true
            }).then(async res => {
                //console.log(await convertWonData(res.data))
                //let parsedArray = JSON.parse(convert.xml2json(res.data, {compact: true, spaces: 2}))
                //console.log("Won Response: " + JSON.stringify(parsedArray, null, 2))
                //console.log("WON today answer: \n" + res.data)
                await convertWonData(res.data).then(res => {
                    console.log("today request done")
                    resolve(res);
                })
            }).catch((err) => {
                if (err) {
                    console.error(err)
                    reject(err)
                }
            })
        })

        await Promise.all([
            todayPromise,
            yesterdayPromise
        ]).then((res) => {
            console.log("Response 0 (length: " + res[0].length + "): \n")
            console.log("Response 1 (length: " + res[1].length + "): \n")
            console.log("Complete Response (length: " + [].concat(res[0], res[1]).length + "): \n")
            resolve([].concat(res[0], res[1]))
        })




    })
}

module.exports = fetchWonData