import BasePresenter from "../BasePresenter"
import { LivestreamEvent } from "./livestreams"

export default class LivestreamPresenter extends BasePresenter<LivestreamEvent> {
   constructor(public readonly model: LivestreamEvent) {
      super(model)
   }

   isLive(): boolean {
      return this.model.hasStarted && !this.model.hasEnded
   }

   isTest(): boolean {
      return this.model.test
   }

   getStartDateString(): Date {
      const nanoseconds = this.model.start?.seconds * 1000
      // convert nanoseconds to date string
      return new Date(nanoseconds)
   }

   /**
    * Elapsed minutes since the livestream started
    *
    * If the model is a BreakoutRoom document, the elapsed minutes
    * are related to the parent livestream document
    */
   elapsedMinutesSinceStart(): number {
      let start = this.model.start
      if ("parentLivestream" in this.model) {
         // breakout room support
         start = this.model["parentLivestream"].start
      }
      return Math.floor((Date.now() - start?.toDate().getTime()) / 1000 / 60)
   }
}
