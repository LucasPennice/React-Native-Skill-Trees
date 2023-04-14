import { ScrollView } from "react-native";
import AppText from "../../components/AppText";
import { colors } from "../homepage/canvas/parameters";
import { useAppDispatch, useAppSelector } from "../../redux/reduxHooks";
import { changeTree, selectTreeSlice } from "../../redux/userTreesSlice";
import AddTreeModal from "./modals/AddTreeModal";
import TreeCard from "./TreeCard";
import EditTreeModal from "./modals/EditTreeModal";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StackNavigatorParams } from "../../../App";

type Props = NativeStackScreenProps<StackNavigatorParams, "MyTrees">;

function MyTrees({ navigation }: Props) {
    //Redux Related
    const { userTrees } = useAppSelector(selectTreeSlice);
    const dispatch = useAppDispatch();

    const factoryChangeTreeAndNavigateHome = (treeId: string) => () => {
        dispatch(changeTree(treeId));
        navigation.navigate("Home");
    };

    return (
        <>
            <ScrollView style={{ backgroundColor: colors.background, flex: 1, paddingHorizontal: 10 }}>
                <AppText style={{ color: "white", fontFamily: "helveticaBold", marginBottom: 5 }} fontSize={32}>
                    My Trees
                </AppText>
                <AppText style={{ color: `${colors.unmarkedText}8D`, marginBottom: 5 }} fontSize={16}>
                    Tap a roadmap to access it
                </AppText>
                <AppText style={{ color: `${colors.unmarkedText}8D`, marginBottom: 20 }} fontSize={16}>
                    Long press to access it's options menu
                </AppText>

                {userTrees.map((element, idx) => {
                    const changeTreeAndNavigateHome = factoryChangeTreeAndNavigateHome(element.treeId ?? "");
                    return <TreeCard element={element} changeTreeAndNavigateHome={changeTreeAndNavigateHome} key={idx} />;
                })}
            </ScrollView>

            <EditTreeModal />
            <AddTreeModal />
        </>
    );
}

export default MyTrees;
