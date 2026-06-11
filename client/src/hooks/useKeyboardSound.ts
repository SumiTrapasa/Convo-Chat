import { KEY_STROKE_SOUNDS } from "@/const/audio";

function useKeyboardSound() {
  const playRandomKeyStrokeSound = () => {
    const randomSound =
      KEY_STROKE_SOUNDS[Math.floor(Math.random() * KEY_STROKE_SOUNDS.length)];

    randomSound.currentTime = 0; // this is for a better UX, def add this
    randomSound
      .play()
      .catch((error) => console.log("Audio play failed:", error));
  };

  return { playRandomKeyStrokeSound };
}

export default useKeyboardSound;
