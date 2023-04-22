import { Pressable, View } from "react-native";
import TreeView from "./canvas/TreeView";
import ChildrenHoistSelectorModal from "./modals/ChildrenHoistSelector";
import ProgressIndicatorAndName from "./components/ProgressIndicatorAndName";
import SettingsMenu from "./components/SettingsMenu";
import { CIRCLE_SIZE, colors } from "./canvas/parameters";
import { useAppDispatch, useAppSelector } from "../../redux/reduxHooks";
import { selectCurrentTree, selectTentativeTree, selectTreeSlice, setSelectedDndZone, setSelectedNode } from "../../redux/userTreesSlice";
import AddNode from "./AddNode";
import NewNodeModal from "./modals/NewNodeModal";
import useRunHomepageCleanup from "./useRunHomepageCleanup";
import { DnDZone, Skill, Tree } from "../../types";
import * as Sharing from "expo-sharing";
import { useContext, useRef } from "react";
import { ImageFormat, SkiaDomView, rect } from "@shopify/react-native-skia";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { IsSharingAvailableContext } from "../../../App";
import { selectScreenDimentions } from "../../redux/screenDimentionsSlice";
import { calculateDimentionsAndRootCoordinates, centerNodeCoordinatesInCanvas } from "./canvas/coordinateFunctions";
import { getCirclePositions } from "./canvas/coordinateFunctions";

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
    useRunHomepageCleanup();
    //Derived State
    const shouldRenderDndZones = newNode && !selectedDndZone;

    const shouldRenderShareButton = isSharingAvailable && currentTree && !selectedDndZone && !selectedNode && !newNode;

    const shareCanvasScreenShot = async () => {
        if (!canvasRef.current || !currentTree) return;

        const boundsRect = createBoundsRect(currentTree);

        const image = canvasRef.current!.makeImageSnapshot(boundsRect);

        if (!image) return;

        setTimeout(async () => {
            const encodedImage = image.encodeToBase64(ImageFormat.PNG, 99);

            const data = `data:image/png;base64,${encodedImage}`;
            const base64Code = data.split("data:image/png;base64,")[1];

            const filename = FileSystem.documentDirectory + "some_unique_file_name.png";

            await FileSystem.writeAsStringAsync(filename, base64Code, {
                encoding: FileSystem.EncodingType.Base64,
            });

            await MediaLibrary.saveToLibraryAsync(filename);

            Sharing.shareAsync(filename);
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
                    onNodeClick={(id: string) => dispatch(setSelectedNode(id))}
                    showDndZones={shouldRenderDndZones}
                    onDndZoneClick={(clickedZone: DnDZone | undefined) => dispatch(setSelectedDndZone(clickedZone))}
                />
            )}
            <ProgressIndicatorAndName />
            <AddNode />
            {currentTree !== undefined && <SettingsMenu />}

            {shouldRenderShareButton && (
                <Pressable
                    onPress={shareCanvasScreenShot}
                    style={{ position: "absolute", width: 50, height: 50, top: 70, left: 10, backgroundColor: colors.blue }}></Pressable>
            )}

            <ChildrenHoistSelectorModal />
            <NewNodeModal />
        </View>
    );
}

HomePage.whyDidYouRender = false;
// HomePage.whyDidYouRender = {
//     logOnDifferentValues: true,
//     customName: "Homeapge",
// };

export default HomePage;
