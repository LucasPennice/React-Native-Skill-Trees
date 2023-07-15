import { View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

export type Config = {
    directions: ("horizontal" | "vertical")[];
    //Values should be between 0 and 1, where 1 is the largest trigger zone
    triggerZoneSize: number;
    horizontalSize: number;
    verticalSize: number;
    allowFling?: boolean;
    showBounds?: boolean;
    allowTap?: boolean;
    //If we choose circular the horizontal and vertical sizes must be equal
    circular?: boolean;
    runActionOnTouchUp?: boolean;
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
    onHoverActions?: Actions & { clearHover: () => void };
    children: JSX.Element;
};

type ActionType = "verticalUp" | "verticalDown" | "horizontalLeft" | "horizontalRight";

function DirectionMenu({ action, config, children, onHoverActions }: Props) {
    const { directions, horizontalSize, showBounds, triggerZoneSize, allowFling, allowTap, circular, runActionOnTouchUp, verticalSize } = config;

    //The deacceleration reduces the allowed translation value by 2
    const realVertical = verticalSize * 2;
    const realHorizontal = horizontalSize * 2;

    const x = useSharedValue(0);
    const y = useSharedValue(0);

    const lastExecutedAction = useSharedValue<ActionType | undefined>(undefined);
    const lastHoveredAction = useSharedValue<ActionType | undefined>(undefined);

    const m1 = verticalSize / horizontalSize;
    const m2 = -m1;

    const drag = Gesture.Pan()
        .onUpdate((e) => {
            // Handles limit translation to bounds
            const absX = Math.abs(e.translationX);
            const absY = Math.abs(e.translationY);

            if (circular) {
                const distanceFromCenter = Math.sqrt(absX ** 2 + absY ** 2);
                const friction = distanceFromCenter * (-1 / realHorizontal) + 1;
                x.value = e.translationX * friction;
                y.value = e.translationY * friction;
            } else {
                const horizontalFriction = absX * (-1 / realHorizontal) + 1;
                const verticalFriction = absY * (-1 / realVertical) + 1;

                if (directions.includes("horizontal") && absX < realHorizontal / 2) {
                    x.value = e.translationX * horizontalFriction;
                }

                if (directions.includes("vertical") && absY < realVertical / 2) {
                    y.value = e.translationY * verticalFriction;
                }
            }

            const bottomLeftHalf = e.translationY > m1 * e.translationX;
            const topRightHalf = e.translationY <= m1 * e.translationX;
            const topLeftHalf = e.translationY <= m2 * e.translationX;
            const bottomRightHalf = e.translationY > m2 * e.translationX;

            //Actions and Actions On Hover 👇

            if (directions.includes("horizontal")) {
                const inRightTriggerZone = e.translationX >= (horizontalSize / 2) * (1 - triggerZoneSize);
                const inLeftTriggerZone = e.translationX <= (-horizontalSize / 2) * (1 - triggerZoneSize);
                const hoveringOverRightZone = bottomRightHalf && topRightHalf && inRightTriggerZone;
                const hoveringOverLeftZone = bottomLeftHalf && topLeftHalf && inLeftTriggerZone;

                if (hoveringOverRightZone) {
                    if (!runActionOnTouchUp && lastExecutedAction.value !== "horizontalRight" && action && action.horizontalRight) {
                        runOnJS(action.horizontalRight)();
                        lastExecutedAction.value = "horizontalRight";
                    }
                    if (runActionOnTouchUp && lastHoveredAction.value !== "horizontalRight" && onHoverActions && onHoverActions.horizontalRight) {
                        runOnJS(onHoverActions.horizontalRight)();
                        lastHoveredAction.value = "horizontalRight";
                    }
                    return;
                }

                if (hoveringOverLeftZone) {
                    if (!runActionOnTouchUp && lastExecutedAction.value !== "horizontalLeft" && action && action.horizontalLeft) {
                        runOnJS(action.horizontalLeft)();
                        lastExecutedAction.value = "horizontalLeft";
                    }
                    if (runActionOnTouchUp && lastHoveredAction.value !== "horizontalLeft" && onHoverActions && onHoverActions.horizontalLeft) {
                        runOnJS(onHoverActions.horizontalLeft)();
                        lastHoveredAction.value = "horizontalLeft";
                    }
                    return;
                }
            }

            if (directions.includes("vertical")) {
                const inDownTriggerZone = e.translationY >= (verticalSize / 2) * (1 - triggerZoneSize);
                const inUpTriggerZone = e.translationY <= (-verticalSize / 2) * (1 - triggerZoneSize);
                const hoveringOverDown = bottomLeftHalf && bottomRightHalf && inDownTriggerZone;
                const hoveringOverUp = topRightHalf && topLeftHalf && inUpTriggerZone;

                if (hoveringOverDown) {
                    if (!runActionOnTouchUp && lastExecutedAction.value !== "verticalDown" && action && action.verticalDown) {
                        runOnJS(action.verticalDown)();
                        lastExecutedAction.value = "verticalDown";
                    }
                    if (runActionOnTouchUp && lastHoveredAction.value !== "verticalDown" && onHoverActions && onHoverActions.verticalDown) {
                        runOnJS(onHoverActions.verticalDown)();
                        lastHoveredAction.value = "verticalDown";
                    }
                    return;
                }

                if (hoveringOverUp) {
                    if (!runActionOnTouchUp && lastExecutedAction.value !== "verticalUp" && action && action.verticalUp) {
                        runOnJS(action.verticalUp)();
                        lastExecutedAction.value = "verticalUp";
                    }
                    if (runActionOnTouchUp && lastHoveredAction.value !== "verticalUp" && onHoverActions && onHoverActions.verticalUp) {
                        runOnJS(onHoverActions.verticalUp)();
                        lastHoveredAction.value = "verticalUp";
                    }
                    return;
                }
            }

            if (onHoverActions) {
                if (lastHoveredAction.value !== undefined) runOnJS(onHoverActions.clearHover)();
                lastHoveredAction.value = undefined;
            }
        })
        .onEnd((e) => {
            const velocityX = e.velocityX * 1.5;
            const velocityY = e.velocityY * 1.5;

            const VELOCITY_ACTION_THRESHOLD_Y = 2000;
            const VELOCITY_ACTION_THRESHOLD_X = 2000;

            const actionOnFling = allowFling && action && lastExecutedAction.value !== undefined;
            const actionOnTouchUp = runActionOnTouchUp && action;

            if (actionOnFling) {
                if (action.verticalDown && velocityY > VELOCITY_ACTION_THRESHOLD_Y) runOnJS(action.verticalDown!)();
                if (action.verticalUp && velocityY < -VELOCITY_ACTION_THRESHOLD_Y) runOnJS(action.verticalUp!)();

                if (action.horizontalRight && velocityX > VELOCITY_ACTION_THRESHOLD_X) runOnJS(action.horizontalRight!)();
                if (action.horizontalLeft && velocityX < -VELOCITY_ACTION_THRESHOLD_X) runOnJS(action.horizontalLeft!)();
            }

            if (actionOnTouchUp) {
                const bottomLeftHalf = e.translationY > m1 * e.translationX;
                const topRightHalf = e.translationY <= m1 * e.translationX;
                const topLeftHalf = e.translationY <= m2 * e.translationX;
                const bottomRightHalf = e.translationY > m2 * e.translationX;

                if (directions.includes("horizontal")) {
                    const inRightTriggerZone = e.translationX >= (horizontalSize / 2) * (1 - triggerZoneSize);
                    const inLeftTriggerZone = e.translationX <= (-horizontalSize / 2) * (1 - triggerZoneSize);
                    const hoveringOverRightZone = bottomRightHalf && topRightHalf && inRightTriggerZone;
                    const hoveringOverLeftZone = bottomLeftHalf && topLeftHalf && inLeftTriggerZone;

                    if (action.horizontalRight && hoveringOverRightZone) {
                        runOnJS(action.horizontalRight)();
                    }
                    if (action.horizontalLeft && hoveringOverLeftZone) {
                        runOnJS(action.horizontalLeft)();
                    }
                }

                if (directions.includes("vertical")) {
                    const inDownTriggerZone = e.translationY >= (verticalSize / 2) * (1 - triggerZoneSize);
                    const inUpTriggerZone = e.translationY <= (-verticalSize / 2) * (1 - triggerZoneSize);
                    const hoveringOverDown = bottomLeftHalf && bottomRightHalf && inDownTriggerZone;
                    const hoveringOverUp = topRightHalf && topLeftHalf && inUpTriggerZone;

                    if (action.verticalDown && hoveringOverDown) {
                        runOnJS(action.verticalDown)();
                    }

                    if (action.verticalUp && hoveringOverUp) {
                        runOnJS(action.verticalUp)();
                    }
                }
            }

            x.value = withSpring(0, { damping: 26, stiffness: 300, velocity: velocityX });
            y.value = withSpring(0, { damping: 26, stiffness: 300, velocity: velocityY });
            lastExecutedAction.value = undefined;
        })
        .activateAfterLongPress(40)
        .shouldCancelWhenOutside(true);

    const tap = Gesture.Tap()
        .maxDuration(40)
        .onStart((e) => {
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
        return { transform: [{ translateX: x.value }, { translateY: y.value }] };
    }, [x, y]);

    return (
        <GestureDetector gesture={Gesture.Race(drag, tap)}>
            {/* <View
                style={{
                    backgroundColor: showBounds ? "#50D1587D" : undefined,
                    borderRadius: circular ? horizontalSize : 0,
                    width: 2 * horizontalSize,
                    height: 2 * verticalSize,
                    justifyContent: "center",
                    alignItems: "center",
                    // position: "absolute",
                    // left: position.x,
                    // top: position.y,
                    transform: [{ translateX: -horizontalSize / 2 }, { translateY: -verticalSize / 2 }],
                }}> */}
            <View
                style={{
                    backgroundColor: showBounds ? "#1982F97D" : undefined,
                    borderRadius: circular ? horizontalSize : 0,
                    width: horizontalSize,
                    height: verticalSize,
                    justifyContent: "center",
                    alignItems: "center",
                }}>
                <Animated.View style={[translate]}>{children}</Animated.View>
            </View>
            {/* </View> */}
        </GestureDetector>
    );
}

export default DirectionMenu;
