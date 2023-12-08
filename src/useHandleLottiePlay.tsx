import AnimatedLottieView from "lottie-react-native";
import { useEffect, useRef } from "react";

export const useHandleLottiePlay = (run: boolean, delay = 1000) => {
    const animation = useRef<AnimatedLottieView>(null);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        if (run) {
            timeoutId = setTimeout(() => {
                animation.current?.reset();
                animation.current?.play();
            }, delay);
        }

        if (!run) {
            animation.current?.reset();
            animation.current?.pause();
        }

        return () => {
            clearTimeout(timeoutId);
        };
    }, [run]);

    return animation;
};
