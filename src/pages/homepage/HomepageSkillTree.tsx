import { StaticRadialPathList } from "@/components/treeRelated/radial/StaticRadialCanvasPath";
import { completedSkillPercentageFromCoords } from "@/functions/extractInformationFromTree";
import { SkFont } from "@shopify/react-native-skia";
import { Fragment, memo, useMemo } from "react";
import { SharedValue } from "react-native-reanimated";
import StaticNodeList from "../../components/treeRelated/general/StaticNodeList";
import RadialLabel from "../../components/treeRelated/radial/RadialLabel";
import { CanvasDimensions, NodeCoordinate } from "../../types";

type TreeProps = {
    reactiveNodes: NodeCoordinate[];
    staticNodes: NodeCoordinate[];
    allNodes: NodeCoordinate[];
    selectedNode: string | null;
    canvasDimensions: CanvasDimensions;
    settings: {
        showLabel: boolean;
        oneColorPerTree: boolean;
        showIcons: boolean;
    };
    drag: {
        x: SharedValue<number>;
        y: SharedValue<number>;
        nodesToDragId: string[];
    };
    fonts: {
        labelFont: SkFont;
        nodeLetterFont: SkFont;
        emojiFont: SkFont;
    };
};

const LabelList = memo(function LabelList({
    nodeCoordinates,
    rootNode,
    font,
}: {
    nodeCoordinates: NodeCoordinate[];
    rootNode: NodeCoordinate;
    font: SkFont;
}) {
    const rootCoordinate = { x: rootNode.x, y: rootNode.y };

    return nodeCoordinates.map((node, idx) => {
        if (node.isRoot) return <Fragment key={idx}></Fragment>;

        return (
            <RadialLabel
                key={idx}
                labelFont={font}
                // text={node.nodeId.slice(0, 5)}
                text={node.data.name}
                coord={{ x: node.x, y: node.y }}
                rootCoord={rootCoordinate}
            />
        );
    });
});

function useGetTreeCompletePercetage(nodeCoordinates: NodeCoordinate[], rootId?: string) {
    const result = useMemo(() => {
        if (rootId === undefined) return 0;

        return completedSkillPercentageFromCoords(nodeCoordinates, rootId);
    }, [nodeCoordinates, rootId]);

    return result;
}

function HomepageSkillTree({ allNodes, reactiveNodes, staticNodes, selectedNode, settings, drag, fonts, canvasDimensions }: TreeProps) {
    const { emojiFont, labelFont, nodeLetterFont } = fonts;

    const rootNode = allNodes.find((n) => n.level === 0);

    const treeCompletedPercentage = useGetTreeCompletePercetage(allNodes, rootNode?.nodeId);

    if (!rootNode) return <></>;

    // PARECE HABER UNA PERDIDA DE PERFORMANCE DEMASIADO HEAVY EN ANDROID CUANDO HACEMOS
    // TRANSFORMACIONES DE ESCALA, ENTONCES LA ALTERNATIVA ES RENDERIZAR UN NODO
    // DE LA MISMA MANERA QUE EL NODE MENU(O SEA QUE SE RENDERICE NO EN EL CANVAS SINO COMO UN NODEVIEW)
    // SE PUEDE HACER LA MISMA TRANSICION QUE LA QUE ESTA PASANDO AHORA EN EL CANVAS PERO CONSUMIENDO
    // MENOS RECURSOS. Y EL HOOK DE REACTIVE NODES QUEDA PARA MUTACIONES Y DRAGS

    return (
        <>
            <StaticRadialPathList allNodes={allNodes} staticNodes={allNodes} canvasDimensions={canvasDimensions} />

            {settings.showLabel && <LabelList font={labelFont} nodeCoordinates={allNodes} rootNode={rootNode} />}

            <StaticNodeList
                fonts={{ emojiFont, nodeLetterFont }}
                allNodes={allNodes}
                staticNodes={staticNodes}
                settings={{ oneColorPerTree: settings.oneColorPerTree, showIcons: settings.showIcons }}
                canvasDimensions={canvasDimensions}
            />
            {/* <ReactiveNodeList
                fonts={{ emojiFont, nodeLetterFont }}
                allNodes={allNodes}
                reactiveNodes={reactiveNodes}
                rootNode={rootNode}
                selectedNodeId={selectedNode}
                treeCompletedPercentage={treeCompletedPercentage}
                settings={{ oneColorPerTree: settings.oneColorPerTree, showIcons: settings.showIcons }}
            /> */}
        </>
    );
}

export default HomepageSkillTree;
