import { useEffect, useState } from "react";
import { Alert, View } from "react-native";
import AppText from "../../../components/AppText";
import AppTextInput from "../../../components/AppTextInput";
import ColorSelector from "../../../components/ColorsSelector";
import FlingToDismissModal from "../../../components/FlingToDismissModal";
import { createTree } from "../../../functions/misc";
import { colors, possibleTreeColors } from "../../../parameters";
import { close, selectAddTree } from "../../../redux/addTreeModalSlice";
import { useAppDispatch, useAppSelector } from "../../../redux/reduxHooks";
import { appendToUserTree } from "../../../redux/userTreesSlice";
import { getDefaultSkillValue } from "../../../types";

function AddTreeModal() {
    //Local State
    const [treeName, setTreeName] = useState("");
    const [selectedColor, setSelectedColor] = useState("");
    //Redux State
    const { open } = useAppSelector(selectAddTree);

    const dispatch = useAppDispatch();

    useEffect(() => {
        setTreeName("");
        setSelectedColor("");
    }, [open]);

    const closeModal = () => dispatch(close());

    const createNewTree = () => {
        if (treeName === "" || selectedColor === "") return Alert.alert("Please fill all of the fields");

        const newTree = createTree(treeName, selectedColor, true, "SKILL_TREE", getDefaultSkillValue(treeName, true));

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
            </View>
        </FlingToDismissModal>
    );
}

export default AddTreeModal;
