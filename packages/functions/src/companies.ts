import { Group } from "@careerfairy/shared-lib/groups"
import { GroupPresenter } from "@careerfairy/shared-lib/groups/GroupPresenter"
import { GroupsDataParser } from "@careerfairy/shared-lib/groups/GroupRepository"
import {
   chunkArray,
   isWithinNormalizationLimit,
} from "@careerfairy/shared-lib/utils/utils"
import * as functions from "firebase-functions"
import { logger } from "firebase-functions/v2"
import { onSchedule } from "firebase-functions/v2/scheduler"
import { InferType, array, boolean, object, string } from "yup"
import { firestore } from "./api/firestoreAdmin"
import {
   customJobRepo,
   groupRepo,
   livestreamsRepo,
   sparkRepo,
} from "./api/repositories"
import config from "./config"
import { middlewares } from "./middlewares/middlewares"
import { dataValidation } from "./middlewares/validations"
import { processInBatches } from "./util"

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
               functions.logger.info("skipping, no data changes", groupId)
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
