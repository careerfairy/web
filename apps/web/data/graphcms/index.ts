type Variables = { [p: string]: any }
interface Options {
   variables: Variables
   preview: boolean
}

const fetchAPI = async (query: string, options?: Options) => {
   const res = await fetch(process.env.GRAPHCMS_PROJECT_API, {
      method: "POST",
      headers: {
         "Content-Type": "application/json",
         Authorization: `Bearer ${
            options?.preview
               ? process.env.GRAPHCMS_DEV_AUTH_TOKEN
               : process.env.GRAPHCMS_PROD_AUTH_TOKEN
         }`,
      },
      body: JSON.stringify({
         query,
         variables: options?.variables,
      }),
   })
   const json = await res.json()

   if (json.errors) {
      console.error(json.errors)
      throw new Error("Failed to fetch API")
   }

   return json.data
}

export { fetchAPI }
