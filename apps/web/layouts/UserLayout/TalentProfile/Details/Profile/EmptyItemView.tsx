import { Box, Button, Stack, Typography } from "@mui/material"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   emptyDetailsRoot: {
      alignItems: "center",
      width: {
         xs: "280px",
         sm: "280px",
         md: "400px",
      },
   },
   emptyTitle: {
      fontWeight: 600,
      textAlign: "center",
   },
   emptyDescription: {
      fontWeight: 400,
      textAlign: "center",
   },
   addButton: {
      p: "8px 16px",
   },
})

type EmptyItemViewProps = {
   title: string
   description: string
   addButtonText?: string
   handleAdd?: () => void
   icon: JSX.Element
}

export const EmptyItemView = ({
   title,
   description,
   addButtonText,
   handleAdd,
   icon,
}: EmptyItemViewProps) => {
   return (
      <Stack alignItems={"center"} spacing={2}>
         <Box color={"primary.main"}>{icon}</Box>
         <Stack spacing={2} sx={styles.emptyDetailsRoot}>
            <Stack alignItems={"center"}>
               <Typography
                  sx={styles.emptyTitle}
                  color="neutral.800"
                  variant="brandedBody"
               >
                  {title}
               </Typography>
               <Typography
                  sx={styles.emptyDescription}
                  color={"neutral.700"}
                  variant="small"
               >
                  {description}
               </Typography>
            </Stack>
            {handleAdd ? (
               <Button
                  variant="contained"
                  color="primary"
                  sx={styles.addButton}
                  onClick={handleAdd}
               >
                  {addButtonText}
               </Button>
            ) : null}
         </Stack>
      </Stack>
   )
}
