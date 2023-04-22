import { Pressable, View } from "react-native";
import TreeView from "./canvas/TreeView";
import ChildrenHoistSelectorModal from "./modals/ChildrenHoistSelector";
import ProgressIndicatorAndName from "./components/ProgressIndicatorAndName";
import SettingsMenu from "./components/SettingsMenu";
import { colors } from "./canvas/parameters";
import { useAppDispatch, useAppSelector } from "../../redux/reduxHooks";
import { selectCurrentTree, selectTentativeTree, selectTreeSlice, setSelectedDndZone, setSelectedNode } from "../../redux/userTreesSlice";
import AddNode from "./AddNode";
import NewNodeModal from "./modals/NewNodeModal";
import useRunHomepageCleanup from "./useRunHomepageCleanup";
import { DnDZone, Skill, Tree, centerFlex } from "../../types";
import * as Sharing from "expo-sharing";
import { useContext, useRef, useState } from "react";
import { ImageFormat, SkiaDomView, rect } from "@shopify/react-native-skia";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { IsSharingAvailableContext } from "../../../App";
import { selectScreenDimentions } from "../../redux/screenDimentionsSlice";
import { calculateDimentionsAndRootCoordinates, centerNodeCoordinatesInCanvas } from "./canvas/coordinateFunctions";
import { getCirclePositions } from "./canvas/coordinateFunctions";
import TakingScreenshotLoadingScreenModal from "./modals/TakingScreenshotLoadingScreenModal";
import AppText from "../../components/AppText";

type HomepageModes = "SelectedNode" | "AddingNode" | "TakingScreenshot" | "Idle";

function HomePage() {
    //Redux State
    const currentTree = useAppSelector(selectCurrentTree);
    const { selectedDndZone, newNode, selectedNode } = useAppSelector(selectTreeSlice);
    const screenDimentions = useAppSelector(selectScreenDimentions);
    const tentativeNewTree = useAppSelector(selectTentativeTree);
    const dispatch = useAppDispatch();
    //Hooks
    const isSharingAvailable = useContext(IsSharingAvailableContext);
    const canvasRef = useRef<SkiaDomView | null>(null);
    const [isTakingScreenshot, setIsTakingScreenshot] = useState(false);
    useRunHomepageCleanup();
    //Derived State
    const shouldRenderDndZones = newNode && !selectedDndZone;
    const homepageMode = getHomepageMode();
    const shouldRenderShareButton = isSharingAvailable && currentTree && homepageMode === "Idle";

    const onNodeClick = (id: string) => {
        if (homepageMode !== "Idle") return;
        dispatch(setSelectedNode(id));
    };

    const onDndZoneClick = (clickedZone: DnDZone | undefined) => {
        if (homepageMode !== "AddingNode") return;
        dispatch(setSelectedDndZone(clickedZone));
    };

    const shareCanvasScreenShot = async () => {
        if (!canvasRef.current || !currentTree) return;

        setIsTakingScreenshot(true);

        const boundsRect = createBoundsRect(currentTree);

        const image1 = canvasRef.current!.makeImageSnapshot(boundsRect);
        const image2 = canvasRef.current!.makeImageSnapshot(boundsRect);
        const image3 = canvasRef.current!.makeImageSnapshot(boundsRect);
        const image4 = canvasRef.current!.makeImageSnapshot(boundsRect);
        const image5 = canvasRef.current!.makeImageSnapshot(boundsRect);

        const encodedImage1 = image1.encodeToBase64(ImageFormat.PNG, 99);
        const encodedImage2 = image2.encodeToBase64(ImageFormat.PNG, 99);
        const encodedImage3 = image3.encodeToBase64(ImageFormat.PNG, 99);
        const encodedImage4 = image4.encodeToBase64(ImageFormat.PNG, 99);
        const encodedImage5 = image5.encodeToBase64(ImageFormat.PNG, 99);

        const encodedImages = [encodedImage1, encodedImage2, encodedImage3, encodedImage4, encodedImage5];

        let tentativeBestEncodedImage: string | null = null;

        for (let index = 0; index < encodedImages.length; index++) {
            const encodedImage = encodedImages[index];

            if (tentativeBestEncodedImage === null || encodedImage.length > tentativeBestEncodedImage.length) {
                tentativeBestEncodedImage = encodedImage;
            }
        }

        setTimeout(async () => {
            const data = `data:image/png;base64,${tentativeBestEncodedImage}`;
            const base64Code = data.split("data:image/png;base64,")[1];

            const filename = FileSystem.documentDirectory + `${currentTree.treeName ?? "yourTree"}` + ".png";

            await FileSystem.writeAsStringAsync(filename, base64Code, {
                encoding: FileSystem.EncodingType.Base64,
            });

            await MediaLibrary.saveToLibraryAsync(filename);

            await Sharing.shareAsync(filename);

            setIsTakingScreenshot(false);
        }, 1000);

        function createBoundsRect(tree: Tree<Skill>) {
            const nodeCoordinates = getCirclePositions(tree);
            const canvasDimentions = calculateDimentionsAndRootCoordinates(nodeCoordinates, screenDimentions);
            const centeredCoord = centerNodeCoordinatesInCanvas(nodeCoordinates, canvasDimentions);

            const xCoordArray = centeredCoord.map((c) => c.x);
            const yCoordArray = centeredCoord.map((c) => c.y);
            const maxX = Math.max(...xCoordArray);
            const maxY = Math.max(...yCoordArray);

            const result = rect(0, 0, maxX * 10, maxY * 10);

            return result;
        }
    };

    return (
        <View style={{ position: "relative", backgroundColor: colors.background }}>
            {currentTree && (
                <TreeView
                    tree={tentativeNewTree ?? currentTree}
                    canvasRef={canvasRef}
                    onNodeClick={onNodeClick}
                    showDndZones={shouldRenderDndZones}
                    onDndZoneClick={onDndZoneClick}
                    isTakingScreenshot={isTakingScreenshot}
                />
            )}
            <ProgressIndicatorAndName />
            {(homepageMode === "Idle" || homepageMode === "AddingNode") && <AddNode />}
            {currentTree !== undefined && <SettingsMenu />}

            {shouldRenderShareButton && (
                <Pressable
                    onPress={shareCanvasScreenShot}
                    style={[
                        centerFlex,
                        {
                            position: "absolute",
                            width: 50,
                            height: 50,
                            top: 70,
                            left: 10,
                            backgroundColor: colors.darkGray,
                            borderRadius: 10,
                        },
                    ]}>
                    <AppText fontSize={24} style={{ lineHeight: 33 }}>
                        🌎
                    </AppText>
                </Pressable>
            )}

            <ChildrenHoistSelectorModal />
            <NewNodeModal />
            <TakingScreenshotLoadingScreenModal open={isTakingScreenshot} />
        </View>
    );

    function getHomepageMode(): HomepageModes {
        if (selectedNode !== null) return "SelectedNode";
        if (newNode !== undefined) return "AddingNode";
        if (isTakingScreenshot) return "TakingScreenshot";
        return "Idle";
    }
}

HomePage.whyDidYouRender = false;
// HomePage.whyDidYouRender = {
//     logOnDifferentValues: true,
//     customName: "Homeapge",
// };

export default HomePage;
