import { Alert, ScrollView, View } from "react-native";
import { useAppDispatch, useAppSelector } from "../../../redux/reduxHooks";
import { close, selectAddTree } from "../../../redux/addTreeModalSlice";
import { useEffect, useState } from "react";
import AppTextInput from "../../../components/AppTextInput";
import FlingToDismissModal from "../../../components/FlingToDismissModal";
import AppText from "../../../components/AppText";
import ColorSelector from "../../../components/ColorsSelector";
import RadioInput from "../../../components/RadioInput";
import { Skill, Tree } from "../../../types";
import { appendToUserTree } from "../../../redux/userTreesSlice";
import { createTree, makeid } from "../../../functions/misc";
import { colors, possibleTreeColors } from "../../../parameters";

function AddTreeModal() {
    //Local State
    const [treeName, setTreeName] = useState("");
    const [selectedColor, setSelectedColor] = useState("");
    const [firstSkillName, setFirstSkillName] = useState("");
    const [firstSkillComplete, setFirstSkillComplete] = useState(false);
    //Redux State
    const { open } = useAppSelector(selectAddTree);

    const dispatch = useAppDispatch();

    useEffect(() => {
        setTreeName("");
        setSelectedColor("");
        setFirstSkillName("");
        setFirstSkillComplete(false);
    }, [open]);

    const closeModal = () => dispatch(close());

    const createNewTree = () => {
        if (treeName === "" || selectedColor === "" || firstSkillName === "") return Alert.alert("Please fill all of the fields");

        const newTree = createTree(treeName, selectedColor, true, { name: firstSkillName, isCompleted: firstSkillComplete });

        dispatch(appendToUserTree(newTree));
        closeModal();
    };

    return (
        <FlingToDismissModal closeModal={closeModal} open={open} leftHeaderButton={{ onPress: createNewTree, title: "Add Tree" }}>
            <View>
                <AppTextInput
                    placeholder={"Tree Name"}
                    textState={[treeName, setTreeName]}
                    onlyContainsLettersAndNumbers
                    containerStyles={{ marginVertical: 20 }}
                />
                <AppText fontSize={16} style={{ color: colors.unmarkedText }}>
                    Select an accent color for your new tree
                </AppText>
                <AppText fontSize={16} style={{ color: colors.unmarkedText, marginBottom: 10 }}>
                    Completed skills and progress bars will show with this color
                </AppText>
                <AppText fontSize={16} style={{ color: colors.unmarkedText, marginBottom: 10 }}>
                    Scroll to see more colors
                </AppText>
                <ColorSelector colorsArray={possibleTreeColors} state={[selectedColor, setSelectedColor]} />
                <AppText fontSize={16} style={{ color: colors.unmarkedText, marginTop: 10 }}>
                    Enter the name of the first skill your tree will have
                </AppText>
                <AppText fontSize={16} style={{ color: colors.unmarkedText }}>
                    Every other skill will stem from it
                </AppText>
                <AppTextInput
                    placeholder={"First Skill Name"}
                    onlyContainsLettersAndNumbers
                    textState={[firstSkillName, setFirstSkillName]}
                    containerStyles={{ marginTop: 10, marginBottom: 20 }}
                />
                <RadioInput state={[firstSkillComplete, setFirstSkillComplete]} text={"I Mastered This Skill"} />
            </View>
        </FlingToDismissModal>
    );
}

export default AddTreeModal;
