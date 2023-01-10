import {
   isGroupAdminPath,
   isEmbedded,
   isStreamingPath,
   isRecordingWindow,
   queryStringExists,
} from "util/PathUtils"

expect.extend({
   toBeValidCall(received, testerFn) {
      return {
         pass: testerFn(received),
         message: () => `${received} evaluates to false`,
      }
   },
   toQueryStringExists(received, path) {
      return {
         pass: queryStringExists(received, path),
         message: () => `${received} evaluates to false`,
      }
   },
})

test("Correct matching on group admin paths", () => {
   expect("/group/[groupId]").toBeValidCall(isGroupAdminPath)
   expect("/group/[groupId]").toBeValidCall(isGroupAdminPath)
   expect("/group/[groupId]/analytics").toBeValidCall(isGroupAdminPath)
   expect("/group/[groupId]/past-livestreams").toBeValidCall(isGroupAdminPath)
   expect("/group/[groupId]/past-livestreams/oldest").toBeValidCall(
      isGroupAdminPath
   )

   expect("/signup-admin").toBeValidCall(isGroupAdminPath)

   expect("/group/0SsUuTKo03ZXuuLIkb1c/admin/analytics").toBeValidCall(
      isGroupAdminPath
   )

   expect(null).not.toBeValidCall(isGroupAdminPath)
})

test("Correct matching on streaming paths", () => {
   expect(
      "/streaming/VRLKhWi8hdDdRi1FV0FE/joining-streamer?withHighQuality"
   ).toBeValidCall(isStreamingPath)
   expect("/streaming/VRLKhWi8hdDdRi1FV0FE/viewer").toBeValidCall(
      isStreamingPath
   )
   expect(null).not.toBeValidCall(isStreamingPath)
})

test("Correct matching on isRecordingWindow query strings", () => {
   expect("?isRecordingWindow=true").toBeValidCall(isRecordingWindow)
   expect("?isRecordingWindow=false").toBeValidCall(isRecordingWindow)
   expect("isRecordingWindow=true").toBeValidCall(isRecordingWindow)

   expect("?isNotRecordingWindow").not.toBeValidCall(isRecordingWindow)
   expect(null).not.toBeValidCall(isRecordingWindow)
})

test("Correct matching on isEmbedded paths", () => {
   expect("/test/embed").toBeValidCall(isEmbedded)
   expect("/embed").toBeValidCall(isEmbedded)

   expect("/test").not.toBeValidCall(isEmbedded)
   expect(null).not.toBeValidCall(isEmbedded)
})

test("Correct matching on queryStringExists", () => {
   expect("test").toQueryStringExists("?test=true")
   expect("test").toQueryStringExists("test=true")
   expect("test").toQueryStringExists("?hello=false&test=true")

   expect("not").not.toQueryStringExists("test=true")
   expect(null).not.toQueryStringExists("test=true")
})
