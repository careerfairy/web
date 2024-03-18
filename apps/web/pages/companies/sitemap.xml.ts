import { Group } from "@careerfairy/shared-lib/groups"
import { mapGroupsToSiteMap, siteMapXmlWrapper } from "components/util/Sitemap"
import { getServerSideBaseUrl } from "components/util/url"
import { groupRepo } from "data/RepositoryInstances"
import { GetServerSideProps } from "next"

const CompaniesSitemap = () => {
   return null
}
const generateSiteMap = async (basePath: string) => {
   const results: Group[] = await groupRepo.getAllPublicProfileGroups()

   return siteMapXmlWrapper(mapGroupsToSiteMap(`${basePath}/company`, results))
}

export const getServerSideProps: GetServerSideProps = async ({ res, req }) => {
   // Generate the XML sitemap
   const sitemap = await generateSiteMap(getServerSideBaseUrl(req))

   res.setHeader("Content-Type", "text/xml")
   // Send the XML to the browser
   res.write(sitemap)
   res.end()

   return {
      props: {},
   }
}

export default CompaniesSitemap
