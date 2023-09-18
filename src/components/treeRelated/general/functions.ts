import { TreeData } from "@/redux/slices/newUserTreesSlice";
import { NormalizedNode, Skill, Tree } from "@/types";
import { SkFont } from "@shopify/react-native-skia";

const MAX_LINE_WIDTH_PX = 60;
const SPACE_BETWEEN_WORDS_PX = 5;

export function getNodeLabelLines(words: string[], font: SkFont) {
    const lines: string[] = [];

    let currentLineIdx = 0;

    let remainingSpaceInLine = MAX_LINE_WIDTH_PX;

    for (const word of words) {
        const wordWidth = font.getTextWidth(word);
        const wordFitInCurrentLine = checkIfWordFitsInLine(wordWidth, remainingSpaceInLine);
        const isFirstWordInLine = lines[currentLineIdx] === undefined;

        if (wordFitInCurrentLine) {
            if (isFirstWordInLine) {
                lines[currentLineIdx] = word;
                remainingSpaceInLine -= font.getTextWidth(word);
            } else {
                lines[currentLineIdx] += ` ${word}`;
                remainingSpaceInLine -= font.getTextWidth(` ${word}`);
            }
        } else {
            const oneLineWordCase = wordWidth > MAX_LINE_WIDTH_PX;

            if (oneLineWordCase) {
                const cutWord = getCutWord(word, wordWidth);

                if (isFirstWordInLine) {
                    lines[currentLineIdx] = cutWord;
                } else {
                    lines[currentLineIdx + 1] = cutWord;
                }

                remainingSpaceInLine = MAX_LINE_WIDTH_PX;
            } else {
                lines[currentLineIdx + 1] = word;
                remainingSpaceInLine = MAX_LINE_WIDTH_PX - wordWidth;
            }
            currentLineIdx++;
        }
    }

    return lines;
}

function checkIfWordFitsInLine(wordWidth: number, remainingSpaceInLine: number) {
    const isFirstWordInLine = remainingSpaceInLine === MAX_LINE_WIDTH_PX;

    if (isFirstWordInLine) return wordWidth <= remainingSpaceInLine;

    return wordWidth + SPACE_BETWEEN_WORDS_PX <= remainingSpaceInLine;
}

function getCutWord(word: string, wordWidth: number) {
    const overflowPercentage = wordWidth / MAX_LINE_WIDTH_PX - 1;

    const nOverflowLetters = parseInt((word.length * overflowPercentage).toFixed(0));
    const nLettersToKeep = word.length - nOverflowLetters;

    return `${word.slice(0, nLettersToKeep)}_`;
}

export function normalizedNodeToTree(nodes: NormalizedNode[], treeData: TreeData) {
    const rootNode = nodes.find((node) => node.nodeId === treeData.rootNodeId);

    if (!rootNode) throw new Error("rootNode undefined at foo");

    return createTreeFromArray(rootNode.nodeId);

    function createTreeFromArray(nodeId: string) {
        //Base case
        const nodeOfTree = nodes.find((n) => n.nodeId === nodeId);

        if (!nodeOfTree) throw new Error("nodeOfTree undefined at recursivefoo");

        let fooTree: Tree<Skill> = {
            accentColor: treeData.accentColor,
            category: nodeOfTree.category,
            children: [],
            data: nodeOfTree.data,
            isRoot: nodeOfTree.isRoot,
            level: nodeOfTree.level,
            nodeId: nodeOfTree.nodeId,
            parentId: nodeOfTree.parentId,
            treeId: treeData.treeId,
            treeName: treeData.treeName,
            x: nodeOfTree.x,
            y: nodeOfTree.y,
        };

        if (!nodeOfTree.childrenIds.length) return fooTree;

        for (const childId of nodeOfTree.childrenIds) {
            fooTree.children.push(createTreeFromArray(childId));
        }

        return fooTree;
    }
}
