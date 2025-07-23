import { styled } from "@mui/material/styles"
import { AdminContainer } from "../common/Container"

export const LivestreamAnalyticsContainer = styled(AdminContainer)(
   ({ theme }) => ({
      paddingTop: theme.spacing(1),
      paddingBottom: theme.spacing(2),
   })
)
