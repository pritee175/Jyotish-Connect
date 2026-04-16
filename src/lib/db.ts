import {
  collection, doc, addDoc, updateDoc, getDoc, getDocs,
  query, where, orderBy, onSnapshot,
  deleteDoc, increment
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type {
  AstroQuery, QueryStatus, AnswerTemplate, Remedy,
  SavedPerson, QueryMessage, PersonDetails, QueryDomain
} from '@/types'

// ─── Queries ─────────────────────────────────────────────────────────────────

export const submitQuery = async (
  userId: string,
  userName: string,
  userPhone: string,
  domain: QueryDomain,
  personDetails: PersonDetails,
  queryText: string
): Promise<string> => {
  const ref = await addDoc(collection(db, 'queries'), {
    userId, userName, userPhone,
    domain, personDetails, queryText,
    status:    'pending_review' as QueryStatus,
    messages:  [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })
  return ref.id
}

export const updateQueryStatus = async (
  queryId: string,
  status: QueryStatus,
  extra?: Partial<AstroQuery>
) => {
  await updateDoc(doc(db, 'queries', queryId), {
    status,
    updatedAt: new Date().toISOString(),
    ...extra,
  })
}

export const setQueryFee = async (queryId: string, fee: number) => {
  await updateDoc(doc(db, 'queries', queryId), {
    fee,
    status:    'fee_set' as QueryStatus,
    updatedAt: new Date().toISOString(),
  })
}

export const confirmPayment = async (queryId: string, paymentNote: string) => {
  await updateDoc(doc(db, 'queries', queryId), {
    status:      'paid' as QueryStatus,
    paymentNote,
    paidAt:      new Date().toISOString(),
    deadline:    new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    updatedAt:   new Date().toISOString(),
  })
}

export const sendAnswer = async (
  queryId: string,
  answer: string,
  templateIds: string[]
) => {
  await updateDoc(doc(db, 'queries', queryId), {
    answer,
    templateIds,
    status:      'answered' as QueryStatus,
    answeredAt:  new Date().toISOString(),
    updatedAt:   new Date().toISOString(),
  })
  // increment usage count for each template used
  for (const tid of templateIds) {
    await updateDoc(doc(db, 'templates', tid), {
      usedCount: increment(1)
    })
  }
}

export const addMessage = async (
  queryId: string,
  from: 'user' | 'admin',
  text: string
) => {
  const qRef = doc(db, 'queries', queryId)
  const snap = await getDoc(qRef)
  if (!snap.exists()) return
  const data = snap.data() as AstroQuery
  const newMsg: QueryMessage = {
    id:        crypto.randomUUID(),
    from,
    text,
    createdAt: new Date().toISOString(),
  }
  const messages = [...(data.messages ?? []), newMsg]
  await updateDoc(qRef, {
    messages,
    status:    from === 'admin' ? 'clarification' : data.status,
    updatedAt: new Date().toISOString(),
  })
}

export const getUserQueries = (
  userId: string,
  cb: (queries: AstroQuery[]) => void
) => {
  const q = query(
    collection(db, 'queries'),
    where('userId', '==', userId)
    // no orderBy here — avoids requiring a composite index in Firestore
    // (where + orderBy together need a manually-created composite index)
  )
  return onSnapshot(q, snap => {
    const sorted = snap.docs
      .map(d => ({ id: d.id, ...d.data() }) as AstroQuery)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    cb(sorted)
  })
}

export const getAllQueries = (cb: (queries: AstroQuery[]) => void) => {
  const q = query(collection(db, 'queries'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, snap => {
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() }) as AstroQuery))
  })
}

export const getQuery = async (queryId: string): Promise<AstroQuery | null> => {
  const snap = await getDoc(doc(db, 'queries', queryId))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as AstroQuery
}

export const subscribeQuery = (
  queryId: string,
  cb: (query: AstroQuery | null) => void
) => {
  return onSnapshot(doc(db, 'queries', queryId), snap => {
    if (!snap.exists()) { cb(null); return }
    cb({ id: snap.id, ...snap.data() } as AstroQuery)
  })
}

// ─── Templates ───────────────────────────────────────────────────────────────

export const getTemplates = (cb: (templates: AnswerTemplate[]) => void) => {
  const q = query(collection(db, 'templates'), orderBy('usedCount', 'desc'))
  return onSnapshot(q, snap => {
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() }) as AnswerTemplate))
  })
}

export const addTemplate = async (t: Omit<AnswerTemplate, 'id' | 'usedCount' | 'createdAt'>) => {
  await addDoc(collection(db, 'templates'), {
    ...t,
    usedCount: 0,
    createdAt: new Date().toISOString(),
  })
}

export const updateTemplate = async (id: string, data: Partial<AnswerTemplate>) => {
  await updateDoc(doc(db, 'templates', id), data)
}

export const deleteTemplate = async (id: string) => {
  await deleteDoc(doc(db, 'templates', id))
}

// ─── Remedies ────────────────────────────────────────────────────────────────

export const getRemedies = (cb: (remedies: Remedy[]) => void) => {
  return onSnapshot(collection(db, 'remedies'), snap => {
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() }) as Remedy))
  })
}

export const addRemedy = async (r: Omit<Remedy, 'id'>) => {
  await addDoc(collection(db, 'remedies'), r)
}

export const deleteRemedy = async (id: string) => {
  await deleteDoc(doc(db, 'remedies', id))
}

// ─── Saved Persons ───────────────────────────────────────────────────────────

export const getSavedPersons = async (userId: string): Promise<SavedPerson[]> => {
  const snap = await getDocs(collection(db, 'users', userId, 'savedPersons'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as SavedPerson)
}

export const savePersonForUser = async (userId: string, details: PersonDetails) => {
  await addDoc(collection(db, 'users', userId, 'savedPersons'), { details })
}

export const deleteSavedPerson = async (userId: string, personId: string) => {
  await deleteDoc(doc(db, 'users', userId, 'savedPersons', personId))
}
