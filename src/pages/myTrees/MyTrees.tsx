import { Button, Modal, Pressable, SafeAreaView, ScrollView, TouchableHighlight, View } from "react-native";
import { Circle, Svg } from "react-native-svg";
import AppText from "../../AppText";
import { Skill, Tree, mockSkillTreeArray } from "../../types";
import { colors } from "../homepage/canvas/parameters";
import { useAppDispatch } from "../../redux/reduxHooks";
import { changeTree } from "../../redux/currentTreeSlice";
import AddTreeModal from "./modals/AddTreeModal";
import TreeCard from "./TreeCard";
import TreeOptionsModal from "./modals/TreeOptionsModal";

function MyTrees({ navigation }: { navigation: any }) {
    const dispatch = useAppDispatch();

    const factoryChangeTreeAndNavigateHome = (tree: Tree<Skill>) => () => {
        dispatch(changeTree(tree));
        navigation.navigate("Home");
    };

    return (
        <>
            <ScrollView style={{ backgroundColor: colors.background, flex: 1, paddingHorizontal: 10 }}>
                <AppText style={{ color: "white", fontSize: 32, fontFamily: "helveticaBold", marginBottom: 20 }}>My Trees</AppText>
                {mockSkillTreeArray.map((element, idx) => {
                    const changeTreeAndNavigateHome = factoryChangeTreeAndNavigateHome(element);
                    return <TreeCard element={element} changeTreeAndNavigateHome={changeTreeAndNavigateHome} key={idx} />;
                })}
            </ScrollView>

            <TreeOptionsModal />
            <AddTreeModal />
        </>
    );
}

export default MyTrees;
