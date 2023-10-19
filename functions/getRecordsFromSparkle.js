const axios = require('axios');
const oauth = require('axios-oauth-client');
const clientId = process.env.VUE_APP_SPARKLE_TOKEN_CLIENTID;
const clientSecret = process.env.VUE_APP_SPARKLE_TOKEN_CLIENTSECRET;
const tokenUrl = 'https://auth.redbull.com/oauth2/auszmenrqNMwQtOJP416/v1/token';


async function fetchSparkleData(array) {
    console.log("fetchSparkleData")
    let erronousAssetIds = []
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
        //console.log(array.length)
        //let result = [];
        //console.log(token)
        //let i = 0;
        console.log("Element 0: " + JSON.stringify(array[0], null, 2))
        console.log("Element 38: " + JSON.stringify(array[38], null, 2))
        for (const element of array) {
            console.log("Asset Id of Element during Sparkle API call: " + element.assetId)
            //const index = array.indexOf(element);
            let token = await getSparkleToken()
            //console.log("Index: " + index)
            //ask for Sparkle Data
            axios.get('https://sparkle2-api.liiift.io/api/v1/stv/channels/stvcom/assets/' + element.assetId, {
                headers: {
                    'Authorization': `Bearer ${token.access_token}`,
                    'content-type': 'application/x-www-form-urlencoded'
                }
            }).then(async (res) => {
                res.data.attributes = sanitizeSparkleData(res.data.attributes)
                element.sparkleDawn = res.data.attributes.currentdawn ? new Date(res.data.attributes.currentdawn).toISOString() : ""
                element.sparkleDusk = res.data.attributes.current_dusk ? new Date(res.data.attributes.current_dusk).toISOString() : ""
                element.sparkleSunrise = res.data.attributes.current_sunrise ? new Date(res.data.attributes.current_sunrise).toISOString() : ""
                element.sparkleSunset = res.data.attributes.current_sunset ? new Date(res.data.attributes.current_sunset).toISOString() : ""
                element.title = res.data.attributes.title_stv ? res.data.attributes.title_stv : ""
                element.type =  res.data.attributes.asset_type ? res.data.attributes.asset_type : ""
                //console.log("Element after Sparkle: " + JSON.stringify(element, null, 2))
                if (element.sparkleDawn !== element.dawn)
                    element.discrepancy.push("dawn")
                if (element.sparkleDusk !== element.dusk)
                    element.discrepancy.push("dusk")
                if (element.sparkleSunrise !== element.sunrise)
                    element.discrepancy.push("sunrise")
                if (element.sparkleSunset !== element.sunset)
                    element.discrepancy.push("sunset")

            }).catch((err) => {
                //console.error(err)
                //reject(err)
                erronousAssetIds.push(element.assetId + ": " + err.message)
            })
        }
        //console.log("'element' 0 before sparkleData: " + JSON.stringify(array[0], null, 2))
        console.log("Errors: \n")
        erronousAssetIds.forEach(element => {
            console.log(element)
        })
        resolve(array)

    })
    //write Sparkle Data to element -> note discrepancies
    //return result;
}

async function getSparkleToken() {
    const getAuthorizationToken = oauth.client(axios.create(), {
        url: tokenUrl,
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        scope: '',
    });
    //console.log(token)
    return await getAuthorizationToken();
}

module.exports = fetchSparkleData