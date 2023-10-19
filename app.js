const express = require('express')
const app = express()
const port = process.env.PORT || 8080
const path = require("path");
const rbtvPas = require("./functions/rbtvPas");
const cron = require('node-cron')
const {compareLocales} = require("./functions/compareLocales");

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.set('json spaces', 2);
app.set('views', './views')
app.set('view engine', 'pug');

app.get('/', (req, res) => {

    if(req.query.mode === 'rbtv')
            res.render("index", {title: "Tessa", mode: req.query.mode})
    else if(req.query.mode === 'stv')
            res.render("index", {title: "Tessa", mode: req.query.mode})
    else if(req.query.mode === 'rbtvLocales')
        res.render("localeComparisonIndex", {title: "Tessa Locale Comparison", mode: req.query.mode})
    else
        res.status(500).send("Page does not exist without proper parameters")
})

app.get('/request', async (req, res) => {

    if (req.query.mode === 'rbtv') {
        let time = await rbtvPas()
        res.json(time)
    } else if (req.query.mode === 'stv') {
        //let time = await stvPas()


        res.json("no function defined yet for STV PAS")
    } else if (req.query.mode === 'rbtvLocales') {

        let time = await compareLocales(req.query.assetId, false)

        res.json(time)
    }else if (req.query.mode === "rbtvLocalesHierarchy"){
        console.log("Import + Hierarchy")
        let time = await compareLocales(req.query.assetId, true)

        res.json(time)
    } else
        res.status(500).send("no or unsupported mode")
})

cron.schedule('0 2,6,10,14,18,22 * * *', () => {
    rbtvPas().then(res => console.log("Scheduled RBTV PAS done.", res))
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
