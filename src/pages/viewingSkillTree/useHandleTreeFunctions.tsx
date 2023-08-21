import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";
import { StackNavigatorParams } from "../../../App";
import { InteractiveTreeFunctions } from "../../components/treeRelated/InteractiveTree";
import { deleteNodeWithNoChildren, updateNodeAndTreeCompletion } from "../../functions/mutateTree";
import { useAppDispatch } from "../../redux/reduxHooks";
import { removeUserTree, setSelectedDndZone, setSelectedNode, updateUserTrees } from "../../redux/slices/userTreesSlice";
import { DnDZone, Skill, Tree } from "../../types";
import { ModalState } from "./ViewingSkillTree";

function useHandleTreeFunctions(
    state: {
        params: StackNavigatorParams["ViewingSkillTree"];
        modal: [ModalState, (v: ModalState) => void];
    },
    functions: {
        openChildrenHoistSelector: (nodeToDelete: Tree<Skill>) => void;
    },
    navigation: NativeStackNavigationProp<StackNavigatorParams, "ViewingSkillTree", undefined>
) {
    //State
    const { modal, params } = state;
    const [modalState, setModalState] = modal;
    //Hooks
    const dispatch = useAppDispatch();
    const modalRef = useRef<ModalState>(modalState);
    //This is a copy of the Dnd zones inside InteractiveTree 👇
    const [dndZoneCoordinatesCopy, setDndZoneCoordinatesCopy] = useState<DnDZone[]>([]);

    useEffect(() => {
        modalRef.current = modalState;
    }, [modalState]);

    const result: InteractiveTreeFunctions = useMemo(() => {
        const onNodeClick = (node: Tree<Skill>) => {
            if (modalRef.current !== "IDLE") return;

            const nodeId = node.nodeId;

            dispatch(setSelectedNode({ nodeId, menuMode: "VIEWING" }));
            setModalState("NODE_SELECTED");
        };

        const onDndZoneClick = (clickedZone: DnDZone | undefined) => {
            if (modalRef.current !== "PLACING_NEW_NODE") return;
            if (clickedZone === undefined) return;
            dispatch(setSelectedDndZone(clickedZone));
            setModalState("INPUT_DATA_FOR_NEW_NODE");
        };

        const nodeMenu: InteractiveTreeFunctions["nodeMenu"] = {
            navigate: navigation.navigate,
            confirmDeleteNode: (tree: Tree<Skill>, node: Tree<Skill>) => {
                if (node.children.length !== 0) return functions.openChildrenHoistSelector(node);

                const result = deleteNodeWithNoChildren(tree, node);

                dispatch(updateUserTrees(result));
            },
            selectNode: (nodeId: string, menuMode: "VIEWING" | "EDITING") => dispatch(setSelectedNode({ nodeId, menuMode })),
            confirmDeleteTree: (treeId: string) => {
                Alert.alert(
                    "Delete this tree?",
                    "",
                    [
                        { text: "No", style: "cancel" },
                        {
                            text: "Yes",
                            onPress: () => {
                                navigation.navigate("MyTrees", {});
                                dispatch(removeUserTree(treeId));
                            },
                            style: "destructive",
                        },
                    ],
                    { cancelable: true }
                );
            },
            toggleCompletionOfSkill: (treeToUpdate: Tree<Skill>, node: Tree<Skill>) => {
                let updatedNode: Tree<Skill> = { ...node, data: { ...node.data, isCompleted: !node.data.isCompleted } };

                const updatedTree = updateNodeAndTreeCompletion(treeToUpdate, updatedNode);

                dispatch(updateUserTrees(updatedTree));
            },
            openAddSkillModal: (zoneType: "PARENT" | "CHILDREN" | "LEFT_BROTHER" | "RIGHT_BROTHER", node: Tree<Skill>) => {
                const dndZone = dndZoneCoordinatesCopy.find((zone) => zone.ofNode === node.nodeId && zone.type === zoneType);

                if (!dndZone) throw new Error("couldn't find dndZone in openAddSkillModal");

                dispatch(setSelectedDndZone(dndZone));
                setModalState("INPUT_DATA_FOR_NEW_NODE");
            },
        };

        const runOnTreeUpdate = (dndZoneCoordinates: DnDZone[]) => {
            setDndZoneCoordinatesCopy(dndZoneCoordinates);
            if (!params || !params.addNodeModal) return;

            const { dnDZoneType, nodeId } = params.addNodeModal;

            const dndZone = dndZoneCoordinates.find((zone) => zone.ofNode === nodeId && zone.type === dnDZoneType);

            if (!dndZone) throw new Error("couldn't find dndZone in runOnTreeUpdate");

            dispatch(setSelectedDndZone(dndZone));
            setModalState("INPUT_DATA_FOR_NEW_NODE");
        };

        return { onNodeClick, onDndZoneClick, nodeMenu, runOnTreeUpdate };
    }, [dispatch, dndZoneCoordinatesCopy, functions, navigation.navigate, params, setModalState]);

    return result;
}

export default useHandleTreeFunctions;
