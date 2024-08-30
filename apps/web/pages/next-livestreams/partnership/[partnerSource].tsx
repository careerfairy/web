import { mapPartnershipFieldsOfStudy } from "@careerfairy/shared-lib/fieldOfStudy"
import { Box } from "@mui/material"
import { getServerSideBaseUrl } from "components/util/url"
import NextLiveStreamsWithFilter from "components/views/common/NextLivestreams/NextLiveStreamsWithFilter"
import { PartnershipProvider } from "HOCs/PartnershipProvider"
import { GetServerSideProps } from "next"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   container: {
      my: 2,
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      overflow: "auto",
   },
})

// White list of valid partner sources
const VALID_PARTNER_SOURCES = [
   "uniwunder",
   "careerfairy",
   "unibasel-business-student-council",
]

type Props = {
   partnerSource: string
}

const PartnershipPage = ({ partnerSource }: Props) => {
   return (
      <PartnershipProvider partnerSource={partnerSource}>
         <Box sx={styles.container}>
            <NextLiveStreamsWithFilter initialTabValue="upcomingEvents" />
         </Box>
      </PartnershipProvider>
   )
}

export default PartnershipPage

export const getServerSideProps: GetServerSideProps = async (context) => {
   const { partnerSource = "" } = context.params
   const { req } = context

   // Check if the partnerSource is valid
   if (!VALID_PARTNER_SOURCES.includes(partnerSource as string)) {
      return {
         notFound: true,
      }
   }

   const partnerFieldOfStudy = context.query.studyArea as string | undefined

   // Map the partnerFieldOfStudy to fieldOfStudyIdTags
   const mappedFieldsOfStudy = mapPartnershipFieldsOfStudy(partnerFieldOfStudy)
   const encodedFields = encodeURIComponent(mappedFieldsOfStudy.join(","))

   const baseUrl = getServerSideBaseUrl(req)
   const newUrl = `${baseUrl}/next-livestreams/partnership/${partnerSource}?fieldsOfStudy=${encodedFields}`

   if (partnerFieldOfStudy && mappedFieldsOfStudy.length > 0) {
      return {
         redirect: {
            destination: newUrl,
            permanent: false,
         },
      }
   }

   return {
      props: {
         partnerSource,
      },
   }
}
