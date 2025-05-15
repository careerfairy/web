export const ANIMATION_CONFIG = {
   container: {
      slideIn: 0.3,
      slideOut: 0.8,
      opacity: 0.3,
      delayBeforeExit: 2200,
   },
   text: {
      duration: 0.3,
      delay: 0.3,
   },
   stars: {
      duration: 1.5,
      delay: 0.3,
      staggerDelay: 0.1,
      rotationDuration: 2.1,
      swipingDuration: 0.3,
      rotationDistance: 6,
      topRight: {
         startRotation: 14.99,
         get endRotation() {
            return (
               this.startRotation *
               (1 - ANIMATION_CONFIG.stars.rotationDistance)
            )
         }, // Counter-clockwise
      },
      midLeft: {
         startRotation: 13.87,
         get endRotation() {
            return (
               this.startRotation *
               (1 - ANIMATION_CONFIG.stars.rotationDistance)
            )
         }, // Counter-clockwise
      },
      bottomRight: {
         startRotation: -15,
         get endRotation() {
            return (
               this.startRotation *
               (1 + ANIMATION_CONFIG.stars.rotationDistance)
            )
         }, // Clockwise
      },
   },
}
