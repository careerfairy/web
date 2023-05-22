import { object, string } from "yup"
import {
   Group,
   GroupATSIntegrationTokensDocument,
} from "@careerfairy/shared-lib/groups"
import { CallableContext } from "firebase-functions/lib/common/providers/https"
import {
   logAndThrow,
   validateData,
   validateUserAuthExists,
   validateUserIsGroupAdmin,
} from "./validations"
import { groupRepo } from "../api/repositories"
import { auth } from "firebase-admin"
import DecodedIdToken = auth.DecodedIdToken
import { IATSRepository } from "./IATSRepository"
import { Candidate } from "@careerfairy/shared-lib/ats/Candidate"
import { UserATSRelations, UserData } from "@careerfairy/shared-lib/users"
import { GroupATSAccount } from "@careerfairy/shared-lib/groups/GroupATSAccount"
import { Job } from "@careerfairy/shared-lib/ats/Job"
import { getIntegrationSpecifics } from "@careerfairy/shared-lib/ats/IntegrationSpecifics"

type AlwaysPresentData = {
   groupId: string
   integrationId: string
}

type AlwaysPresentArgs = AlwaysPresentData & {
   idToken: DecodedIdToken
   group: Group
}

type Options<T extends object> = {
   data: T & AlwaysPresentData
   context: CallableContext
   requiredData?: object
}

/**
 * Common Logic to validate ATS Requests
 *
 * Returns the data fetched from the validations
 * @param options
 */
export async function atsRequestValidation<T extends object>(
   options: Options<T>
): Promise<T & AlwaysPresentArgs> {
   const inputSchema = object(
      Object.assign(
         {
            groupId: string().required(),
            integrationId: string().required(),
         },
         options.requiredData ?? {}
      )
   )

   // validations that throw exceptions
   const idToken = await validateUserAuthExists(options.context)
   const inputValidationResult = (await validateData(
      options.data,
      inputSchema
   )) as T & AlwaysPresentData

   const { group } = await validateUserIsGroupAdmin(
      inputValidationResult.groupId,
      idToken.email
   )

   return {
      ...inputValidationResult,
      idToken,
      group,
   }
}

/**
 * Extends the validation above and also fetches the account tokens
 * @param options
 */
export async function atsRequestValidationWithAccountToken<T extends object>(
   options: Options<T>
): Promise<
   T & AlwaysPresentArgs & { tokens: GroupATSIntegrationTokensDocument }
> {
   const data = await atsRequestValidation(options)

   // fetch account tokens (required to request information on behalf of the company)
   const accountTokens = await groupRepo.getATSIntegrationTokens(
      data.groupId,
      data.integrationId
   )
   if (!accountTokens) {
      logAndThrow("The requested integration is missing the account tokens", {
         groupId: data.groupId,
         integrationId: data.integrationId,
      })
   }

   return {
      ...data,
      tokens: accountTokens,
   }
}

/**
 * Creates a Job Application for the given User / Job
 *
 * Returns an object with all the related ATS ids created
 * @param job
 * @param userData
 * @param atsRepository
 * @param atsAccount
 * @param relations this object is mutated in place
 */
export async function createJobApplication(
   job: Job,
   userData: UserData,
   atsRepository: IATSRepository,
   atsAccount: GroupATSAccount,
   relations: UserATSRelations
): Promise<UserATSRelations> {
   // Fetch or create a Candidate object
   let candidate: Candidate
   if (relations.candidateId) {
      candidate = await atsRepository.getCandidate(relations.candidateId)
   } else {
      const specifics = getIntegrationSpecifics(atsAccount)
      if (!specifics.candidateCVAsANestedWrite) {
         // Some accounts do not support nested writes atm
         // We need to make separated requests
         candidate = await atsRepository.createCandidate(userData, {
            jobAssociation: job,
            extraRequiredData: atsAccount.extraRequiredData,
         })

         relations["candidateId"] = candidate.id ?? null

         let attachmentId: string | null = null
         try {
            attachmentId = await atsRepository.candidateAddCVAttachment(
               candidate.id,
               userData,
               {
                  extraRequiredData: atsAccount.extraRequiredData,
               }
            )
         } catch (e) {
            console.error("Error adding CV attachment to candidate", e)

            /**
             * Fail if the integration is not Workable
             *
             * There seems to be an issue between Merge & Workable when creating the CV attachment
             * as of 22/05/2023, we need to allow the candidate creation without the CV for the application to work
             */
            if (atsAccount.name?.toLowerCase() !== "workable") {
               throw e
            }
         }

         relations["cvAttachmentId"] = attachmentId ?? null
      } else {
         // candidate + cv attachment in the same request
         candidate = await atsRepository.createCandidate(userData, {
            jobAssociation: job,
            nestedWriteCV: true,
            extraRequiredData: atsAccount.extraRequiredData,
         })

         relations["candidateId"] = candidate.id ?? null
      }
   }

   // Create the application if needed
   if (candidate.applications.length === 0) {
      relations.jobApplications = {
         // Create the application
         [job.id]: await atsRepository.createApplication(candidate.id, job.id, {
            extraRequiredData: atsAccount.extraRequiredData,
         }),
      }
   } else {
      // application already in the candidate model
      const application = candidate.applications[0]
      relations.jobApplications = {
         [job.id]:
            typeof application === "string" ? application : application.id,
      }
   }

   return relations
}
