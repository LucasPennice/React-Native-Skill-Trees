import { useAnimatedStyle, withTiming } from "react-native-reanimated";

function useShowHideStylesWithoutTransitionView(show: boolean) {
    //Avoids creating a transition view, which prevails in android
    //blocking touch inputs
    const styles = useAnimatedStyle(() => {
        return {
            opacity: withTiming(show ? 1 : 0, { duration: 200 }),
            transform: [{ translateY: withTiming(show ? 0 : 10, { duration: 200 }) }],
        };
    }, [show]);

    return styles;
}

export default useShowHideStylesWithoutTransitionView;
