import { Router } from "express"
import * as admin from "firebase-admin"
import {
  DocumentReference,
  DocumentSnapshot,
  QuerySnapshot
} from "@google-cloud/firestore"

const db = admin.firestore()

const router = Router()

router.get("/communities", async (req, res) => {
  const userRef = db.doc(`users/${req.uid}`)
  let querySnapshot = await db
    .collection("communities")
    .where("members", "array-contains", userRef)
    .get()
  let communities = await communityQuerySnapshotHelper(querySnapshot)
  if (communities.length !== 0) {
    res.json(communities)
  }
  querySnapshot = await db
    .collection("communities")
    .where("creator", "==", userRef)
    .get()
  communities = await communityQuerySnapshotHelper(querySnapshot)
  res.json(communities)
})

const communityQuerySnapshotHelper = async (querySnapshot: QuerySnapshot) => {
  const communitiesPromise = querySnapshot.docs.map(async communitySnapshot => {
    const community = communitySnapshot.data()
    const creatorRef: DocumentReference = community.creator
    const creatorSnapShot = await creatorRef.get()
    const creator = creatorSnapShot.data()
    community.creator = creator
    const membersRef: Array<DocumentReference> = community.members
    const membersSnapshotPromise: Promise<DocumentSnapshot>[] = membersRef.map(
      async memberSnapshot => await memberSnapshot.get()
    )
    const membersSnapshot = await Promise.all(membersSnapshotPromise)
    const members = membersSnapshot.map(memberSnapshot => memberSnapshot.data())
    community.members = members
    return community
  })
  const communities = await Promise.all(communitiesPromise)
  return communities
}

export default router
