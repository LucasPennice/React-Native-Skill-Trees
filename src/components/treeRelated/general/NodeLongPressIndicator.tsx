import { memo } from "react";
import { Platform } from "react-native";
import Animated, { ZoomIn, ZoomOut, useAnimatedProps, withSequence, withTiming } from "react-native-reanimated";
import { Svg, Circle as SvgCircle } from "react-native-svg";
import { getWheelParams, renderScaleForNodeActionMenu } from "../../../functions/misc";
import { colors } from "../../../parameters";
import { NodeCoordinate } from "../../../types";
import { MIN_DURATION_LONG_PRESS_MS } from "../hooks/useCanvasPressAndLongPress";

const AnimatedCircle = Animated.createAnimatedComponent(SvgCircle);
const indicatorSize = Platform.OS === "android" ? 143 : 150;

function NodeLongPressIndicator({ data, scale }: { data: NodeCoordinate; scale: number }) {
    const animatedProps = useAnimatedProps(() => {
        const renderScaleForNodeActionMenu = 1 / scale;
        const updatedStrokeWidth = 16 * renderScaleForNodeActionMenu;

        return {
            strokeWidth: withSequence(withTiming(0, { duration: 0 }), withTiming(updatedStrokeWidth, { duration: MIN_DURATION_LONG_PRESS_MS })),
        };
    });

    const updatedScale = renderScaleForNodeActionMenu(scale);
    const updatedSize = indicatorSize * updatedScale;
    const updatedStrokeWidth = 16 * updatedScale;

    const progressWheelProps = getWheelParams("#FFFFFF", `#FFFFFF3D`, updatedSize, updatedStrokeWidth);

    const position = { x: data.x - updatedSize / 2, y: data.y - updatedSize / 2 };

    return (
        <Animated.View
            entering={ZoomIn.springify().damping(15).stiffness(150)}
            exiting={ZoomOut}
            style={{ position: "absolute", top: position.y, left: position.x }}
            pointerEvents={"none"}>
            <Svg width={updatedSize} height={updatedSize}>
                <AnimatedCircle
                    cx={progressWheelProps.centerCoordinate}
                    cy={progressWheelProps.centerCoordinate}
                    r={updatedSize / 2 - updatedStrokeWidth / 2}
                    fillOpacity={0}
                    stroke={`${colors.unmarkedText}7D`}
                    strokeDasharray={progressWheelProps.circumference}
                    strokeLinecap="round"
                    animatedProps={animatedProps}
                />
            </Svg>
        </Animated.View>
    );
}

export default memo(NodeLongPressIndicator);
