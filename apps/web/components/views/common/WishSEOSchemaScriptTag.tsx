import React from "react"
import { Review } from "schema-dts"

interface WishSEOProps {
   wishDescription: string
   wishCreationDate: Date | null
   wishUpdateDate: Date | null
   wishAuthor: string
   wishRating: string
   wishRatingCount: number
}
const WishSEOSchemaScriptTag = ({
   wishDescription,
   wishCreationDate,
   wishUpdateDate,
   wishAuthor,
   wishRating,
   wishRatingCount,
}: WishSEOProps) => {
   const review: Review = {
      "@type": "Review",
      description: wishDescription,
      // @ts-ignore
      ratingValue: wishRating,
      ratingCount: wishRatingCount,
      worstRating: "1",
      bestRating: "5",
      ratingExplanation:
         "This rating measures how much users would like to see this wish come true",
      itemReviewed: {
         "@type": "Organization",
         name: "CareerFairy Wish",
         image: "https://www.careerfairy.io/logo_teal.svg",
      },
      publisher: {
         "@type": "Organization",
         name: "CareerFairy",
         image: "https://www.careerfairy.io/logo_teal.svg",
      },
      author: {
         "@type": "Person",
         name: wishAuthor,
      },
      dateCreated: wishCreationDate?.toISOString(),
      dateModified: wishUpdateDate?.toISOString(),
   }

   return (
      <script
         type="application/ld+json"
         dangerouslySetInnerHTML={{
            __html: JSON.stringify({
               "@context": "https://schema.org",
               ...review,
            }),
         }}
      />
   )
}

export default WishSEOSchemaScriptTag
