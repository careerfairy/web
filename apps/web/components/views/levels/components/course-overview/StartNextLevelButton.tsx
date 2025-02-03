import { LoadingButton, LoadingButtonProps } from "@mui/lab"
import { Box } from "@mui/material"
import { Page, TalentGuideModule } from "data/hygraph/types"
import { useAuth } from "HOCs/AuthProvider"
import { useNextTalentGuideModule } from "hooks/useNextTalentGuideModule"
import Link from "next/link"
import { useRouter } from "next/router"
import { Play } from "react-feather"
import { buildLevelQueryParams } from "util/routes"

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
   const { query } = useRouter()

   const isLoadingAuth = !isLoggedOut && !isLoggedIn

   const { data, isLoading: isLoadingNextLevel } = useNextTalentGuideModule(
      authenticatedUser.uid,
      undefined,
      { disabled: isLoadingAuth }
   )

   const isLoading = isLoadingAuth || isLoadingNextLevel

   const hasNoNextLevel = data === null

   if (isLoading) {
      return (
         <LoadingButton {...defaultProps} {...props} loading={isLoading}>
            Level {allLevels[0].slug} wiederholen
         </LoadingButton>
      )
   }

   const levelId = hasNoNextLevel ? allLevels[0].slug : data.slug

   return (
      <Box
         width="100%"
         component={Link}
         {...buildLevelQueryParams({
            levelId,
            currentQuery: query,
         })}
      >
         <LoadingButton {...defaultProps} {...props} loading={isLoading}>
            {hasNoNextLevel
               ? `Level ${allLevels[0].slug} wiederholen`
               : `Level ${data.slug} starten`}
         </LoadingButton>
      </Box>
   )
}
