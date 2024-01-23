import { Badge, BadgeProps, styled } from "@mui/material"

import { shouldForwardProp } from "@careerfairy/shared-ui"

const positionTransforms: Record<string, string> = {
   topRight: "scale(1) translate(30%, -30%)",
   topLeft: "scale(1) translate(-30%, -30%)",
   bottomRight: "scale(1) translate(30%, 30%)",
   bottomLeft: "scale(1) translate(-30%, 30%)",
}

const getPositionTransform = (
   anchorOrigin?: BadgeProps["anchorOrigin"]
): string => {
   // if no anchorOrigin is provided, we assume it's top right (default)
   if (!anchorOrigin) return positionTransforms.topRight

   const key = `${anchorOrigin.vertical}${
      anchorOrigin.horizontal.charAt(0).toUpperCase() +
      anchorOrigin.horizontal.slice(1)
   }`

   return positionTransforms[key]
}

export const BrandedBadge = styled(Badge, {
   shouldForwardProp: shouldForwardProp([]),
})(({ theme, anchorOrigin }) => {
   return {
      "& .MuiBadge-badge": {
         boxShadow: `0 0 0 1px ${theme.brand.white[50]}`,
         transform: getPositionTransform(anchorOrigin),
      },
   }
})
