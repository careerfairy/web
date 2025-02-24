import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { UserData } from "@careerfairy/shared-lib/users"
import CookiesUtil from "./CookiesUtil"

// Only import types, will not be part of the bundle, real package is loaded by GTM
import { Group } from "@careerfairy/shared-lib/groups"
import { Creator, PublicCreator } from "@careerfairy/shared-lib/groups/creators"
import { SparkPresenter } from "@careerfairy/shared-lib/sparks/SparkPresenter"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { type GroupTraits } from "@customerio/cdp-analytics-browser"
import { ModuleStepType, RichTextBlockType } from "data/hygraph/types"
import { TalentGuideState } from "store/reducers/talentGuideReducer"
import { AnalyticsEvent } from "./analyticsConstants"
import { errorLogAndNotify } from "./CommonUtil"
import { getProgressPercentage } from "./levels"

/**
 * Push an event to the GTM DataLayer
 *
 * @param eventName
 * @param optionalVariables
 */
export const dataLayerEvent = (
   eventName: AnalyticsEvent,
   optionalVariables = {}
) => {
   dataLayerWrapper({
      event: eventName,
      ...optionalVariables,
   })

   analyticsTrackEvent(eventName, optionalVariables)
}

/**
 * Set user variables on DataLayer
 * @param userData
 */
export const dataLayerUser = (userData: UserData) => {
   if (!userData) return

   dataLayerWrapper({
      user_id: userData.authId,
      isAdmin: userData.isAdmin === true,
   })
}

const dataLayerWrapper = (event: object) => {
   if (typeof window === "undefined") return

   try {
      window["dataLayer"].push(event)
   } catch (e) {
      console.error(e)
   }
}

/**
 * Data layer event that receives a livestream object and sends extra metadata as variables
 * @param eventName
 * @param livestream
 * @param optionalVariables Additional properties that are not already in LivestreamEvent
 */
export const dataLayerLivestreamEvent = (
   eventName: AnalyticsEvent,
   livestream: LivestreamEvent,
   optionalVariables = {}
) => {
   dataLayerEvent(
      eventName,
      Object.assign(
         {},
         {
            livestreamId: livestream?.id, // GTM Variable
            livestreamTitle: livestream?.title, // GTM Variable
            companyName: livestream?.company, // GTM Variable
         },
         optionalVariables
      )
   )
}

/**
 * Data layer event that receives a group object and sends extra metadata as variables
 * @param eventName
 * @param company
 * @param optionalVariables Additional properties that are not already in the company object
 */
export const dataLayerCompanyEvent = (
   eventName: AnalyticsEvent,
   company: Partial<Group>,
   optionalVariables = {}
) => {
   dataLayerEvent(eventName, {
      ...optionalVariables,
      companyName: company.universityName, // GTM Variable
      companyId: company.id, // GTM Variable
   })
}

/**
 * Data layer event that receives a mentor object and sends extra metadata as variables
 * @param eventName
 * @param mentor
 * @param optionalVariables Additional properties that are not already in the mentor object
 */
export const dataLayerMentorEvent = (
   eventName: AnalyticsEvent,
   mentor: Creator | PublicCreator,
   optionalVariables = {}
) => {
   dataLayerEvent(eventName, {
      ...optionalVariables,
      mentorId: mentor.id, // GTM Variable
      mentorName: `${mentor.firstName} ${mentor.lastName}`, // GTM Variable
      companyId: mentor.groupId, // GTM Variable
   })
}

/**
 * Data layer event that receives a spark object and sends extra metadata as variables
 * @param eventName
 * @param spark
 * @param optionalVariables Additional properties that are not already in the spark object
 */
export const dataLayerSparkEvent = (
   eventName: AnalyticsEvent,
   spark: Spark | SparkPresenter,
   optionalVariables = {}
) => {
   dataLayerEvent(eventName, {
      ...optionalVariables,
      sparkId: spark.id, // GTM Variable
      companyId: spark.group.id, // GTM Variable
      categoryId: spark.category.id, // GTM Variable
      mentorId: spark.creator?.id, // GTM Variable
   })
}

const getRichTextLastReference = (content: RichTextBlockType) => {
   const references = content?.content?.references || []
   return references[references.length - 1]
}

const getStepContent = (currentStep: ModuleStepType) => {
   if (currentStep?.content?.__typename === "RichTextBlock") {
      return currentStep?.content?.content?.references.map(sanitizeForAnalytics)
   }
   return [sanitizeForAnalytics(currentStep?.content)]
}

const getLastContentId = (currentStep: ModuleStepType) => {
   if (currentStep?.content?.__typename === "RichTextBlock") {
      return getRichTextLastReference(currentStep?.content)?.id
   }
   return currentStep?.content?.id
}

const getLastContentType = (currentStep: ModuleStepType) => {
   if (currentStep?.content?.__typename === "RichTextBlock") {
      return (
         getRichTextLastReference(currentStep?.content)?.__typename || "Text"
      )
   }
   return currentStep?.content?.__typename
}

/**
 * Sends analytics events for talent guide interactions.
 * Requires a valid talent guide state to execute.
 *
 * @param eventName Analytics event name
 * @param levelsState Current talent guide state
 * @param optionalVariables Additional event properties
 */
