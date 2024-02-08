import * as functions from "firebase-functions"
import config from "./config"
import { InferType, array, boolean, object, string } from "yup"
import { groupRepo } from "./api/repositories"
import { middlewares } from "./middlewares/middlewares"
import { dataValidation } from "./middlewares/validations"
import { GroupsDataParser } from "@careerfairy/shared-lib/groups/GroupRepository"
import { GroupPresenter } from "@careerfairy/shared-lib/groups/GroupPresenter"
import { isWithinNormalizationLimit } from "@careerfairy/shared-lib/utils/utils"

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
