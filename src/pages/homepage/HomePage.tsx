import { View } from "react-native";
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
import { DnDZone } from "../../types";
import { insertNodeBasedOnDnDZone } from "./canvas/coordinateFunctions";
import { getPathFromRootToNode } from "./treeFunctions";

function HomePage() {
    //Redux State
    const currentTree = useAppSelector(selectCurrentTree);
    const { selectedDndZone, newNode } = useAppSelector(selectTreeSlice);
    const tentativeNewTree = useAppSelector(selectTentativeTree);
    const dispatch = useAppDispatch();
    //Derived State
    const shouldRenderDndZones = newNode && !selectedDndZone;

    useRunHomepageCleanup();

    return (
        <View style={{ position: "relative", backgroundColor: colors.background }}>
            {currentTree && (
                <TreeView
                    tree={tentativeNewTree ?? currentTree}
                    onNodeClick={(id: string) => dispatch(setSelectedNode(id))}
                    showDndZones={shouldRenderDndZones}
                    onDndZoneClick={(clickedZone: DnDZone | undefined) => dispatch(setSelectedDndZone(clickedZone))}
                />
            )}
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
