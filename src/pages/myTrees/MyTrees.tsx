import { Button, Modal, Pressable, SafeAreaView, ScrollView, TouchableHighlight, View } from "react-native";
import { Circle, Svg } from "react-native-svg";
import AppText from "../../components/AppText";
import { Skill, Tree, mockSkillTreeArray } from "../../types";
import { colors } from "../homepage/canvas/parameters";
import { useAppDispatch, useAppSelector } from "../../redux/reduxHooks";
import { changeTree, selectTreeSlice } from "../../redux/userTreesSlice";
import AddTreeModal from "./modals/AddTreeModal";
import TreeCard from "./TreeCard";
import EditTreeModal from "./modals/EditTreeModal";

function MyTrees({ navigation }: { navigation: any }) {
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
                <AppText style={{ color: "white", fontSize: 32, fontFamily: "helveticaBold", marginBottom: 5 }}>My Trees</AppText>
                <AppText style={{ color: colors.unmarkedText, marginBottom: 5, fontSize: 16 }}>Tap a roadmap to access it</AppText>
                <AppText style={{ color: colors.unmarkedText, marginBottom: 20, fontSize: 16 }}>Long press to access it's options menu</AppText>

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
