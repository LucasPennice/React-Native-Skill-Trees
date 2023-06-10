import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCanvasRef } from "@shopify/react-native-skia";
import { useState } from "react";
import { StackNavigatorParams } from "../../../App";
import CanvasSettingsModal from "../../components/CanvasSettingsModal";
import OpenSettingsMenu from "../../components/OpenSettingsMenu";
import ProgressIndicatorAndName from "../../components/ProgressIndicatorAndName";
import ShareTreeLayout from "../../components/takingScreenshot/ShareTreeScreenshot";
import InteractiveTree, { InteractiveNodeState, InteractiveTreeConfig, InteractiveTreeFunctions } from "../../components/treeRelated/InteractiveTree";
import SelectedNodeMenu, { SelectedNodeMenuState } from "../../components/treeRelated/selectedNodeMenu/SelectedNodeMenu";
import useGetMenuFunctions from "../../components/treeRelated/selectedNodeMenu/useGetMenuFunctions";
import { findNodeById } from "../../functions/extractInformationFromTree";
import { mutateEveryTreeNode } from "../../functions/mutateTree";
import { CanvasDisplaySettings, selectCanvasDisplaySettings } from "../../redux/canvasDisplaySettingsSlice";
import { useAppSelector } from "../../redux/reduxHooks";
import { selectSafeScreenDimentions } from "../../redux/screenDimentionsSlice";
import { selectTreeSlice } from "../../redux/userTreesSlice";
import { Skill, Tree, getDefaultSkillValue } from "../../types";

type Props = NativeStackScreenProps<StackNavigatorParams, "Home">;

function HomepageTree({ navigation }: Props) {
    //Redux State
    const screenDimensions = useAppSelector(selectSafeScreenDimentions);
    const canvasDisplaySettings = useAppSelector(selectCanvasDisplaySettings);
    const { userTrees } = useAppSelector(selectTreeSlice);
    //State
    const [isTakingScreenshot, setIsTakingScreenshot] = useState(false);
    const [canvasSettings, setCanvasSettings] = useState(false);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    //Derived State
    const homepageTree = buildHomepageTree(userTrees, canvasDisplaySettings);

    const onNodeClick = (node: Tree<Skill>) => {
        const nodeId = node.nodeId;

        setSelectedNodeId(nodeId);

        return;
    };

    const canvasRef = useCanvasRef();

    //CHANGE REDUX STATE TO HOLD NODE LATER 😝
    const selectedNode = findNodeById(homepageTree, selectedNodeId);

    const clearSelectedNode = () => setSelectedNodeId(null);

    //Interactive Tree Props
    const config: InteractiveTreeConfig = { canvasDisplaySettings, isInteractive: true, renderStyle: "radial" };
    const state: InteractiveNodeState = { screenDimensions, canvasRef, selectedNodeId };
    const functions: InteractiveTreeFunctions = { onNodeClick };
    //Interactive Tree Props - SelectedNodeMenu
    const menuFunctions = useGetMenuFunctions({ selectedNode, navigation, clearSelectedNode });
    const selectedNodeMenuState: SelectedNodeMenuState = { screenDimensions, selectedNode: selectedNode! };

    return (
        <>
            <InteractiveTree
                config={config}
                state={state}
                tree={homepageTree}
                functions={functions}
                renderOnSelectedNodeId={<SelectedNodeMenu functions={menuFunctions} state={selectedNodeMenuState} />}
            />
            <ProgressIndicatorAndName tree={homepageTree} />
            <OpenSettingsMenu openModal={() => setCanvasSettings(true)} />
            <ShareTreeLayout
                canvasRef={canvasRef}
                shouldShare
                takingScreenShotState={[isTakingScreenshot, setIsTakingScreenshot]}
                tree={homepageTree}
            />
            <CanvasSettingsModal open={canvasSettings} closeModal={() => setCanvasSettings(false)} />
        </>
    );
}

export default HomepageTree;

function buildHomepageTree(userTrees: Tree<Skill>[], canvasDisplaySettings: CanvasDisplaySettings) {
    const { homepageTreeColor, homepageTreeName } = canvasDisplaySettings;
    const ROOT_ID = "homepageRoot";

    const modifiedUserTrees = userTrees.map((uT) => {
        const treeWithUpdatedLevel = mutateEveryTreeNode(uT, increaseLevelByOne);

        if (!treeWithUpdatedLevel) throw new Error("buildHomepageTree not treeWithUpdatedLevel");

        return { ...treeWithUpdatedLevel, isRoot: false, parentId: ROOT_ID };
    });

    const result: Tree<Skill> = {
        accentColor: homepageTreeColor,
        nodeId: ROOT_ID,
        isRoot: true,
        children: modifiedUserTrees,
        data: getDefaultSkillValue(homepageTreeName, false, { isEmoji: false, text: "S" }),
        level: 0,
        parentId: null,
        treeId: "HomepageTree",
        treeName: homepageTreeName,
        x: 0,
        y: 0,
        category: "USER",
    };

    return result;

    function increaseLevelByOne(tree: Tree<Skill>): Tree<Skill> {
        return { ...tree, level: tree.level + 1 };
    }
}
