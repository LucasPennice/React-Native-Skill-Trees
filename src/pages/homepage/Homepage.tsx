import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { View } from "react-native";
import { StackNavigatorParams } from "../../../App";
import { useAppSelector } from "../../redux/reduxHooks";
import { selectTreeSlice } from "../../redux/userTreesSlice";
import HomepageTree from "./HomepageTree";
import WelcomeScreen from "./WelcomeScreen";

type Props = NativeStackScreenProps<StackNavigatorParams, "Home">;

function Homepage(props: Props) {
    const { navigation } = props;
    const { userTrees } = useAppSelector(selectTreeSlice);

    const userTreesChildrenQty = userTrees.length;

    const userHasAtLestOneTree = userTreesChildrenQty !== 0;

    const openCreateNewTree = () => {
        navigation.navigate("MyTrees", { openNewTreeModal: true });
    };

    return (
        <View style={{ position: "relative", flex: 1, overflow: "hidden" }}>
            {userHasAtLestOneTree ? <HomepageTree {...props} /> : <WelcomeScreen openCreateNewTree={openCreateNewTree} />}
        </View>
    );
}
export default Homepage;
