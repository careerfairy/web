import { Group } from "@careerfairy/shared-lib/groups"
import useIsMobile from "components/custom-hook/useIsMobile"
import { ContentCarousel } from "components/views/common/carousels/ContentCarousel"
import { ReactNode } from "react"
import { CompaniesCarouselSkeleton } from "./CompaniesCarouselSkeleton"
import { CompanyCard } from "./CompanyCard"

export const CompaniesCarousel = ({
   companies,
   title,
   isLoading,
}: {
   companies: Group[]
   title?: string | ReactNode
   isLoading?: boolean
}) => {
   const isMobile = useIsMobile()

   if (isLoading) {
      return <CompaniesCarouselSkeleton title={title} />
   }

   return (
      <ContentCarousel
         slideWidth={254}
         headerTitle={title}
         disableArrows={isMobile}
         viewportSx={{
            // hack to ensure overflow visibility with parent padding
            paddingX: "16px",
            marginX: "-16px",
            width: "calc(100% + 32px)", // Account for parent container padding (16px on each side)
         }}
         containerSx={{
            gap: 1,
         }}
         emblaProps={{
            emblaOptions: {
               dragFree: true,
               skipSnaps: true,
               loop: false,
               axis: "x",
            },
         }}
      >
         {companies.map((company) => (
            <CompanyCard key={company.id} company={company} />
         ))}
      </ContentCarousel>
   )
}
