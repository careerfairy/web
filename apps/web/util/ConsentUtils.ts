import { getWindow } from "./PathUtils"

declare global {
   interface Window {
      UC_UI: UC_UI
   }
}

interface UC_UI {
   getServicesBaseInfo(): [{ name: string; consent: { status: boolean } }]
}

/**
 * Name of the services on UC
 *
 * Union
 */
export const UC_SERVICES = "Sentry Error Monitoring"

/**
 * Checks if a given service name has consent enabled
 *
 * Uses the usercentrics global variable UC_UI to look for consents
 * On server side, the consent is always enabled (for now)
 */
export const isConsentEnabled = (name: typeof UC_SERVICES): boolean => {
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
