const logo =
   "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/highlights%2Flogos%2Fdownload%201.png?alt=media&token=a435b542-b1df-4f46-8159-42d5f31c6b8e"
const demoMan =
   "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/speaker-video%2Fvideoblocks-confident-male-coach-lector-recording-educational-video-lecture_r_gjux7cu_1080__D.mp4?alt=media"
const thumbnail =
   "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/highlights%2Fthumbnails%2FWoman-on-a-video-conference-call-1%201.png?alt=media&token=6f34d092-70fb-41fc-85bd-b2708390021c"
const numData = 10

const highlightDoc = {
   videoUrl: demoMan,
   thumbnail: thumbnail,
   logo: logo,
}
export const dummyHighlights = Array(numData).fill(highlightDoc)
