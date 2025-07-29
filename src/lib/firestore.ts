import { db } from "./firebase"
import { collection, doc, setDoc } from "firebase/firestore" // ✅ Make sure `doc` is here
import type { Issue } from "@/types/issue"


export async function createIssueInFirestore(issue: Omit<Issue, "id">) {
  const id = `SR${Date.now()}`

  const completeIssue: Issue = {
    ...issue,
    id,
    createdAt: new Date(),
    updatedAt: new Date(),
    pickedUpAt: issue.pickedUpAt ?? null,
    assignedAt: issue.assignedAt ?? null,
    resolvedAt: issue.resolvedAt ?? null,
    closedAt: issue.closedAt ?? null,
    agingDays: issue.agingDays ?? null,
    agingMonths: issue.agingMonths ?? null,
    agingBucket: issue.agingBucket ?? null,
  }

  const ref = doc(collection(db, "issues"), id)
  await setDoc(ref, completeIssue)

  return completeIssue
}
