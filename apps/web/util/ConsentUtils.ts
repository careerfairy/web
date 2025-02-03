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
