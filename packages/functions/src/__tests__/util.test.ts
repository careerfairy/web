import { compress, decompress, sha1 } from "../util"

test("SHA1 should be deterministic and match other sources", async () => {
   // hashes obtained from http://www.sha1-online.com/
   expect(sha1("input")).toBe("140f86aae51ab9e1cda9b4254fe98a74eb54c1a1")
   expect(sha1("input")).toBe("140f86aae51ab9e1cda9b4254fe98a74eb54c1a1")

   expect(sha1("my random string")).toBe(
      "7ecc055a2f9204f0802ec9a141351a9445d77036"
   )
})

test("compress string should work", async () => {
   const toCompress = "this string will be compressed"
   const buffer = new Buffer(toCompress)

   const compressed = await compress(buffer)
   const decompressed = await decompress(compressed)

   expect(decompressed.toString()).toBe(toCompress)
})
