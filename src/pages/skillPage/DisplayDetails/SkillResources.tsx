import { useRef } from "react";
import { Dimensions, Linking, Pressable, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import Animated, { Layout } from "react-native-reanimated";
import AppText from "../../../components/AppText";
import { centerFlex, colors } from "../../../parameters";
import { generalStyles } from "../../../styles";
import { SkillResource } from "../../../types";
import { LeftAction, RightAction } from "./ActionButtons";
type Props = {
    skillResources: SkillResource[];
    mutateResources: (newMotivesToLearn: SkillResource[]) => void;
    openModal: (ref: Swipeable | null, data?: SkillResource) => () => void;
};

function SkillResources({ mutateResources, openModal, skillResources }: Props) {
    const deleteResource = (idToDelete: string) => () => {
        const result = skillResources.filter((motive) => motive.id !== idToDelete);
        mutateResources(result);
    };

    return (
        <Animated.View layout={Layout.duration(200)} style={[centerFlex, { alignItems: "flex-start", marginBottom: 10 }]}>
            <View style={[centerFlex, { flexDirection: "row", justifyContent: "space-between", width: "100%" }]}>
                <AppText fontSize={24} style={{ color: "#FFFFFF", fontFamily: "helveticaBold" }}>
                    Resources
                </AppText>

                <Pressable onPress={openModal(null, undefined)} style={[generalStyles.btn, { backgroundColor: "transparent" }]}>
                    <AppText style={{ color: colors.accent }} fontSize={16}>
                        + Add Resource
                    </AppText>
                </Pressable>
            </View>
            <AppText fontSize={18} style={{ color: colors.unmarkedText, marginBottom: 10 }}>
                Click the icon-labeled resources to visit the corresponding URL
            </AppText>
            {skillResources.map((resource) => (
                <ResourceCard openModal={openModal} key={resource.id} data={resource} deleteResource={deleteResource(resource.id)} />
            ))}
        </Animated.View>
    );
}

function ResourceCard({
    data,
    openModal,
    deleteResource,
}: {
    data: SkillResource;
    openModal: (ref: Swipeable | null, data?: SkillResource) => () => void;
    deleteResource: () => void;
}) {
    const { width } = Dimensions.get("window");

    const ref = useRef<Swipeable | null>(null);
    return (
        <Animated.View layout={Layout.duration(200)}>
            <Swipeable ref={ref} renderLeftActions={LeftAction(openModal(ref.current, data))} renderRightActions={RightAction(deleteResource)}>
                <Pressable
                    style={[{ width: width - 20 }]}
                    onPress={() => {
                        if (data.url === undefined) return;
                        Linking.openURL(data.url);
                    }}>
                    <View
                        style={[
                            centerFlex,
                            {
                                flexDirection: "row",
                                gap: 15,
                                backgroundColor: colors.darkGray,
                                paddingHorizontal: 15,
                                paddingVertical: 15,
                                justifyContent: "flex-start",
                                borderRadius: 10,
                                borderWidth: 1,
                                borderColor: colors.darkGray,
                            },
                        ]}>
                        <View style={[centerFlex, { gap: 5, alignItems: "flex-start" }]}>
                            <View style={[centerFlex, { flexDirection: "row", gap: 5 }]}>
                                {data.url && (
                                    <AppText fontSize={20} style={{ color: colors.accent, fontFamily: "emojisMono", lineHeight: 33 }}>
                                        {data.url && "🌎"}
                                    </AppText>
                                )}
                                <AppText fontSize={20} style={{ color: "#FFFFFF", fontFamily: "helveticaBold" }}>
                                    {data.title}
                                </AppText>
                            </View>
                            <AppText fontSize={18} style={{ color: colors.unmarkedText }}>
                                {data.description}
                            </AppText>
                        </View>
                    </View>
                </Pressable>
            </Swipeable>
        </Animated.View>
    );
}

export default SkillResources;
