import { View } from "react-native";
import CanvasTest from "../canvas/CanvasTest";
import ChildrenHoistSelectorModal from "./ChildrenHoistSelector";
import ProgressIndicator from "./ProgressIndicator";
import SettingsMenu from "./SettingsMenu";
import TreeName from "./TreeName";
import TreeSelectorModal from "./TreeSelectorModal";

export const NAV_HEGIHT = 75;

function HomePage() {
    return (
        <View style={{ position: "relative" }}>
            <CanvasTest />
            <ProgressIndicator />
            <TreeName />
            <SettingsMenu />

            <TreeSelectorModal />
            <ChildrenHoistSelectorModal />
        </View>
    );
}

export default HomePage;
