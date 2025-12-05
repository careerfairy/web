import functions = require("firebase-functions")
import {
   Chapter,
   CreateLivestreamChapterRequest,
   DeleteLivestreamChapterRequest,
   LivestreamChapter,
   LivestreamEvent,
   UpdateLivestreamChapterRequest,
} from "@careerfairy/shared-lib/livestreams"
import { onCall } from "firebase-functions/https"
import * as yup from "yup"
import { livestreamsRepo } from "../../api/repositories"
import { middlewares } from "../../middlewares/middlewares"
import {
   chapterExists,
   dataValidation,
   livestreamExists,
   userShouldBeGroupAdmin,
} from "../../middlewares/validations"

const createChapterSchema: yup.SchemaOf<CreateLivestreamChapterRequest> =
   yup.object({
      livestreamId: yup.string().required(),
      groupId: yup.string().required(),
      title: yup.string().required(),
      startSec: yup.number().required().min(0),
      endSec: yup.number().notRequired().min(0),
      summary: yup.string().notRequired(),
   })

type Context = {
   livestream: LivestreamEvent
}

type ContextWithChapter = Context & {
   chapter: LivestreamChapter
}

export const createChapter = onCall(
   middlewares<Context & CreateLivestreamChapterRequest>(
      dataValidation(createChapterSchema),
      livestreamExists(),
      userShouldBeGroupAdmin(),
      async (request) => {
         const { livestreamId, title, startSec, endSec, summary } = request.data

         functions.logger.info("Creating chapter", {
            livestreamId,
            title,
            startSec,
            endSec,
         })

         // Build chapter object, only including defined fields
         const chapterData: Chapter = {
            title,
            startSec,
         }

         // Only add optional fields if they are defined
         if (endSec !== undefined) {
            chapterData.endSec = endSec
         }
         if (summary !== undefined) {
            chapterData.summary = summary
         }

         const chapter = await livestreamsRepo.createChapter(
            livestreamId,
            chapterData
         )

         functions.logger.info("Chapter created", {
            livestreamId,
            chapterId: chapter.id,
         })

         return {
            success: true,
            chapter,
         }
      }
   )
)

const updateChapterSchema: yup.SchemaOf<UpdateLivestreamChapterRequest> =
   yup.object({
      livestreamId: yup.string().required(),
      groupId: yup.string().required(),
      chapterId: yup.string().required(),
      title: yup.string().notRequired(),
      startSec: yup.number().notRequired().min(0),
      endSec: yup.number().notRequired().min(0),
      summary: yup.string().notRequired(),
   })

export const updateChapter = onCall(
   middlewares<ContextWithChapter & UpdateLivestreamChapterRequest>(
      dataValidation(updateChapterSchema),
      livestreamExists(),
      userShouldBeGroupAdmin(),
      chapterExists(),
      async (request) => {
         const { livestreamId, chapterId, title, startSec, endSec, summary } =
            request.data

         functions.logger.info("Updating chapter", {
            livestreamId,
            chapterId,
            title,
            startSec,
            endSec,
         })

         const updateData: Partial<Chapter> = {}

         if (title !== undefined) {
            updateData.title = title
         }
         if (startSec !== undefined) {
            updateData.startSec = startSec
         }
         if (endSec !== undefined) {
            updateData.endSec = endSec
         }
         if (summary !== undefined) {
            updateData.summary = summary
         }

         await livestreamsRepo.updateChapter(
            livestreamId,
            chapterId,
            updateData
         )

         functions.logger.info("Chapter updated", {
            livestreamId,
            chapterId,
         })

         return {
            success: true,
         }
      }
   )
)

const deleteChapterSchema: yup.SchemaOf<DeleteLivestreamChapterRequest> =
   yup.object({
      livestreamId: yup.string().required(),
      groupId: yup.string().required(),
      chapterId: yup.string().required(),
   })

export const deleteChapter = onCall(
   middlewares<ContextWithChapter & DeleteLivestreamChapterRequest>(
      dataValidation(deleteChapterSchema),
      livestreamExists(),
      userShouldBeGroupAdmin(),
      chapterExists(),
      async (request) => {
         const { livestreamId, chapterId } = request.data

         functions.logger.info("Deleting chapter", {
            livestreamId,
            chapterId,
         })

         await livestreamsRepo.deleteChapter(livestreamId, chapterId)

         functions.logger.info("Chapter deleted", {
            livestreamId,
            chapterId,
         })
      }
   )
)
