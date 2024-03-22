export type PlanFeatureItem = {
   enabled: boolean
   name: string
}

export const PREMIUM_FEATURES: PlanFeatureItem[] = [
   {
      enabled: true,
      name: "Unlimited Sparks slots",
   },
   {
      enabled: true,
      name: "Unlimited featured employees",
   },
   {
      enabled: true,
      name: "General analytics",
   },
   {
      enabled: true,
      name: "Reach and audience analytics",
   },
   {
      enabled: true,
      name: "Competitor analytics",
   },
   {
      enabled: true,
      name: "Dedicated KAM",
   },
   {
      enabled: true,
      name: "11'000 - 13’000 Exposure range",
   },
]
export const ADVANCED_FEATURES: PlanFeatureItem[] = [
   {
      enabled: true,
      name: "10 Sparks slots",
   },
   {
      enabled: true,
      name: "Up to 7 featured employees",
   },
   {
      enabled: true,
      name: "General analytics",
   },
   {
      enabled: true,
      name: "Reach and audience analytics",
   },
   {
      enabled: false,
      name: "Competitor analytics",
   },
   {
      enabled: true,
      name: "Dedicated KAM",
   },
   {
      enabled: true,
      name: "7'000 - 8’000 Exposure range",
   },
]
export const ESSENTIAL_FEATURES: PlanFeatureItem[] = [
   {
      enabled: true,
      name: "6 Sparks slots",
   },
   {
      enabled: true,
      name: "General analytics",
   },
   {
      enabled: true,
      name: "Up to 4 featured employees",
   },
   {
      enabled: false,
      name: "Reach and audience analytics",
   },
   {
      enabled: false,
      name: "Competitor analytics",
   },
   {
      enabled: false,
      name: "Dedicated KAM",
   },
   {
      enabled: true,
      name: "4'000 - 5’000 Exposure range",
   },
]
