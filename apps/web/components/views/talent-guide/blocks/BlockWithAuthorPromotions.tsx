import { AuthorPromotionComponentType } from "data/hygraph/types"
import { ReactNode, useMemo } from "react"
import { AuthorPromotion } from "./AuthorPromotion"

type WithPromotionProps = {
   promotionData?: AuthorPromotionComponentType
   children: ReactNode
}

export const BlockWithAuthorPromotion = ({
   promotionData,
   children,
}: WithPromotionProps) => {
   const isAuthorPromotion = useMemo(() => {
      return (
         promotionData?.authorName &&
         promotionData?.authorAvatar &&
         promotionData?.backgroundColor
      )
   }, [promotionData])

   return isAuthorPromotion ? (
      <AuthorPromotion {...promotionData}>{children}</AuthorPromotion>
   ) : (
      <>{children}</>
   )
}
