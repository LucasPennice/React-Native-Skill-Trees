import { Dimensions, Pressable, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import axiosClient from "../../axiosClient";
import { useRequestProcessor } from "../../requestProcessor";
import { centerFlex, colors } from "../parameters";
import { useAppSelector } from "../redux/reduxHooks";
import { selectUserSlice } from "../redux/userSlice";
import { Skill, Tree } from "../types";
import AppText from "./AppText";
import AppTextInput from "./AppTextInput";
import FlingToDismissModal from "./FlingToDismissModal";
import LoadingIcon from "./LoadingIcon";

function ShareTreeUrl({ tree }: { tree: Tree<Skill> }) {
    const { mutate } = useRequestProcessor();
    const { width, height } = Dimensions.get("screen");
    const { userId } = useAppSelector(selectUserSlice);

    const {
        mutate: runMutation,
        status,
        data: treeShareLink,
        reset,
    } = mutate(["storeTree", tree, userId], () => axiosClient.post(`shareTree/${userId}`, tree).then((res) => res.data), {});

    return (
        <View style={{ position: "absolute", top: 70, left: 130 }}>
            <Pressable
                disabled={status === "loading"}
                style={[
                    centerFlex,
                    { width: 50, height: 50, borderRadius: 10, backgroundColor: colors.darkGray, opacity: status === "loading" ? 0.5 : 1 },
                ]}
                onPress={() => runMutation()}>
                <AppText style={{ color: colors.background, fontFamily: "helveticaBold" }} fontSize={16}>
                    ✈️
                </AppText>
            </Pressable>

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
                                disable
                                containerStyles={{ width: width - 20, marginVertical: 15 }}
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
        </View>
    );
}

export default ShareTreeUrl;
