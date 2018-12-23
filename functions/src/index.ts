const cors = require("cors")({ origin: true })

import * as functions from "firebase-functions"
import * as express from "express"
import * as bodyParser from "body-parser"

const app = express()
app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true
  })
)

app.use(cors)

app.get("/", (_req, res) => {
  res.json({ message: "Kanca backend is up!" })
})

exports.app = functions.region("asia-northeast1").https.onRequest(app)
