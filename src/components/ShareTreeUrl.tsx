import { Dimensions, Pressable, View } from "react-native";
import AppText from "./AppText";
import { centerFlex, colors } from "../parameters";
import { useRequestProcessor } from "../../requestProcessor";
import axiosClient from "../../axiosClient";
import { Skill, Tree } from "../types";
import { useEffect, useState } from "react";
import FlingToDismissModal from "./FlingToDismissModal";
import { generalStyles } from "../styles";

function ShareTreeUrl({ tree }: { tree: Tree<Skill> }) {
    const { mutate } = useRequestProcessor();
    const { width } = Dimensions.get("screen");

    const {
        mutate: runMutation,
        status,
        data: treeShareLink,
        reset,
    } = mutate(["storeTree", tree], () => axiosClient.post(`shareTree`, tree).then((res) => res.data), {});

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

            <FlingToDismissModal closeModal={() => reset()} open={treeShareLink !== undefined}>
                <>
                    <AppText fontSize={32} style={{ color: "#FFFFFF", fontFamily: "helveticaBold", marginTop: 10 }}>
                        Your share link
                    </AppText>
                    <AppText fontSize={16} style={{ color: colors.unmarkedText, marginTop: 10 }}>
                        Click to copy
                    </AppText>
                    <Pressable
                        style={[
                            generalStyles.btn,
                            { backgroundColor: `${colors.line}3D`, borderRadius: 10, marginVertical: 25, paddingHorizontal: 10 },
                        ]}>
                        <AppText
                            fontSize={24}
                            style={[{ color: "#FFFFFF", maxWidth: width, textAlign: "left" }]}
                            textProps={{ ellipsizeMode: "tail", numberOfLines: 1 }}>
                            {treeShareLink}
                        </AppText>
                    </Pressable>

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
                </>
            </FlingToDismissModal>
        </View>
    );
}

export default ShareTreeUrl;
