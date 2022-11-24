const algoliasearch = require("algoliasearch")
const functions = require("firebase-functions")
const dotenv = require("dotenv")

// Cloud Trigger functions
// load values from the .env file in this directory into process.env
dotenv.config()

const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID
const ALGOLIA_ADMIN_KEY = process.env.ALGOLIA_API_KEY
const ALGOLIA_GROUP_INDEX_NAME = process.env.ALGOLIA_INDEX_NAME
const ALGOLIA_STREAM_INDEX_NAME = process.env.ALGOLIA_STREAM_INDEX_NAME

const algolia = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY)
const groupIndex = algolia.initIndex(ALGOLIA_GROUP_INDEX_NAME)
const streamIndex = algolia.initIndex(ALGOLIA_STREAM_INDEX_NAME)

exports.addToIndex = functions.firestore
   .document("careerCenterData/{careerCenter}")
   .onCreate((snapshot) => {
      const data = snapshot.data()
      const objectID = snapshot.id
      data.groupId = objectID
      // deletes personal Identifiable data
      delete data.adminEmail
      delete data.adminEmails
      return groupIndex
         .saveObject({ ...data, objectID })
         .then(() => {
            functions.logger.log("Groups imported into Algolia")
         })
         .catch((error) => {
            functions.logger.warn(
               "Error when importing group into Algolia",
               error
            )
         })
   })

exports.addToStreamIndex = functions.firestore
   .document("livestreams/{livestream}")
   .onCreate((snapshot) => {
      const data = snapshot.data()
      if (data.test === false) {
         // dont add test streams to algolia
         const objectID = snapshot.id
         data.numberOfRegistered =
            (data.registeredUsers && data.registeredUsers.length) || 0

         // deletes personal Identifiable data
         delete data.registeredUsers
         return streamIndex
            .saveObject({ ...data, objectID })
            .then(() => {
               functions.logger.log("Stream imported into Algolia")
            })
            .catch((error) => {
               functions.logger.warn(
                  "Error when importing stream into Algolia",
                  error
               )
            })
      }
   })

exports.updateIndex = functions.firestore
   .document("careerCenterData/{careerCenter}")
   .onUpdate((change) => {
      const newData = change.after.data()
      // deletes personal Identifiable data
      delete newData.adminEmail
      delete newData.adminEmails

      const objectID = change.after.id
      return groupIndex
         .saveObject({ ...newData, objectID })
         .then(() => {
            functions.logger.log("Groups updated into Algolia")
         })
         .catch((error) => {
            functions.logger.warn(
               "Error when importing group into Algolia",
               error
            )
         })
   })

exports.updateStreamIndex = functions.firestore
   .document("livestreams/{livestream}")
   .onUpdate((change) => {
      const newData = change.after.data()
      if (newData.test === false) {
         // dont add test streams to algolia

         newData.numberOfRegistered =
            (newData.registeredUsers && newData.registeredUsers.length) || 0
         // deletes personal Identifiable data
         delete newData.registeredUsers

         const objectID = change.after.id
         return streamIndex
            .saveObject({ ...newData, objectID })
            .then(() => {
               functions.logger.log("Stream updated into Algolia")
            })
            .catch((error) => {
               functions.logger.warn(
                  "Error when importing stream into Algolia",
                  error
               )
            })
      }
   })

exports.deleteFromIndex = functions.firestore
   .document("careerCenterData/{careerCenter}")
   .onDelete((snapshot) => groupIndex.deleteObject(snapshot.id))

exports.deleteStreamFromIndex = functions.firestore
   .document("livestreams/{livestream}")
   .onDelete((snapshot) => streamIndex.deleteObject(snapshot.id))
