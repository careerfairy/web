import { GroupPresenter } from "@careerfairy/shared-lib/groups/GroupPresenter"
import { GroupsDataParser } from "@careerfairy/shared-lib/groups/GroupRepository"
import { isWithinNormalizationLimit } from "@careerfairy/shared-lib/utils/utils"
import * as functions from "firebase-functions"
import { InferType, array, boolean, object, string } from "yup"
import { fieldOfStudyRepo, groupRepo } from "./api/repositories"
import config from "./config"
import { middlewares } from "./middlewares/middlewares"
import { dataValidation } from "./middlewares/validations"

const MAX_FEATURED_COMPANIES = 4

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

const FilterFeaturedCompaniesOptionsSchema = {
   countryId: string(),
   fieldOfStudyId: string(),
}

const schema = object().shape(FilterCompaniesOptionsSchema)

const featuredSchema = object().shape(FilterFeaturedCompaniesOptionsSchema)

type FilterCompanyOptions = InferType<typeof schema>

type FilterFeaturedCompanyOptions = InferType<typeof featuredSchema>

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

export const getFeaturedCompanies = functions
   .region(config.region)
   .https.onCall(
      middlewares(
         dataValidation(FilterFeaturedCompaniesOptionsSchema),
         async (data: FilterFeaturedCompanyOptions) => {
            const { countryId, fieldOfStudyId } = data

            // 1. Get the user field of study category
            const fieldOfStudy = await fieldOfStudyRepo.getById(fieldOfStudyId)
            const fieldOfStudyCategory = fieldOfStudy.category

            // 2. Get the featured groups that match the user field of study category and country
            const featuredGroups =
               fieldOfStudyCategory && countryId
                  ? await groupRepo.getFeaturedGroups(
                       fieldOfStudyCategory,
                       countryId
                    )
                  : []

            if (featuredGroups.length < MAX_FEATURED_COMPANIES) {
               const availableSlots =
                  MAX_FEATURED_COMPANIES - featuredGroups.length

               // TODO: Improve available slots fill based on requirements (tbd)
               const randomGroups = await groupRepo.getGroupsByIds([
                  "i8NjOiRu85ohJWDuFPwo",
                  "FvPXsjLbvUplyIgXQjdB",
                  "G9rXGe70iYuCVIWac6f7",
                  "GgZYSTdoWiHqXGxGzntn",
               ])
               featuredGroups.push(...randomGroups.slice(0, availableSlots))
            }

            // 3. Return the featured groups
            return featuredGroups
               .slice(0, MAX_FEATURED_COMPANIES)
               .map(GroupPresenter.createFromDocument)
         }
      )
   )
