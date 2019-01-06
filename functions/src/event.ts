import { Router } from "express"
import * as admin from "firebase-admin"
import{
    DocumentReference,
    DocumentSnapshot,
    QuerySnapshot
} from "@google-cloud/firestore"

const db = admin.firestore()

const router = Router()

router.get("/communities/:community_id/events", async(req, res) =>{
    const limit = req.query.limit || 10;
    const offset = req.query.offset || 0 
    const communitySnapshot = await db.doc(`communities/${req.params.community_id}`).get()
    const events = await eventFromHelper(communitySnapshot)
    res.json(events)
})

router.get("/events", async(req, res) =>{
  const limit = req.query.limit || 10
  const offset = req.query.offset || 0 
  let querySnapshot = await db
    .collection("events")
    .limit(limit)
    .offset(offset)
    .get()
  const events = await eventSnapshotHelper(querySnapshot)
  res.json(events)
})

const eventFromHelper = async (docSnapshot: DocumentSnapshot) => {
    const community = docSnapshot.data()
    const eventsRef: Array<DocumentReference> = community.events
    const eventsSnapshotPromise: Promise<DocumentSnapshot>[] = eventsRef.map(
      async eventSnapshot => await eventSnapshot.get()
    )
    const eventSnapshot = await Promise.all(eventsSnapshotPromise)
    const eventsRaw = eventSnapshot.map(eventSnapshot => eventSnapshot.data())

    const eventsPromise = eventsRaw.map(async event => {
      const participantsRef: Array<DocumentReference> = event.participants
      const participantsSnapshotPromise: Promise<DocumentSnapshot>[] = participantsRef.map(
        async participantSnapshot => await participantSnapshot.get()
      )
      const participantsSnapshot = await Promise.all(participantsSnapshotPromise)
      const participants = participantsSnapshot.map(participantSnapshot => participantSnapshot.data())
      event.participants = participants
      return event
    })
    const events = await Promise.all(eventsPromise)
    return events
  }


const eventSnapshotHelper = async (querySnapshot: QuerySnapshot) => {
  const eventsPromise = querySnapshot.docs.map(async eventSnapshot => {
    const event = eventSnapshot.data()
    const participantsRef: Array<DocumentReference> = event.participants
    const participantsSnapshotPromise: Promise<DocumentSnapshot>[] = participantsRef.map(
      async participantSnapshot => await participantSnapshot.get()
    )
    const participantsSnapshot = await Promise.all(participantsSnapshotPromise)
    const participants = participantsSnapshot.map(participantSnapshot => participantSnapshot.data())
    event.participants = participants
    return event
  })
  const events = await Promise.all(eventsPromise)
  return events
}



export default router