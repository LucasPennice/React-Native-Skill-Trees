import AppText from "@/components/AppText";
import { colors } from "@/parameters";
import { useEffect } from "react";
import { Dimensions, StyleSheet, View, ViewStyle } from "react-native";
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from "react-native-reanimated";

const ProgressBarAndIndicator = ({ progressPercentage, containerStyles }: { progressPercentage: number; containerStyles?: ViewStyle }) => {
    const roundedProgressPercentage = parseInt(`${progressPercentage}`);

    const MAX_PROGRESS_INDICATOR_WIDTH = 56;
    const HORIZONTAL_PADDING = 20;

    const { width } = Dimensions.get("window");

    const widthWithPaddingAccounted = width - HORIZONTAL_PADDING;

    const possiblyNegativeProgressIndicatorLeft = (widthWithPaddingAccounted * roundedProgressPercentage) / 100 - MAX_PROGRESS_INDICATOR_WIDTH;
    const progressIndicatorLeft = possiblyNegativeProgressIndicatorLeft < 0 ? 0 : possiblyNegativeProgressIndicatorLeft;

    const styles = StyleSheet.create({
        container: {
            width: "100%",
            height: 65,
            backgroundColor: colors.background,
            marginBottom: 10,
            position: "relative",
            transform: [{ translateY: -10 }],
        },
        progressIndicator: {
            alignItems: "center",
            marginBottom: 20,
            width: MAX_PROGRESS_INDICATOR_WIDTH,
            position: "absolute",
            textAlign: "center",
            top: 10,
            backgroundColor: colors.darkGray,
            padding: 5,
            borderRadius: 10,
        },
    });

    const animatedProgressIndicator = useAnimatedStyle(() => {
        return { left: withSpring(progressIndicatorLeft, { dampingRatio: 0.7 }) };
    });

    return (
        <View style={[styles.container, containerStyles]}>
            <Animated.View style={[styles.progressIndicator, animatedProgressIndicator]}>
                <AppText children={`${roundedProgressPercentage}%`} fontSize={18} style={{ color: "#E6E8E6" }} />
            </Animated.View>
            <ProgressBar progress={roundedProgressPercentage} containerStyle={{ position: "absolute", bottom: 10 }} />
        </View>
    );
};

export const ProgressBar = ({
    progress,
    barStyle,
    containerStyle,
    delay,
}: {
    progress: number;
    containerStyle?: ViewStyle;
    barStyle?: ViewStyle;
    delay?: number;
}) => {
    const styles = StyleSheet.create({
        progressBar: { height: "100%", backgroundColor: "#EFEFEF", borderRadius: 10 },
        barContainer: { width: "100%", height: 10, backgroundColor: colors.line, borderRadius: 10 },
    });

    const width = useSharedValue("0%");

    useEffect(() => {
        width.value = delay ? withDelay(delay, withSpring(`${progress}%`, { dampingRatio: 0.7 })) : withSpring(`${progress}%`, { dampingRatio: 0.7 });
    }, []);

    //@ts-ignore
    const animatedProgressBar = useAnimatedStyle(() => {
        return {
            width: width.value,
            backgroundColor: withTiming(interpolateColor(progress, [0, 66, 100], [colors.red, colors.orange, colors.green])),
        };
    });

    return (
        <View style={[styles.barContainer, containerStyle]}>
            <Animated.View style={[styles.progressBar, animatedProgressBar, barStyle]} />
        </View>
    );
};

export default ProgressBarAndIndicator;
