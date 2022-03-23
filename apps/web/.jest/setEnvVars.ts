require("dotenv").config({
   ...(!process.env.CI && { path: "../../.env.test.local" }),
})
