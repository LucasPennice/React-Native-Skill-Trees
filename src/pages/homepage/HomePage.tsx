import { View } from "react-native";
import TreeView from "./canvas/TreeView";
import ChildrenHoistSelectorModal from "./modals/ChildrenHoistSelector";
import ProgressIndicatorAndName from "./components/ProgressIndicatorAndName";
import SettingsMenu from "./components/SettingsMenu";
import TreeSelectorModal from "./modals/TreeSelectorModal";
import ChooseTree from "./ChooseTree";
import { colors } from "./canvas/parameters";
import { useAppSelector } from "../../redux/reduxHooks";
import { selectCurrentTree } from "../../redux/currentTreeSlice";
import AppText from "../../AppText";

export const NAV_HEGIHT = 65;

function HomePage() {
    const { value: currentTree } = useAppSelector(selectCurrentTree);

    return (
        <View style={{ position: "relative", backgroundColor: colors.background }}>
            <TreeView />
            <ProgressIndicatorAndName />
            <ChooseTree />
            {currentTree !== undefined && <SettingsMenu />}

            <TreeSelectorModal />
            <ChildrenHoistSelectorModal />
        </View>
    );
}

export default HomePage;
