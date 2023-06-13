import { useCallback, useMemo } from "react";
import { InteractiveNodeState, InteractiveTreeConfig, InteractiveTreeFunctions } from "../../components/treeRelated/InteractiveTree";
import SelectedNodeMenu from "../../components/treeRelated/selectedNodeMenu/SelectedNodeMenu";
import { getMenuNonEditingFunctions } from "../../components/treeRelated/selectedNodeMenu/useGetMenuFunctions";
import { SelectedNodeId, Skill, Tree } from "../../types";
import { CanvasDisplaySettings } from "../../redux/canvasDisplaySettingsSlice";
import { ScreenDimentions } from "../../redux/screenDimentionsSlice";
import { SkiaDomView } from "@shopify/react-native-skia";
import { findNodeById } from "../../functions/extractInformationFromTree";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StackNavigatorParams } from "../../../App";

function useHandleMemoizedTreeProps(
    state: {
        screenDimensions: ScreenDimentions;
        canvasDisplaySettings: CanvasDisplaySettings;
        userTrees: Tree<Skill>[];
    },
    selectedNodeState: [SelectedNodeId, (v: SelectedNodeId) => void],
    canvasRef: React.RefObject<SkiaDomView>,
    homepageTree: Tree<Skill>,
    navigation: NativeStackNavigationProp<StackNavigatorParams, "Home", undefined>
) {
    const { canvasDisplaySettings, screenDimensions } = state;
    const [selectedNodeId, setSelectedNodeId] = selectedNodeState;

    const clearSelectedNode = () => setSelectedNodeId(null);

    const selectedNode = findNodeById(homepageTree, selectedNodeId);

    const onNodeClick = useCallback((node: Tree<Skill>) => {
        const nodeId = node.nodeId;

        setSelectedNodeId(nodeId);

        return;
        //eslint-disable-next-line
    }, []);

    //Interactive Tree Props
    const config: InteractiveTreeConfig = useMemo(() => {
        return { canvasDisplaySettings, isInteractive: true, renderStyle: "radial" };
    }, [canvasDisplaySettings]);
    const interactiveTreeState: InteractiveNodeState = useMemo(() => {
        return { screenDimensions, canvasRef, selectedNodeId };
    }, [screenDimensions, canvasRef, selectedNodeId]);
    const functions: InteractiveTreeFunctions = useMemo(() => {
        return { onNodeClick };
    }, [onNodeClick]);

    //Interactive Tree Props - SelectedNodeMenu
    const RenderOnSelectedNodeId = useMemo(() => {
        const nonEditingMenuFunctions = getMenuNonEditingFunctions(selectedNode, navigation, clearSelectedNode);

        const selectedNodeMenuState = { screenDimensions, selectedNode: selectedNode!, selectedTree: homepageTree };

        return <SelectedNodeMenu functions={nonEditingMenuFunctions} state={selectedNodeMenuState} />;
        //eslint-disable-next-line
    }, [homepageTree, navigation, screenDimensions, selectedNode]);

    return { config, interactiveTreeState, functions, RenderOnSelectedNodeId };
}

export default useHandleMemoizedTreeProps;
