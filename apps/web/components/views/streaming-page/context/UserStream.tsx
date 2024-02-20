import React, { ReactNode, createContext, useContext } from "react"
import { UserStream } from "../types"

type UserStreamContextType<T extends UserStream | undefined> = T

const UserStreamContext =
   createContext<UserStreamContextType<UserStream | undefined>>(undefined)

type UserStreamProviderProps<T extends UserStream> = {
   user: T
   children: ReactNode
}

export function UserStreamProvider<T extends UserStream>({
   user,
   children,
}: UserStreamProviderProps<T>) {
   return (
      <UserStreamContext.Provider value={user}>
         {children}
      </UserStreamContext.Provider>
   )
}

export function useUserStream<T extends UserStream>(): T {
   const user = useContext(UserStreamContext)
   if (user === undefined) {
      throw new Error("useUserStream must be used within a UserStreamProvider")
   }
   return user as T
}
