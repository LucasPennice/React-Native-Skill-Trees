import { useEffect } from "react";
import { View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { SharedValue, runOnJS, useAnimatedStyle, useSharedValue } from "react-native-reanimated";

export type Config = {
    horizontalSize: number;
    verticalSize: number;
    showBounds?: boolean;
    allowTap?: boolean;
    //If we choose circular the horizontal and vertical sizes must be equal
    circular?: boolean;
    actionZoneTranslateY?: number;
};

export type Actions = {
    verticalDown?: () => void;
    verticalUp?: () => void;
    horizontalLeft?: () => void;
    horizontalRight?: () => void;
};

type Props = {
    config: Config;
    action?: Actions;
    children: JSX.Element;
    actionZoneTranslateY?: number;
};

function useKeepYValueInSyncWithTranslateY(y: SharedValue<number>, actionZoneTranslateY: number) {
    useEffect(() => {
        y.value = actionZoneTranslateY;
    }, [actionZoneTranslateY]);
}

function DirectionMenu({ action, config, children, actionZoneTranslateY = 0 }: Props) {
    const { horizontalSize, showBounds, allowTap, circular, verticalSize } = config;

    //The deacceleration reduces the allowed translation value by 2

    const x = useSharedValue(0);
    const y = useSharedValue(actionZoneTranslateY);

    useKeepYValueInSyncWithTranslateY(y, actionZoneTranslateY);

    const m1 = verticalSize / horizontalSize;
    const m2 = -m1;

    const tap = Gesture.Tap().onStart((e) => {
        if (!allowTap) return;
        if (!action) return;
        if (!circular) return;

        const translationX = e.x - horizontalSize / 2;
        const translationY = e.y - verticalSize / 2;

        const bottomLeftHalf = translationY > m1 * translationX;
        const topRightHalf = translationY <= m1 * translationX;
        const topLeftHalf = translationY <= m2 * translationX;
        const bottomRightHalf = translationY > m2 * translationX;

        const clickedOnRightZone = bottomRightHalf && topRightHalf;
        const clickedOnLeftZone = bottomLeftHalf && topLeftHalf;
        const clickedOnDownZone = bottomLeftHalf && bottomRightHalf;
        const clickedOnTopZone = topRightHalf && topLeftHalf;

        if (action.horizontalRight && clickedOnRightZone) runOnJS(action.horizontalRight)();
        if (action.horizontalLeft && clickedOnLeftZone) runOnJS(action.horizontalLeft)();
        if (action.verticalDown && clickedOnDownZone) runOnJS(action.verticalDown)();
        if (action.verticalUp && clickedOnTopZone) runOnJS(action.verticalUp)();
    });

    const translate = useAnimatedStyle(() => {
        return { transform: [{ translateX: x.value }, { translateY: y.value - 2 * actionZoneTranslateY }] };
    }, [x, y, actionZoneTranslateY]);

    return (
        <GestureDetector gesture={tap}>
            <View
                style={{
                    backgroundColor: showBounds ? "#1982F97D" : undefined,
                    borderRadius: circular ? horizontalSize : 0,
                    width: horizontalSize,
                    transform: [{ translateY: actionZoneTranslateY }],
                    height: verticalSize,
                    justifyContent: "center",
                    alignItems: "center",
                }}>
                <Animated.View style={translate}>{children}</Animated.View>
            </View>
        </GestureDetector>
    );
}

export default DirectionMenu;
