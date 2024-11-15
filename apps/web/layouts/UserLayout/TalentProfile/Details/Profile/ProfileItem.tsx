import { Box, Stack, Typography } from "@mui/material"
import ConditionalWrapper from "components/util/ConditionalWrapper"
import { ReactElement } from "react"
import { PlusCircle } from "react-feather"
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
})

type Props = {
   title: string
   hasItems?: boolean
   handleAdd: () => void
   children: ReactElement
}

export const ProfileItem = ({
   hasItems,
   title,
   children,
   handleAdd,
}: Props) => {
   return (
      <Stack spacing={1.5}>
         <Stack direction={"row"} sx={styles.titleRoot}>
            <Typography variant="brandedBody" sx={styles.title}>
               {title}
            </Typography>
            <ConditionalWrapper condition={hasItems}>
               <Box
                  component={PlusCircle}
                  sx={styles.plusCircle}
                  onClick={handleAdd}
               />
            </ConditionalWrapper>
         </Stack>
         {children}
      </Stack>
   )
}
