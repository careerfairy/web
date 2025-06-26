import branch, { BranchEvent } from "react-native-branch"

class BranchService {
   private static instance: BranchService

   private constructor() {}

   static getInstance(): BranchService {
      if (!BranchService.instance) {
         BranchService.instance = new BranchService()
      }
      return BranchService.instance
   }

   async initialize(): Promise<ReturnType<typeof branch.subscribe>> {
      return branch.subscribe({
         onOpenStart: (params) => {
            console.log("Branch session starting", params)
         },
         onOpenComplete: (params) => {
            console.log("Branch session opened", params)
         },
      })
   }

   async identifyUser(userId: string): Promise<void> {
      console.log(`Branch: set identity to ${userId}`)
      return branch.setIdentity(userId)
   }

   async logout(): Promise<void> {
      console.log("Branch: user logged out")
      return branch.logout()
   }

   async trackEvent(
      eventName: string,
      properties: Record<string, any>
   ): Promise<void> {
      console.log(`Branch: tracking event ${eventName}`, properties)

      // Map custom event names to Branch standard events
      const branchEventName = this.mapToStandardEvent(eventName)

      const event = new BranchEvent(branchEventName, undefined, properties)

      await event.logEvent()
   }

   private mapToStandardEvent(eventName: string): string {
      const eventMapping: Record<string, string> = {
         login_complete: BranchEvent.Login,
         signup_complete_redirect: BranchEvent.CompleteRegistration,
      }

      return eventMapping[eventName] || eventName
   }
}

export const branchTracking = BranchService.getInstance()
