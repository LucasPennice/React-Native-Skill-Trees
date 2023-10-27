import HomepageContents from "@/pages/homepage/HomepageContents";
import WelcomeScreen from "@/pages/homepage/WelcomeScreen";
import { useAppSelector } from "@/redux/reduxHooks";
import { selectTotalTreeQty } from "@/redux/slices/userTreesSlice";
import { View } from "react-native";

function Home() {
    const userTreeQty = useAppSelector(selectTotalTreeQty);

    return <View style={{ position: "relative", flex: 1, overflow: "hidden" }}>{userTreeQty !== 0 ? <HomepageContents /> : <WelcomeScreen />}</View>;
}

export default Home;
