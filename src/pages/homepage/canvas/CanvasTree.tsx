import { Blur, Path, Skia, SkiaMutableValue, useComputedValue, useSpring } from "@shopify/react-native-skia";
import { CirclePositionInCanvasWithLevel, Skill, Tree } from "../../../types";
import { CANVAS_SPRING, colors, MAX_OFFSET } from "./parameters";
import useHandleTreeAnimations from "./hooks/useHandleTreeAnimations";
import { findDistanceBetweenNodesById, findParentOfNode } from "../treeFunctions";
import Label from "./Label";
import Node from "./Node";
import CanvasPath from "./CavnasPath";

type TreeProps = {
    tree: Tree<Skill>;
    wholeTree: Tree<Skill>;
    parentNodeInfo?: { coordinates: { x: number; y: number }; numberOfChildren: number; currentChildIndex: number };
    stateProps: {
        selectedNode: string | null;
        showLabel: boolean;
        circlePositionsInCanvas: CirclePositionInCanvasWithLevel[];
        tentativeCirlcePositionsInCanvas: CirclePositionInCanvasWithLevel[];
    };
    rootCoordinates?: { width: number; height: number };
    treeAccentColor: string;
    hasTreeChanged: boolean;
};

function CanvasTree({ tree, parentNodeInfo, stateProps, rootCoordinates: rC, wholeTree, treeAccentColor, hasTreeChanged }: TreeProps) {
    //Props
    const { selectedNode, showLabel, circlePositionsInCanvas, tentativeCirlcePositionsInCanvas } = stateProps;

    const defaultParentInfo = parentNodeInfo ?? { coordinates: { x: rC!.width, y: rC!.height }, numberOfChildren: 1, currentChildIndex: 0 };

    const previewMode = tentativeCirlcePositionsInCanvas.length !== 0;

    //Coordinates calculation
    const currentNodeTentativeCoordinates = tentativeCirlcePositionsInCanvas.find((c) => c.id === tree.data.id);

    const currentNodeParentTentativeCoordinates = tentativeCirlcePositionsInCanvas.find((c) => {
        if (!currentNodeTentativeCoordinates) return false;
        return c.id === currentNodeTentativeCoordinates.parentId;
    });

    const currentNodeCoordintes = circlePositionsInCanvas.find((c) => c.id === tree.data.id)!;

    const pathInitialPoint =
        previewMode && currentNodeParentTentativeCoordinates ? currentNodeParentTentativeCoordinates : defaultParentInfo.coordinates;

    const cx = currentNodeTentativeCoordinates ? currentNodeTentativeCoordinates.x : currentNodeCoordintes.x;
    const cy = currentNodeTentativeCoordinates ? currentNodeTentativeCoordinates.y : currentNodeCoordintes.y;

    // --

    let newParentNodeInfo = { coordinates: { ...currentNodeCoordintes, x: cx, y: cy }, numberOfChildren: tree.children ? tree.children.length : 0 };

    const { circleBlurOnInactive, groupTransform, pathBlurOnInactive, labelOpacity } = useHandleTreeAnimations(
        selectedNode,
        showLabel,
        tree,
        findDistanceBetweenNodesById(wholeTree, tree.data.id) ?? 0
    );

    const nodeAndParentCompleted = (() => {
        if (tree.data.isCompleted !== true) return false;

        const parentNode = findParentOfNode(wholeTree, tree.data.id);

        if (!parentNode) return false;

        if (parentNode.data.isCompleted !== true) return false;

        return true;
    })();

    const pathColor = nodeAndParentCompleted ? `${treeAccentColor}7D` : colors.line;

    const textColor = tree.data.isCompleted ? treeAccentColor : tree.data.id === selectedNode ? "white" : colors.unmarkedText;
    const letterToRender = tree.data.name ? tree.data.name[0] : "-";

    return (
        <>
            <CanvasPath
                coordinates={{ cx, cy, pathInitialPoint }}
                isRoot={Boolean(tree.isRoot)}
                pathBlurOnInactive={pathBlurOnInactive}
                pathColor={pathColor}
            />
            {/* Recursive fucntion that renders the rest of the tree */}
            {tree.children &&
                tree.children.map((element, idx) => {
                    return (
                        <CanvasTree
                            key={idx}
                            tree={element}
                            wholeTree={wholeTree}
                            hasTreeChanged={hasTreeChanged}
                            treeAccentColor={treeAccentColor}
                            parentNodeInfo={{ ...newParentNodeInfo, currentChildIndex: idx }}
                            stateProps={{ selectedNode, showLabel, circlePositionsInCanvas, tentativeCirlcePositionsInCanvas }}
                        />
                    );
                })}

            {showLabel && (
                <Label
                    treeAccentColor={treeAccentColor}
                    tree={tree}
                    coord={{ cx, cy }}
                    labelOpacity={labelOpacity}
                    pathBlurOnInactive={pathBlurOnInactive}
                />
            )}

            <Node
                circleBlurOnInactive={circleBlurOnInactive}
                isComplete={tree.data.isCompleted}
                treeAccentColor={treeAccentColor}
                coord={{ cx, cy }}
                groupTransform={groupTransform}
                text={{ color: textColor, letter: letterToRender }}
            />
        </>
    );
}
export default CanvasTree;
