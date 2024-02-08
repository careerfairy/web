import { Functions, httpsCallable } from "firebase/functions"
import { FunctionsInstance } from "./FirebaseInstance"
import { FilterCompanyOptions, Group } from "@careerfairy/shared-lib/groups"

export class CompanyService {
   constructor(private readonly functions: Functions) {}

   /**
    * Fetches Companies (Groups) with the given query options
    * @param data  The query options
    * */
   async fetchCompanies(data: FilterCompanyOptions) {
      const { data: companies } = await httpsCallable<typeof data, Group[]>(
         this.functions,
         "fetchCompanies"
      )(data)

      return companies
   }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const companyService = new CompanyService(FunctionsInstance as any)

export default CompanyService
