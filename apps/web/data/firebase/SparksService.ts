import { ISparksRepository } from "@careerfairy/shared-lib/sparks/SparksRepository"
import { sparksRepo } from "data/RepositoryInstances"
import { Functions, httpsCallable } from "firebase/functions"
import { FunctionsInstance } from "./FirebaseInstance"
import { AddSparkSparkData } from "@careerfairy/shared-lib/sparks/sparks"

export class SparksService {
   constructor(
      private readonly repository: ISparksRepository,
      private readonly functions: Functions
   ) {}
   async createSpark(data: AddSparkSparkData) {
      return httpsCallable(this.functions, "createSpark")(data)
   }
}

export const sparkService = new SparksService(
   sparksRepo,
   FunctionsInstance as any
)

export default SparksService
