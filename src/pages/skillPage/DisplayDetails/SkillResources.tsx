import { useContext, useRef } from "react";
import { Dimensions, Pressable, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import Animated, { Layout } from "react-native-reanimated";
import AppText from "../../../components/AppText";
import { centerFlex, colors } from "../../../parameters";
import { SkillResource } from "../../../types";
import { LeftAction, RightAction } from "./ActionButtons";
import { SkillColorContext } from "../../../context";
import { generalStyles } from "../../../styles";
type Props = {
    skillResources: SkillResource[];
    mutateResources: (newMotivesToLearn: SkillResource[] | undefined) => void;
    openModal: (ref: Swipeable | null, data?: SkillResource) => () => void;
};

function SkillResources({ mutateResources, openModal, skillResources }: Props) {
    const color = useContext(SkillColorContext);

    const deleteResource = (idToDelete: string) => () => {
        const result = skillResources.filter((motive) => motive.id !== idToDelete);
        mutateResources(result);
    };

    return (
        <Animated.View layout={Layout.duration(200)} style={[centerFlex, { alignItems: "flex-start", gap: 15, marginBottom: 10 }]}>
            <AppText fontSize={24} style={{ color: "white", fontFamily: "helveticaBold" }}>
                Resources
            </AppText>
            {skillResources.map((resource) => (
                <ResourceCard openModal={openModal} key={resource.id} data={resource} deleteResource={deleteResource(resource.id)} />
            ))}

            <Animated.View layout={Layout.duration(200)}>
                <Pressable onPress={openModal(null, undefined)} style={generalStyles.btn}>
                    <AppText style={{ color }} fontSize={16}>
                        Add Resource
                    </AppText>
                </Pressable>
            </Animated.View>
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
                <View
                    style={[
                        centerFlex,
                        {
                            flexDirection: "row",
                            gap: 15,
                            backgroundColor: colors.darkGray,
                            width: width - 20,
                            paddingHorizontal: 15,
                            justifyContent: "flex-start",
                            paddingVertical: 15,
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor: colors.darkGray,
                        },
                    ]}>
                    <View style={[centerFlex, { gap: 5, alignItems: "flex-start" }]}>
                        <AppText
                            fontSize={20}
                            style={{ color: "white", maxWidth: width - 170 }}
                            textProps={{ ellipsizeMode: "tail", numberOfLines: 1 }}>
                            {data.title}
                        </AppText>
                        <AppText
                            fontSize={20}
                            style={{ color: "white", maxWidth: width - 170 }}
                            textProps={{ ellipsizeMode: "tail", numberOfLines: 1 }}>
                            {data.description}
                        </AppText>
                    </View>
                </View>
            </Swipeable>
        </Animated.View>
    );
}

export default SkillResources;
