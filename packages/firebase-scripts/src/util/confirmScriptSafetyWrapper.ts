const { Snippet } = require("enquirer")

const confirmScriptText = "Yes I am sure"
const prompt = new Snippet({
   name: "Production script confirmation",
   message: `Are you sure you want to run this script on Production? If so please type "${confirmScriptText}"`,
   required: true,
   fields: [
      {
         name: "confirm_text",
         message: "Type confirmation text here",
         validate(value, state, item) {
            if (
               item &&
               item.name === "confirm_text" &&
               value !== confirmScriptText
            ) {
               return prompt.styles.danger("The text does not match")
            }
            return true
         },
      },
   ],
   template: `
  Confirmation Text: "\${confirm_text}",
`,
})
const confirmScriptSafetyWrapper = async (
   callback: () => any,
   useProd: boolean
) => {
   if (useProd) {
      await prompt.run()
      return callback()
   } else {
      return callback()
   }
}
export default confirmScriptSafetyWrapper
