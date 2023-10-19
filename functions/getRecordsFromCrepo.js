const axios = require('axios');
const moment = require('moment');
const crepoApiKey = process.env.CREPO_APIKEY
const dateMinus3D = moment.utc().subtract(3, 'day').toISOString();
const { readFileSync } = require('fs')
const cld = require('cld');
// converting the file Buffer to a UTF-8 string for CREPO query
const rbtvCrepoQuery = readFileSync(require.resolve('../queries/rbtvCrepoQuery.graphql')).toString('utf-8')

// FETCH ASSETS FROM CREPO VIA CONTENT DELIVERY API
// production endpoint
const productionEndpoint = 'https://api.redbull.com';
// staging endpoint //
//const stagingEndpoint = 'https://edge-graphql.crepo-staging.redbullaws.com/'
const crepoHeaders = {
    "apiKey": crepoApiKey
}

const crepoQuery = {
    query: rbtvCrepoQuery,
    variables: {
        cutoffDate: dateMinus3D
    }
}

const graphQLClient = axios.create({
    baseURL: productionEndpoint,
    timeout: 5000,
    headers: crepoHeaders,
})

const getRecordsFromCrepo = async () => {
    let fullData = await graphQLClient.post('/v1/graphql', crepoQuery);
    let skimmedData = fullData.data.data.feed.edges;
    let crepoArray = [];
    for (let i = 0; i < skimmedData.length; i++) {
        let data = skimmedData[i].node;
        let type = ""
        if (skimmedData[i].node) {
            if(data !== "") {
                switch (data.type) {
                    case 'rrn:content:films':
                        type = "Film"
                        break;
                    case 'rrn:content:shows':
                        type = "Show"
                        break;
                    case 'rrn:content:seasons':
                        type = "Show Season"
                        break;
                    case 'rrn:content:event-series':
                        type = "Event Series"
                        break;
                    case 'rrn:content:event-seasons':
                        type = "Event Season"
                        break;
                    case 'rrn:content:event-profiles':
                        type = "Event Profile"
                        break;
                    case 'rrn:content:trailer-videos':
                        type = "Trailer Video"
                        break;
                    case 'rrn:content:episode-videos':
                        type = "Episode Video"
                        break;
                    case 'rrn:content:recap-videos':
                        type = "Recap Video"
                        break;
                    case 'rrn:content:live-videos':
                        type = "Live Video"
                        break;
                    case 'rrn:content:videos-360':
                        type = "VR 360 Video"
                        break;
                    case 'rrn:content:videos':
                        type = "Video"
                        break;
                    default:
                        type = ""
                        break;
                }

                let shortId = (data.id && data.type) ? data.id.replace((data.type + ":"), '') : ""

                let descriptionLanguage = "language detection failed"
                let teaserLanguage = "language detection failed"

                if(data.description && data.description[0].contents.length !== 0) {
                    await cld.detect(data.description[0].contents[0].text).then(result => {
                        descriptionLanguage = result.languages[0].code
                    }).catch(() => console.log("Language couldn't be detected"))
                }

                if(data.teaser && data.teaser.text) {
                    await cld.detect(data.teaser.text).then(result => {
                        teaserLanguage = result.languages[0].code
                    }).catch(() => console.log("Language couldn't be detected"))
                }

                let entry = {
                    "shortId": shortId.replace(":" + data.meta.locale, ""),
                    "type": type || "",
                    "publishedDate": data.publishedDate.dateTimeUTC || "",
                    "vin": data.videoEssence ? data.videoEssence.attributes.VIN : "",
                    "geoblockedIn": data.geoblockedin || "",
                    "title": data.title.text || "",
                    "subHeading": data.subHeading ? data.subHeading.text : "",
                    "teaser": data.teaser ? data.teaser.text : "",
                    "description": data.description && data.description[0].contents.length !== 0 ? data.description[0].contents[0].text : "",
                    "label": data.label || "",
                    "uriSlug": data.uriSlug || "",
                    "locale": data.meta.locale || "",
                    "previewClip": data.featuredMedia.length === 2 && data.featuredMedia[1].hasOwnProperty('id'),
                    "descriptionLanguage": descriptionLanguage,
                    "teaserLanguage": teaserLanguage
                }
                crepoArray.push(entry)
            }
        }
    }
    return crepoArray;
}

module.exports = getRecordsFromCrepo;