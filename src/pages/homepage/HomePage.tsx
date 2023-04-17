import { View } from "react-native";
import TreeView from "./canvas/TreeView";
import ChildrenHoistSelectorModal from "./modals/ChildrenHoistSelector";
import ProgressIndicatorAndName from "./components/ProgressIndicatorAndName";
import SettingsMenu from "./components/SettingsMenu";
import { colors } from "./canvas/parameters";
import { useAppDispatch, useAppSelector } from "../../redux/reduxHooks";
import { selectCurrentTree, setSelectedDndZone, setSelectedNode } from "../../redux/userTreesSlice";
import AddNode from "./AddNode";
import NewNodeModal from "./modals/NewNodeModal";
import useRunHomepageCleanup from "./useRunHomepageCleanup";
import { DnDZone } from "../../types";

function HomePage() {
    //Redux State
    const currentTree = useAppSelector(selectCurrentTree);
    const dispatch = useAppDispatch();
    //

    useRunHomepageCleanup();

    return (
        <View style={{ position: "relative", backgroundColor: colors.background }}>
            {currentTree && (
                <TreeView
                    tree={currentTree}
                    onNodeClick={(id: string) => dispatch(setSelectedNode(id))}
                    showDndZones={true}
                    onDndZoneClick={(clickedZone: DnDZone | undefined) => dispatch(setSelectedDndZone(clickedZone))}
                />
            )}

            {/* <DragAndDropNewNode handleNewNode={handleNewNode} treeAccent={currentTree?.accentColor} /> */}
            <ProgressIndicatorAndName />
            <AddNode />
            {currentTree !== undefined && <SettingsMenu />}

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
