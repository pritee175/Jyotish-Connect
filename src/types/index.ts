// ─── Language ────────────────────────────────────────────────────────────────
export type Lang = 'en' | 'mr'

// ─── User ────────────────────────────────────────────────────────────────────
export interface UserProfile {
  uid:       string
  name:      string
  phone:     string
  email:     string
  createdAt: string
  lang:      Lang
  fcmToken?: string
  fcmTokenUpdatedAt?: string
}

// ─── Query ───────────────────────────────────────────────────────────────────
export type QueryDomain =
  | 'career'
  | 'marriage'
  | 'daily_life'
  | 'baby_children'
  | 'health'
  | 'finance'
  | 'education'
  | 'property'
  | 'travel'
  | 'others'

export type QueryStatus =
  | 'pending_review'   // submitted, awaiting papa approval
  | 'fee_set'          // papa set fee, waiting for payment
  | 'paid'             // payment confirmed
  | 'in_progress'      // papa working on answer
  | 'clarification'    // papa asked for more info
  | 'answered'         // answer delivered
  | 'closed'           // completed & closed
  | 'rejected'         // papa rejected (e.g. duplicate / outside scope)

export interface PersonDetails {
  name:          string
  dob:           string   // YYYY-MM-DD
  tob:           string   // HH:MM
  pob:           string   // place of birth
  currentCity:   string
  gender:        'male' | 'female' | 'other'
  relation:      string   // "self", "spouse", "child", etc.
  pastRemedies?: string
}

export interface QueryMessage {
  id:        string
  from:      'user' | 'admin'
  text:      string
  createdAt: string
}

export interface AstroQuery {
  id:           string
  userId:       string
  userName:     string
  userPhone:    string
  domain:       QueryDomain
  personDetails: PersonDetails
  queryText:    string
  status:       QueryStatus
  fee?:         number        // INR set by admin
  paymentNote?: string        // UPI transaction ref / note
  paymentId?:   string        // Razorpay payment ID
  orderId?:     string        // Razorpay order ID
  paymentMethod?: 'upi' | 'razorpay'
  answer?:      string        // final answer from papa
  templateIds?: string[]      // templates used in answer
  messages:     QueryMessage[]
  createdAt:    string
  updatedAt:    string
  paidAt?:      string
  answeredAt?:  string
  deadline?:    string        // 48h after payment
}

// ─── Answer Template ─────────────────────────────────────────────────────────
export interface AnswerTemplate {
  id:        string
  title:     string
  titleMr:   string
  domain:    QueryDomain | 'general'
  content:   string
  contentMr: string
  tags:      string[]
  usedCount: number
  createdAt: string
}

// ─── Remedy ──────────────────────────────────────────────────────────────────
export type RemedyType = 'gemstone' | 'puja' | 'mantra' | 'donation' | 'fasting' | 'other'

export interface Remedy {
  id:        string
  type:      RemedyType
  name:      string
  nameMr:    string
  detail:    string
  detailMr:  string
}

// ─── Saved Person (address book for users) ───────────────────────────────────
export interface SavedPerson {
  id:      string
  details: PersonDetails
}
