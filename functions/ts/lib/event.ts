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
    const communitySnapshot = await db.doc(`communities/${req.params.community_id}`).get()
    const events = await eventQuerySnapshotHelper(communitySnapshot)
    res.json(events)
})

const eventQuerySnapshotHelper = async (docSnapshot: DocumentSnapshot) => {
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

export default router