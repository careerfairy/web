import React, { Fragment, memo } from "react"
import { SidePanelView } from "./SidePanelView"

import { UserLivestreamData } from "@careerfairy/shared-lib/livestreams"
import { Box, CircularProgress, Stack, Typography } from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { useParticipatingUsers } from "components/custom-hook/streaming/useParticipatingUsers"
import { Eye } from "react-feather"
import AutoSizer from "react-virtualized-auto-sizer"
import { FixedSizeList } from "react-window"
import { useCurrentViewCount } from "store/selectors/streamingAppSelectors"
import { sxStyles } from "types/commonTypes"
import { useStreamingContext } from "../../context"
import UserAvatar from "components/views/common/UserAvatar"
import UserPresenter from "@careerfairy/shared-lib/users/UserPresenter"
import { getMaxLineStyles } from "components/helperFunctions/HelperFunctions"

const styles = sxStyles({
   contentWrapper: {
      p: 0,
   },
   viewer: {
      py: 1,
      px: 2,
   },
   loader: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100%",
   },
})

export const ViewersPanel = () => {
   const viewCount = useCurrentViewCount()

   return (
      <SidePanelView
         id="viewer-panel"
         title={
            <Fragment>
               Viewers:{" "}
               <Box component="span" fontWeight={600}>
                  {viewCount}
               </Box>
            </Fragment>
         }
         icon={<Eye />}
         contentWrapperStyles={styles.contentWrapper}
      >
         <SuspenseWithBoundary fallback={<Loader />}>
            <Content />
         </SuspenseWithBoundary>
      </SidePanelView>
   )
}

const Loader = () => (
   <Box sx={styles.loader}>
      <CircularProgress />
   </Box>
)

const Content = () => {
   const { livestreamId } = useStreamingContext()
   const { data: users } = useParticipatingUsers(livestreamId)

   const userCount = users?.length || 0

   return (
      <AutoSizer>
         {({ height, width }) => (
            <FixedSizeList
               itemSize={66}
               itemCount={userCount}
               height={height}
               width={width}
            >
               {({ style, index }) => (
                  <Viewer
                     key={users[index].id}
                     memberData={users[index]}
                     style={style}
                  />
               )}
            </FixedSizeList>
         )}
      </AutoSizer>
   )
}

type ViewerProps = {
   memberData: UserLivestreamData
   style: React.CSSProperties
}

const Viewer = memo(({ memberData, style }: ViewerProps) => {
   const user = new UserPresenter(memberData.user)
   return (
      <Stack direction="row" spacing={0.75} style={style} sx={styles.viewer}>
         <UserAvatar size={44} data={memberData.user} />
         <Stack>
            <Typography
               sx={getMaxLineStyles(1)}
               variant="medium"
               color="neutral.800"
               fontWeight={600}
            >
               {user.getDisplayName()}
            </Typography>
            <Typography
               sx={getMaxLineStyles(1)}
               variant="small"
               color="neutral.400"
            >
               {user.getBackground()}
            </Typography>
         </Stack>
      </Stack>
   )
})

Viewer.displayName = "Viewer"
