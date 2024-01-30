import * as functions from "firebase-functions"
import config from "./config"
import { InferType, array, boolean, object, string } from "yup"
import { groupRepo } from "./api/repositories"
import { middlewares } from "./middlewares/middlewares"
import { dataValidation } from "./middlewares/validations"
import { GroupsDataParser } from "@careerfairy/shared-lib/groups/GroupRepository"
import { GroupPresenter } from "@careerfairy/shared-lib/groups/GroupPresenter"

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
         console.log("🚀 ~ compoundQuery:", compoundQuery)
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

/**
 * Checks whether a given set of Query String filters, are within the imposed limit by Firestore
 * when used in queries. Applying only to filters of Collection type. To prevent a query from becoming too computationally expensive,
 * Cloud Firestore limits a query to a maximum of 30 disjunctions in disjunctive normal form.
 * @see https://firebase.google.com/docs/firestore/query-data/queries?hl=en#limits_on_or_queries
 * @param limit Limit imposed by Firestore.
 * @param filters Collection of Arrays of various filters of any type, where only the length of each
 * Array in the collection @param filters is taken into consideration for limit check.
 * @returns Boolean indicating whether the provided @param filters, given the length of each individual collection it
 * holds, will exceed or not, the imposed @param limit .
 */
const isWithinNormalizationLimit = (
   limit: number,
   ...filters: Array<Array<unknown>>
): boolean => {
   // Filter empty collections, would result in zero multiplication
   // Map the collection to lengths for calculation
   const sanitizedFilters = filters
      .filter((items) => Boolean(items.length))
      .map((items) => items.length)

   return (
      sanitizedFilters.reduce((previous, current) => previous * current, 1) <
      limit
   )
}
