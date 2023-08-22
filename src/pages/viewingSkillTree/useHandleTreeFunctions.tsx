import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";
import { StackNavigatorParams } from "../../../App";
import { InteractiveTreeFunctions } from "../../components/treeRelated/InteractiveTree";
import { deleteNodeWithNoChildren, updateNodeAndTreeCompletion } from "../../functions/mutateTree";
import { useAppDispatch, useAppSelector } from "../../redux/reduxHooks";
import { removeUserTree, setSelectedDndZone, setSelectedNode, updateUserTrees } from "../../redux/slices/userTreesSlice";
import { DnDZone, Skill, Tree } from "../../types";
import { ModalReducerAction, ModalState } from "./ViewingSkillTree";
import { selectSafeScreenDimentions } from "../../redux/slices/screenDimentionsSlice";

function useHandleTreeFunctions(
    state: {
        params: StackNavigatorParams["ViewingSkillTree"];
        modalStateReducer: readonly [ModalState, React.Dispatch<ModalReducerAction>];
    },
    functions: {
        openChildrenHoistSelector: (nodeToDelete: Tree<Skill>) => void;
    },
    navigation: NativeStackNavigationProp<StackNavigatorParams, "ViewingSkillTree", undefined>
) {
    //State
    const { modalStateReducer, params } = state;
    const [modalState, dispatchModalState] = modalStateReducer;
    //Hooks
    const screenDimensions = useAppSelector(selectSafeScreenDimentions);
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
            dispatchModalState("openSelectedNodeMenu");
        };

        const onDndZoneClick = (clickedZone: DnDZone | undefined) => {
            if (modalRef.current !== "PLACING_NEW_NODE") return;
            if (clickedZone === undefined) return;
            dispatch(setSelectedDndZone(clickedZone));
            dispatchModalState("openNewNodeModal");
        };

        const nodeMenu: InteractiveTreeFunctions["nodeMenu"] = {
            navigate: navigation.navigate,
            confirmDeleteNode: (tree: Tree<Skill>, node: Tree<Skill>) => {
                if (node.children.length !== 0) return functions.openChildrenHoistSelector(node);

                const updatedTree = deleteNodeWithNoChildren(tree, node);

                dispatch(updateUserTrees({ updatedTree, screenDimensions }));
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

                dispatch(updateUserTrees({ updatedTree, screenDimensions }));
            },
            openAddSkillModal: (zoneType: "PARENT" | "CHILDREN" | "LEFT_BROTHER" | "RIGHT_BROTHER", node: Tree<Skill>) => {
                const dndZone = dndZoneCoordinatesCopy.find((zone) => zone.ofNode === node.nodeId && zone.type === zoneType);

                if (!dndZone) throw new Error("couldn't find dndZone in openAddSkillModal");

                dispatch(setSelectedDndZone(dndZone));
                dispatchModalState("openNewNodeModal");
            },
        };

        const runOnTreeUpdate = (dndZoneCoordinates: DnDZone[]) => {
            setDndZoneCoordinatesCopy(dndZoneCoordinates);
            if (!params || !params.addNodeModal) return;

            const { dnDZoneType, nodeId } = params.addNodeModal;

            const dndZone = dndZoneCoordinates.find((zone) => zone.ofNode === nodeId && zone.type === dnDZoneType);

            if (!dndZone) throw new Error("couldn't find dndZone in runOnTreeUpdate");

            dispatch(setSelectedDndZone(dndZone));
            dispatchModalState("openNewNodeModal");
        };

        return { onNodeClick, onDndZoneClick, nodeMenu, runOnTreeUpdate };
    }, [dispatch, dndZoneCoordinatesCopy, functions, navigation.navigate, params, screenDimensions, modalStateReducer]);

    return result;
}

export default useHandleTreeFunctions;
