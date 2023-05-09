import { ImageFormat, SkiaDomView } from "@shopify/react-native-skia";
import { useEffect, useState } from "react";
import { Alert, Dimensions, FlatList, Image, Modal, Pressable, SafeAreaView, View } from "react-native";
import Animated, { Easing, FadeInDown, FadeOutDown, Layout, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { centerFlex, colors } from "../../parameters";
import { Skill, Tree } from "../../types";
import { sharePNG } from "../../useIsSharingAvailable";
import AppText from "../AppText";

type Stage = "TAKING_SCREENSHOT" | "SELECTING_BEST_SCREENSHOT" | "SELECTING_LAYOUT";

function TakingScreenshotLoadingScreenModal({
    canvasRef,
    takingScreenShotState,
    tree,
}: {
    canvasRef: SkiaDomView;
    takingScreenShotState: [boolean, (v: boolean) => void];
    tree: Tree<Skill>;
}) {
    const [open, setOpen] = takingScreenShotState;

    const [stage, setStage] = useState<Stage>("TAKING_SCREENSHOT");
    const [tentativeScreenshots, setTentativeScreenshots] = useState<string[]>([]);
    const [selectedImageIdx, setSelectedImageIdx] = useState<number | null>(null);
    const [tentativeLayout, setTentativeLayout] = useState<string[]>([]);
    const [selectedLayoutIdx, setSelectedLayoutIdx] = useState<number | null>(null);
    //Derived State
    const selectedImage = selectedImageIdx !== null ? tentativeScreenshots[selectedImageIdx] : undefined;
    const selectedLayout = selectedLayoutIdx !== null ? tentativeLayout[selectedLayoutIdx] : undefined;

    useEffect(() => {
        if (open) getScreenShots();
    }, [open]);

    useEffect(() => {
        return () => {
            setSelectedImageIdx(null);
            setTentativeScreenshots([]);
            setTentativeLayout([]);
            setSelectedLayoutIdx(null);
            setStage("TAKING_SCREENSHOT");
        };
    }, []);

    useEffect(() => {
        if (selectedImage === undefined) return;

        setTentativeLayout([selectedImage]);
    }, [selectedImage]);

    const styles = useAnimatedStyle(() => {
        return { width: withTiming(stage === "TAKING_SCREENSHOT" ? 200 : 0, { duration: 1000, easing: Easing.bezierFn(0.83, 0, 0.17, 1) }) };
    }, [stage]);

    return (
        <Modal animationType="fade" transparent={true} visible={open}>
            {stage === "TAKING_SCREENSHOT" && (
                <View style={[centerFlex, { flex: 1, opacity: 1 }]}>
                    <View
                        style={[
                            centerFlex,
                            {
                                backgroundColor: colors.darkGray,
                                height: 250,
                                width: 250,
                                borderRadius: 10,
                                padding: 20,
                                justifyContent: "space-evenly",
                            },
                        ]}>
                        <AppText fontSize={100} style={{ color: "white", lineHeight: 120 }}>
                            🌴
                        </AppText>
                        <AppText fontSize={13} style={{ color: "white" }}>
                            Turning your skill tree into an image
                        </AppText>
                        <View style={{ backgroundColor: `${colors.accent}5D`, height: 8, width: 200, borderRadius: 5 }}>
                            <Animated.View style={[styles, { backgroundColor: colors.accent, height: 8, borderRadius: 5 }]} />
                        </View>
                    </View>
                </View>
            )}
            {stage === "SELECTING_BEST_SCREENSHOT" && (
                <SafeAreaView style={[{ flex: 1, backgroundColor: colors.background }]}>
                    <Animated.View style={[centerFlex, { flex: 1 }]} entering={FadeInDown}>
                        <AppText fontSize={16} style={{ color: "white", textAlign: "center" }}>
                            Select the best screenshot. If none are acceptable please try again
                        </AppText>
                        <AppText fontSize={16} style={{ color: colors.line, marginBottom: 15 }}>
                            The library takes buggy screenshots sometimes
                        </AppText>
                        <FlatList
                            style={{ flex: 1 }}
                            data={tentativeScreenshots}
                            renderItem={({ item, index }) => (
                                <RenderItemToSelect
                                    index={index}
                                    selectItemIdx={selectedImageIdx}
                                    setSelectedItemIdx={setSelectedImageIdx}
                                    item={item}
                                />
                            )}
                            keyExtractor={(_, idx) => `${idx}`}
                            horizontal
                        />
                        <ConfirmSelectButtom
                            selection={selectedImageIdx}
                            buttons={[{ title: "Retake", onPress: getScreenShots, color: colors.accent }]}
                            setPrevStage={{ title: "Close", onPress: () => setOpen(false), color: colors.red }}
                            setNextStage={{ title: "Confirm", onPress: () => setStage("SELECTING_LAYOUT"), color: colors.accent }}
                        />
                    </Animated.View>
                </SafeAreaView>
            )}
            {stage === "SELECTING_LAYOUT" && tentativeLayout.length !== 0 && (
                <SafeAreaView style={[{ flex: 1, backgroundColor: colors.background }]}>
                    <Animated.View style={[centerFlex, { flex: 1 }]} entering={FadeInDown}>
                        <AppText fontSize={16} style={{ color: "white", marginBottom: 15 }}>
                            Choose the layout you like the most
                        </AppText>
                        <FlatList
                            style={{ flex: 1 }}
                            data={tentativeLayout}
                            renderItem={({ item, index }) => (
                                <RenderItemToSelect
                                    index={index}
                                    selectItemIdx={selectedLayoutIdx}
                                    setSelectedItemIdx={setSelectedLayoutIdx}
                                    item={item}
                                />
                            )}
                            keyExtractor={(_, idx) => `${idx}`}
                            horizontal
                        />
                        <ConfirmSelectButtom
                            selection={selectedLayoutIdx}
                            setPrevStage={{ title: "Back", onPress: () => setStage("SELECTING_BEST_SCREENSHOT"), color: colors.accent }}
                            setNextStage={{
                                title: "Confirm",
                                onPress: async () => {
                                    if (!selectedLayout) return Alert.alert("error");
                                    await sharePNG(tree.treeName, selectedLayout);
                                    setOpen(false);
                                },
                                color: colors.accent,
                            }}
                        />
                    </Animated.View>
                </SafeAreaView>
            )}
        </Modal>
    );

    async function getScreenShots() {
        setSelectedImageIdx(null);
        setStage("TAKING_SCREENSHOT");
        try {
            await new Promise((resolve) =>
                setTimeout(async () => {
                    const imagesArray = [
                        canvasRef.makeImageSnapshot(),
                        canvasRef.makeImageSnapshot(),
                        canvasRef.makeImageSnapshot(),
                        canvasRef.makeImageSnapshot(),
                        canvasRef.makeImageSnapshot(),
                    ];

                    const encodedImages = imagesArray.map((image) => image.encodeToBase64(ImageFormat.PNG, 99));

                    //Sometimes skia takes a screenshot and its empty 🤡
                    const imagesWithContent = getImagesWithContent(encodedImages);

                    const formattedImages = imagesWithContent.map((eI) => `data:image/png;base64,${eI}`);

                    setTentativeScreenshots(formattedImages);
                    setStage("SELECTING_BEST_SCREENSHOT");
                }, 1000)
            );
        } catch (error) {
            Alert.alert("Could not generate image, please try again");
            setOpen(false);
        }
    }

    function getImagesWithContent(base64Images: string[]) {
        //When the image is completely black, its encoded length is much smaller than an image with content
        //So I check the difference with the max image (hopefully not all images are empty)
        //I check the max difference but really I should eliminate outlier values (smaller ones)
        //This method seems to work good enough

        const lengths = base64Images.map((i) => i.length);
        const maxLength = Math.max(...lengths);

        const result: string[] = [];

        const tolerance = 0.1;

        lengths.forEach((l, idx) => {
            const delta = maxLength - l;
            if (delta < maxLength * tolerance) result.push(base64Images[idx]);
        });

        return result;
    }
}

function ConfirmSelectButtom<T>({
    selection,
    setNextStage,
    setPrevStage,
    buttons,
}: {
    selection: T | null;
    buttons?: { title: string; onPress: () => void; color: string }[];
    setNextStage?: { title: string; onPress: () => void; color: string };
    setPrevStage?: { title: string; onPress: () => void; color: string };
}) {
    const show = useSharedValue(false);

    useEffect(() => {
        show.value = selection !== null;
    }, [selection]);

    return (
        <Animated.View style={[centerFlex, { flexDirection: "row", gap: 15 }]} layout={Layout.duration(200)}>
            {buttons !== undefined &&
                buttons.map((button, idx) => {
                    return (
                        <Animated.View key={idx} style={[{ backgroundColor: colors.darkGray, borderRadius: 10 }]}>
                            <Pressable onPress={button.onPress} style={[centerFlex, { height: 50, paddingHorizontal: 15 }]}>
                                <AppText fontSize={16} style={{ color: button.color }}>
                                    {button.title}
                                </AppText>
                            </Pressable>
                        </Animated.View>
                    );
                })}
            {setPrevStage && (
                <Animated.View style={[{ backgroundColor: colors.darkGray, borderRadius: 10 }]}>
                    <Pressable onPress={setPrevStage.onPress} style={[centerFlex, { height: 50, paddingHorizontal: 15 }]}>
                        <AppText fontSize={16} style={{ color: setPrevStage.color }}>
                            {setPrevStage.title}
                        </AppText>
                    </Pressable>
                </Animated.View>
            )}
            {setNextStage && selection !== null && (
                <Animated.View style={[{ backgroundColor: colors.darkGray, borderRadius: 10 }]} entering={FadeInDown} exiting={FadeOutDown}>
                    <Pressable onPress={setNextStage.onPress} style={[centerFlex, { height: 50, paddingHorizontal: 15 }]}>
                        <AppText fontSize={16} style={{ color: setNextStage.color }}>
                            {setNextStage.title}
                        </AppText>
                    </Pressable>
                </Animated.View>
            )}
        </Animated.View>
    );
}

function RenderItemToSelect({
    item,
    selectItemIdx,
    setSelectedItemIdx,
    index,
}: {
    selectItemIdx: number | null;
    setSelectedItemIdx: (v: number | null) => void;
    item: string;
    index: number;
}) {
    const { width, height } = Dimensions.get("screen");

    const isSelected = useSharedValue(false);

    useEffect(() => {
        isSelected.value = selectItemIdx === index;
    }, [selectItemIdx]);

    const styles = useAnimatedStyle(() => {
        return { borderColor: withTiming(isSelected.value ? colors.accent : colors.line) };
    }, [isSelected]);

    return (
        <Pressable
            style={[centerFlex, { height, width, justifyContent: "flex-start" }]}
            onPress={() => {
                if (selectItemIdx === index) return setSelectedItemIdx(null);
                setSelectedItemIdx(index);
            }}>
            <Animated.View
                style={[
                    styles,
                    {
                        backgroundColor: colors.background,
                        height: height * 0.8 - 50,
                        width: width * 0.8,
                        borderRadius: 20,
                        borderWidth: 2,
                    },
                ]}>
                <Image source={{ uri: item }} style={{ height: height * 0.8 - 50, width: width * 0.8 }} resizeMode={"contain"}></Image>
            </Animated.View>
        </Pressable>
    );
}

export default TakingScreenshotLoadingScreenModal;
