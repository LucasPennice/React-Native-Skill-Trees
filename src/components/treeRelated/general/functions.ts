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
