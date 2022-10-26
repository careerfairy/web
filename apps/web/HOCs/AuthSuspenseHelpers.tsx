import { useAuth } from "./AuthProvider"

/**
 * Wrapper component to ensure child components only render when
 * the user is logged in
 *
 * Useful to use with Suspense
 * @param props
 * @constructor
 */
export const EnsureUserIsLoggedIn = (props) => {
   const { isLoggedIn, authenticatedUser } = useAuth()

   if (!isLoggedIn || !authenticatedUser) {
      return null
   }

   return props.children
}

/**
 * Wrapper component to ensure child components only render when
 * the userData document is loaded
 *
 * Useful to use with Suspense
 * @param props
 * @constructor
 */
export const EnsureUserDataIsLoaded = (props) => {
   const { userData } = useAuth()

   if (!userData) {
      return null
   }

   return props.children
}
