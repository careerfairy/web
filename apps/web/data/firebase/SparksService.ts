import { ISparkRepository } from "@careerfairy/shared-lib/sparks/SparkRepository"
import { sparkRepo } from "data/RepositoryInstances"
import { Functions, httpsCallable } from "firebase/functions"
import { FunctionsInstance } from "./FirebaseInstance"
import {
   AddSparkSparkData,
   DeleteSparkData,
   UpdateSparkData,
} from "@careerfairy/shared-lib/sparks/sparks"

export class SparksService {
   constructor(
      private readonly repository: ISparkRepository,
      private readonly functions: Functions
   ) {}
   async createSpark(data: AddSparkSparkData) {
      return httpsCallable<AddSparkSparkData, void>(
         this.functions,
         "createSpark"
      )(data)
   }

   async updateSpark(data: UpdateSparkData) {
      return httpsCallable<UpdateSparkData, void>(
         this.functions,
         "updateSpark"
      )(data)
   }

   async deleteSpark(data: DeleteSparkData) {
      return httpsCallable<DeleteSparkData, void>(
         this.functions,
         "deleteSpark"
      )(data)
   }
}

export const sparkService = new SparksService(
   sparkRepo,
   FunctionsInstance as any
)

export default SparksService
