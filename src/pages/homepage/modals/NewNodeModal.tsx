import { BlurView } from "expo-blur";
import { useEffect, useState } from "react";
import { Modal, Pressable, SafeAreaView, TextInput, View, Dimensions, TouchableOpacity, TouchableHighlight, Alert } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import AppText from "../../../components/AppText";
import { selectCanvasDisplaySettings, toggleNewNode } from "../../../redux/canvasDisplaySettingsSlice";
import { useAppDispatch, useAppSelector } from "../../../redux/reduxHooks";
import { colors } from "../canvas/parameters";
import FlingToDismissModal from "../../../components/FlingToDismissModal";
import AppTextInput from "../../../components/AppTextInput";
import RadioInput from "../../../components/RadioInput";
import { makeid } from "../../myTrees/functions";
import { setNewNode, setSelectedNode } from "../../../redux/userTreesSlice";

function NewNodeModal() {
    const { openMenu } = useAppSelector(selectCanvasDisplaySettings);
    const dispatch = useAppDispatch();

    const [text, onChangeText] = useState("");
    const [isCompleted, setIsCompleted] = useState(false);

    useEffect(() => {
        onChangeText("");
        setIsCompleted(false);
    }, [openMenu]);

    const closeModal = () => dispatch(toggleNewNode());

    const addNewNode = () => {
        if (text === "") return Alert.alert("Please enter a name for the new skill");
        dispatch(setNewNode({ name: text.trim(), isCompleted, id: makeid(24) }));
        dispatch(toggleNewNode());
        dispatch(setSelectedNode(null));
    };

    return (
        <FlingToDismissModal closeModal={closeModal} open={openMenu == "newNode"} leftHeaderButton={{ onPress: addNewNode, title: "Confirm" }}>
            <View style={{ flex: 1, marginTop: 20 }}>
                <AppText style={{ color: colors.unmarkedText, marginBottom: 10 }} fontSize={16}>
                    Enter the name of the new skill you'll add to the roadmap
                </AppText>

                <AppTextInput
                    placeholder={"Skill Name"}
                    textState={[text, onChangeText]}
                    onlyContainsLettersAndNumbers
                    containerStyles={{ marginBottom: 15 }}
                />
                <RadioInput state={[isCompleted, setIsCompleted]} text={"I Mastered This Skill"} />
            </View>
        </FlingToDismissModal>
    );
}

export default NewNodeModal;
