import { SerializedSpark, SparkPresenter } from "@careerfairy/shared-lib/sparks/SparkPresenter"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"

const STORAGE_KEY = "portalPublicSparks"

type StoredPortalSparks = {
   updatedAt: number
   sparks: SerializedSpark[]
}

export const storePortalSparks = (sparks: Spark[]) => {
   if (typeof window === "undefined") return

   try {
      if (!sparks?.length) {
         sessionStorage.removeItem(STORAGE_KEY)
         return
      }

      const serializedSparks = sparks.map((spark) =>
         SparkPresenter.serialize(spark)
      )

      const payload: StoredPortalSparks = {
         updatedAt: Date.now(),
         sparks: serializedSparks,
      }

      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
   } catch (error) {
      console.error("Failed to store portal sparks", error)
   }
}

export const readPortalSparks = (): StoredPortalSparks | null => {
   if (typeof window === "undefined") return null

   try {
      const raw = sessionStorage.getItem(STORAGE_KEY)

      if (!raw) return null

      const parsed = JSON.parse(raw) as StoredPortalSparks

      if (!Array.isArray(parsed?.sparks) || parsed.sparks.length === 0) {
         return null
      }

      return parsed
   } catch (error) {
      console.error("Failed to read portal sparks", error)
      return null
   }
}

export const clearPortalSparks = () => {
   if (typeof window === "undefined") return

   try {
      sessionStorage.removeItem(STORAGE_KEY)
   } catch (error) {
      console.error("Failed to clear portal sparks", error)
   }
}
