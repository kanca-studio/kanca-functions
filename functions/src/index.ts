const functions = require("firebase-functions")
const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")({ origin: true })

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
