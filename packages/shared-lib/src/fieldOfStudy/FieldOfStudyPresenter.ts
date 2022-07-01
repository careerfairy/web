import BasePresenter from "../BasePresenter"
import { FieldOfStudy } from "./fieldOfStudy"
import "@tensorflow/tfjs"
import * as use from "@tensorflow-models/universal-sentence-encoder"

export default class FieldOfStudyPresenter extends BasePresenter<FieldOfStudy> {
   constructor(public readonly model: FieldOfStudy) {
      super(model)
   }

   async findBestFieldOfStudyFit(
      targetFieldOfStudyLabel?: FieldOfStudy["label"],
      potentialFieldsOfStudy?: string[]
   ) {
      use.load().then((model) => {
         const sentences = ["Hello.", "How are you?", "helicopter"]
         console.log("-> sentences", sentences)
         model.embed(sentences).then((embeddings) => {
            console.log("-> embeddings", embeddings.cos)
            console.log("-> embeddings.rank", embeddings.rank)
            console.log("-> embeddings.rankType", embeddings.rankType)
            embeddings.print(true /* verbose */)
         })
      })
   }

   async getEmbeddings(
      targetFieldOfStudyLabel: FieldOfStudy["label"],
      potentialFieldsOfStudy: string[],
      callback?
   ) {
      // const sets = potentialFieldsOfStudy.map((fieldOfStudy) => [
      //    targetFieldOfStudyLabel,
      //    fieldOfStudy,
      // ])
      const model = await use.load()
      const embedding = await model.embed([
         targetFieldOfStudyLabel,
         ...potentialFieldsOfStudy,
      ])
      let cosine_similarity_matrix = this.cosine_similarity_matrix(
         embedding.arraySync()
      )
      console.log("--> cosine_similarity_matrix", cosine_similarity_matrix)
      // const embeddings = await Promise.all(sets.map((set) => model.embed(set)))
      // console.log("-> embeddings", embeddings)
      // embeddings.forEach((embedding) => {
      //    let cosine_similarity_matrix = this.cosine_similarity_matrix(
      //       embedding.arraySync()
      //    )
      //    console.log("--> cosine_similarity_matrix", cosine_similarity_matrix)
      // })
      // return embeddings
   }
   cosine_similarity_matrix(matrix) {
      let cosine_similarity_matrix = []
      for (let i = 0; i < matrix.length; i++) {
         let row = []
         for (let j = 0; j < i; j++) {
            row.push(cosine_similarity_matrix[j][i])
         }
         row.push(1)
         for (let j = i + 1; j < matrix.length; j++) {
            row.push(this.similarity(matrix[i], matrix[j]))
         }
         cosine_similarity_matrix.push(row)
      }
      return cosine_similarity_matrix
   }
   similarity(a, b) {
      var magnitudeA = Math.sqrt(this.dot(a, a))
      var magnitudeB = Math.sqrt(this.dot(b, b))
      if (magnitudeA && magnitudeB)
         return this.dot(a, b) / (magnitudeA * magnitudeB)
      else return false
   }
   dot(a, b) {
      var hasOwnProperty = Object.prototype.hasOwnProperty
      var sum = 0
      for (var key in a) {
         if (hasOwnProperty.call(a, key) && hasOwnProperty.call(b, key)) {
            sum += a[key] * b[key]
         }
      }
      return sum
   }
}
