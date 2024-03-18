import { getServerSideBaseUrl } from "components/util/url"
import { GetServerSideProps } from "next"

const SitemapIndex = () => {
   return null
}

export const getServerSideProps: GetServerSideProps = async ({ res, req }) => {
   const basePath = getServerSideBaseUrl(req)

   // Generate the XML sitemap index
   const sitemapIndex = `<?xml version='1.0' encoding='UTF-8'?>
    <sitemapindex xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
             xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/siteindex.xsd"
             xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
       <sitemap>
            <loc>${basePath}/portal/sitemap.xml</loc>
            <changefreq>daily</changefreq>
       </sitemap>
    
       <sitemap>
            <loc>${basePath}/companies/sitemap.xml</loc>
       </sitemap>
    
       <sitemap>
            <loc>${basePath}/next-livestreams/sitemap.xml</loc>
            <changefreq>daily</changefreq>
       </sitemap>
       
       <sitemap>
            <loc>${basePath}/past-livestreams/sitemap.xml</loc>
            <changefreq>daily</changefreq>
       </sitemap>
       
       <sitemap>
            <loc>${basePath}/landing_sitemap.xml</loc>
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
