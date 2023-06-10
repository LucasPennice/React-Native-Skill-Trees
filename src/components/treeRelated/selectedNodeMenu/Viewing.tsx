import { TouchableOpacity } from "react-native-gesture-handler";
import AppText from "../../AppText";
import { colors } from "../../../parameters";
import { generalStyles } from "../../../styles";
import { Skill, Tree } from "../../../types";
import { useRoute } from "@react-navigation/native";
import { RouteName } from "../../../../App";
import { Linking, ScrollView, View } from "react-native";
import { MilestoneCard } from "../../../pages/skillPage/Milestones";
import { LogCard } from "../../../pages/skillPage/DisplayDetails/Logs";
import { MotivesToLearnCard } from "../../../pages/skillPage/DisplayDetails/MotivesToLearn";
import { ResourceCard } from "../../../pages/skillPage/DisplayDetails/SkillResources";
import Animated, { FadeInDown } from "react-native-reanimated";

function Viewing({ functions, selectedNode }: { functions: { goToSkillPage: () => void; goToTreePage: () => void }; selectedNode: Tree<Skill> }) {
    const route = useRoute();

    const treePageRoute: RouteName = "ViewingSkillTree";

    const isNotOnTreePage = route.name !== treePageRoute;

    const { goToSkillPage, goToTreePage } = functions;

    const { category, treeName } = selectedNode;

    return (
        <Animated.View entering={FadeInDown}>
            {category !== "SKILL" && (
                <AppText style={{ color: "#FFFFFF", fontFamily: "helveticaBold", marginBottom: 10 }} fontSize={24}>
                    {treeName}
                </AppText>
            )}

            {category === "SKILL" && <SkillDetails data={selectedNode} goToSkillPage={goToSkillPage} />}

            {category !== "SKILL" && <TreeStats />}

            {category === "SKILL_TREE" && (
                <AppText style={{ color: colors.accent }} fontSize={16}>
                    Edit tree button
                </AppText>
            )}

            {category !== "USER" && isNotOnTreePage && (
                <TouchableOpacity style={[generalStyles.btn, { backgroundColor: "#282A2C", marginBottom: 10 }]} onPress={goToTreePage}>
                    <AppText style={{ color: colors.accent }} fontSize={16}>
                        Go To Tree Page
                    </AppText>
                </TouchableOpacity>
            )}
        </Animated.View>
    );
}

function SkillDetails({ goToSkillPage, data }: { goToSkillPage: () => void; data: Tree<Skill> }) {
    const {
        data: { milestones, logs, motivesToLearn, usefulResources },
    } = data;
    return (
        <>
            <View style={{ height: 300 }}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <TouchableOpacity
                        style={[generalStyles.btn, { backgroundColor: "#282A2C", marginBottom: 10, width: "100%" }]}
                        onPress={goToSkillPage}>
                        <AppText style={{ color: colors.accent }} fontSize={16}>
                            Go To Skill Page
                        </AppText>
                    </TouchableOpacity>
                    <AppText fontSize={20} style={{ color: "#FFFFFF", marginVertical: 10 }}>
                        Milestones
                    </AppText>
                    {milestones.map((milestone, key) => (
                        <MilestoneCard data={milestone} key={key} backgroundColor="#282A2C" />
                    ))}
                    <AppText fontSize={20} style={{ color: "#FFFFFF", marginVertical: 10 }}>
                        Motives To Learn
                    </AppText>
                    {motivesToLearn.map((motiveToLearn, key) => (
                        <MotivesToLearnCard data={motiveToLearn} key={key} backgroundColor="#282A2C" />
                    ))}

                    <AppText fontSize={20} style={{ color: "#FFFFFF", marginVertical: 10 }}>
                        Resources
                    </AppText>
                    {usefulResources.map((usefulResource, key) => (
                        <ResourceCard onPress={(link: string) => Linking.openURL(link)} data={usefulResource} key={key} backgroundColor="#282A2C" />
                    ))}
                    <AppText fontSize={20} style={{ color: "#FFFFFF", marginVertical: 10 }}>
                        Log Entries
                    </AppText>
                    {logs.map((log, key) => (
                        <LogCard data={log} key={key} backgroundColor="#282A2C" />
                    ))}
                </ScrollView>
            </View>
        </>
    );
}

function TreeStats() {
    return (
        <View>
            <AppText style={{ color: colors.accent }} fontSize={16}>
                Overal completion percentage
            </AppText>
            <AppText style={{ color: colors.accent }} fontSize={16}>
                Overal completion quantity
            </AppText>
            <AppText style={{ color: colors.accent }} fontSize={16}>
                Show biggest tree
            </AppText>
            <AppText style={{ color: colors.accent }} fontSize={16}>
                show most complete tree and biggest
            </AppText>
            <AppText style={{ color: colors.accent }} fontSize={16}>
                Show achievements
            </AppText>
        </View>
    );
}

export default Viewing;
