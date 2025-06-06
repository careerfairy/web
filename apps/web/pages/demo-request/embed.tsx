import Head from "next/head"
import { Fragment, useEffect } from "react"

declare global {
   interface Window {
      hbspt: any
   }
}

const HUBSPOT_CONFIG = {
   portalId: "9186494",
   formId: "e2d5408c-4c39-4133-8b49-22d74ad24134",
   region: "eu1", //
}

export default function DemoRequestEmbed() {
   useEffect(() => {
      // Load HubSpot form script
      const script = document.createElement("script")
      script.src = "//js.hsforms.net/forms/embed/v2.js"
      script.type = "text/javascript"
      document.head.appendChild(script)

      script.onload = () => {
         // Create the form once the script is loaded
         if (window.hbspt) {
            window.hbspt.forms.create({
               portalId: HUBSPOT_CONFIG.portalId,
               formId: HUBSPOT_CONFIG.formId,
               region: HUBSPOT_CONFIG.region,
               target: "#hubspot-form",
            })
         }
      }

      return () => {
         // Cleanup: remove the script when component unmounts
         const existingScript = document.querySelector(
            'script[src*="hsforms.net"]'
         )
         if (existingScript) {
            document.head.removeChild(existingScript)
         }
      }
   }, [])

   return (
      <Fragment>
         <Head>
            <title>Request a Demo - CareerFairy</title>
            <meta name="robots" content="noindex, nofollow" />
            <meta
               name="viewport"
               content="width=device-width, initial-scale=1"
            />
         </Head>

         <div id="hubspot-form">{/* HubSpot form will be injected here */}</div>
      </Fragment>
   )
}
