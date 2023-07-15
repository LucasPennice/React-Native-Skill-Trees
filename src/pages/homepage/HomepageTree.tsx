import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCanvasRef } from "@shopify/react-native-skia";
import { useEffect, useMemo, useState } from "react";
import { StackNavigatorParams } from "../../../App";
import CanvasSettingsModal from "../../components/treeRelated/canvasSettingsModal/CanvasSettingsModal";
import OpenSettingsMenu from "../../components/OpenSettingsMenu";
import ProgressIndicatorAndName from "../../components/ProgressIndicatorAndName";
import ShareTreeLayout from "../../components/takingScreenshot/ShareTreeScreenshot";
import InteractiveTree from "../../components/treeRelated/InteractiveTree";
import { CanvasDisplaySettings } from "../../redux/canvasDisplaySettingsSlice";
import { ScreenDimentions } from "../../redux/screenDimentionsSlice";
import { Skill, Tree, getDefaultSkillValue } from "../../types";
import useHandleMemoizedHomeTreeProps from "./useHandleMemoizedHomeTreeProps";

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

    const openCanvasSettings = () => setCanvasSettings(true);
    //Derived State
    const homepageTree = useMemo(() => buildHomepageTree(userTrees, canvasDisplaySettings), [canvasDisplaySettings, userTrees]);

    const canvasRef = useCanvasRef();

    const interactiveTreeProps = useHandleMemoizedHomeTreeProps(
        state,
        [selectedNodeId, setSelectedNodeId],
        canvasRef,
        homepageTree,
        navigation,
        openCanvasSettings
    );
    const { RenderOnSelectedNodeId, config, functions, interactiveTreeState } = interactiveTreeProps;

    useEffect(() => {
        navigation.addListener("state", (_) => setSelectedNodeId(null));
        return () => {
            navigation.removeListener("state", (_) => setSelectedNodeId(null));
        };
    }, []);

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
    const { homepageTreeColor, homepageTreeName, homepageTreeIcon } = canvasDisplaySettings;
    const ROOT_ID = "homepageRoot";

    const modifiedUserTrees = userTrees.map((tree) => {
        return { ...tree, isRoot: false, parentId: ROOT_ID };
    });

    const isEmoji = homepageTreeIcon !== "";
    const text = isEmoji ? homepageTreeIcon : homepageTreeName[0];

    const result: Tree<Skill> = {
        accentColor: homepageTreeColor,
        nodeId: ROOT_ID,
        isRoot: true,
        children: modifiedUserTrees,
        data: getDefaultSkillValue(homepageTreeName, false, { isEmoji, text }),
        level: 0,
        parentId: null,
        treeId: "HomepageTree",
        treeName: homepageTreeName,
        x: 0,
        y: 0,
        category: "USER",
    };

    return result;
}
