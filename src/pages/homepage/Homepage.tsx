import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { View } from "react-native";
import { StackNavigatorParams } from "../../../App";
import { useAppSelector } from "../../redux/reduxHooks";
import { selectUserTrees } from "../../redux/slices/userTreesSlice";
import HomepageContents from "./HomepageContents";
import WelcomeScreen from "./WelcomeScreen";

type Props = NativeStackScreenProps<StackNavigatorParams, "Home">;

function Homepage(props: Props) {
    const { navigation } = props;
    const userTrees = useAppSelector(selectUserTrees);

    const userTreesChildrenQty = userTrees.length;

    const userHasAtLestOneTree = userTreesChildrenQty !== 0;

    const openCreateNewTree = () => {
        navigation.navigate("MyTrees", { openNewTreeModal: true });
    };

    return (
        <View style={{ position: "relative", flex: 1, overflow: "hidden" }}>
            {userHasAtLestOneTree ? <HomepageContents n={props} /> : <WelcomeScreen openCreateNewTree={openCreateNewTree} />}
        </View>
    );
}
export default Homepage;
