import { Skill, Tree } from "../types";
import { countCompletedSkillNodes, countSkillNodes } from "./extractInformationFromTree";

export function testTemplateHTML(tree: Tree<Skill>, imageData: string) {
    const accentColor = tree.accentColor;

    const nodeQty = countSkillNodes(tree)!;
    const completedNodes = countCompletedSkillNodes(tree)!;
    const percentage = (completedNodes / nodeQty) * 100;
    const dashoffset = 100 - percentage;
    const treeName = tree.treeName;

    return `
    <html style="width: 1080px; background-color: #000000; aspect-ratio: 4/5; text-align: center">
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
    </head>
    <body style="text-align: center; margin:0px; background-color: #000000; padding: 10px">
        <div
            style="
                background-color: #181a1c;
                border-radius: 10px;
                padding: 10px;
                padding-right: 20;
                display: flex;
                align-items: center;
                width: fit-content;
                gap: 20px;
                max-width: 1010px;
            ">
            <svg width="100" height="100" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="35" fill="none" stroke="${accentColor}3D" stroke-width="15" />
                <circle
                    shape-rendering="geometricPrecision"
                    stroke-dasharray="100"
                    stroke-dashoffset="${dashoffset}"
                    cx="50"
                    cy="50"
                    r="35"
                    fill="none"
                    stroke="${accentColor}"
                    stroke-linecap="round"
                    stroke-width="15"
                    pathLength="100" />
            </svg>
            <p
                style="
                    margin: 0px;
                    font-family: Arial, Helvetica, sans-serif;
                    color: #b5b4bb;
                    font-size: 48;
                    text-overflow: ellipsis;
                    overflow: hidden;
                    white-space: nowrap;
                    max-width: 890px;
                    text-align: left;
                ">
                ${treeName}
            </p>
        </div>
        <div
            style="
                background-color: #181a1c;
                border-radius: 10px;
                padding: 20px;
                margin-top: 10;
                display: flex;
                align-items: center;
                width: fit-content;
                gap: 20px;
                max-width: 1010px;
            ">
            <p
                style="
                    margin: 0px;
                    font-family: Arial, Helvetica, sans-serif;
                    color: #7f7e83;
                    font-size: 30;
                    text-overflow: ellipsis;
                    overflow: hidden;
                    white-space: nowrap;
                ">
                ${parseInt(`${percentage}`)}% Completed <span style="margin-left: 15">${completedNodes} skills of ${nodeQty}</span>
            </p>
        </div>
        <img src="${imageData}" style="width: 100%" />
    </body>
</html>
`;
}
