import { FC } from "react"
import { sxStyles } from "types/commonTypes"
import { Box, Stack, Typography } from "@mui/material"

const styles = sxStyles({
   container: {
      justifyContent: "center",
      marginTop: 4,
      marginBottom: 4,
   },
   pieChartPlaceholder: {
      width: "285px",
      height: "285px",
      borderRadius: "50%",
      backgroundColor: "#F4F4F4",
   },
})

const EmptyMessage = () => {
   return (
      <Typography>There is not enough data to show in this report.</Typography>
   )
}

type ChildrenWithDataArray = {
   data: any[]
}

type EmptyDataCheckerProps = {
   children: React.ReactElement<ChildrenWithDataArray>
}

const EmptyDataCheckerForBulletChart: FC<EmptyDataCheckerProps> = ({
   children,
}) => {
   return <>{children.props.data.length === 0 ? <EmptyMessage /> : children}</>
}

const EmptyDataCheckerForPieChart: FC<EmptyDataCheckerProps> = ({
   children,
}) => {
   return (
      <>
         {children.props.data.length === 0 ? (
            <>
               <Stack direction="row" sx={styles.container}>
                  <Box sx={styles.pieChartPlaceholder} />
               </Stack>
               <EmptyMessage />
            </>
         ) : (
            children
         )}
      </>
   )
}

export { EmptyDataCheckerForBulletChart, EmptyDataCheckerForPieChart }
