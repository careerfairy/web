import branch from "react-native-branch"

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
}

export const branchTracking = BranchService.getInstance()
