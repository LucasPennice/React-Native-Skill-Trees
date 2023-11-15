import AppText from "@/components/AppText";
import { colors } from "@/parameters";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Dimensions, StyleSheet, View, ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, withSpring } from "react-native-reanimated";

export type OnboardingStep = {
    text: string;
    iconName: React.ComponentProps<typeof FontAwesome>["name"];
    skippeable?: boolean;
    actionButtonText: string;
    onActionButtonPress: () => void;
};

type Props = {
    initialStep?: number;
    steps: OnboardingStep[];
    containerStyles?: ViewStyle;
    progressIndicatorStyle?: ViewStyle;
    currentStep: number;
};

const MAX_PROGRESS_INDICATOR_WIDTH = 56;
const PROGRESS_INDICATOR_HEIGHT = 25;
const HORIZONTAL_PADDING = 20;
const GAP_BETWEEN_BARS = 10;

const styles = StyleSheet.create({
    container: {
        width: "100%",
        height: 40,
        backgroundColor: colors.darkGray,
        position: "relative",
    },
    progressIndicator: {
        alignItems: "center",
        height: PROGRESS_INDICATOR_HEIGHT,
        position: "absolute",
        textAlign: "center",
        top: 0,
        backgroundColor: colors.background,
        padding: 5,
        borderRadius: 10,
    },
    progressBar: { flex: 1, backgroundColor: colors.green, borderRadius: 10 },
    barContainer: { flex: 1, height: 9, backgroundColor: colors.line, borderRadius: 10 },
});

const SteppedProgressBarAndIndicator = ({ containerStyles, steps, initialStep, progressIndicatorStyle, currentStep }: Props) => {
    const roundedProgressPercentage = parseInt(`${100 * (currentStep / steps.length)}`);

    const { width } = Dimensions.get("window");

    const widthWithPaddingAccounted = width - HORIZONTAL_PADDING;

    const possiblyNegativeProgressIndicatorLeft =
        (widthWithPaddingAccounted * roundedProgressPercentage) / 100 - MAX_PROGRESS_INDICATOR_WIDTH + GAP_BETWEEN_BARS * currentStep;
    const progressIndicatorLeft = possiblyNegativeProgressIndicatorLeft < 0 ? 0 : possiblyNegativeProgressIndicatorLeft;

    const animatedProgressIndicator = useAnimatedStyle(() => {
        return { left: withSpring(progressIndicatorLeft, { dampingRatio: 0.7 }) };
    });

    return (
        <View style={[styles.container, containerStyles]}>
            <Animated.View style={[styles.progressIndicator, animatedProgressIndicator]}>
                <AppText children={`${roundedProgressPercentage}%`} fontSize={14} style={{ color: "#E6E8E6" }} />
            </Animated.View>
            <View style={{ flexDirection: "row", flex: 1, position: "absolute", bottom: 0 }}>
                {steps.map((step, idx) => {
                    return (
                        <PartialProgressBar
                            key={idx}
                            isComplete={currentStep > idx}
                            shouldAddMargin={steps.length !== 0 && idx !== steps.length - 1}
                        />
                    );
                })}
            </View>
        </View>
    );
};

const PartialProgressBar = ({ shouldAddMargin, isComplete }: { shouldAddMargin: boolean; isComplete: boolean }) => {
    const margin = shouldAddMargin ? { marginRight: GAP_BETWEEN_BARS } : undefined;

    const animatedProgressBar = useAnimatedStyle(() => {
        return {
            width: withSpring(`${isComplete ? 100 : 0}%`, { dampingRatio: 0.7 }),
        };
    });

    return (
        <View style={[styles.barContainer, margin]}>
            <Animated.View style={[styles.progressBar, animatedProgressBar]} />
        </View>
    );
};

export default SteppedProgressBarAndIndicator;
