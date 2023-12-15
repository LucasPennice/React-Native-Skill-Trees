import AppEmojiPicker, { Emoji } from "@/components/AppEmojiPicker";
import { generateMongoCompliantId, toggleEmoji } from "@/functions/misc";
import { TreeData, addUserTrees, selectTotalTreeQty } from "@/redux/slices/userTreesSlice";
import { selectUserVariables } from "@/redux/slices/userVariablesSlice";
import { HandleModalsContext } from "app/(app)/_layout";
import { SubscriptionContext, mixpanel } from "app/_layout";
import { router } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { Alert, Pressable, View } from "react-native";
import AppText from "../../../components/AppText";
import AppTextInput from "../../../components/AppTextInput";
import ColorGradientSelector from "../../../components/ColorGradientSelector";
import FlingToDismissModal from "../../../components/FlingToDismissModal";
import { colors, nodeGradients } from "../../../parameters";
import { useAppDispatch, useAppSelector } from "../../../redux/reduxHooks";
import { close, selectAddTree } from "../../../redux/slices/addTreeModalSlice";
import { ColorGradient } from "../../../types";

const useClearStateOnOpen = (open: boolean, cleanup: () => void) => {
    useEffect(() => {
        cleanup();
    }, [open]);
};

const useHandleRedirectFreeUser = (open: boolean) => {
    const treeQty = useAppSelector(selectTotalTreeQty);
    const { isProUser } = useContext(SubscriptionContext);

    const dispatch = useAppDispatch();
    const closeModal = () => dispatch(close());

    useEffect(() => {
        if (!open) return;

        if (treeQty < 3) return;
        if (isProUser === null || isProUser === true) return;

        closeModal();
        router.push("/(app)/postOnboardingPaywall");
    }, [isProUser, treeQty, open]);
};

function AddTreeModal() {
    //Local State
    const [treeName, setTreeName] = useState("");
    const [selectedColorGradient, setSelectedColorGradient] = useState<ColorGradient | undefined>(undefined);

    const [emoji, setEmoji] = useState<Emoji | undefined>(undefined);
    const [emojiSelectorOpen, setEmojiSelectorOpen] = useState(false);
    //Redux State
    const { open } = useAppSelector(selectAddTree);
    const { onboardingStep } = useAppSelector(selectUserVariables);
    const dispatch = useAppDispatch();

    useHandleRedirectFreeUser(open);

    const { modal: setShowOnboarding } = useContext(HandleModalsContext);

    useClearStateOnOpen(open, cleanup);

    const closeModal = () => dispatch(close());

    const createNewTree = () => {
        if (treeName === "") return Alert.alert("Please give the tree a name");
        if (!selectedColorGradient) return Alert.alert("Please select a color");

        const isEmoji = emoji === undefined ? false : true;
        const iconText = emoji?.emoji ?? treeName[0];

        const rootNodeId = generateMongoCompliantId();

        const newUserTree: TreeData = {
            accentColor: selectedColorGradient,
            icon: { isEmoji, text: iconText },
            nodes: [rootNodeId],
            rootNodeId,
            treeId: generateMongoCompliantId(),
            treeName,
            showOnHomeScreen: true,
        };

        dispatch(addUserTrees([newUserTree]));

        if (onboardingStep === 0) setShowOnboarding(true);

        mixpanel.track("FEATURE Create Tree", { treeName, isEmoji });

        closeModal();
    };

    return (
        <FlingToDismissModal
            closeModal={closeModal}
            open={open}
            rightHeaderButton={{ onPress: createNewTree, title: "Add" }}
            modalContainerStyles={{ backgroundColor: colors.background }}>
            <>
                <AppText children={"Select your tree's name and icon"} fontSize={16} />
                <AppText children={"Icon is optional"} fontSize={14} style={{ color: `${colors.white}80`, marginTop: 5, marginBottom: 10 }} />
                <View style={{ flexDirection: "row", marginBottom: 20 }}>
                    <AppTextInput
                        placeholder={"Education"}
                        textState={[treeName, setTreeName]}
                        pattern={new RegExp(/^[^ ]/)}
                        containerStyles={{ flex: 1 }}
                    />
                    <Pressable onPress={() => setEmojiSelectorOpen(true)}>
                        <AppText
                            children={emoji ? emoji.emoji : "🧠"}
                            style={{
                                fontFamily: "emojisMono",
                                color: emoji ? (selectedColorGradient ? selectedColorGradient.color1 : colors.white) : colors.line,
                                width: 45,
                                paddingTop: 2,
                                height: 45,
                                backgroundColor: colors.darkGray,
                                borderRadius: 10,
                                marginLeft: 10,
                                textAlign: "center",
                                verticalAlign: "middle",
                            }}
                            fontSize={24}
                        />
                    </Pressable>
                </View>

                <AppText fontSize={16} style={{ color: colors.white }}>
                    Tree Color
                </AppText>

                <AppText fontSize={14} style={{ color: `${colors.white}80`, marginBottom: 10 }}>
                    Scroll to see more colors
                </AppText>

                <ColorGradientSelector
                    colorsArray={nodeGradients}
                    state={[selectedColorGradient, setSelectedColorGradient]}
                    containerStyle={{ backgroundColor: colors.darkGray, borderRadius: 10 }}
                />

                <AppEmojiPicker
                    selectedEmojisName={emoji ? [emoji.name] : undefined}
                    onEmojiSelected={toggleEmoji(setEmoji, emoji)}
                    state={[emojiSelectorOpen, setEmojiSelectorOpen]}
                />
            </>
        </FlingToDismissModal>
    );

    function cleanup() {
        setTreeName("");
        setSelectedColorGradient(undefined);
        setEmojiSelectorOpen(false);
        setEmoji(undefined);
    }
}

export default AddTreeModal;
