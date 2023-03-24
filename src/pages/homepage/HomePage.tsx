import { View } from "react-native";
import TreeView from "./canvas/TreeView";
import ChildrenHoistSelectorModal from "./modals/ChildrenHoistSelector";
import ProgressIndicator from "./components/ProgressIndicator";
import SettingsMenu from "./components/SettingsMenu";
import TreeName from "./components/TreeName";
import TreeSelectorModal from "./modals/TreeSelectorModal";

export const NAV_HEGIHT = 75;

function HomePage() {
    return (
        <View style={{ position: "relative" }}>
            <TreeView />
            <ProgressIndicator />
            <TreeName />
            <SettingsMenu />

            <TreeSelectorModal />
            <ChildrenHoistSelectorModal />
        </View>
    );
}

export default HomePage;
