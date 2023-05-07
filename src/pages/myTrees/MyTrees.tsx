import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ScrollView } from "react-native";
import { StackNavigatorParams } from "../../../App";
import AppText from "../../components/AppText";
import { colors } from "../../parameters";
import { useAppDispatch, useAppSelector } from "../../redux/reduxHooks";
import { changeTree, selectTreeSlice } from "../../redux/userTreesSlice";
import TreeCard from "./TreeCard";
import AddTreeModal from "./modals/AddTreeModal";
import EditTreeModal from "./modals/EditTreeModal";

type Props = NativeStackScreenProps<StackNavigatorParams, "MyTrees">;

function MyTrees({ navigation }: Props) {
    //Redux Related
    const { userTrees } = useAppSelector(selectTreeSlice);
    const dispatch = useAppDispatch();

    const factoryChangeTreeAndNavigateToViewingTree = (treeId: string) => () => {
        dispatch(changeTree(treeId));
        navigation.navigate("ViewingSkillTree");
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

                {userTrees.length > 0 &&
                    userTrees.map((element, idx) => {
                        const changeTreeAndNavigateToViewingTree = factoryChangeTreeAndNavigateToViewingTree(element.treeId ?? "");
                        return <TreeCard element={element} changeTreeAndNavigateToViewingTree={changeTreeAndNavigateToViewingTree} key={idx} />;
                    })}
            </ScrollView>

            <EditTreeModal />
            <AddTreeModal />
        </>
    );
}

export default MyTrees;