export const dataLayerLevelEvent = (
   eventName: AnalyticsEvent,
   levelsState: TalentGuideState,
   optionalVariables = {}
) => {
   if (!levelsState.moduleData?.content) {
      const message = `Missing module data for level event ${eventName} - event not sent. Consider using dataLayerEvent() if level state not required`
      console.error(message, levelsState)
      errorLogAndNotify(new Error(message))

      return
   }

   const currentStepIndex = levelsState.currentStepIndex
   const currentStep =
      levelsState.moduleData?.content?.moduleSteps?.[currentStepIndex]

   dataLayerEvent(eventName, {
      ...optionalVariables,
      levelSlug: levelsState.moduleData.slug,
      levelName: levelsState.moduleData.content?.moduleName,
      levelId: levelsState.moduleData.content?.id,
      currentStepIndex: currentStepIndex,
      totalSteps: levelsState.moduleData.content?.moduleSteps?.length,
      progressPercentage: Math.round(
         getProgressPercentage(currentStepIndex, levelsState.moduleData)
      ),
      currentStepId: currentStep?.content?.id,
      currentStepType: currentStep?.content?.__typename,
      currentStepContent: getStepContent(currentStep),
      lastContentId: getLastContentId(currentStep),
      lastContentType: getLastContentType(currentStep),
   })
}

/**
 * Before you continue, please read the following:
 * 1. We queue analytics events in window["analytics"] array before Customer.io script loads.
 * 2. Once Customer.io script loads, it will automatically process any queued/incoming events.
 */

/**
 * Track an event
 * @param eventName Name of the event
 * @param properties Optional properties for the event
 */
export const analyticsTrackEvent = (
   eventName: AnalyticsEvent,
   properties: Record<string, any> = {}
) => {
   if (typeof window === "undefined") return

   const enrichedProperties = { ...properties }

   // Incase cookies are not available, we don't want to crash the analytics tracking
   try {
      const utmParams = CookiesUtil.getUTMParams()

      if (utmParams) {
         enrichedProperties.engagement_origin_params = utmParams
      }
   } catch (error) {
      console.error("Failed to retrieve UTM params:", error)
   }

   window["analytics"].push(["track", eventName, enrichedProperties])
}

/**
 * By setting the user, all activity will be associated with the user
 * @param userAuthId the user auth id
 */
export const analyticsSetUser = async (userAuthId: string) => {
   if (typeof window === "undefined") return

   // Link anonymous user's activity to their new account after setting the user
   if (typeof window["analytics"] !== "undefined" && window["analytics"].user) {
      const isSameUser = window["analytics"].user().id() === userAuthId

      if (isSameUser) {
         return // Don't identify the same user multiple times
      }

      const anonymousId = window["analytics"].user().anonymousId()

      // Immediately alias the anonymous user to the new user before identifying
      // Docs: https://docs.customer.io/cdp/sources/source-spec/alias-spec/
      if (anonymousId) {
         window["analytics"].alias(userAuthId, anonymousId)
      }
   }

   window["analytics"].push(["identify", userAuthId])
}

/**
 * Remove the logged in user from the analytics
 */
export const analyticsResetUser = async () => {
   if (typeof window === "undefined") return

   window["analytics"].push(["reset"])
}

/**
 * Reserved relationship types between users and entities
 * Entities can be companies, livestreams, sparks, etc.
 * Note: Entities will also have to be synced into Customer.io as "objects"
 */
const USER_RELATIONSHIP_TYPE = {
   FOLLOWS_COMPANY: 1,
   REGISTERED_TO_LIVESTREAM: 2,
   PARTICIPATES_IN_LIVESTREAM: 3,
} as const

type UserRelationshipType =
   (typeof USER_RELATIONSHIP_TYPE)[keyof typeof USER_RELATIONSHIP_TYPE]

/**
 * Associates an existing user with an entity
 * @param id the entity id
 * @param traits the entity traits
 */
export const analyticsAssociateUserToEntity = (
   id: string,
   traits: GroupTraits & { objectTypeId: UserRelationshipType }
) => {
   if (typeof window === "undefined") return

   window["analytics"].push(["group", id, traits])
}

/**
 * Removes an existing user association from an entity
 * @param objectTypeId the association type
 * @param objectId the id of the entity
 */
export const analyticsRemoveUserAssociationFromEntity = (
   objectTypeId: UserRelationshipType,
   objectId: string
) => {
   if (typeof window === "undefined") return

   window["analytics"].push([
      "track",
      "Delete Relationship", // Reserved event name from Customer.io
      {
         objectTypeId,
         objectId,
      },
   ])
}

/**
 * Tracks a page view event in Customer.io analytics
 * Automatically captures current page metadata including but not limited to:
 * - URL path
 * - Page title
 * - Referrer
 * - Search parameters
 * No manual parameters needed since the analytics script handles collection
 */
export const analyticsTrackPageView = () => {
   if (typeof window === "undefined") return

   window["analytics"].push(["page"])
}

/**
 * Creates a safe copy of an object for analytics by removing undefined values and circular references
 * @param obj The object to sanitize
 * @returns A sanitized copy of the object
 */
const sanitizeForAnalytics = <T>(obj: T): T => {
   return JSON.parse(JSON.stringify(obj))
}
