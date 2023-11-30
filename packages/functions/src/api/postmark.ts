import { chunkArray } from "@careerfairy/shared-lib/utils"
import * as postmark from "postmark"
import { ServerClient } from "postmark"
import { Callback, MessageSendingResponse } from "postmark/dist/client/models"
import { isLocalEnvironment, isTestEnvironment } from "../util"
let serverToken = process.env.NEXT_PRIVATE_PROD_POSTMARK_SERVER_TOKEN

// on local emulators use the sandbox environment
if (isLocalEnvironment()) {
   serverToken = process.env.NEXT_PRIVATE_DEV_POSTMARK_SERVER_TOKEN
   console.log(
      "Using postmark sandbox environment, you need to check the sent emails on their dashboard"
   )
}

export let client: ServerClient

if (isTestEnvironment()) {
   /**
    * Postmark emails sent for the sandbox environment count
    * towards the monthly limit, so we mock the client in tests
    * https://postmarkapp.com/support/article/1256-what-is-a-sandboxed-message
    */
   client = postmarkStub() as any
   console.log("Using postmark mock")
} else {
   client = new postmark.ServerClient(serverToken)
}

export class PostmarkEmailSender {
   constructor(private readonly client: ServerClient) {}

   /**
    * Send a batch of emails with templates
    * Chunks the emails into batches of 250
    */
   async sendEmailBatchWithTemplates(
      templates: postmark.TemplatedMessage[],
      callback?: Callback<MessageSendingResponse[]>
   ) {
      // postmark api accepts a max of 500 templates per batch
      // https://postmarkapp.com/developer/api/templates-api#send-batch-with-templates
      // but, using 500 might cause socket hang up errors
      // https://github.com/ActiveCampaign/postmark.js/issues/109#issuecomment-1223873949
      const chunks = chunkArray(templates, 250)
      const promises = chunks.map((chunk, i) =>
         this.client.sendEmailBatchWithTemplates(chunk, callback).then(() => {
            console.log(
               `Successfully sent batch ${i} with ${chunk.length} emails`
            )
         })
      )

      return Promise.all(promises)
   }

   static create() {
      return new PostmarkEmailSender(client)
   }
}

function postmarkStub() {
   return {
      sendEmailWithTemplate: () => Promise.resolve(),
      sendEmailBatchWithTemplates: () => Promise.resolve(),
   }
}
