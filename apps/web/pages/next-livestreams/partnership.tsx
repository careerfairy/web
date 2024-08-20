import { mapPartnershipFieldsOfStudy } from '@careerfairy/shared-lib/fieldOfStudy'
import { Box } from '@mui/material'
import { getBaseUrl } from 'components/helperFunctions/HelperFunctions'
import { GetServerSideProps } from 'next'
import { sxStyles } from 'types/commonTypes'
import NextLiveStreamsWithFilter from '../../components/views/common/NextLivestreams/NextLiveStreamsWithFilter'

const styles = sxStyles({
    container: {
        my: 2,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto', // Allows scrolling if content exceeds iframe height
    }
})

const PartnershipPage = () => {

  return (
    <Box sx={styles.container}>
        <NextLiveStreamsWithFilter
            initialTabValue="upcomingEvents"
        />
    </Box>
  )
}

export default PartnershipPage

export const getServerSideProps: GetServerSideProps = async (context) => {
    const partnerFieldOfStudy = context.query.initialStudyArea as string | undefined

    // Map the partnerFieldOfStudy to fieldOfStudyIdTags 
    const mappedFieldsOfStudy = mapPartnershipFieldsOfStudy(partnerFieldOfStudy)
    const encodedFields = encodeURIComponent(mappedFieldsOfStudy.join(","))

    const baseUrl = getBaseUrl()
    const newUrl = `${baseUrl}/next-livestreams/partnership?fieldsOfStudy=${encodedFields}`

    if (partnerFieldOfStudy && mappedFieldsOfStudy.length > 0) {
        return {
          redirect: {
            destination: newUrl,
            permanent: false,
          },
        }
    }

    return {
        props: {}
    }
  }