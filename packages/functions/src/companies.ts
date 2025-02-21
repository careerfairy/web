import { Group } from "@careerfairy/shared-lib/groups"
import { GroupPresenter } from "@careerfairy/shared-lib/groups/GroupPresenter"
import { GroupsDataParser } from "@careerfairy/shared-lib/groups/GroupRepository"
import {
   GroupClientEventsPayload,
   GroupEventActions,
   GroupEventServer,
} from "@careerfairy/shared-lib/groups/telemetry"
import {
   chunkArray,
   isWithinNormalizationLimit,
} from "@careerfairy/shared-lib/utils/utils"
import * as functions from "firebase-functions"
import { logger } from "firebase-functions/v2"
import { onSchedule } from "firebase-functions/v2/scheduler"
import { InferType, SchemaOf, array, boolean, mixed, object, string } from "yup"
import { firestore } from "./api/firestoreAdmin"
import {
   customJobRepo,
   groupRepo,
   livestreamsRepo,
   sparkRepo,
} from "./api/repositories"
import config from "./config"
import { logAndThrow } from "./lib/validations"
import { middlewares } from "./middlewares/middlewares"
import { dataValidation } from "./middlewares/validations"
import { getCountryCode, processInBatches } from "./util"

const FilterCompaniesOptionsSchema = {
   publicSparks: boolean(),
   companySize: array().of(string()),
   companyIndustries: array().of(string()),
   companyCountries: array().of(string()),
   allCompanyIndustries: array()
      .of(
         object().shape({
            id: string(),
            name: string(),
         })
      )
      .optional(),
}

const schema = object().shape(FilterCompaniesOptionsSchema)

type FilterCompanyOptions = InferType<typeof schema>

export const fetchCompanies = functions.region(config.region).https.onCall(
   middlewares(
      dataValidation(FilterCompaniesOptionsSchema),
      async (data: FilterCompanyOptions) => {
         const {
            companyIndustries = [],
            companyCountries = [],
            companySize = [],
            allCompanyIndustries,
         } = data
         const compoundQuery = isWithinNormalizationLimit(
            30,
            data.companyCountries,
            data.companyIndustries,
            data.companySize
         )

         const groups = await groupRepo.fetchCompanies(
            data,
            compoundQuery,
            allCompanyIndustries
         )

         let res = new GroupsDataParser(groups)
         if (!compoundQuery) {
            if (companyIndustries.length > 0) {
               res = res.filterByCompanyIndustry(companyIndustries)
            }

            if (companyCountries.length > 0) {
               res = res.filterByCompanyCountry(companyCountries)
            }

            if (companySize.length > 0) {
               res = res.filterByCompanySize(companySize)
            }
         }
         return res.get().map(GroupPresenter.createFromDocument)
      }
   )
)

export const syncFeaturedCompaniesData = onSchedule(
   {
      schedule: "every 30 minutes",
      timeoutSeconds: 540,
      memory: "8GiB",
   },
   async () => {
      const bulkWriter = firestore.bulkWriter()
      // Get all companies
      const groups = await groupRepo.fetchCompanies({})
      const groupsRecord: Record<string, Group> = groups.reduce(
         (acc, group) => ({
            ...acc,
            [group.id]: group,
         }),
         {}
      )

      const groupUpdateData: Record<
         string,
         Pick<Group, "hasJobs" | "hasSparks" | "hasUpcomingEvents">
      > = {}

      await processInBatches(
         groups,
         25,
         async (group) => {
            const hasJobsPromise = customJobRepo.groupHasPublishedCustomJobs(
               group.id
            )

            const hasSparksPromise = sparkRepo.groupHasPublishedSparks(group.id)

            const hasUpcomingEventsPromise = livestreamsRepo
               .getFutureLivestreamsQuery(group.id)
               .get()
               .then((data) => !data.empty)

            const [hasJobs, hasSparks, hasUpcomingEvents] = await Promise.all([
               hasJobsPromise,
               hasSparksPromise,
               hasUpcomingEventsPromise,
            ])

            groupUpdateData[group.id] = {
               hasJobs,
               hasSparks,
               hasUpcomingEvents,
            }
         },
         logger
      )

      logger.info("syncFeaturedCompaniesData", groupUpdateData)

      const chunkedGroupUpdateData = chunkArray(
         Object.entries(groupUpdateData),
         25
      )

      for (const batch of chunkedGroupUpdateData) {
         for (const [groupId, groupData] of batch) {
            if (
               groupsRecord[groupId].hasJobs === groupData.hasJobs &&
               groupsRecord[groupId].hasSparks === groupData.hasSparks &&
               groupsRecord[groupId].hasUpcomingEvents ===
                  groupData.hasUpcomingEvents
            ) {
               logger.info("skipping, no data changes", groupId)
               continue
            }
            const docRef = firestore.collection("careerCenterData").doc(groupId)

            void bulkWriter.update(docRef, {
               hasJobs: groupData.hasJobs,
               hasSparks: groupData.hasSparks,
               hasUpcomingEvents: groupData.hasUpcomingEvents,
            })
         }

         await bulkWriter.flush()
      }
   }
)

const groupEventClientSchema: SchemaOf<GroupClientEventsPayload> =
   object().shape({
      events: array().of(
         object().shape({
            authId: string().optional(),
            visitorId: string().optional(),
            stringTimestamp: string().required(),
            utm_source: string().nullable(),
            utm_medium: string().nullable(),
            utm_campaign: string().nullable(),
            utm_term: string().nullable(),
            utm_content: string().nullable(),
            interactionSource: string().nullable(),
            actionType: mixed()
               .oneOf(Object.values(GroupEventActions))
               .required(),
            groupId: string().required(),
         })
      ),
   })

export const trackGroupEvents = functions.region(config.region).https.onCall(
   middlewares(
      dataValidation(groupEventClientSchema),
      async (data: GroupClientEventsPayload, context) => {
         try {
            const groupEvents: GroupEventServer[] = data.events.map(
               (groupEvent) => {
                  const countryCode = getCountryCode(context)

                  let timestamp = new Date(groupEvent.stringTimestamp)

                  if (isNaN(timestamp.getTime())) {
                     timestamp = new Date() // Fallback to current time
                  }

                  delete groupEvent.stringTimestamp

                  return {
                     ...groupEvent,
                     countryCode,
                     timestamp,
                  }
               }
            )

            return groupRepo.trackGroupEvents(groupEvents)
         } catch (error) {
            logAndThrow("Error in tracking group event", {
               data,
               error,
               context,
            })
         }
      }
   )
)
