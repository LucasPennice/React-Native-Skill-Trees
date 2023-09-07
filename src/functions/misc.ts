import { colors } from "../parameters";
import { ColorGradient, NodeCategory, Skill, Tree, UpdateRadiusPerLevelTable, getDefaultSkillValue } from "../types";
import { DistanceToCenterPerLevel } from "./treeToRadialCoordinates/overlap";

export function makeid(length: number) {
    let result = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}

export function createTree(treeName: string, gradient: ColorGradient, isRoot: boolean, category: NodeCategory, data: Skill) {
    const result: Tree<Skill> = {
        treeName: treeName.trim(),
        accentColor: gradient,
        isRoot,
        parentId: null,
        treeId: makeid(24),
        level: 0,
        nodeId: makeid(24),
        category,
        children: [],
        x: 0,
        y: 0,
        data: getDefaultSkillValue(data.name.trim(), data.isCompleted ?? false, data.icon),
    };

    return result;
}

export function interpolateColors(color1: string, color2: string, percent: number) {
    // Convert the hex colors to RGB values
    const r1 = parseInt(color1.substring(1, 3), 16);
    const g1 = parseInt(color1.substring(3, 5), 16);
    const b1 = parseInt(color1.substring(5, 7), 16);

    const r2 = parseInt(color2.substring(1, 3), 16);
    const g2 = parseInt(color2.substring(3, 5), 16);
    const b2 = parseInt(color2.substring(5, 7), 16);

    // Interpolate the RGB values
    const r = Math.round(r1 + (r2 - r1) * percent);
    const g = Math.round(g1 + (g2 - g1) * percent);
    const b = Math.round(b1 + (b2 - b1) * percent);

    // Convert the interpolated RGB values back to a hex color
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

export function checkContrastHex(color1: string, color2: string) {
    let [luminance1, luminance2] = [color1, color2].map((color) => {
        color = color.startsWith("#") ? color.slice(1) : color;

        let r = parseInt(color.slice(0, 2), 16);
        let g = parseInt(color.slice(2, 4), 16);
        let b = parseInt(color.slice(4, 6), 16);

        return luminance(r, g, b);
    });

    return contrastRatio(luminance1, luminance2);

    function contrastRatio(luminance1: number, luminance2: number) {
        let lighterLum = Math.max(luminance1, luminance2);
        let darkerLum = Math.min(luminance1, luminance2);

        return (lighterLum + 0.05) / (darkerLum + 0.05);
    }

    function luminance(r: number, g: number, b: number) {
        let [lumR, lumG, lumB] = [r, g, b].map((component) => {
            let proportion = component / 255;

            return proportion <= 0.03928 ? proportion / 12.92 : Math.pow((proportion + 0.055) / 1.055, 2.4);
        });

        return 0.2126 * lumR + 0.7152 * lumG + 0.0722 * lumB;
    }
}

export function getLabelTextColor(treeAccentColor: string) {
    const whiteContrast = checkContrastHex(treeAccentColor, "#FFFFFF");
    const backgroundContrast = checkContrastHex(treeAccentColor, colors.background);

    if (whiteContrast > backgroundContrast) return "#FFFFFF";

    return colors.background;
}

export function getWheelParams(progressColor: string, backgroundColor: string, size?: number, strokeWidth?: number) {
    let result = {
        size: 65,
        strokeWidth: 7,
        centerCoordinate: 0,
        radius: 0,
        circumference: 0,
        strokeDasharray: 0,
        progressStroke: "",
        backgroundStroke: "",
    };

    if (size) result.size = size;
    if (strokeWidth) result.strokeWidth = strokeWidth;

    result.centerCoordinate = result.size / 2;
    result.radius = result.size / 2 - result.strokeWidth / 2;
    result.progressStroke = progressColor;
    result.backgroundStroke = backgroundColor;
    result.circumference = 2 * Math.PI * result.radius;
    result.strokeDasharray = 2 * Math.PI * result.radius;

    return result;
}

export function renderScaleForNodeActionMenu(scale: number) {
    //Just to make sure I notice an invalid value
    if (scale === 0) return 5;

    return 1 / scale;
}

export function updateRadiusPerLevelTable(distanceToCenterPerLevel: DistanceToCenterPerLevel, levelOverflow: UpdateRadiusPerLevelTable) {
    if (!levelOverflow) throw new Error("levelOverflow undefined at updatedDistanceToCenterTable");

    const result: DistanceToCenterPerLevel = { ...distanceToCenterPerLevel };

    const levelsString = Object.keys(distanceToCenterPerLevel);

    for (const levelString of levelsString) {
        const level = parseInt(levelString);

        if (level >= levelOverflow.level) {
            const timesToIncrease = level - levelOverflow.level + 1;

            result[level] = result[level] + levelOverflow.distanceToDisplace * timesToIncrease;
        }
    }

    return result;
}
