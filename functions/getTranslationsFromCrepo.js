const axios = require('axios');
const moment = require('moment');
const crepoApiKey = process.env.CREPO_APIKEY
const { readFileSync } = require('fs')
// converting the file Buffer to a UTF-8 string for CREPO query
const getTranslationsQuery = readFileSync(require.resolve('../queries/getTranslationsQuery.graphql')).toString('utf-8')
const localeComparisonQuery = readFileSync(require.resolve('../queries/localeComparisonQuery.graphql')).toString('utf-8')

// FETCH ASSETS FROM CREPO VIA CONTENT DELIVERY API
// production endpoint
const productionEndpoint = 'https://api.redbull.com';
// staging endpoint //
//const stagingEndpoint = 'https://edge-graphql.crepo-staging.redbullaws.com/'


const crepoHeaders = {
    "apiKey": crepoApiKey
}

const graphQLClient = axios.create({
    baseURL: productionEndpoint,
    timeout: 5000,
    headers: crepoHeaders,
})

async function getTranslationsFromCrepo(assetId) {

    const now = moment.utc().toISOString();

    const translationsQuery = {
        query: getTranslationsQuery,
        variables: {
            id: assetId
        }
    }

    let results = []

    let fullData = await graphQLClient.post('/v1/graphql', translationsQuery).catch(err => console.error(err.code));

    if(fullData){
        if(fullData.data.data.resource){
            let allTranslations = [fullData.data.data.resource.id]

            fullData.data.data.resource.translations.forEach(entry => {
                allTranslations.push(entry.id)
            })

            for (const id of allTranslations) {
                if(id)
                    results.push(await getCrepoData(id, now))
            }
        }
    }


    return results
}

async function getCrepoData(id, now) {

    const crepoQuery = {
        query: localeComparisonQuery,
        variables: {
            id: id
        }
    }

    let fullData = await graphQLClient.post('/v1/graphql', crepoQuery).catch(err => console.error(err.code));

    let data = flattenGraphqlJson(JSON.stringify(fullData.data.data.resource))

    data = parentChildCleanup(data)

    console.log(data)

    data.startDate = data.startDate ? data.startDate : null
    data.endDate = data.endDate ? data.endDate : null
    data.created = now
    data.hasEssence = data.videoEssence ? "has Essence Link" : "no Essence linked"
    data.published = data.published  ? "Published": "Unpublished"
    data.standalone = data.usageRestrictions === null ? "Standalone" : "No Standalone"

    return data

}

function flattenGraphqlJson (json) {

    //flatten single level entries (e.g. json.title.text to json.title, description is also flattened, if only one is present, yay)
    let parsedJson = JSON.parse(json, function(key, value) {
        if (Object(value) !== value) return value; // primitive values
        let keys = Object.keys(value);
        if (keys.length === 1)
            return value[keys[0]];
        else
            return value;
    });

    //remove empty arrays
    if(parsedJson){
        let keys = Object.keys(parsedJson)
        keys.forEach(key => {
            if(Array.isArray(parsedJson[key]) && parsedJson[key].length === 0)
                parsedJson[key] = ""
        })

        //pull up metadata (e.g. json.meta.locale => json.locale
        if(parsedJson.meta){
            let keys = Object.keys(parsedJson.meta)
            keys.forEach((key) => {
                parsedJson[key] = parsedJson.meta[key]
            })
        }

        //meta is not needed after pulling metadata to first layer
        delete parsedJson["meta"]

        //flatten every object that is still multilayered into one string (excluding spaces as this is entered into a multi-select field)
        keys = Object.keys(parsedJson)
        keys.forEach(key => {
            if(parsedJson[key] !== null && typeof parsedJson[key] === "object" && key !== "spaces") {
                parsedJson[key] = key + "\n" + JSON.stringify(parsedJson[key], null, 2)
            }
        })
    }


    return parsedJson || {}
}

function parentChildCleanup (flattenedJson) {

    let result = flattenedJson

    result.parents = ""
    result.children = ""

    let parentChildArray;

    if (result !== "") {
        switch (result.type) {
            case 'rrn:content:films':
                result.type = "Film"
                parentChildArray = ["", ""]
                break;
            case 'rrn:content:shows':
                result.type = "Show"
                parentChildArray = ["", "seasons"]
                break;
            case 'rrn:content:seasons':
                result.type = "Show Season"
                parentChildArray = ["show", "episodes"]
                break;
            case 'rrn:content:event-series':
                result.type = "Event Series"
                parentChildArray = ["", "events"]
                break;
            case 'rrn:content:event-seasons':
                result.type = "Event Season"
                parentChildArray = ["", "events"]
                break;
            case 'rrn:content:event-profiles':
                result.type = "Event Profile"
                parentChildArray = [["series", "season"], "live"]
                break;
            case 'rrn:content:trailer-videos':
                result.type = "Trailer Video"
                parentChildArray = ["extraFor", ""]
                break;
            case 'rrn:content:episode-videos':
                result.type = "Episode Video"
                parentChildArray = ["season", ""]
                break;
            case 'rrn:content:recap-videos':
                result.type = "Recap Video"
                parentChildArray = ["extraFor", ""]
                break;
            case 'rrn:content:live-videos':
                result.type = "Live Video"
                parentChildArray = ["events", ""]
                break;
            case 'rrn:content:videos-360':
                result.type = "VR 360 Video"
                parentChildArray = ["", ""]
                break;
            case 'rrn:content:videos':
                result.type = "Video"
                parentChildArray = ["extraFor", ""]
                break;
            default:
                result.type = ""
                parentChildArray = ["", ""]
                break;
        }
    }

    //set parents
    if(Array.isArray(parentChildArray[0])){
        parentChildArray[0].forEach(entry => {
                result.parents += result[entry] || "" + "\n"
        })
    } else {
        result.parents = result[parentChildArray[0]] || ""
    }
    //set children
    if(Array.isArray(parentChildArray[1])){
        parentChildArray[1].forEach(entry => {
                result.children += result[entry] || "" + "\n"
        })
    } else {
        result.children = result[parentChildArray[1]] || ""
    }

    return result
}

module.exports = getTranslationsFromCrepo;