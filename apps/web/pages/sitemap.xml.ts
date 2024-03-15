import { getBaseUrl } from "components/helperFunctions/HelperFunctions"
import { GetServerSideProps } from "next"

const SitemapIndex = () => {
   return null
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
   // Generate the XML sitemap index
   const sitemapIndex = `<?xml version='1.0' encoding='UTF-8'?>
    <sitemapindex xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
             xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/siteindex.xsd"
             xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
       <sitemap>
            <loc>${getBaseUrl()}/portal/sitemap.xml</loc>
            <changefreq>daily</changefreq>
       </sitemap>
    
       <sitemap>
            <loc>${getBaseUrl()}/companies/sitemap.xml</loc>
       </sitemap>
    
       <sitemap>
            <loc>${getBaseUrl()}/next-livestreams/sitemap.xml</loc>
            <changefreq>daily</changefreq>
       </sitemap>
       
       <sitemap>
            <loc>${getBaseUrl()}/past-livestreams/sitemap.xml</loc>
            <changefreq>daily</changefreq>
       </sitemap>
       
       <sitemap>
            <loc>${getBaseUrl()}/landing_sitemap.xml</loc>
       </sitemap>    
    </sitemapindex>`

   res.setHeader("Content-Type", "text/xml")
   // Send the XML sitemap index to the browser
   res.write(sitemapIndex)
   res.end()

   return {
      props: {},
   }
}

export default SitemapIndex
