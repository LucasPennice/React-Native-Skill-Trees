import { ImageFormat, SkiaDomView } from "@shopify/react-native-skia";
import { shareAsync } from "expo-sharing";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Dimensions, Pressable, View } from "react-native";
import { Gesture, GestureDetector, gestureHandlerRootHOC } from "react-native-gesture-handler";
import Animated, { Easing, FadeInDown, FadeOutUp, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import ViewShot from "react-native-view-shot";
import { centerFlex, colors } from "../../parameters";
import { generalStyles } from "../../styles";
import { Skill, Tree } from "../../types";
import AppText from "../AppText";
import FlingToDismissModal from "../FlingToDismissModal";
import ProgressIndicatorAndName from "../ProgressIndicatorAndName";

type Stage = "TAKING_SCREENSHOT" | "EDITING_LAYOUT";

function TakingScreenshotLoadingScreenModal({
    canvasRef,
    takingScreenShotState,
    tree,
}: {
    canvasRef: SkiaDomView;
    takingScreenShotState: [boolean, (v: boolean) => void];
    tree: Tree<Skill>;
}) {
    const { width } = Dimensions.get("screen");

    const [open, setOpen] = takingScreenShotState;

    const [stage, setStage] = useState<Stage>("TAKING_SCREENSHOT");
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        if (open) getScreenShots();
    }, [open]);

    useEffect(() => {
        return () => {
            setSelectedImage(null);
            setStage("TAKING_SCREENSHOT");
        };
    }, []);

    const closeModal = () => setOpen(false);

    const BAR_WIDHT = width > 600 ? 550 : width - 50;

    const styles = useAnimatedStyle(() => {
        return { width: withTiming(open ? BAR_WIDHT : 0, { duration: 1000, easing: Easing.bezierFn(0.83, 0, 0.17, 1) }) };
    }, [open]);

    return (
        <FlingToDismissModal closeModal={closeModal} open={open}>
            <>
                {stage === "TAKING_SCREENSHOT" && (
                    <Animated.View style={[centerFlex, { flex: 1, opacity: 1 }]} entering={FadeInDown} exiting={FadeOutUp}>
                        <AppText fontSize={24} style={{ color: "#FFFFFF", fontFamily: "helveticaBold", textAlign: "center", marginBottom: 25 }}>
                            Turning your skill tree into an image
                        </AppText>
                        <View style={{ backgroundColor: `${colors.accent}5D`, height: 8, width: BAR_WIDHT, borderRadius: 5 }}>
                            <Animated.View style={[styles, { backgroundColor: colors.accent, height: 8, borderRadius: 5 }]} />
                        </View>
                    </Animated.View>
                )}

                {stage === "EDITING_LAYOUT" && selectedImage !== null && (
                    <LayoutSelector selectedImage={selectedImage} tree={tree} cancelSharing={() => setOpen(false)} />
                )}
            </>
        </FlingToDismissModal>
    );

    async function getScreenShots() {
        setStage("TAKING_SCREENSHOT");

        try {
            await new Promise((resolve) =>
                setTimeout(async () => {
                    const image = canvasRef.makeImageSnapshot();

                    const encodedImage = image.encodeToBase64(ImageFormat.PNG, 99);

                    const formattedImage = `data:image/png;base64,${encodedImage}`;

                    setSelectedImage(formattedImage);
                    setStage("EDITING_LAYOUT");
                }, 1000)
            );
        } catch (error) {
            Alert.alert("Could not generate image, please try again");
            setOpen(false);
        }
    }
}

