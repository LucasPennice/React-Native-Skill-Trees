import { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCanvasRef } from "@shopify/react-native-skia";
import { useCallback, useContext, useEffect, useMemo, useReducer, useState } from "react";
import { View } from "react-native";
import { StackNavigatorParams } from "../../../App";
import OpenSettingsMenu from "../../components/OpenSettingsMenu";
import ProgressIndicatorAndName from "../../components/ProgressIndicatorAndName";
import ShareTree from "../../components/ShareTree";
import ShareTreeScreenshot from "../../components/takingScreenshot/ShareTreeScreenshot";
import CanvasSettingsModal from "../../components/treeRelated/canvasSettingsModal/CanvasSettingsModal";
import { IsSharingAvailableContext } from "../../context";
import { findNodeById, treeCompletedSkillPercentage } from "../../functions/extractInformationFromTree";
import { deleteNodeWithNoChildren, insertNodesBasedOnDnDZone, updateNodeAndTreeCompletion } from "../../functions/mutateTree";
import { colors } from "../../parameters";
import { useAppDispatch, useAppSelector } from "../../redux/reduxHooks";
import { selectSafeScreenDimentions } from "../../redux/slices/screenDimentionsSlice";
import { TreeCoordinateData } from "../../redux/slices/treesCoordinatesSlice";
import { changeTree, updateUserTreeWithAppendedNode, updateUserTrees } from "../../redux/slices/userTreesSlice";
import { NodeCoordinate, DnDZone, Skill, Tree } from "../../types";
import useCurrentTree from "../../useCurrentTree";
import AddNodeStateIndicator from "./AddNodeStateIndicator";
import IndividualSkillTree from "./IndividualSkillTree";
import AddNodeModal from "./modals/AddNodeModal";
import DeleteNodeModal from "./modals/DeleteNodeModal";
import SelectedNodeMenu, {
    SelectedNodeMenuFunctions,
    SelectedNodeMenuMutateFunctions,
    SelectedNodeMenuState,
} from "../../components/treeRelated/selectedNodeMenu/SelectedNodeMenu";
import { handleTreeBuild } from "../../components/treeRelated/treeCalculateCoordinates";

export type ModalState =
    | "TAKING_SCREENSHOT"
    | "EDITING_CANVAS_SETTINGS"
    | "IDLE"
    | "INPUT_DATA_FOR_NEW_NODE"
    | "CANDIDATES_TO_HOIST"
    | "PLACING_NEW_NODE"
    | "NODE_SELECTED";

export type ModalReducerAction =
    | "returnToIdle"
    | "openCandidatesToHoistModal"
    | "openNewNodeModal"
    | "openTakeScreenshotModal"
    | "openEditCanvasSettings"
    | "openSelectedNodeMenu"
    | "openNewNodePositionSelector";

type Props = NativeStackScreenProps<StackNavigatorParams, "ViewingSkillTree">;

function useViewingSkillTreeState() {
    const selectedTree = useCurrentTree();
    const screenDimensions = useAppSelector(selectSafeScreenDimentions);

    let treeCoordinate: TreeCoordinateData | undefined = undefined;

    if (selectedTree) {
        const {
            dndZoneCoordinates,
            canvasDimentions: canvasDimensions,
            nodeCoordinatesCentered,
        } = handleTreeBuild(selectedTree, screenDimensions, "hierarchy");

        treeCoordinate = { addNodePositions: dndZoneCoordinates, canvasDimensions, nodeCoordinates: nodeCoordinatesCentered };
    }

    return { selectedTree, treeCoordinate };
}

function useModalStateReducer() {
    function reducer(state: ModalState, action: ModalReducerAction) {
        switch (action) {
            case "returnToIdle":
                return "IDLE";
            case "openCandidatesToHoistModal":
                return "CANDIDATES_TO_HOIST";
            case "openNewNodePositionSelector":
                return "PLACING_NEW_NODE";
            case "openEditCanvasSettings":
                return "EDITING_CANVAS_SETTINGS";
            case "openSelectedNodeMenu":
                return "NODE_SELECTED";
            case "openTakeScreenshotModal":
                return "TAKING_SCREENSHOT";
            case "openNewNodeModal":
                return "INPUT_DATA_FOR_NEW_NODE";
            default:
                return state;
        }
    }

    const [state, dispatch] = useReducer(reducer, "IDLE");

    return [state, dispatch] as const;
}

function useCleanupOnNavigation(
    dispatchModalState: React.Dispatch<ModalReducerAction>,
    functions: {
        resetNodeToDelete: () => void;
        clearSelectedNodeCoord: () => void;
        clearSelectedNewNodePosition: () => void;
    }
) {
    useEffect(() => {
        return () => {
            dispatchModalState("returnToIdle");
            functions.resetNodeToDelete();
            functions.clearSelectedNodeCoord();
            functions.clearSelectedNewNodePosition();
        };
    }, []);
}

