import { GroupATSAccount } from "../groups/GroupATSAccount"
import { Recruiter } from "./Recruiter"

interface IntegrationSpecifics {
   /**
    * Some ATS require an associated recruiter when creating candidates
    * The Recruiter might need some special permissions
    * @param recruiters
    */
   filterRecruiters: (recruiters: Recruiter[]) => Recruiter[]

   /**
    * The integration might support creating the CV attachment in the same request
    * that we create the candidate
    */
   candidateCVAsANestedWrite: boolean
}

class DefaultIntegration implements IntegrationSpecifics {
   filterRecruiters = (recruiters: Recruiter[]) => recruiters
   candidateCVAsANestedWrite = false
}

class GreenhouseIntegration extends DefaultIntegration {
   filterRecruiters = (recruiters: Recruiter[]) =>
      recruiters.filter((r) => r?.role.includes("ADMIN"))
   candidateCVAsANestedWrite = true
}

class WorkableIntegration extends DefaultIntegration {
   candidateCVAsANestedWrite = true
}

/**
 * All integration specifics
 *
 * account slug => integration specifics
 */
const map: Record<string, IntegrationSpecifics> = {
   greenhouse: new GreenhouseIntegration(),
   workable: new WorkableIntegration(),
   default: new DefaultIntegration(),
}

/**
 * Get ATS integration specifics implementation for a certain account
 * @param account
 */
export const getIntegrationSpecifics = (account: GroupATSAccount) => {
   if (map[account.slug]) {
      return map[account.slug]
   }

   return map.default
}
