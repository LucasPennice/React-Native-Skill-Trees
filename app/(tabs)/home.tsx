import HomepageContents from "@/pages/homepage/HomepageContents";
import WelcomeScreen from "@/pages/homepage/WelcomeScreen";
import { useAppSelector } from "@/redux/reduxHooks";
import { selectUserTrees } from "@/redux/slices/userTreesSlice";
import { router } from "expo-router";
import { View } from "react-native";

function Home() {
    const userTrees = useAppSelector(selectUserTrees);

    const userTreesChildrenQty = userTrees.length;

    const userHasAtLestOneTree = userTreesChildrenQty !== 0;

    const openCreateNewTree = () => {
        router.push({ pathname: "/myTrees", params: { openNewTreeModal: true } });
    };

    return (
        <View style={{ position: "relative", flex: 1, overflow: "hidden" }}>
            {userHasAtLestOneTree ? <HomepageContents /> : <WelcomeScreen openCreateNewTree={openCreateNewTree} />}
        </View>
    );
}

export default Home;
