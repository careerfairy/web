import { GroupPlanType } from "../groups"

export const STRIPE_CUSTOMER_METADATA_VERSION = "0.1"
export const STRIPE_CUSTOMER_SESSION_METADATA_VERSION = "0.1"

/**
 * Stripe environment constants for type-safe access
 */
export const StripeEnvironments = {
   Prod: "prod",
   Test: "test",
} as const

/**
 * Stripe environment types derived from StripeEnvironments
 */
export type StripeEnvironment =
   (typeof StripeEnvironments)[keyof typeof StripeEnvironments]

export type StripeCustomerSessionData = {
   customerSessionSecret: string
}

/**
 * Base metadata type for all Stripe customer sessions
 */
export interface BaseStripeSessionMetadata {
   groupId: string
   userEmail: string
   userName?: string
   type: StripeProductType
}

export interface CreateCheckoutSessionParams<
   T extends BaseStripeSessionMetadata
> {
   customerId: string
   returnUrl: string
   priceId: string
   adjustableQuantity?: boolean
   metadata: T
}

/**
 * Product types supported by the Stripe integration
 */
export enum StripeProductType {
   GROUP_PLAN = "group-plan",
   OFFLINE_EVENT = "offline-event",
}

/**
 * Metadata for group plan sessions
 */
export interface GroupPlanSessionMetadata extends BaseStripeSessionMetadata {
   type: StripeProductType.GROUP_PLAN
   plan: GroupPlanType
}

/**
 * Metadata for offline event sessions
 */
export interface OfflineEventSessionMetadata extends BaseStripeSessionMetadata {
   type: StripeProductType.OFFLINE_EVENT
}

/**
 * Union type for all session metadata types
 */
export type StripeSessionMetadata =
   | GroupPlanSessionMetadata
   | OfflineEventSessionMetadata

/**
 * Base payload for creating a Stripe customer session
 */
export interface BaseFetchStripeCustomerSession {
   customerName: string
   customerEmail: string
   groupId: string
   priceId: string
   successUrl: string
   type: StripeProductType
   environment: StripeEnvironment
}

/**
 * Payload for group plan sessions
 */
export interface GroupPlanFetchStripeCustomerSession
   extends BaseFetchStripeCustomerSession {
   type: StripeProductType.GROUP_PLAN
   plan: GroupPlanType
}

/**
 * Payload for offline event sessions
 */
export interface OfflineEventFetchStripeCustomerSession
   extends BaseFetchStripeCustomerSession {
   type: StripeProductType.OFFLINE_EVENT
}

/**
 * Union type for all session payload types
 */
export type FetchStripeCustomerSession =
   | GroupPlanFetchStripeCustomerSession
   | OfflineEventFetchStripeCustomerSession

/**
 * Base session payload that can be used for validation
 */
export interface BaseSessionPayload {
   type: StripeProductType
   customerName: string // Name of the user that is buying the product
   customerEmail: string // Email of the user that is buying the product
   groupId: string
   priceId: string
   successUrl: string
   environment: StripeEnvironment
   plan?: GroupPlanType
   [key: string]: unknown
}
