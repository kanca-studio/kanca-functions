const cors = require("cors")({ origin: true })

import * as functions from "firebase-functions"
import * as express from "express"
import * as bodyParser from "body-parser"
import * as admin from "firebase-admin"

admin.initializeApp()

import community from "./community"

const app = express()
app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true
  })
)

app.use(cors)

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  )

  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, DELETE")
    return res.status(200).json({})
  }

  return next()
})

app.use(async (req, _res, next) => {
  const token = req.headers.authorization
  const decodedToken = await admin.auth().verifyIdToken(token)
  const uid = decodedToken.uid
  req.uid = uid
  next()
})

app.use(community)

app.get("/", (_req, res) => {
  res.json({ message: "Kanca backend is up!" })
})

exports.app = functions.region("asia-northeast1").https.onRequest(app)