function LayoutSelector({ selectedImage, tree, cancelSharing }: { selectedImage: string; tree: Tree<Skill>; cancelSharing: () => void }) {
    const { width: screenWidth } = Dimensions.get("window");
    const width = screenWidth > 600 ? 600 : screenWidth;

    //The only purpouse of this piece of state is to trigger a reset function inside MovableCanvasImage with a useEffect
    const [foo, setFoo] = useState(false);
    const toggleImageSizeReset = () => setFoo(!foo);
    //This is instagrams recommended aspect ratio
    const aspectRatio = 4 / 5;

    const ref = useRef<ViewShot | null>(null);

    const attemptCapture = () => {
        if (ref.current === null) return;
        if (ref.current.capture === undefined) return;

        ref.current.capture();
    };

    const onCapture = useCallback(async (uri: string) => {
        try {
            await shareAsync(`file://${uri}`);
            cancelSharing();
        } catch (error) {
            Alert.alert("Error onCapture");
        }
    }, []);

    const MovableCanvasImage = gestureHandlerRootHOC(() => {
        const { height: screenHeight, width: screenWidth } = Dimensions.get("window");
        const width = screenWidth > 600 ? 600 : screenWidth;
        const height = screenHeight > 400 ? 400 : screenHeight;

        /* eslint-disable react-hooks/rules-of-hooks */
        const start = useSharedValue({ x: 0, y: -height / 4 });
        const offset = useSharedValue({ x: 0, y: -height / 4 });

        const scale = useSharedValue(1);
        const savedScale = useSharedValue(1);

        const rotation = useSharedValue(0);
        const savedRotation = useSharedValue(0);

        const showBorder = useSharedValue(false);

        useEffect(() => {
            start.value = { x: 0, y: -height / 4 };
            offset.value = { x: 0, y: -height / 4 };
            scale.value = 1;
            savedScale.value = 1;
            rotation.value = 0;
            savedRotation.value = 0;
        }, [foo]);

        const canvasZoom = Gesture.Pinch()
            .onUpdate((e) => {
                showBorder.value = true;

                scale.value = savedScale.value * e.scale;
            })
            .onEnd(() => {
                savedScale.value = scale.value;
                showBorder.value = false;
            });

        const canvasPan = Gesture.Pan()
            .onUpdate((e) => {
                showBorder.value = true;

                const newXValue = e.translationX + start.value.x;
                const newYValue = e.translationY + start.value.y;

                offset.value = { x: newXValue, y: newYValue };
            })
            .onEnd(() => {
                start.value = { x: offset.value.x, y: offset.value.y };
                showBorder.value = false;
            });

        const canvasRotation = Gesture.Rotation()
            .onUpdate((e) => {
                rotation.value = savedRotation.value + e.rotation;
            })
            .onEnd(() => {
                savedRotation.value = rotation.value;
            });

        const canvasGestures = Gesture.Simultaneous(canvasPan, canvasZoom, canvasRotation);

        const transform = useAnimatedStyle(() => {
            return {
                transform: [
                    { translateX: offset.value.x },
                    { translateY: offset.value.y },
                    { scale: scale.value },
                    { rotateZ: `${(rotation.value / Math.PI) * 180}deg` },
                ],
                borderColor: showBorder.value ? colors.accent : "#FFFFFF00",
            };
        });

        /* eslint-enable react-hooks/rules-of-hooks */

        return (
            <GestureDetector gesture={canvasGestures}>
                <Animated.Image
                    source={{ uri: selectedImage, width, height }}
                    style={[transform, { resizeMode: "contain", borderWidth: 1, borderRadius: 10 }]}
                />
            </GestureDetector>
        );
    });

    const SCREENSHOT_WIDTH = width - 10;

    return (
        <Animated.View style={[centerFlex, { flex: 1, justifyContent: "space-between" }]} entering={FadeInDown}>
            <View style={{ width: SCREENSHOT_WIDTH, paddingHorizontal: 15, marginTop: 10 }}>
                <AppText fontSize={24} style={{ color: "#FFFFFF", fontFamily: "helveticaBold", marginBottom: 10 }}>
                    Edit the layout to your liking
                </AppText>
                <AppText fontSize={18} style={{ color: colors.unmarkedText }}>
                    You can move, zoom or rotate the skill tree
                </AppText>
            </View>
            {/* THIS WILL BE WHATS SHARED IN THE SCREENSHOT 👇 */}
            <ViewShot
                ref={ref}
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: SCREENSHOT_WIDTH,
                    maxHeight: 460,
                    aspectRatio,
                    overflow: "hidden",
                    backgroundColor: colors.background,
                }}
                onCapture={onCapture}
                options={{ fileName: tree.treeName, result: "tmpfile", format: "png", quality: 1 }}>
                <MovableCanvasImage />
                <ProgressIndicatorAndName tree={tree} />
            </ViewShot>
            {/* THIS WILL BE WHATS SHARED IN THE SCREENSHOT 👆 */}

            <View style={[centerFlex, { flexDirection: "row", flexWrap: "wrap", gap: 10 }]}>
                <Pressable onPress={toggleImageSizeReset} style={[generalStyles.btn]}>
                    <AppText fontSize={16} style={{ color: colors.unmarkedText }}>
                        Reset
                    </AppText>
                </Pressable>
                <Pressable onPress={cancelSharing} style={[generalStyles.btn]}>
                    <AppText fontSize={16} style={{ color: colors.red }}>
                        Cancel
                    </AppText>
                </Pressable>
                <Pressable onPress={attemptCapture} style={[generalStyles.btn]}>
                    <AppText fontSize={16} style={{ color: colors.accent }}>
                        Share
                    </AppText>
                </Pressable>
            </View>
        </Animated.View>
    );
}

export default TakingScreenshotLoadingScreenModal;
