const cors = require("cors")({ origin: true })

import * as functions from "firebase-functions"
import * as admin from "firebase-admin"
import * as express from "express"
import * as bodyParser from "body-parser"

admin.initializeApp(functions.config().firebase)
const db = admin.firestore()

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

app.get("/firestore", async (_req, res) => {
  const data = await db.collection("events").get()
  console.log(".get() return", data)
  const arr = data.docs.map(async eventSnapshot => {
    const event = eventSnapshot.data()
    const communityRef = await event.community.get()
    event.community = communityRef.data()
    const creatorRef = await event.community.creator.get()
    event.community.creator = creatorRef.data()
    return event
  })
  const events = await Promise.all(arr)

  res.json({ events: events })
})

exports.app = functions.region("asia-northeast1").https.onRequest(app)
