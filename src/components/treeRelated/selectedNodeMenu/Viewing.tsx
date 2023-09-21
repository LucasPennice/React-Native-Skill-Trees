import AppText from "@/components/AppText";
import GoToPageButton from "@/components/GoToPageButton";
import { LogCard } from "@/pages/skillPage/DisplayDetails/Logs";
import { MotivesToLearnCard } from "@/pages/skillPage/DisplayDetails/MotivesToLearn";
import { ResourceCard } from "@/pages/skillPage/DisplayDetails/SkillResources";
import { MilestoneCard } from "@/pages/skillPage/Milestones";
import { HOMEPAGE_TREE_ID, centerFlex, colors } from "@/parameters";
import { useAppSelector } from "@/redux/reduxHooks";
import { TreeData, selectAllTrees, selectTreeById } from "@/redux/slices/newUserTreesSlice";
import { selectAllNodes, selectNodesOfTree } from "@/redux/slices/nodesSlice";
import { NodeCategory, NormalizedNode } from "@/types";
import { usePathname } from "expo-router";
import { Linking, ScrollView, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { countCompleteNodes } from "../../../functions/extractInformationFromTree";

function Viewing({
    functions,
    selectedNode,
    selectedTreeId,
}: {
    functions: { goToSkillPage: () => void; goToTreePage: () => void; goToEditTreePage: () => void };
    selectedNode: NormalizedNode;
    selectedTreeId: string;
}) {
    const pathname = usePathname();

    const selectedTree = useAppSelector(selectTreeById(selectedTreeId));

    const treeData = useAppSelector(selectTreeById(selectedNode.treeId));

    const isNotOnTreePage = !pathname.includes("/myTrees");

    const { goToSkillPage, goToTreePage, goToEditTreePage } = functions;

    return (
        <Animated.View entering={FadeInDown}>
            <AppText style={{ color: "#FFFFFF", fontFamily: "helveticaBold", marginBottom: 10 }} fontSize={24}>
                {selectedNode.category === "SKILL" ? selectedNode.data.name : treeData.treeName}
            </AppText>

            {selectedNode.category === "SKILL" && <SkillDetails data={selectedNode} goToSkillPage={goToSkillPage} />}

            {selectedNode.category !== "SKILL" && <TreeStats category={selectedNode.category} selectedTree={selectedTree} />}

            {selectedNode.category === "SKILL_TREE" && <GoToPageButton onPress={goToEditTreePage} title={"Edit tree"} />}

            {selectedNode.category !== "USER" && isNotOnTreePage && <GoToPageButton onPress={goToTreePage} title={`Skill Tree`} />}
        </Animated.View>
    );
}

function SkillDetails({ goToSkillPage, data }: { goToSkillPage: () => void; data: NormalizedNode }) {
    const {
        data: { milestones, logs, motivesToLearn, usefulResources },
    } = data;
    return (
        <>
            <View style={{ maxHeight: 300 }}>
                <GoToPageButton onPress={goToSkillPage} title={"Edit Skill Details"} />
                <ScrollView showsVerticalScrollIndicator={false}>
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

function TreeStats<T extends Omit<TreeData, "nodes">>({ selectedTree, category }: { selectedTree: T; category: NodeCategory }) {
    //Redux Related
    const nodesOfTree = useAppSelector(selectedTree.treeId === HOMEPAGE_TREE_ID ? selectAllNodes : selectNodesOfTree(selectedTree.treeId));

    const completedSkillsQty = countCompleteNodes(nodesOfTree);
    const skillsQty = nodesOfTree.length - 1;
    const completePercentage = skillsQty === 0 ? 0 : (completedSkillsQty / skillsQty) * 100;

    return (
        <View style={{ borderTopColor: colors.line, borderColor: "transparent", borderWidth: 1, paddingTop: 15 }}>
            <View style={[centerFlex, { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 }]}>
                <AppText style={{ color: colors.unmarkedText }} fontSize={16}>
                    Completed (%)
                </AppText>
                <AppText style={{ color: selectedTree.accentColor.color1, fontFamily: "helveticaBold" }} fontSize={16}>
                    {completePercentage.toFixed(2)}%
                </AppText>
            </View>
            <View style={[centerFlex, { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 }]}>
                <AppText style={{ color: colors.unmarkedText }} fontSize={16}>
                    Completed Skills
                </AppText>
                <AppText style={{ color: selectedTree.accentColor.color1, fontFamily: "helveticaBold" }} fontSize={16}>
                    {completedSkillsQty}
                </AppText>
            </View>
            <View style={[centerFlex, { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 }]}>
                <AppText style={{ color: colors.unmarkedText }} fontSize={16}>
                    Total Skills
                </AppText>
                <AppText style={{ color: selectedTree.accentColor.color1, fontFamily: "helveticaBold" }} fontSize={16}>
                    {skillsQty}
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
        const allTrees = useAppSelector(selectAllTrees);
        const allNodes = useAppSelector(selectAllNodes);

        const { largestSubTreeName, quantity: largestSubTreeQuantity } = getLargestSubTree(allTrees);

        const { completePercentage, mostCompleteSubTreeName } = getMostCompleteSubTree(allTrees, allNodes);

        return (
            <>
                <View style={[centerFlex, { flexDirection: "row", justifyContent: "flex-start", marginBottom: 20, gap: 4, flexWrap: "wrap" }]}>
                    <AppText style={{ color: colors.unmarkedText }} fontSize={16}>
                        Largest tree is
                    </AppText>
                    <AppText style={{ color: selectedTree.accentColor.color1, fontFamily: "helveticaBold" }} fontSize={16}>
                        {largestSubTreeName}
                    </AppText>
                    <AppText style={{ color: colors.unmarkedText }} fontSize={16}>
                        with
                    </AppText>
                    <AppText style={{ color: selectedTree.accentColor.color1, fontFamily: "helveticaBold" }} fontSize={16}>
                        {largestSubTreeQuantity}
                    </AppText>
                    <AppText style={{ color: colors.unmarkedText }} fontSize={16}>
                        {largestSubTreeQuantity === 1 ? "node" : "nodes"}
                    </AppText>
                </View>
                <View style={[centerFlex, { flexDirection: "row", justifyContent: "flex-start", marginBottom: 20, gap: 4, flexWrap: "wrap" }]}>
                    <AppText style={{ color: colors.unmarkedText }} fontSize={16}>
                        Most complete tree is
                    </AppText>
                    <AppText style={{ color: selectedTree.accentColor.color1, fontFamily: "helveticaBold" }} fontSize={16}>
                        {mostCompleteSubTreeName}
                    </AppText>
                    <AppText style={{ color: colors.unmarkedText }} fontSize={16}>
                        with
                    </AppText>
                    <AppText style={{ color: selectedTree.accentColor.color1, fontFamily: "helveticaBold" }} fontSize={16}>
                        {completePercentage.toFixed(2)}%
                    </AppText>
                    <AppText style={{ color: colors.unmarkedText }} fontSize={16}>
                        completion
                    </AppText>
                </View>
            </>
        );
    }
}

function getLargestSubTree(allTrees: TreeData[]) {
    let largestSubTreeName = "";
    let quantity = 0;

    for (const tree of allTrees) {
        if (tree.nodes.length > quantity) {
            largestSubTreeName = tree.treeName;
            quantity = tree.nodes.length;
        }
    }

    return { largestSubTreeName, quantity };
}

function getMostCompleteSubTree(allTrees: TreeData[], allNodes: NormalizedNode[]) {
    let mostCompleteSubTreeName = "";
    let completeQuantity = 0;
    let quantity = 0;
    let completePercentage = 0;

    for (const tree of allTrees) {
        const treeCompleteSkillQty = allNodes.reduce((acc, node) => {
            if (node.treeId === tree.treeId && node.data.isCompleted) return acc + 1;
            return acc;
        }, 0);

        const treeCompletePercentage = (treeCompleteSkillQty / tree.nodes.length) * 100;

        if (treeCompletePercentage > completePercentage) {
            mostCompleteSubTreeName = tree.treeName;
            completeQuantity = treeCompleteSkillQty;
            quantity = tree.nodes.length;
            completePercentage = treeCompletePercentage;
        }
    }

    return { mostCompleteSubTreeName, completeQuantity, quantity, completePercentage };
}

export default Viewing;
