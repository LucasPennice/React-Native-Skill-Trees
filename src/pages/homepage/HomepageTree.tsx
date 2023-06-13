import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCanvasRef } from "@shopify/react-native-skia";
import { useMemo, useState } from "react";
import { StackNavigatorParams } from "../../../App";
import CanvasSettingsModal from "../../components/CanvasSettingsModal";
import OpenSettingsMenu from "../../components/OpenSettingsMenu";
import ProgressIndicatorAndName from "../../components/ProgressIndicatorAndName";
import ShareTreeLayout from "../../components/takingScreenshot/ShareTreeScreenshot";
import InteractiveTree from "../../components/treeRelated/InteractiveTree";
import { mutateEveryTreeNode } from "../../functions/mutateTree";
import { CanvasDisplaySettings } from "../../redux/canvasDisplaySettingsSlice";
import { ScreenDimentions } from "../../redux/screenDimentionsSlice";
import { Skill, Tree, getDefaultSkillValue } from "../../types";
import useHandleMemoizedTreeProps from "./useHandleMemoizedTreeProps";

type Props = {
    n: NativeStackScreenProps<StackNavigatorParams, "Home">;
    state: {
        screenDimensions: ScreenDimentions;
        canvasDisplaySettings: CanvasDisplaySettings;
        userTrees: Tree<Skill>[];
    };
};

function HomepageTree({ n: { navigation, route }, state }: Props) {
    const { canvasDisplaySettings, userTrees } = state;
    //State
    const [isTakingScreenshot, setIsTakingScreenshot] = useState(false);
    const [canvasSettings, setCanvasSettings] = useState(false);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    //Derived State
    const homepageTree = useMemo(() => buildHomepageTree(userTrees, canvasDisplaySettings), [canvasDisplaySettings, userTrees]);

    const canvasRef = useCanvasRef();

    const interactiveTreeProps = useHandleMemoizedTreeProps(state, [selectedNodeId, setSelectedNodeId], canvasRef, homepageTree, navigation);
    const { RenderOnSelectedNodeId, config, functions, interactiveTreeState } = interactiveTreeProps;

    return (
        <>
            <InteractiveTree
                config={config}
                state={interactiveTreeState}
                tree={homepageTree}
                functions={functions}
                renderOnSelectedNodeId={RenderOnSelectedNodeId}
            />
            <ProgressIndicatorAndName tree={homepageTree} />
            <OpenSettingsMenu openModal={() => setCanvasSettings(true)} show={selectedNodeId === null} />
            <ShareTreeLayout
                canvasRef={canvasRef}
                shouldShare={selectedNodeId === null}
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
