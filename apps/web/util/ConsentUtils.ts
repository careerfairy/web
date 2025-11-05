import { getWindow } from "./PathUtils"

declare global {
   interface Window {
      UC_UI: UC_UI
   }
}

interface UC_UI {
   getServicesBaseInfo(): [
      { name: string; id: string; consent: { status: boolean } }
   ]
   acceptService(id: string): Promise<void>
   showSecondLayer(): void
   restartEmbeddings(): void
   closeCMP(): void
   isConsentRequired(): boolean
   areAllConsentsAccepted(): boolean
}

interface UCEventDetail {
   type: "ACCEPT_ALL" | "DENY_ALL" | "SAVE"
   event?: string
   [key: string]: any
}

/**
 * Name of the services on UC
 */
type UC_SERVICES = "Sentry Error Monitoring" | "Crisp Chat" | "Customer.io"

/**
 * Checks if a given service name has consent enabled
 *
 * Uses the usercentrics global variable UC_UI to look for consents
 * On server side, the consent is always enabled (for now)
 */
export const isConsentEnabled = (name: UC_SERVICES): boolean => {
   try {
      const data = getWindow()?.UC_UI?.getServicesBaseInfo()

      // UC info not available, fallback to enable
      if (!data) return true

      const found = data.find((e) => e.name === name)

      return found?.consent?.status
   } catch (e) {
      console.error(e)
   }

   return false
}

/**
 * Give consent to a given service name
 */
export const enableConsentFor = (name: UC_SERVICES): Promise<void> => {
   const uc = getWindow()?.UC_UI

   if (!uc) {
      return Promise.reject("window.UC_UI not found")
   }

   const service = uc.getServicesBaseInfo().find((s) => s.name === name)

   if (!service)
      return Promise.reject(`${name} not found in the usercentrics list`)

   return uc.acceptService(service.id)
}

/**
 * Programmatically close the UC privacy wall dialog
 */
export const closePrivacyWall = () => {
   getWindow()?.UC_UI?.closeCMP()
}

/**
 * Listen for Usercentrics consent events (accept/deny/save)
 * @param callback Function to call when user makes a consent decision
 * @returns Cleanup function to remove the event listener
 */
export const onConsentChange = (
   callback: (detail: UCEventDetail) => void
): (() => void) => {
   const win = getWindow()
   if (!win) return () => {}

   const handler = (event: CustomEvent<UCEventDetail>) => {
      if (event.detail) {
         callback(event.detail)
      }
   }

   // Usercentrics fires this event when users interact with the consent dialog
   win.addEventListener("UC_UI_CMP_EVENT", handler as EventListener)

   // Return cleanup function
   return () => {
      win.removeEventListener("UC_UI_CMP_EVENT", handler as EventListener)
   }
}

/**
 * Checks if the user has specifically declined (denied) consent
 *
 * Uses Usercentrics API methods to determine if:
 * 1. The user has made a consent decision (isConsentRequired = false)
 * 2. The user did NOT accept all consents (areAllConsentsAccepted = false)
 *
 * This means the user either declined all or made partial selections.
 *
 * @returns true if user has declined consent, false otherwise
 */
export const hasUserDeclinedConsent = (): boolean => {
   try {
      const ucUI = getWindow()?.UC_UI
      if (!ucUI) return false

      // Check if Usercentrics API methods are available
      if (
         typeof ucUI.isConsentRequired !== "function" ||
         typeof ucUI.areAllConsentsAccepted !== "function"
      ) {
         console.warn(
            "Usercentrics API methods not available. Cannot determine consent status."
         )
         return false
      }

      // User has declined if:
      // - They've made a decision (isConsentRequired = false)
      // - They didn't accept all (areAllConsentsAccepted = false)
      const hasDeclined =
         !ucUI.isConsentRequired() && !ucUI.areAllConsentsAccepted()

      return hasDeclined
   } catch (e) {
      console.error("Error checking declined consent:", e)
      return false
   }
}
