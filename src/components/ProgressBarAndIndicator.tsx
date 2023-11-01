import AppText from "@/components/AppText";
import { colors } from "@/parameters";
import { Dimensions, StyleSheet, View, ViewStyle } from "react-native";
import Animated, { interpolateColor, useAnimatedStyle, withSpring, withTiming } from "react-native-reanimated";

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
        progressBar: { height: "100%", backgroundColor: "#EFEFEF", borderRadius: 10 },
        barContainer: { width: "100%", height: 10, backgroundColor: colors.line, borderRadius: 10, position: "absolute", bottom: 10 },
    });

    const animatedProgressBar = useAnimatedStyle(() => {
        return {
            width: withSpring(`${roundedProgressPercentage}%`, { dampingRatio: 0.7 }),
            backgroundColor: withTiming(interpolateColor(roundedProgressPercentage, [0, 66, 100], [colors.red, colors.orange, colors.green])),
        };
    });

    const animatedProgressIndicator = useAnimatedStyle(() => {
        return { left: withSpring(progressIndicatorLeft, { dampingRatio: 0.7 }) };
    });

    return (
        <View style={[styles.container, containerStyles]}>
            <Animated.View style={[styles.progressIndicator, animatedProgressIndicator]}>
                <AppText children={`${roundedProgressPercentage}%`} fontSize={18} style={{ color: "#E6E8E6" }} />
            </Animated.View>
            <View style={styles.barContainer}>
                <Animated.View style={[styles.progressBar, animatedProgressBar]} />
            </View>
        </View>
    );
};

export default ProgressBarAndIndicator;
