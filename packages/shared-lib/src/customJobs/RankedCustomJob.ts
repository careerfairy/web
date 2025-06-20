import { CustomJob } from "./customJobs"

export class RankedCustomJob {
   public points: number
   public id: string

   constructor(public model: CustomJob) {
      this.model = model
      this.id = model.id
      this.points = 0
   }

   getId(): string {
      return this.id
   }

   getCompanyCountryId(): string {
      return this.model.group.companyCountry.id
   }

   static create(customJob: CustomJob) {
      return new RankedCustomJob(customJob)
   }

   addPoints(points: number) {
      this.points += points
   }

   getPoints() {
      return this.points
   }

   removePoints(points: number) {
      this.points -= points
   }

   setPoints(points: number) {
      this.points = points
   }
}
