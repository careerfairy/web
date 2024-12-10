import { Box, Stack, Typography } from "@mui/material"
import ConditionalWrapper from "components/util/ConditionalWrapper"
import { ReactElement } from "react"
import { Icon, PlusCircle } from "react-feather"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   titleRoot: {
      pr: "12px",
      alignItems: "center",
      justifyContent: "space-between",
   },
   title: {
      fontWeight: 600,
      color: (theme) => theme.palette.neutral[900],
   },
   plusCircle: {
      width: "20px",
      height: "20px",
      color: (theme) => theme.palette.neutral[600],
      "&:hover": {
         cursor: "pointer",
      },
   },
   count: {
      fontWeight: 400,
      color: (theme) => theme.palette.neutral[900],
   },
})

type Props = {
   title: string
   showAddIcon?: boolean
   addIcon?: Icon
   handleAdd?: () => void
   count?: number
   children: ReactElement
}

export const ProfileSection = ({
   showAddIcon,
   addIcon,
   title,
   children,
   handleAdd,
   count,
}: Props) => {
   return (
      <Stack spacing={1.5}>
         <Stack direction={"row"} sx={styles.titleRoot}>
            <Typography variant="brandedBody" sx={styles.title}>
               {title}
               {count !== undefined ? (
                  <Typography
                     variant="small"
                     sx={styles.count}
                  >{` (${count})`}</Typography>
               ) : null}
            </Typography>
            <ConditionalWrapper condition={showAddIcon}>
               <Box
                  component={addIcon ?? PlusCircle}
                  sx={styles.plusCircle}
                  onClick={handleAdd}
               />
            </ConditionalWrapper>
         </Stack>
         {children}
      </Stack>
   )
}
