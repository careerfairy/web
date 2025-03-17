import { clearFirestoreCache } from "data/util/authUtil"
import { Auth } from "firebase/auth"
import { Functions, httpsCallable } from "firebase/functions"
import { AuthInstance, FunctionsInstance } from "./FirebaseInstance"

export class UserService {
   constructor(
      private readonly functions: Functions,
      private readonly auth: Auth
   ) {}

   async deleteCurrentUser() {
      await httpsCallable(this.functions, "deleteLoggedInUserAccount_v2")()
      await this.auth.signOut()
      clearFirestoreCache()
   }
}

export const userService = new UserService(
   FunctionsInstance as any,
   AuthInstance as any
)

export default UserService
