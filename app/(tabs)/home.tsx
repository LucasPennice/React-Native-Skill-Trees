import HomepageContents from "@/pages/homepage/HomepageContents";
import WelcomeScreen from "@/pages/homepage/WelcomeScreen";
import { useAppSelector } from "@/redux/reduxHooks";
import { selectTotalTreeQty } from "@/redux/slices/newUserTreesSlice";
import { router } from "expo-router";
import { View } from "react-native";

function Home() {
    const userTreeQty = useAppSelector(selectTotalTreeQty);

    const openCreateNewTree = () => {
        router.push({ pathname: "/myTrees", params: { openNewTreeModal: true } });
    };

    return (
        <View style={{ position: "relative", flex: 1, overflow: "hidden" }}>
            {userTreeQty !== 0 ? <HomepageContents /> : <WelcomeScreen openCreateNewTree={openCreateNewTree} />}
        </View>
    );
}

export default Home;
