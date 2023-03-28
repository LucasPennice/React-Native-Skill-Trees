import { View } from "react-native";
import TreeView from "./canvas/TreeView";
import ChildrenHoistSelectorModal from "./modals/ChildrenHoistSelector";
import ProgressIndicatorAndName from "./components/ProgressIndicatorAndName";
import SettingsMenu from "./components/SettingsMenu";
import TreeSelectorModal from "./modals/TreeSelectorModal";
import ChooseTree from "./ChooseTree";

export const NAV_HEGIHT = 75;

function HomePage() {
    return (
        <View style={{ position: "relative" }}>
            <TreeView />
            <ProgressIndicatorAndName />
            <ChooseTree />
            <SettingsMenu />

            <TreeSelectorModal />
            <ChildrenHoistSelectorModal />
        </View>
    );
}

export default HomePage;
