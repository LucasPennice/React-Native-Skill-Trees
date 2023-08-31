import { Keyframe } from "react-native-reanimated";

export const exitOpacityScale = (initialScale: number) => {
    const result = new Keyframe({
        0: {
            opacity: 1,
            transform: [{ scale: initialScale }],
        },
        100: {
            opacity: 0,
            transform: [{ scale: 0 }],
        },
    });

    return result;
};
