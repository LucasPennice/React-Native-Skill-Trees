import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCanvasRef } from "@shopify/react-native-skia";
import { useEffect, useMemo, useState } from "react";
import { StackNavigatorParams } from "../../../App";
import OpenSettingsMenu from "../../components/OpenSettingsMenu";
import ProgressIndicatorAndName from "../../components/ProgressIndicatorAndName";
import ShareTreeLayout from "../../components/takingScreenshot/ShareTreeScreenshot";
import InteractiveTree from "../../components/treeRelated/InteractiveTree";
import CanvasSettingsModal from "../../components/treeRelated/canvasSettingsModal/CanvasSettingsModal";
import { buildHomepageTree } from "../../functions/treeToRadialCoordinates/general";
import { CanvasDisplaySettings } from "../../redux/canvasDisplaySettingsSlice";
import { ScreenDimentions } from "../../redux/screenDimentionsSlice";
import { Skill, Tree } from "../../types";
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
