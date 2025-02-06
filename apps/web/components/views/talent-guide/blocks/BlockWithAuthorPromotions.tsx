import { AuthorPromotionComponentType } from "data/hygraph/types"
import { ReactNode } from "react"
import { AuthorPromotion } from "./AuthorPromotion"

type WithPromotionProps = {
   promotionData?: AuthorPromotionComponentType
   children: ReactNode
}

export const BlockWithAuthorPromotion = ({
   promotionData,
   children,
}: WithPromotionProps) => {
   return promotionData ? (
      <AuthorPromotion {...promotionData}>{children}</AuthorPromotion>
   ) : (
      <>{children}</>
   )
}
