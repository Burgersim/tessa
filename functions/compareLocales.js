const getTranslationsFromCrepo = require("./getTranslationsFromCrepo")
const createLocaleCompareRecords = require("./createLocaleCompareRecords")

function collectIds(text) {
    const regex = /"id":\s*"([^"]+)"/g;
    const ids = [];
    let match;

    while ((match = regex.exec(text)) !== null) {
        ids.push(match[1]);
    }
    console.log("found ids" + ids)
    return ids;
}
async function compareLocales(id, hierarchy){
    console.log("Asset Id: " + id)

    let start = Date.now()
    let time = "No new Assets"

    let translations = await getTranslationsFromCrepo(id)
    let childtranslation = []

    let hasmostchildren = ""

    for (const locale of translations) {
        await createLocaleCompareRecords(locale)

        if(locale.children.length > hasmostchildren.length){
            hasmostchildren = locale.children
        }
    }

    if(hierarchy && hasmostchildren !== undefined){
        for (const child of collectIds(hasmostchildren)) {
            childtranslation = await getTranslationsFromCrepo(child)
            for (const childlocale of childtranslation) {
                await createLocaleCompareRecords(childlocale)
            }
        }
    }

    let end = Date.now()

    if (translations.length > 0)
        time = "Time: " + (end - start) + " ms"
    if(translations.length === 0)
        time = "No Asset found"

    return time
}

module.exports = {
    compareLocales: compareLocales
}