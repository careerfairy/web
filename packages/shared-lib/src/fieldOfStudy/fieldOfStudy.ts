import { Identifiable } from "../commonTypes"

export type FieldOfStudy = Identifiable & {
   name: string
}

export type LevelOfStudy = FieldOfStudy

export const levelsOfStudyOrderMap: Record<string, number> = {
   bachelor: 1,
   master: 2,
   phd: 3,
}

export const mapPartnershipFieldsOfStudy = (
   partnerFieldOfStudy: string
): string[] => {
   switch (partnerFieldOfStudy) {
      case "wirtschaftswissenschaften":
         return [
            "business_administration_economics",
            "finance",
            "luxury_fashion",
            "marketing",
            "public_administration",
            "systems_science",
            "transportation",
         ]

      case "ingenieurwissenschaften":
         return [
            "architecture_and_design",
            "business_engineering",
            "chemical_engineering",
            "civil_engineering",
            "electrical_engineering",
            "materials_science_and_engineering",
            "mechanical_engineering",
            "space_sciences",
         ]

      case "sprach_kulturwissenschaften":
         return [
            "journalism_media_studies_and_communication",
            "linguistics_and_languages",
         ]

      case "mathematik_naturwissenschaften":
         return [
            "astronomy",
            "biology",
            "chemistry",
            "computer_science",
            "earth_sciences",
            "life_sciences",
            "mathematics",
         ]

      case "medizin_gesundheitswissenschaften_psychologie_sport":
         return [
            "human_physical_performance_and_recreation",
            "medicine",
            "psychology",
         ]

      case "rechts_sozialwissenschaften":
         return [
            "anthropology",
            "archaeology",
            "divinity",
            "history",
            "law",
            "military_sciences",
            "philosophy",
            "political_science",
            "religion",
            "sociology",
         ]

      case "kunst_musik":
         return ["literature_arts"]

      case "erziehungs_bildungswissenschaften_lehrämter":
         return ["education"]

      case "agrar_forst_ernährungswissenschaften":
         return [
            "agriculture",
            "environmental_studies_and_forestry",
            "geography",
         ]

      default:
         return []
   }
}
