import { Box, Stack, Typography } from "@mui/material"

const EmptyMessage = () => {
   return (
      <Typography>There is not enough data to show in this report.</Typography>
   )
}

const EmptyDataCheckerForBulletChart = ({ children }) => {
   return <>{children.props.data.length === 0 ? <EmptyMessage /> : children}</>
}

const EmptyDataCheckerForPieChart = ({ children }) => {
   const containerSize = "285px"
   const margin = 4
   return (
      <>
         {children.props.data.length === 0 ? (
            <>
               <Stack
                  direction="row"
                  justifyContent="center"
                  marginTop={margin}
                  marginBottom={margin}
               >
                  <Box
                     sx={{
                        width: containerSize,
                        height: containerSize,
                        borderRadius: "50%",
                        backgroundColor: "#F4F4F4",
                     }}
                  />
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
