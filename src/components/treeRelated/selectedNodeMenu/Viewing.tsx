import { TouchableOpacity } from "react-native-gesture-handler";
import AppText from "../../AppText";
import { centerFlex, colors } from "../../../parameters";
import { generalStyles } from "../../../styles";
import { Skill, Tree } from "../../../types";
import { useRoute } from "@react-navigation/native";
import { RouteName } from "../../../../App";
import { Linking, Pressable, ScrollView, View } from "react-native";
import { MilestoneCard } from "../../../pages/skillPage/Milestones";
import { LogCard } from "../../../pages/skillPage/DisplayDetails/Logs";
import { MotivesToLearnCard } from "../../../pages/skillPage/DisplayDetails/MotivesToLearn";
import { ResourceCard } from "../../../pages/skillPage/DisplayDetails/SkillResources";
import Animated, { FadeInDown } from "react-native-reanimated";
import { treeCompletedSkillPercentage } from "../../../functions/extractInformationFromTree";
import { countCompletedSkillNodes } from "../../../functions/extractInformationFromTree";
import { countSkillNodes } from "../../../functions/extractInformationFromTree";

function Viewing({
    functions,
    selectedNode,
    selectedTree,
}: {
    functions: { goToSkillPage: () => void; goToTreePage: () => void };
    selectedNode: Tree<Skill>;
    selectedTree: Tree<Skill>;
}) {
    const route = useRoute();

    const treePageRoute: RouteName = "ViewingSkillTree";

    const isNotOnTreePage = route.name !== treePageRoute;

    const { goToSkillPage, goToTreePage } = functions;

    const { category, treeName } = selectedNode;

    return (
        <Animated.View entering={FadeInDown}>
            <AppText style={{ color: "#FFFFFF", fontFamily: "helveticaBold", marginBottom: 10 }} fontSize={24}>
                {treeName}
            </AppText>

            {category === "SKILL" && <SkillDetails data={selectedNode} goToSkillPage={goToSkillPage} />}

            {category !== "SKILL" && <TreeStats category={category} selectedTree={selectedTree} selectedNode={selectedNode} />}

            {category === "SKILL_TREE" && (
                <Pressable style={[generalStyles.btn, { backgroundColor: "#282A2C", marginTop: 10 }]}>
                    <AppText style={{ color: colors.accent }} fontSize={16}>
                        Edit tree button
                    </AppText>
                </Pressable>
            )}

            {category !== "USER" && isNotOnTreePage && (
                <TouchableOpacity style={[generalStyles.btn, { backgroundColor: "#282A2C", marginVertical: 10 }]} onPress={goToTreePage}>
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
            <View style={{ maxHeight: 300 }}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <TouchableOpacity
                        style={[generalStyles.btn, { backgroundColor: "#282A2C", marginBottom: 10, width: "100%" }]}
                        onPress={goToSkillPage}>
                        <AppText style={{ color: colors.accent }} fontSize={16}>
                            Go To Skill Page
                        </AppText>
                    </TouchableOpacity>
                    {milestones.length !== 0 && (
                        <>
                            <AppText fontSize={18} style={{ color: "#FFFFFF", marginVertical: 10 }}>
                                Milestones
                            </AppText>
                            {milestones.map((milestone, key) => (
                                <MilestoneCard data={milestone} key={key} backgroundColor="#282A2C" />
                            ))}
                        </>
                    )}
                    {motivesToLearn.length !== 0 && (
                        <>
                            <AppText fontSize={18} style={{ color: "#FFFFFF", marginVertical: 10 }}>
                                Motives To Learn
                            </AppText>
                            {motivesToLearn.map((motiveToLearn, key) => (
                                <MotivesToLearnCard data={motiveToLearn} key={key} backgroundColor="#282A2C" />
                            ))}
                        </>
                    )}
                    {usefulResources.length !== 0 && (
                        <>
                            <AppText fontSize={18} style={{ color: "#FFFFFF", marginVertical: 10 }}>
                                Resources
                            </AppText>
                            {usefulResources.map((usefulResource, key) => (
                                <ResourceCard
                                    onPress={(link: string) => Linking.openURL(link)}
                                    data={usefulResource}
                                    key={key}
                                    backgroundColor="#282A2C"
                                />
                            ))}
                        </>
                    )}
                    {logs.length !== 0 && (
                        <>
                            <AppText fontSize={18} style={{ color: "#FFFFFF", marginVertical: 10 }}>
                                Log Entries
                            </AppText>
                            {logs.map((log, key) => (
                                <LogCard data={log} key={key} backgroundColor="#282A2C" />
                            ))}
                        </>
                    )}
                </ScrollView>
            </View>
        </>
    );
}

function TreeStats({
    selectedTree,
    category,
    selectedNode,
}: {
    selectedTree: Tree<Skill>;
    category: Tree<Skill>["category"];
    selectedNode: Tree<Skill>;
}) {
    const completedPercenage = treeCompletedSkillPercentage(selectedNode);
    const completedNodes = countCompletedSkillNodes(selectedNode);
    const nodes = countSkillNodes(selectedNode);

    return (
        <View style={{ borderTopColor: colors.line, borderColor: "transparent", borderWidth: 1, paddingTop: 15 }}>
            <View style={[centerFlex, { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 }]}>
                <AppText style={{ color: colors.unmarkedText }} fontSize={16}>
                    Completed Percentage
                </AppText>
                <AppText style={{ color: selectedNode.accentColor.color1, fontFamily: "helveticaBold" }} fontSize={16}>
                    {completedPercenage}%
                </AppText>
            </View>
            <View style={[centerFlex, { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 }]}>
                <AppText style={{ color: colors.unmarkedText }} fontSize={16}>
                    Completed Skills
                </AppText>
                <AppText style={{ color: selectedNode.accentColor.color1, fontFamily: "helveticaBold" }} fontSize={16}>
                    {completedNodes}
                </AppText>
            </View>
            <View style={[centerFlex, { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 }]}>
                <AppText style={{ color: colors.unmarkedText }} fontSize={16}>
                    Total Skills
                </AppText>
                <AppText style={{ color: selectedNode.accentColor.color1, fontFamily: "helveticaBold" }} fontSize={16}>
                    {nodes}
                </AppText>
            </View>

            {category === "USER" && <UserTreeStats />}

            {/* <AppText style={{ color: "#FFFFFF" }} fontSize={18}>
                    Add 1/5/10/15 skill to a skill tree
                </AppText>
                <AppText style={{ color: "#FFFFFF" }} fontSize={18}>
                    Have your homepage tree do a full roation
                </AppText>
                <AppText style={{ color: "#FFFFFF" }} fontSize={18}>
                    In a tree with at least 4 skills complete 25%/50%/75%/100%
                </AppText>
                <AppText style={{ color: "#FFFFFF" }} fontSize={18}>
                    Become and expert in a skill (100% completion with more than 9 nodes)
                </AppText>
                <AppText style={{ color: "#FFFFFF" }} fontSize={18}>
                    Share your first skill tree
                </AppText>
                <AppText style={{ color: "#FFFFFF" }} fontSize={18}>
                    Share your first skill tree screenshot
                </AppText>
                <AppText style={{ color: "#FFFFFF" }} fontSize={18}>
                    Write your first milestone for a skill
                </AppText>
                <AppText style={{ color: "#FFFFFF" }} fontSize={18}>
                    Complete your first milestone for a skill
                </AppText>
                <AppText style={{ color: "#FFFFFF" }} fontSize={18}>
                    Add log, add resource, all that jazz
                </AppText> */}
        </View>
    );
    function UserTreeStats() {
        const subTreeNodeQty = selectedTree.children.map((t) => countSkillNodes(t));
        const maxNodeQty = Math.max(...subTreeNodeQty);
        const largestSubTreeIdx = subTreeNodeQty.indexOf(maxNodeQty);
        const largestSubTree = selectedTree.children[largestSubTreeIdx];

        const subTreeCompletion = selectedTree.children.map((t) => treeCompletedSkillPercentage(t));
        const maxCompletion = Math.max(...subTreeCompletion);
        const mostCompleteSubTreeIdx = subTreeCompletion.indexOf(maxCompletion);
        const mostCompleteSubTree = selectedTree.children[mostCompleteSubTreeIdx];

        return (
            <>
                <View style={[centerFlex, { flexDirection: "row", justifyContent: "flex-start", marginBottom: 20, gap: 4, flexWrap: "wrap" }]}>
                    <AppText style={{ color: colors.unmarkedText }} fontSize={16}>
                        Largest tree is
                    </AppText>
                    <AppText style={{ color: selectedNode.accentColor.color1, fontFamily: "helveticaBold" }} fontSize={16}>
                        {largestSubTree.data.name}
                    </AppText>
                    <AppText style={{ color: colors.unmarkedText }} fontSize={16}>
                        with
                    </AppText>
                    <AppText style={{ color: selectedNode.accentColor.color1, fontFamily: "helveticaBold" }} fontSize={16}>
                        {maxNodeQty}
                    </AppText>
                    <AppText style={{ color: colors.unmarkedText }} fontSize={16}>
                        {maxNodeQty === 1 ? "node" : "nodes"}
                    </AppText>
                </View>
                <View style={[centerFlex, { flexDirection: "row", justifyContent: "flex-start", marginBottom: 20, gap: 4, flexWrap: "wrap" }]}>
                    <AppText style={{ color: colors.unmarkedText }} fontSize={16}>
                        Most complete tree is
                    </AppText>
                    <AppText style={{ color: selectedNode.accentColor.color1, fontFamily: "helveticaBold" }} fontSize={16}>
                        {mostCompleteSubTree.data.name}
                    </AppText>
                    <AppText style={{ color: colors.unmarkedText }} fontSize={16}>
                        with
                    </AppText>
                    <AppText style={{ color: selectedNode.accentColor.color1, fontFamily: "helveticaBold" }} fontSize={16}>
                        {maxCompletion}%
                    </AppText>
                    <AppText style={{ color: colors.unmarkedText }} fontSize={16}>
                        completion
                    </AppText>
                </View>
            </>
        );
    }
}

export default Viewing;
