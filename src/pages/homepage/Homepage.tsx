import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { View } from "react-native";
import { StackNavigatorParams } from "../../../App";
import { selectCanvasDisplaySettings } from "../../redux/slices/canvasDisplaySettingsSlice";
import { useAppSelector } from "../../redux/reduxHooks";
import { selectSafeScreenDimentions } from "../../redux/slices/screenDimentionsSlice";
import { selectUserTrees } from "../../redux/slices/userTreesSlice";
import HomepageTree from "./HomepageTree";
import WelcomeScreen from "./WelcomeScreen";

type Props = NativeStackScreenProps<StackNavigatorParams, "Home">;

function Homepage(props: Props) {
    const { navigation } = props;
    const userTrees = useAppSelector(selectUserTrees);
    const screenDimensions = useAppSelector(selectSafeScreenDimentions);
    const canvasDisplaySettings = useAppSelector(selectCanvasDisplaySettings);

    const userTreesChildrenQty = userTrees.length;

    const userHasAtLestOneTree = userTreesChildrenQty !== 0;

    const openCreateNewTree = () => {
        navigation.navigate("MyTrees", { openNewTreeModal: true });
    };

    return (
        <View style={{ position: "relative", flex: 1, overflow: "hidden" }}>
            {userHasAtLestOneTree ? (
                <HomepageTree n={props} state={{ canvasDisplaySettings, screenDimensions, userTrees }} />
            ) : (
                <WelcomeScreen openCreateNewTree={openCreateNewTree} />
            )}
        </View>
    );
}
export default Homepage;
