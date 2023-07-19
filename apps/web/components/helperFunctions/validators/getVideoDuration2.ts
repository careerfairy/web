function getVideoDuration2(file: File): Promise<number> {
   return new Promise((resolve, reject) => {
      const video = document.createElement("video")
      const url = URL.createObjectURL(file)
      video.src = url
      video.onloadedmetadata = () => {
         URL.revokeObjectURL(url)
         resolve(video.duration)
      }
      video.onerror = (e) => {
         URL.revokeObjectURL(url)
         reject(e)
      }
   })
}
