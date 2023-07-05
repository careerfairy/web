import { Box, Grid, Skeleton, Stack, Typography } from "@mui/material"
import { sxStyles } from "../../../../../../../types/commonTypes"
import { alpha, SxProps } from "@mui/material/styles"
import LinearProgress, {
   linearProgressClasses,
} from "@mui/material/LinearProgress"
import { DefaultTheme } from "@mui/styles"

const cardVotesStyles = sxStyles({
   entryRoot: {
      border: (theme) =>
         `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
      borderRadius: 4,
      p: 2,
      flex: 1,
   },
   optionProgress: {
      borderRadius: 2,
      backgroundColor: "transparent",
      border: `1px solid #EDE7FD`,
      [`& .${linearProgressClasses.bar}`]: {
         backgroundColor: "#EDE7FD",
      },
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      height: "100%",
   },
   optionRoot: {
      minHeight: 50,
      position: "relative",
   },
   optionDetails: {
      display: "flex",
      position: "relative",
      py: 1,
      px: 1.5,
      zIndex: 1,
   },
   count: {
      borderRadius: "50%",
      position: "relative",
      backgroundColor: "white",
      color: "secondary.main",
      width: 30,
      height: 30,
      minWidth: 30,
      minHeight: 30,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      "& p": {
         position: "absolute",
      },
   },
   gridItem: {
      display: "flex",
   },
   optionSkeleton: {
      borderRadius: 2,
   },
})

type SectionContainerProps = {
   title: string
   children: React.ReactNode
}

export const SectionContainer = ({
   children,
   title,
}: SectionContainerProps) => {
   return (
      <Stack spacing={2}>
         <Stack direction="row" alignItems="center" spacing={2}>
            <Typography variant="h5" fontWeight={600}>
               {title}
            </Typography>
         </Stack>
         <Box>
            <Grid container spacing={2}>
               {children}
            </Grid>
         </Box>
      </Stack>
   )
}

type CardVotesProps = {
   totalVotes: string | number
   title: string
   sxRoot?: SxProps<DefaultTheme>
   children: React.ReactNode
}

export const CardVotes = ({
   title,
   totalVotes,
   children,
   sxRoot,
}: CardVotesProps) => {
   return (
      <Grid sx={cardVotesStyles.gridItem} item xs={12} md={6} lg={4}>
         <Stack
            spacing={1}
            sx={[
               cardVotesStyles.entryRoot,
               ...(Array.isArray(sxRoot) ? sxRoot : [sxRoot]),
            ]}
         >
            <Typography variant="body2">{totalVotes} votes</Typography>
            <Typography variant="h6" fontWeight={600}>
               {title}
            </Typography>
            <Stack spacing={2}>{children}</Stack>
         </Stack>
      </Grid>
   )
}

type CardVotesOptionProps = {
   count: number
   title: string
   total: number
   sxProgress?: SxProps<DefaultTheme>
   sxText?: SxProps<DefaultTheme>
}

export const CardVotesOption = ({
   count,
   title,
   total,
   sxProgress,
   sxText,
}: CardVotesOptionProps) => {
   return (
      <Box sx={cardVotesStyles.optionRoot}>
         <Stack
            spacing={1.1}
            direction="row"
            alignItems="center"
            sx={cardVotesStyles.optionDetails}
         >
            <Box
               sx={[
                  cardVotesStyles.count,
                  ...(Array.isArray(sxText) ? sxText : [sxText]),
               ]}
            >
               <Typography variant="body2" fontWeight={600}>
                  {count ?? 0}
               </Typography>
            </Box>
            <Typography fontSize="0.95rem" lineHeight="1.5rem" variant="body2">
               {title}
            </Typography>
         </Stack>
         <LinearProgress
            sx={[
               cardVotesStyles.optionProgress,
               ...(Array.isArray(sxProgress) ? sxProgress : [sxProgress]),
            ]}
            variant="determinate"
            value={count ? (count / total) * 100 : 0}
         />
      </Box>
   )
}

export const CardVotesSectionSkeleton = () => {
   return (
      <Grid sx={cardVotesStyles.gridItem} item xs={12} md={6} lg={4}>
         <Stack spacing={2}>
            <Stack direction="row" alignItems="center" spacing={2}>
               <Skeleton variant="text" width={200} height={40} />
            </Stack>
            <Box>
               <Grid container spacing={2}>
                  {Array.from({ length: 3 }).map((_, i) => (
                     <Grid
                        sx={cardVotesStyles.gridItem}
                        key={i}
                        item
                        xs={12}
                        md={6}
                        lg={4}
                     >
                        <VoteOptionSkeleton />
                     </Grid>
                  ))}
               </Grid>
            </Box>
         </Stack>
      </Grid>
   )
}

const VoteOptionSkeleton = () => {
   return (
      <Stack spacing={1} sx={cardVotesStyles.entryRoot}>
         <Typography variant="body2">
            <Skeleton variant="text" width={40} />
         </Typography>
         <Typography variant="h6" width="80%">
            <Skeleton width="100%" />
         </Typography>
         <Stack spacing={2}>
            {Array.from({ length: 3 }).map((_, i) => (
               <Skeleton
                  key={i}
                  sx={cardVotesStyles.optionSkeleton}
                  variant="rectangular"
                  width={`calc(100% * ${Math.random() * (1 - 0.5) + 0.5})`}
                  height={50}
               />
            ))}
         </Stack>
      </Stack>
   )
}
