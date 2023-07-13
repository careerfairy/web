import { ISparksRepository } from "@careerfairy/shared-lib/sparks/SparksRepository"
import { sparksRepo } from "data/RepositoryInstances"
import { Functions } from "firebase/functions"
import { FunctionsInstance } from "./FirebaseInstance"

export class SparksService {
   constructor(
      private readonly repository: ISparksRepository,
      private readonly functions: Functions
   ) {
      // client methods for Sparks go here...
   }
}

export const rewardService = new SparksService(
   sparksRepo,
   FunctionsInstance as any
)

export default SparksService
