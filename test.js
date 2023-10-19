const {compareLocales} = require("./functions/compareLocales");
const getTranslationsFromCrepo = require("./functions/getTranslationsFromCrepo")

async function main () {

    /*
    let records = await getRecordsFromCrepo()


    console.log(records.length)
    console.log(records[0])
     */

    //rrn:content:live-videos:09774f43-2c69-4b02-a616-4100942bcd29:en-INT


    let record1 = await getTranslationsFromCrepo("rrn:content:live-videos:9b75572c-3d92-487f-a2ab-99aa8fa927ab")
let record = await getTranslationsFromCrepo("rrn:content:seasons:37f1dcb4-0afa-4f3a-9283-b509d4f94366:en-INT")

    //let result = flattenGraphqlJson(JSON.stringify(record))

    console.log(record)
    console.log(record1)

}

main()

