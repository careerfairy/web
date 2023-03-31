import { chunkArray } from "@careerfairy/shared-lib/utils"
import * as postmark from "postmark"
import { ServerClient } from "postmark"
import { Callback, MessageSendingResponse } from "postmark/dist/client/models"
import { isLocalEnvironment, isTestEnvironment } from "../util"
let serverToken = "3f6d5713-5461-4453-adfd-71f5fdad4e63"

// on local emulators use the sandbox environment
if (isLocalEnvironment()) {
   serverToken = "40c62a86-6189-432d-b3f8-f25b345184aa"
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
    * Chunks the emails into batches of 500
    */
   async sendEmailBatchWithTemplates(
      templates: postmark.TemplatedMessage[],
      callback?: Callback<MessageSendingResponse[]>
   ) {
      // max of 500 templates per batch
      // https://postmarkapp.com/developer/api/templates-api#send-batch-with-templates
      const chunks = chunkArray(templates, 500)
      const promises = chunks.map((chunk) =>
         this.client.sendEmailBatchWithTemplates(chunk, callback)
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