function useHandleRouteParams(
    params: Props["route"]["params"],
    dispatchModalState: React.Dispatch<ModalReducerAction>,
    addNewNodePositions: DnDZone[],
    functions: {
        updateSelectedNewNodePosition: (position: DnDZone) => void;
        updateSelectedNodeCoord: (node: NodeCoordinate, menuMode: "EDITING" | "VIEWING") => void;
    }
) {
    useEffect(() => {
        if (!params) return;

        if (params.addNewNodePosition) {
            const newNodePosition = addNewNodePositions.find((position) => {
                return position.ofNode === params.node.nodeId && position.type === params.addNewNodePosition;
            });

            if (!newNodePosition) throw new Error("newNodePosition undefined at useHandleRouterParams - InidividualSkillTree");

            functions.updateSelectedNewNodePosition(newNodePosition);
            return dispatchModalState("openNewNodeModal");
        }

        functions.updateSelectedNodeCoord(params.node, "VIEWING");

        //eslint-disable-next-line
    }, []);
}

function useNodeToDelete() {
    const [nodeToDelete, setNodeToDelete] = useState<Tree<Skill> | null>(null);

    const resetNodeToDelete = () => setNodeToDelete(null);

    const updateNodeToDelete = (node: Tree<Skill>) => setNodeToDelete(node);

    return [nodeToDelete, { updateNodeToDelete, resetNodeToDelete }] as const;
}

function useChildrenHoistSelectorProps(
    mutateNodeToDelete: { updateNodeToDelete: (node: Tree<Skill>) => void; resetNodeToDelete: () => void },
    dispatchModalState: React.Dispatch<ModalReducerAction>,
    clearSelectedNodeCoord: () => void
) {
    const { resetNodeToDelete, updateNodeToDelete } = mutateNodeToDelete;

    const openChildrenHoistSelector = useCallback((nodeToDelete: Tree<Skill>) => {
        updateNodeToDelete(nodeToDelete);
        dispatchModalState("openCandidatesToHoistModal");
    }, []);

    //Select ChildrenToHoistWhenDeletingParentModal
    const closeChildrenHoistModal = () => {
        resetNodeToDelete();
        clearSelectedNodeCoord();
        dispatchModalState("returnToIdle");
    };

    return { openChildrenHoistSelector, closeChildrenHoistModal };
}

function useNodeStateIndicatorFunctions(dispatchModalState: React.Dispatch<ModalReducerAction>, modalState: ModalState) {
    return useMemo(() => {
        return {
            returnToIdleState: () => {
                dispatchModalState("returnToIdle");
            },
            openNewNodePositionSelector: () => {
                if (modalState !== "IDLE") return;
                dispatchModalState("openNewNodePositionSelector");
            },
        };
    }, []);
}

function useAddNodeModalFunctions(
    dispatchModalState: React.Dispatch<ModalReducerAction>,
    selectedTree: Tree<Skill>,
    clearSelectedNewNodePosition: () => void
) {
    const dispatch = useAppDispatch();

    const result = (newNodes: Tree<Skill>[], dnDZone: DnDZone) => {
        let result = insertNodesBasedOnDnDZone(dnDZone, selectedTree, newNodes);

        if (result === undefined) throw new Error("result undefined at foo");

        const treeSkillCompletion = treeCompletedSkillPercentage(result);

        if (treeSkillCompletion === 100) result = { ...result, data: { ...result.data, isCompleted: true } };
        if (treeSkillCompletion !== 100) result = { ...result, data: { ...result.data, isCompleted: false } };

        dispatch(updateUserTreeWithAppendedNode(result));
        clearSelectedNewNodePosition();
        dispatchModalState("returnToIdle");
    };

    return result;
}

export type SelectedNewNodePositionState = readonly [
    DnDZone | null,
    {
        readonly clearSelectedNewNodePosition: () => void;
        readonly updateSelectedNewNodePosition: (position: DnDZone) => void;
    }
];

function useSelectedNewNodePositionState() {
    const [newNodePosition, setNewNodePosition] = useState<DnDZone | null>(null);

    const clearSelectedNewNodePosition = () => setNewNodePosition(null);
    const updateSelectedNewNodePosition = (position: DnDZone) => setNewNodePosition(position);

    return [newNodePosition, { clearSelectedNewNodePosition, updateSelectedNewNodePosition }] as SelectedNewNodePositionState;
}

