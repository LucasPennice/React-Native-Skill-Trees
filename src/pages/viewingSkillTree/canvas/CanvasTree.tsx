import { findParentOfNode } from "../../../functions/extractInformationFromTree";
import { colors } from "../../../parameters";
import { CartesianCoordinate, NodeCoordinate, Skill, Tree } from "../../../types";
import HierarchicalCanvasPath from "./HierarchicalCanvasPath";
import Label from "./Label";
import Node from "./Node";
import RadialCanvasPath from "./RadialCanvasPath";
import RadialLabel from "./RadialLabel";
import useHandleTreeAnimations from "./hooks/useHandleTreeAnimations";

type TreeProps = {
    tree: Tree<Skill>;
    wholeTree: Tree<Skill>;
    parentNodeInfo?: { coordinates: CartesianCoordinate; numberOfChildren: number; currentChildIndex: number };
    stateProps: {
        selectedNode: string | null;
        showLabel: boolean;
        nodeCoordinatesCentered: NodeCoordinate[];
    };
    rootCoordinates?: { width: number; height: number };
    treeAccentColor: string;
    isRadial?: boolean;
};

function CanvasTree({ tree, parentNodeInfo, stateProps, rootCoordinates: rC, wholeTree, treeAccentColor, isRadial }: TreeProps) {
    //Props
    const { selectedNode, showLabel, nodeCoordinatesCentered } = stateProps;

    const defaultParentInfo = parentNodeInfo ?? { coordinates: { x: rC!.width, y: rC!.height }, numberOfChildren: 1, currentChildIndex: 0 };

    const currentNodeCoordintes = nodeCoordinatesCentered.find((c) => c.id === tree.nodeId)!;

    const pathInitialPoint = defaultParentInfo.coordinates;

    const cx = currentNodeCoordintes.x;
    const cy = currentNodeCoordintes.y;

    let newParentNodeInfo = { coordinates: { ...currentNodeCoordintes, x: cx, y: cy }, numberOfChildren: tree.children.length };

    const { circleBlurOnInactive, groupTransform, pathBlurOnInactive } = useHandleTreeAnimations(selectedNode, showLabel, tree);

    const nodeAndParentCompleted = (() => {
        if (tree.data.isCompleted !== true) return false;

        const parentNode = findParentOfNode(wholeTree, tree.nodeId);

        if (!parentNode) return false;

        if (parentNode.data.isCompleted !== true) return false;

        return true;
    })();

    const pathColor = nodeAndParentCompleted ? `${treeAccentColor}` : colors.line;

    const textColor = tree.data.isCompleted ? treeAccentColor : tree.nodeId === selectedNode ? "white" : colors.unmarkedText;

    const letterToRender = tree.data.name ? tree.data.name[0] : "-";

    return (
        <>
            {isRadial ? (
                <RadialCanvasPath
                    coordinates={{ cx, cy, pathInitialPoint }}
                    isRoot={Boolean(tree.isRoot)}
                    pathBlurOnInactive={pathBlurOnInactive}
                    pathColor={pathColor}
                    nodeCoordinatesCentered={nodeCoordinatesCentered}
                />
            ) : (
                <HierarchicalCanvasPath
                    coordinates={{ cx, cy, pathInitialPoint }}
                    isRoot={Boolean(tree.isRoot)}
                    pathBlurOnInactive={pathBlurOnInactive}
                    pathColor={pathColor}
                />
            )}
            {/* Recursive fucntion that renders the rest of the tree */}
            {tree.children.map((element, idx) => {
                return (
                    <CanvasTree
                        key={element.nodeId}
                        tree={element}
                        wholeTree={wholeTree}
                        treeAccentColor={treeAccentColor}
                        parentNodeInfo={{ ...newParentNodeInfo, currentChildIndex: idx }}
                        stateProps={{ selectedNode, showLabel, nodeCoordinatesCentered }}
                        isRadial={isRadial}
                    />
                );
            })}

            {showLabel && !isRadial && (
                <Label
                    treeAccentColor={treeAccentColor}
                    color={"red"}
                    text={tree.data.name}
                    coord={{ cx, cy }}
                    pathBlurOnInactive={pathBlurOnInactive}
                />
            )}
            {showLabel && isRadial && (
                <RadialLabel treeAccentColor={treeAccentColor} tree={tree} coord={{ cx, cy }} pathBlurOnInactive={pathBlurOnInactive} />
            )}

            <Node
                key={`${tree.nodeId}node`}
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
