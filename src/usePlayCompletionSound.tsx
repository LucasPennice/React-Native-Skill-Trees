import { useEffect, useState } from "react";
import { Audio } from "expo-av";
import { Sound } from "expo-av/build/Audio";

function usePlayCompletionSound() {
    const [sound, setSound] = useState<Sound>();

    async function playSound() {
        const { sound } = await Audio.Sound.createAsync(require("../assets/complete.mp3"));
        setSound(sound);

        await sound.playAsync();
    }

    useEffect(() => {
        return sound
            ? () => {
                  sound.unloadAsync();
              }
            : undefined;
    }, [sound]);

    return playSound;
}

export default usePlayCompletionSound;