export type SelectedNodeCoordState = readonly [
    {
        node: NodeCoordinate | null;
        menuMode: "EDITING" | "VIEWING";
    } | null,
    {
        readonly clearSelectedNodeCoord: () => void;
        readonly updateSelectedNodeCoord: (node: NodeCoordinate, menuMode: "EDITING" | "VIEWING") => void;
    }
];

function useSelectedNodeCoordState(dispatchModalState: React.Dispatch<ModalReducerAction>) {
    const [selectedNodeCoord, setSelectedNodeCoord] = useState<{ node: NodeCoordinate | null; menuMode: "EDITING" | "VIEWING" } | null>(null);

    const clearSelectedNodeCoord = () => {
        setSelectedNodeCoord(null);
        dispatchModalState("returnToIdle");
    };
    const updateSelectedNodeCoord = (node: NodeCoordinate, menuMode: "EDITING" | "VIEWING") => setSelectedNodeCoord({ node, menuMode });

    return [selectedNodeCoord, { clearSelectedNodeCoord, updateSelectedNodeCoord }] as const;
}

function useGetSelectedNodeMenuFns(
    selectedNode: Tree<Skill> | undefined,
    selectedTree: Tree<Skill>,
    navigation: NativeStackNavigationProp<StackNavigatorParams, "ViewingSkillTree", undefined>,
    openChildrenHoistSelector: (nodeToDelete: Tree<Skill>) => void,
    clearSelectedNodeCoord: () => void
) {
    const dispatch = useAppDispatch();
    const screenDimensions = useAppSelector(selectSafeScreenDimentions);

    const closeMenu = clearSelectedNodeCoord;

    const handleDeleteNode = (node: Tree<Skill>) => {
        if (!selectedTree) throw new Error("No selectedTree at deleteNode");
        if (!selectedNode) throw new Error("No selected node at deleteNode");

        if (node.children.length !== 0) return openChildrenHoistSelector(node);

        const updatedTree = deleteNodeWithNoChildren(selectedTree, node);

        dispatch(updateUserTrees({ updatedTree, screenDimensions }));
        clearSelectedNodeCoord();
    };

    const updateNode = (updatedNode: Tree<Skill>) => {
        try {
            if (!selectedNode) throw new Error("No selected node at updateNode");

            const updatedTree = updateNodeAndTreeCompletion(selectedTree, updatedNode);

            dispatch(updateUserTrees({ updatedTree, screenDimensions }));
        } catch (error) {
            console.error(error);
        }
    };

    const goToSkillPage = () => {
        if (!selectedNode) throw new Error("No selected node at goToSkillPage");
        navigation.navigate("SkillPage", selectedNode);
    };
    const goToTreePage = () => {
        if (!selectedNode) throw new Error("No selected node at goToTreePage");
        navigation.navigate("ViewingSkillTree", { node: selectedNode });
    };
    const goToEditTreePage = () => {
        if (!selectedNode) throw new Error("No selected node at goToTreePage");
        navigation.navigate("MyTrees", { editingTreeId: selectedNode.treeId });
    };

    const result: { query: SelectedNodeMenuFunctions; mutate: SelectedNodeMenuMutateFunctions } = {
        mutate: { handleDeleteNode, updateNode },
        query: { closeMenu, goToEditTreePage, goToSkillPage, goToTreePage },
    };

    return result;
}

function IndividualSkillTreePage({ navigation, route }: Props) {
    //Redux State
    const { selectedTree, treeCoordinate } = useViewingSkillTreeState();

    const dispatch = useAppDispatch();

    useEffect(() => {
        if (!route.params) return;

        dispatch(changeTree(route.params.node.treeId));
    }, []);

    if (!selectedTree || !treeCoordinate) return <></>;

    return <IndividualSkillTreeWithSelectedTree navigation={navigation} route={route} selectedTree={selectedTree} treeCoordinate={treeCoordinate} />;
}

type IndividualSkillTreeWithSelectedTreeProps = Props & { selectedTree: Tree<Skill>; treeCoordinate: TreeCoordinateData };

