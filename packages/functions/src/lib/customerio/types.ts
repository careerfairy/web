export type CustomerIOWebhookIdentifiers = {
   /**
    * User's Auth ID in firebase
    */
   id: string
   /**
    * The unique id of the user in Customer.io
    */
   cio_id: string
   /**
    * User's email address in firebase
    */
   email: string
}

export type CustomerIOWebhookData = {
   customer_id: string
   identifiers: CustomerIOWebhookIdentifiers
   /**
    * The email address that had the unsubscribe event
    */
   email_address: string
}

export type CustomerIOWebhookEvent = {
   data: CustomerIOWebhookData
   /**
    * The id of the reporting webhook instance
    */
   event_id: string
   object_type: "customer"
   metric: "subscribed" | "unsubscribed"
   timestamp: number
}

export type CustomerIORecommendedLivestreamWebhookData = {
   url: string
   title: string
   company: string
   start: string
   backgroundImageUrl: string
   companyLogoUrl: string
}
