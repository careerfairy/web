import { createGenericConverter } from "@careerfairy/shared-lib/BaseFirebaseRepository"
import { Group } from "@careerfairy/shared-lib/groups"
import Alert, { alertClasses } from "@mui/material/Alert"
import { Button, Skeleton } from "@mui/material"
import { FormControl } from "@mui/material"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import { doc } from "firebase/firestore"
import { useRouter } from "next/router"
import { FC, useCallback } from "react"
import { useFirestore, useFirestoreDocDataOnce } from "reactfire"
import { sxStyles } from "types/commonTypes"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"

const styles = sxStyles({
   text: {
      display: "inline-block",
   },
   alert: {
      [`& .${alertClasses.message}`]: {
         alignSelf: "self-end",
      },
   },
})

const ActiveCompanyFilter: FC = () => {
   const {
      query: { companyId },
   } = useRouter()

   return companyId ? (
      <SuspenseWithBoundary
         fallback={<Skeleton variant="text" width="80%" height={30} />}
      >
         <Filter companyId={companyId as string} />
      </SuspenseWithBoundary>
   ) : null
}

type FilterProps = {
   companyId: string
}

const Filter: FC<FilterProps> = ({ companyId }) => {
   const { data: company } = useCompanyOnce(companyId)
   const { replace, query, pathname } = useRouter()

   const handleRemoveCompanyFilter = useCallback(() => {
      const queryCopy = { ...query }
      delete queryCopy.companyId
      replace(
         {
            pathname,
            query: queryCopy,
         },
         undefined,
         { shallow: true }
      )
   }, [query, replace, pathname])

   // If the company data is empty, render a different message and a clear button
   if (!company) {
      return (
         <FormControl key="recorded-only" variant={"outlined"} fullWidth>
            <Box
               display={"flex"}
               justifyContent={"space-between"}
               alignItems={"center"}
            >
               <Typography
                  sx={styles.text}
                  mt={1}
                  variant={"body1"}
                  fontWeight={300}
               >
                  No active company matches your filter. Please clear the filter
                  and try again.
               </Typography>
               <Button
                  variant="text"
                  color="secondary"
                  onClick={handleRemoveCompanyFilter}
               >
                  Clear Filter
               </Button>
            </Box>
         </FormControl>
      )
   }

   return (
      <FormControl key="recorded-only" variant={"outlined"} fullWidth>
         <Box
            display={"flex"}
            justifyContent={"space-between"}
            alignItems={"center"}
         >
            <Alert
               icon={<InfoOutlinedIcon />}
               severity="success"
               // @ts-ignore
               color="secondary"
               variant="outlined"
               sx={styles.alert}
            >
               Only live streams by {company.universityName} are being displayed
               right now
            </Alert>
         </Box>
      </FormControl>
   )
}

const useCompanyOnce = (companyId: string) => {
   return useFirestoreDocDataOnce(
      doc(useFirestore(), "careerCenterData", companyId).withConverter(
         createGenericConverter<Group>()
      )
   )
}

export default ActiveCompanyFilter