function IndividualSkillTreeWithSelectedTree({ navigation, route, selectedTree, treeCoordinate }: IndividualSkillTreeWithSelectedTreeProps) {
    const screenDimensions = useAppSelector(selectSafeScreenDimentions);
    //
    const modalStateReducer = useModalStateReducer();
    const [modalState, dispatchModalState] = modalStateReducer;
    //
    const selectedNodeCoordState = useSelectedNodeCoordState(dispatchModalState);
    const [selectedNodeCoord, { clearSelectedNodeCoord, updateSelectedNodeCoord }] = selectedNodeCoordState;
    //
    const selectedNewNodePositionState = useSelectedNewNodePositionState();
    const [selectedNewNodePosition, { clearSelectedNewNodePosition, updateSelectedNewNodePosition }] = selectedNewNodePositionState;
    //Local State
    const [nodeToDelete, mutateNodeToDelete] = useNodeToDelete();
    const { resetNodeToDelete } = mutateNodeToDelete;
    //Hooks
    const { closeChildrenHoistModal, openChildrenHoistSelector } = useChildrenHoistSelectorProps(
        mutateNodeToDelete,
        dispatchModalState,
        clearSelectedNodeCoord
    );
    const isSharingAvailable = useContext(IsSharingAvailableContext);
    const canvasRef = useCanvasRef();
    //
    useHandleRouteParams(route.params, dispatchModalState, treeCoordinate.addNodePositions, {
        updateSelectedNewNodePosition,
        updateSelectedNodeCoord,
    });
    useCleanupOnNavigation(dispatchModalState, { resetNodeToDelete, clearSelectedNewNodePosition, clearSelectedNodeCoord });
    //
    const nodeStateIndicatorFunctions = useNodeStateIndicatorFunctions(dispatchModalState, modalState);
    const addNodes = useAddNodeModalFunctions(dispatchModalState, selectedTree, clearSelectedNewNodePosition);
    //
    const showNewNodePositions = modalState === "PLACING_NEW_NODE";
    const shouldRenderShareButton = isSharingAvailable && modalState === "IDLE";
    const showAddNodeModal = selectedNewNodePosition !== null;

    const takingScreenshotState = [
        modalState === "TAKING_SCREENSHOT",
        {
            openTakingScreenshotModal: () => dispatchModalState("openTakeScreenshotModal"),
            closeTakingScreenshotModal: () => dispatchModalState("returnToIdle"),
        },
    ] as const;

    const treeFunctions = {
        openChildrenHoistSelector: openChildrenHoistSelector,
        openCanvasSettingsModal: () => dispatchModalState("openEditCanvasSettings"),
        openNewNodeModal: () => dispatchModalState("openNewNodeModal"),
    };

    const selectedNode = findNodeById(selectedTree, selectedNodeCoord?.node?.nodeId ?? null);

    const selectedNodeMenuState: SelectedNodeMenuState = {
        screenDimensions,
        selectedNode: selectedNode!,
        selectedTree,
        initialMode: selectedNodeCoord?.menuMode ?? "VIEWING",
    };

    const selectedNodeMenuFunctions = useGetSelectedNodeMenuFns(
        selectedNode,
        selectedTree,
        navigation,
        openChildrenHoistSelector,
        clearSelectedNodeCoord
    );

    return (
        <View style={{ position: "relative", backgroundColor: colors.background, flex: 1, overflow: "hidden" }}>
            <IndividualSkillTree
                state={{
                    selectedNodeCoordState,
                    selectedNewNodePositionState,
                    addNodePositions: treeCoordinate.addNodePositions,
                    showNewNodePositions,
                }}
                canvasRef={canvasRef}
                tree={selectedTree}
                navigation={navigation}
                functions={treeFunctions}
            />
            <ProgressIndicatorAndName tree={selectedTree} />

            <ShareTreeScreenshot
                canvasRef={canvasRef}
                shouldShare={Boolean(shouldRenderShareButton)}
                takingScreenshotState={takingScreenshotState}
                tree={selectedTree}
            />
            <ShareTree tree={selectedTree} show={modalState === "IDLE"} />

            <OpenSettingsMenu show={modalState === "IDLE"} openModal={() => dispatchModalState("openEditCanvasSettings")} />

            <AddNodeStateIndicator mode={modalState} functions={nodeStateIndicatorFunctions} currentTree={selectedTree} />

            {selectedNodeCoord && (
                <SelectedNodeMenu
                    functions={selectedNodeMenuFunctions.query}
                    mutateFunctions={selectedNodeMenuFunctions.mutate}
                    state={selectedNodeMenuState}
                    allowEdit
                />
            )}

            <DeleteNodeModal
                open={modalState === "CANDIDATES_TO_HOIST"}
                nodeToDelete={nodeToDelete}
                closeModalAndClearState={closeChildrenHoistModal}
            />
            {showAddNodeModal && (
                <AddNodeModal
                    open={modalState === "INPUT_DATA_FOR_NEW_NODE"}
                    addNodes={addNodes}
                    closeModal={() => {
                        clearSelectedNewNodePosition();
                        dispatchModalState("returnToIdle");
                    }}
                    selectedTree={selectedTree}
                    dnDZone={selectedNewNodePosition}
                />
            )}

            <CanvasSettingsModal open={modalState === "EDITING_CANVAS_SETTINGS"} closeModal={() => dispatchModalState("returnToIdle")} />
        </View>
    );
}

export default IndividualSkillTreePage;
