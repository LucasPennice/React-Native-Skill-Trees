import { Dimensions, Pressable } from "react-native";
import Animated, { FadeInDown, useAnimatedStyle, withTiming } from "react-native-reanimated";
import axiosClient from "../../axiosClient";
import { useRequestProcessor } from "../../requestProcessor";
import { centerFlex, colors } from "../parameters";
import { useAppSelector } from "../redux/reduxHooks";
import { selectUserId } from "../redux/slices/userSlice";
import { Skill, Tree } from "../types";
import AppText from "./AppText";
import AppTextInput from "./AppTextInput";
import FlingToDismissModal from "./FlingToDismissModal";
import ExportTreeIcon from "./Icons/ExportTreeIcon";
import LoadingIcon from "./LoadingIcon";
import { memo } from "react";

function ShareTreeUrl({ tree, show }: { tree: Tree<Skill>; show?: boolean }) {
    const { mutate } = useRequestProcessor();
    const { width } = Dimensions.get("screen");
    const userId = useAppSelector(selectUserId);

    const {
        mutate: runMutation,
        status,
        data: treeShareLink,
        reset,
    } = mutate(["storeTree", tree, userId], () => axiosClient.post(`shareTree/${userId}`, tree).then((res) => res.data), {});

    const opacity = useAnimatedStyle(() => {
        if (!show) return { opacity: withTiming(0.5, { duration: 150 }) };

        return { opacity: withTiming(1, { duration: 150 }) };
    }, [show]);

    return (
        <>
            <Animated.View style={[opacity, { position: "absolute", top: 70, left: 70 }]}>
                <Pressable
                    disabled={status === "loading"}
                    style={[
                        centerFlex,
                        { width: 50, height: 50, borderRadius: 10, backgroundColor: colors.darkGray, opacity: status === "loading" ? 0.5 : 1 },
                    ]}
                    onPress={() => {
                        if (show === false) return;
                        runMutation();
                    }}>
                    <ExportTreeIcon />
                </Pressable>
            </Animated.View>

            <FlingToDismissModal closeModal={() => reset()} open={status !== "idle"}>
                <>
                    {status === "loading" && (
                        <Animated.View entering={FadeInDown} style={[centerFlex, { width, flex: 1 }]}>
                            <LoadingIcon />
                        </Animated.View>
                    )}
                    {status === "error" && (
                        <AppText fontSize={16} style={{ color: colors.unmarkedText, marginTop: 10 }}>
                            Error getting your share link
                        </AppText>
                    )}
                    {status === "success" && (
                        <Animated.View entering={FadeInDown}>
                            <AppText fontSize={32} style={{ color: "#FFFFFF", fontFamily: "helveticaBold", marginTop: 10 }}>
                                Your share link
                            </AppText>
                            <AppText fontSize={16} style={{ color: colors.unmarkedText, marginTop: 10 }}>
                                Copy this
                            </AppText>
                            <AppTextInput
                                inputProps={{ selectTextOnFocus: true, multiline: true }}
                                disable
                                containerStyles={{ width: width - 20, marginVertical: 15, padding: 0 }}
                                textState={[treeShareLink, () => {}]}
                                placeholder={"link"}
                            />
                            <AppText fontSize={24} style={{ color: "#FFFFFF", fontFamily: "helveticaBold", marginBottom: 20 }}>
                                How to import a skill tree from a link
                            </AppText>
                            <AppText fontSize={16} style={{ color: colors.unmarkedText, marginBottom: 10 }}>
                                Go to the Skill Trees page
                            </AppText>
                            <AppText fontSize={16} style={{ color: colors.unmarkedText, marginBottom: 10 }}>
                                Click the Add Tree button located at the top right
                            </AppText>
                            <AppText fontSize={16} style={{ color: colors.unmarkedText, marginBottom: 10 }}>
                                Click Import Tree and paste the code there
                            </AppText>
                        </Animated.View>
                    )}
                </>
            </FlingToDismissModal>
        </>
    );
}

export default memo(ShareTreeUrl);
