import { LoadingButton, LoadingButtonProps } from "@mui/lab"
import { Box } from "@mui/material"
import { Page, TalentGuideModule } from "data/hygraph/types"
import { useAuth } from "HOCs/AuthProvider"
import { useNextTalentGuideModule } from "hooks/useNextTalentGuideModule"
import Link from "next/link"
import { Play } from "react-feather"

const defaultProps: LoadingButtonProps = {
   variant: "contained",
   color: "primary",
   size: "large",
   fullWidth: true,
   endIcon: <Play />,
}

type Props = LoadingButtonProps & {
   allLevels: Page<TalentGuideModule>[]
}

export const StartNextLevelButton = ({ allLevels, ...props }: Props) => {
   const { authenticatedUser, isLoggedIn, isLoggedOut } = useAuth()

   const isLoadingAuth = !isLoggedOut && !isLoggedIn

   const { data, isLoading } = useNextTalentGuideModule(
      authenticatedUser.uid,
      undefined,
      { disabled: isLoadingAuth }
   )

   const hasNoNextLevel = data === null

   if (isLoading || isLoadingAuth) {
      return (
         <LoadingButton {...defaultProps} {...props} loading={isLoading}>
            Review Level {allLevels[0].slug}
         </LoadingButton>
      )
   }

   const link = hasNoNextLevel
      ? `/levels/${allLevels[0].slug}`
      : `/levels/${data.slug}`

   return (
      <Box width="100%" component={Link} href={link}>
         <LoadingButton {...defaultProps} {...props}>
            {hasNoNextLevel
               ? `Review Level ${allLevels[0].slug}`
               : `Start Level ${data.slug}`}
         </LoadingButton>
      </Box>
   )
}
