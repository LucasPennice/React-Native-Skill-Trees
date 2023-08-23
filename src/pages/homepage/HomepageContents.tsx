import { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCanvasRef } from "@shopify/react-native-skia";
import { useEffect, useMemo, useState } from "react";
import { StackNavigatorParams } from "../../../App";
import OpenSettingsMenu from "../../components/OpenSettingsMenu";
import ProgressIndicatorAndName from "../../components/ProgressIndicatorAndName";
import ShareTreeLayout from "../../components/takingScreenshot/ShareTreeScreenshot";
import CanvasSettingsModal from "../../components/treeRelated/canvasSettingsModal/CanvasSettingsModal";
import { buildHomepageTree } from "../../functions/treeToRadialCoordinates/general";
import { useAppSelector } from "../../redux/reduxHooks";
import { selectCanvasDisplaySettings } from "../../redux/slices/canvasDisplaySettingsSlice";
import { selectSafeScreenDimentions } from "../../redux/slices/screenDimentionsSlice";
import { selectUserTrees } from "../../redux/slices/userTreesSlice";
import HomepageTree from "./HomepageTree";

type Props = {
    n: NativeStackScreenProps<StackNavigatorParams, "Home">;
};

// function useHandleInitialTreeCoordinates(userTrees: Tree<Skill>[], screenDimensions: ScreenDimentions, canvasDisplaySettings: CanvasDisplaySettings) {
//     const dispatch = useAppDispatch();

//     useEffect(() => {
//         dispatch(calculateHomeTreeCoordinatesInitially({ canvasDisplaySettings, screenDimensions, userTrees }));
//     }, []);
// }

function useHandleNavigationListener(
    navigation: NativeStackNavigationProp<StackNavigatorParams, "Home", undefined>,
    clearSelectedNodeId: () => void
) {
    useEffect(() => {
        navigation.addListener("state", (_) => clearSelectedNodeId());
        return () => {
            navigation.removeListener("state", (_) => clearSelectedNodeId());
        };
    }, []);
}

function useHomepageContentsState() {
    const userTrees = useAppSelector(selectUserTrees);
    const screenDimensions = useAppSelector(selectSafeScreenDimentions);
    const canvasDisplaySettings = useAppSelector(selectCanvasDisplaySettings);

    return { canvasDisplaySettings, screenDimensions, userTrees };
}

function useTakingScreenshotState() {
    const [takingScreenshot, setTakingScreenshot] = useState(false);

    const openTakingScreenshotModal = () => setTakingScreenshot(true);
    const closeTakingScreenshotModal = () => setTakingScreenshot(false);

    return [takingScreenshot, { openTakingScreenshotModal, closeTakingScreenshotModal }] as const;
}

function useSelectedNodeIdState() {
    const [selectedNodeId, setSelectedNodeId] = useState<{ nodeId: string; treeId: string } | null>(null);

    const clearSelectedNodeId = () => setSelectedNodeId(null);
    const updateSelectedNodeId = (value: { nodeId: string; treeId: string }) => setSelectedNodeId(value);

    return [selectedNodeId, { clearSelectedNodeId, updateSelectedNodeId }] as const;
}

function useCanvasSettingsState() {
    const [canvasSettings, setCanvasSettings] = useState(false);

    const openCanvasSettingsModal = () => setCanvasSettings(true);
    const closeCanvasSettingsModal = () => setCanvasSettings(false);

    return [canvasSettings, { openCanvasSettingsModal, closeCanvasSettingsModal }] as const;
}

function HomepageContents({ n: { navigation } }: Props) {
    const { canvasDisplaySettings, userTrees } = useHomepageContentsState();

    const takingScreenShotState = useTakingScreenshotState();
    // const [takingScreenshot, { openTakingScreenshotModal, closeTakingScreenshotModal }] = takingScreenShotState;
    const selectedNodeIdState = useSelectedNodeIdState();
    const [selectedNodeId, { clearSelectedNodeId }] = selectedNodeIdState;

    const [canvasSettings, { openCanvasSettingsModal, closeCanvasSettingsModal }] = useCanvasSettingsState();

    const homepageTree = useMemo(
        () =>
            buildHomepageTree(
                [
                    {
                        treeName: "Muscuki",
                        accentColor: { label: "Red", color1: "#FE453A", color2: "#FF9F23" },
                        isRoot: false,
                        parentId: "homepageRoot",
                        treeId: "fEot9gYSv0XHOQS6rjTsepnv",
                        level: 0,
                        nodeId: "xq1Ty3XkyYWLlBX8Aoqt6dCP",
                        category: "SKILL_TREE",
                        children: [],
                        x: 0,
                        y: 0,
                        data: {
                            name: "Muscuki",
                            isCompleted: true,
                            icon: { isEmoji: false, text: "M" },
                            logs: [],
                            milestones: [],
                            motivesToLearn: [],
                            usefulResources: [],
                        },
                    },
                    {
                        treeName: "Degree",
                        accentColor: { label: "Yellow", color1: "#FED739", color2: "#FF9F23" },
                        isRoot: false,
                        parentId: "homepageRoot",
                        treeId: "T60Qxm83DTSZYOLsULl78DZZ",
                        level: 0,
                        nodeId: "xo1pn5U1LbbyB1WpQqlGzjSC",
                        category: "SKILL_TREE",
                        children: [
                            {
                                accentColor: { label: "Yellow", color1: "#FED739", color2: "#FF9F23" },
                                treeId: "T60Qxm83DTSZYOLsULl78DZZ",
                                treeName: "Degree",
                                category: "SKILL",
                                children: [
                                    {
                                        accentColor: { label: "Yellow", color1: "#FED739", color2: "#FF9F23" },
                                        treeId: "T60Qxm83DTSZYOLsULl78DZZ",
                                        treeName: "Degree",
                                        category: "SKILL",
                                        children: [
                                            {
                                                accentColor: { label: "Yellow", color1: "#FED739", color2: "#FF9F23" },
                                                treeId: "T60Qxm83DTSZYOLsULl78DZZ",
                                                treeName: "Degree",
                                                category: "SKILL",
                                                children: [],
                                                data: {
                                                    name: "A",
                                                    isCompleted: false,
                                                    icon: { isEmoji: false, text: "" },
                                                    logs: [],
                                                    milestones: [],
                                                    motivesToLearn: [],
                                                    usefulResources: [],
                                                },
                                                isRoot: false,
                                                level: 3,
                                                nodeId: "W4cebJSthJvkS687FcB6v4SE",
                                                parentId: "PLqLY3zrO1rje2LdoypEuHtp",
                                                x: 0,
                                                y: 0,
                                            },
                                            {
                                                accentColor: { label: "Yellow", color1: "#FED739", color2: "#FF9F23" },
                                                treeId: "T60Qxm83DTSZYOLsULl78DZZ",
                                                treeName: "Degree",
                                                category: "SKILL",
                                                children: [],
                                                data: {
                                                    name: "B",
                                                    isCompleted: false,
                                                    icon: { isEmoji: false, text: "" },
                                                    logs: [],
                                                    milestones: [],
                                                    motivesToLearn: [],
                                                    usefulResources: [],
                                                },
                                                isRoot: false,
                                                level: 3,
                                                nodeId: "OAEoTmtL2CQfBKkGOLtoOpKu",
                                                parentId: "PLqLY3zrO1rje2LdoypEuHtp",
                                                x: 0,
                                                y: 0,
                                            },
                                            {
                                                accentColor: { label: "Yellow", color1: "#FED739", color2: "#FF9F23" },
                                                treeId: "T60Qxm83DTSZYOLsULl78DZZ",
                                                treeName: "Degree",
                                                category: "SKILL",
                                                children: [],
                                                data: {
                                                    name: "C",
                                                    isCompleted: false,
                                                    icon: { isEmoji: false, text: "" },
                                                    logs: [],
                                                    milestones: [],
                                                    motivesToLearn: [],
                                                    usefulResources: [],
                                                },
                                                isRoot: false,
                                                level: 3,
                                                nodeId: "iaYRS8Ay7HBCXmVpuYqXwzaC",
                                                parentId: "PLqLY3zrO1rje2LdoypEuHtp",
                                                x: 0,
                                                y: 0,
                                            },
                                        ],
                                        data: {
                                            name: "Dkkd",
                                            isCompleted: false,
                                            icon: { isEmoji: false, text: "" },
                                            logs: [],
                                            milestones: [],
                                            motivesToLearn: [],
                                            usefulResources: [],
                                        },
                                        isRoot: false,
                                        level: 2,
                                        nodeId: "PLqLY3zrO1rje2LdoypEuHtp",
                                        parentId: "c1nWxT1H0LdIJoIeqzpW9jTQ",
                                        x: 0,
                                        y: 0,
                                    },
                                    {
                                        accentColor: { label: "Yellow", color1: "#FED739", color2: "#FF9F23" },
                                        treeId: "T60Qxm83DTSZYOLsULl78DZZ",
                                        treeName: "Degree",
                                        category: "SKILL",
                                        children: [
                                            {
                                                accentColor: { label: "Yellow", color1: "#FED739", color2: "#FF9F23" },
                                                treeId: "T60Qxm83DTSZYOLsULl78DZZ",
                                                treeName: "Degree",
                                                category: "SKILL",
                                                children: [],
                                                data: {
                                                    name: "Jvvj",
                                                    isCompleted: false,
                                                    icon: { isEmoji: false, text: "" },
                                                    logs: [],
                                                    milestones: [],
                                                    motivesToLearn: [],
                                                    usefulResources: [],
                                                },
                                                isRoot: false,
                                                level: 3,
                                                nodeId: "pGOJR7WrQty7JcW7PY49C7qM",
                                                parentId: "C4pjCLvMIUdw39PsreMyrgb8",
                                                x: 0,
                                                y: 0,
                                            },
                                        ],
                                        data: {
                                            name: "Coo",
                                            isCompleted: false,
                                            icon: { isEmoji: false, text: "" },
                                            logs: [],
                                            milestones: [],
                                            motivesToLearn: [],
                                            usefulResources: [],
                                        },
                                        isRoot: false,
                                        level: 2,
                                        nodeId: "C4pjCLvMIUdw39PsreMyrgb8",
                                        parentId: "c1nWxT1H0LdIJoIeqzpW9jTQ",
                                        x: 0,
                                        y: 0,
                                    },
                                ],
                                data: {
                                    name: "Uno",
                                    isCompleted: false,
                                    icon: { isEmoji: false, text: "" },
                                    logs: [],
                                    milestones: [],
                                    motivesToLearn: [],
                                    usefulResources: [],
                                },
                                isRoot: false,
                                level: 1,
                                nodeId: "c1nWxT1H0LdIJoIeqzpW9jTQ",
                                parentId: "xo1pn5U1LbbyB1WpQqlGzjSC",
                                x: 0,
                                y: 0,
                            },
                            {
                                accentColor: { label: "Yellow", color1: "#FED739", color2: "#FF9F23" },
                                treeId: "T60Qxm83DTSZYOLsULl78DZZ",
                                treeName: "Degree",
                                category: "SKILL",
                                children: [
                                    {
                                        accentColor: { label: "Yellow", color1: "#FED739", color2: "#FF9F23" },
                                        treeId: "T60Qxm83DTSZYOLsULl78DZZ",
                                        treeName: "Degree",
                                        category: "SKILL",
                                        children: [],
                                        data: {
                                            name: "Bsnds",
                                            isCompleted: false,
                                            icon: { isEmoji: false, text: "" },
                                            logs: [],
                                            milestones: [],
                                            motivesToLearn: [],
                                            usefulResources: [],
                                        },
                                        isRoot: false,
                                        level: 2,
                                        nodeId: "ETPU6bW0Il8YWK8kgLCztT2y",
                                        parentId: "OO2ZEOy17klSkQeUjlNIEDyC",
                                        x: 0,
                                        y: 0,
                                    },
                                ],
                                data: {
                                    name: "Dos",
                                    isCompleted: false,
                                    icon: { isEmoji: false, text: "" },
                                    logs: [],
                                    milestones: [],
                                    motivesToLearn: [],
                                    usefulResources: [],
                                },
                                isRoot: false,
                                level: 1,
                                nodeId: "OO2ZEOy17klSkQeUjlNIEDyC",
                                parentId: "xo1pn5U1LbbyB1WpQqlGzjSC",
                                x: 0,
                                y: 0,
                            },
                        ],
                        x: 0,
                        y: 0,
                        data: {
                            name: "Degree",
                            isCompleted: false,
                            icon: { isEmoji: false, text: "D" },
                            logs: [],
                            milestones: [],
                            motivesToLearn: [],
                            usefulResources: [],
                        },
                    },
                    {
                        treeName: "Art",
                        accentColor: { label: "Orange", color1: "#FF9F23", color2: "#BF5AF2" },
                        isRoot: false,
                        parentId: "homepageRoot",
                        treeId: "XrWEpaPKRS68T09rlekrkwvY",
                        level: 0,
                        nodeId: "YiXnGOGRi0AM7Qr6NCLpS0Bc",
                        category: "SKILL_TREE",
                        children: [
                            {
                                accentColor: { label: "Orange", color1: "#FF9F23", color2: "#BF5AF2" },
                                treeId: "XrWEpaPKRS68T09rlekrkwvY",
                                treeName: "Art",
                                category: "SKILL",
                                children: [
                                    {
                                        accentColor: { label: "Orange", color1: "#FF9F23", color2: "#BF5AF2" },
                                        treeId: "XrWEpaPKRS68T09rlekrkwvY",
                                        treeName: "Art",
                                        category: "SKILL",
                                        children: [
                                            {
                                                accentColor: { label: "Orange", color1: "#FF9F23", color2: "#BF5AF2" },
                                                treeId: "XrWEpaPKRS68T09rlekrkwvY",
                                                treeName: "Art",
                                                category: "SKILL",
                                                children: [],
                                                data: {
                                                    name: "S",
                                                    isCompleted: false,
                                                    icon: { isEmoji: false, text: "" },
                                                    logs: [],
                                                    milestones: [],
                                                    motivesToLearn: [],
                                                    usefulResources: [],
                                                },
                                                isRoot: false,
                                                level: 3,
                                                nodeId: "yB7Y5ZFbcvzobGbvDQIBhLBC",
                                                parentId: "UydKvtvXuznmmprn39hDN7Uq",
                                                x: 0,
                                                y: 0,
                                            },
                                            {
                                                accentColor: { label: "Orange", color1: "#FF9F23", color2: "#BF5AF2" },
                                                treeId: "XrWEpaPKRS68T09rlekrkwvY",
                                                treeName: "Art",
                                                category: "SKILL",
                                                children: [],
                                                data: {
                                                    name: "Hehej",
                                                    isCompleted: false,
                                                    icon: { isEmoji: false, text: "" },
                                                    logs: [],
                                                    milestones: [],
                                                    motivesToLearn: [],
                                                    usefulResources: [],
                                                },
                                                isRoot: false,
                                                level: 3,
                                                nodeId: "h1XB4MHwb6UjRndE4yy5H9Fb",
                                                parentId: "UydKvtvXuznmmprn39hDN7Uq",
                                                x: 0,
                                                y: 0,
                                            },
                                        ],
                                        data: {
                                            name: "Dd",
                                            isCompleted: false,
                                            icon: { isEmoji: false, text: "" },
                                            logs: [],
                                            milestones: [],
                                            motivesToLearn: [],
                                            usefulResources: [],
                                        },
                                        isRoot: false,
                                        level: 2,
                                        nodeId: "UydKvtvXuznmmprn39hDN7Uq",
                                        parentId: "6nHFVkOqhxQt1t0wJyPH6XVJ",
                                        x: 0,
                                        y: 0,
                                    },
                                    {
                                        accentColor: { label: "Orange", color1: "#FF9F23", color2: "#BF5AF2" },
                                        treeId: "XrWEpaPKRS68T09rlekrkwvY",
                                        treeName: "Art",
                                        category: "SKILL",
                                        children: [
                                            {
                                                accentColor: { label: "Orange", color1: "#FF9F23", color2: "#BF5AF2" },
                                                treeId: "XrWEpaPKRS68T09rlekrkwvY",
                                                treeName: "Art",
                                                category: "SKILL",
                                                children: [],
                                                data: {
                                                    name: "A",
                                                    isCompleted: false,
                                                    icon: { isEmoji: false, text: "" },
                                                    logs: [],
                                                    milestones: [],
                                                    motivesToLearn: [],
                                                    usefulResources: [],
                                                },
                                                isRoot: false,
                                                level: 3,
                                                nodeId: "OeC54kCCSD4l9hhc1V7QkJUA",
                                                parentId: "o5ZUPWxtFKnBB30tuAw8Xd9w",
                                                x: 0,
                                                y: 0,
                                            },
                                            {
                                                accentColor: { label: "Orange", color1: "#FF9F23", color2: "#BF5AF2" },
                                                treeId: "XrWEpaPKRS68T09rlekrkwvY",
                                                treeName: "Art",
                                                category: "SKILL",
                                                children: [],
                                                data: {
                                                    name: "B",
                                                    isCompleted: false,
                                                    icon: { isEmoji: false, text: "" },
                                                    logs: [],
                                                    milestones: [],
                                                    motivesToLearn: [],
                                                    usefulResources: [],
                                                },
                                                isRoot: false,
                                                level: 3,
                                                nodeId: "zKJi6y5UdSrQOx4ySeX5djPm",
                                                parentId: "o5ZUPWxtFKnBB30tuAw8Xd9w",
                                                x: 0,
                                                y: 0,
                                            },
                                            {
                                                accentColor: { label: "Orange", color1: "#FF9F23", color2: "#BF5AF2" },
                                                treeId: "XrWEpaPKRS68T09rlekrkwvY",
                                                treeName: "Art",
                                                category: "SKILL",
                                                children: [],
                                                data: {
                                                    name: "C",
                                                    isCompleted: false,
                                                    icon: { isEmoji: false, text: "" },
                                                    logs: [],
                                                    milestones: [],
                                                    motivesToLearn: [],
                                                    usefulResources: [],
                                                },
                                                isRoot: false,
                                                level: 3,
                                                nodeId: "QOEus1TQ0uHqbW2QYsHoPDGt",
                                                parentId: "o5ZUPWxtFKnBB30tuAw8Xd9w",
                                                x: 0,
                                                y: 0,
                                            },
                                        ],
                                        data: {
                                            name: "Cf",
                                            isCompleted: false,
                                            icon: { isEmoji: false, text: "" },
                                            logs: [],
                                            milestones: [],
                                            motivesToLearn: [],
                                            usefulResources: [],
                                        },
                                        isRoot: false,
                                        level: 2,
                                        nodeId: "o5ZUPWxtFKnBB30tuAw8Xd9w",
                                        parentId: "6nHFVkOqhxQt1t0wJyPH6XVJ",
                                        x: 0,
                                        y: 0,
                                    },
                                ],
                                data: {
                                    name: "A",
                                    isCompleted: false,
                                    icon: { isEmoji: false, text: "" },
                                    logs: [],
                                    milestones: [],
                                    motivesToLearn: [],
                                    usefulResources: [],
                                },
                                isRoot: false,
                                level: 1,
                                nodeId: "6nHFVkOqhxQt1t0wJyPH6XVJ",
                                parentId: "YiXnGOGRi0AM7Qr6NCLpS0Bc",
                                x: 0,
                                y: 0,
                            },
                            {
                                accentColor: { label: "Orange", color1: "#FF9F23", color2: "#BF5AF2" },
                                treeId: "XrWEpaPKRS68T09rlekrkwvY",
                                treeName: "Art",
                                category: "SKILL",
                                children: [
                                    {
                                        accentColor: { label: "Orange", color1: "#FF9F23", color2: "#BF5AF2" },
                                        treeId: "XrWEpaPKRS68T09rlekrkwvY",
                                        treeName: "Art",
                                        category: "SKILL",
                                        children: [],
                                        data: {
                                            name: "Hh",
                                            isCompleted: false,
                                            icon: { isEmoji: false, text: "" },
                                            logs: [],
                                            milestones: [],
                                            motivesToLearn: [],
                                            usefulResources: [],
                                        },
                                        isRoot: false,
                                        level: 2,
                                        nodeId: "ZcAeHwZQceTlX4D6I3DU9k1U",
                                        parentId: "cquIn5zeC4f8fvLQKK2PV2mM",
                                        x: 0,
                                        y: 0,
                                    },
                                ],
                                data: {
                                    name: "B",
                                    isCompleted: false,
                                    icon: { isEmoji: false, text: "" },
                                    logs: [],
                                    milestones: [],
                                    motivesToLearn: [],
                                    usefulResources: [],
                                },
                                isRoot: false,
                                level: 1,
                                nodeId: "cquIn5zeC4f8fvLQKK2PV2mM",
                                parentId: "YiXnGOGRi0AM7Qr6NCLpS0Bc",
                                x: 0,
                                y: 0,
                            },
                            {
                                accentColor: { label: "Orange", color1: "#FF9F23", color2: "#BF5AF2" },
                                treeId: "XrWEpaPKRS68T09rlekrkwvY",
                                treeName: "Art",
                                category: "SKILL",
                                children: [],
                                data: {
                                    name: "C",
                                    isCompleted: false,
                                    icon: { isEmoji: false, text: "" },
                                    logs: [],
                                    milestones: [],
                                    motivesToLearn: [],
                                    usefulResources: [],
                                },
                                isRoot: false,
                                level: 1,
                                nodeId: "juEwrhtZAQ7ZMFm4Y44jG4Ru",
                                parentId: "YiXnGOGRi0AM7Qr6NCLpS0Bc",
                                x: 0,
                                y: 0,
                            },
                        ],
                        x: 0,
                        y: 0,
                        data: {
                            name: "Art",
                            isCompleted: false,
                            icon: { isEmoji: false, text: "A" },
                            logs: [],
                            milestones: [],
                            motivesToLearn: [],
                            usefulResources: [],
                        },
                    },
                    {
                        treeName: "Moneys",
                        accentColor: { label: "Green", color1: "#50D158", color2: "#1982F9" },
                        isRoot: false,
                        parentId: "homepageRoot",
                        treeId: "VIu0RhIaYuFjtCDLmHCtRpXj",
                        level: 0,
                        nodeId: "ZaP524wLoByB2YUJZha99ELz",
                        category: "SKILL_TREE",
                        children: [
                            {
                                accentColor: { label: "Green", color1: "#50D158", color2: "#1982F9" },
                                treeId: "VIu0RhIaYuFjtCDLmHCtRpXj",
                                treeName: "Moneys",
                                category: "SKILL",
                                children: [
                                    {
                                        accentColor: { label: "Green", color1: "#50D158", color2: "#1982F9" },
                                        treeId: "VIu0RhIaYuFjtCDLmHCtRpXj",
                                        treeName: "Moneys",
                                        category: "SKILL",
                                        children: [],
                                        data: {
                                            name: "B",
                                            isCompleted: false,
                                            icon: { isEmoji: false, text: "" },
                                            logs: [],
                                            milestones: [],
                                            motivesToLearn: [],
                                            usefulResources: [],
                                        },
                                        isRoot: false,
                                        level: 2,
                                        nodeId: "5q0IMY79rAneVeAHSwRgm8AM",
                                        parentId: "EaTStq4s6zIxltcjd0MTaLKS",
                                        x: 0,
                                        y: 0,
                                    },
                                    {
                                        accentColor: { label: "Green", color1: "#50D158", color2: "#1982F9" },
                                        treeId: "VIu0RhIaYuFjtCDLmHCtRpXj",
                                        treeName: "Moneys",
                                        category: "SKILL",
                                        children: [],
                                        data: {
                                            name: "S",
                                            isCompleted: false,
                                            icon: { isEmoji: false, text: "" },
                                            logs: [],
                                            milestones: [],
                                            motivesToLearn: [],
                                            usefulResources: [],
                                        },
                                        isRoot: false,
                                        level: 2,
                                        nodeId: "NRfw8131hOoU3VPgCoQJSBai",
                                        parentId: "EaTStq4s6zIxltcjd0MTaLKS",
                                        x: 0,
                                        y: 0,
                                    },
                                    {
                                        accentColor: { label: "Green", color1: "#50D158", color2: "#1982F9" },
                                        treeId: "VIu0RhIaYuFjtCDLmHCtRpXj",
                                        treeName: "Moneys",
                                        category: "SKILL",
                                        children: [],
                                        data: {
                                            name: "J",
                                            isCompleted: false,
                                            icon: { isEmoji: false, text: "" },
                                            logs: [],
                                            milestones: [],
                                            motivesToLearn: [],
                                            usefulResources: [],
                                        },
                                        isRoot: false,
                                        level: 2,
                                        nodeId: "qsVTkuD9OZ9I5Xl7j3Oib1Ox",
                                        parentId: "EaTStq4s6zIxltcjd0MTaLKS",
                                        x: 0,
                                        y: 0,
                                    },
                                ],
                                data: {
                                    name: "B",
                                    isCompleted: false,
                                    icon: { isEmoji: false, text: "" },
                                    logs: [],
                                    milestones: [],
                                    motivesToLearn: [],
                                    usefulResources: [],
                                },
                                isRoot: false,
                                level: 1,
                                nodeId: "EaTStq4s6zIxltcjd0MTaLKS",
                                parentId: "ZaP524wLoByB2YUJZha99ELz",
                                x: 0,
                                y: 0,
                            },
                            {
                                accentColor: { label: "Green", color1: "#50D158", color2: "#1982F9" },
                                treeId: "VIu0RhIaYuFjtCDLmHCtRpXj",
                                treeName: "Moneys",
                                category: "SKILL",
                                children: [
                                    {
                                        accentColor: { label: "Green", color1: "#50D158", color2: "#1982F9" },
                                        treeId: "VIu0RhIaYuFjtCDLmHCtRpXj",
                                        treeName: "Moneys",
                                        category: "SKILL",
                                        children: [
                                            {
                                                accentColor: { label: "Green", color1: "#50D158", color2: "#1982F9" },
                                                treeId: "VIu0RhIaYuFjtCDLmHCtRpXj",
                                                treeName: "Moneys",
                                                category: "SKILL",
                                                children: [],
                                                data: {
                                                    name: "L",
                                                    isCompleted: false,
                                                    icon: { isEmoji: false, text: "" },
                                                    logs: [],
                                                    milestones: [],
                                                    motivesToLearn: [],
                                                    usefulResources: [],
                                                },
                                                isRoot: false,
                                                level: 3,
                                                nodeId: "eUVW3NvIA3K2JT4cS8Vt4idV",
                                                parentId: "R2uls2cGeedOezadmH92BHu8",
                                                x: 0,
                                                y: 0,
                                            },
                                            {
                                                accentColor: { label: "Green", color1: "#50D158", color2: "#1982F9" },
                                                treeId: "VIu0RhIaYuFjtCDLmHCtRpXj",
                                                treeName: "Moneys",
                                                category: "SKILL",
                                                children: [],
                                                data: {
                                                    name: "Gcgc g",
                                                    isCompleted: false,
                                                    icon: { isEmoji: false, text: "" },
                                                    logs: [],
                                                    milestones: [],
                                                    motivesToLearn: [],
                                                    usefulResources: [],
                                                },
                                                isRoot: false,
                                                level: 3,
                                                nodeId: "tleqTACAMzNV5IWS6PuhKAQa",
                                                parentId: "R2uls2cGeedOezadmH92BHu8",
                                                x: 0,
                                                y: 0,
                                            },
                                        ],
                                        data: {
                                            name: "H",
                                            isCompleted: false,
                                            icon: { isEmoji: false, text: "" },
                                            logs: [],
                                            milestones: [],
                                            motivesToLearn: [],
                                            usefulResources: [],
                                        },
                                        isRoot: false,
                                        level: 2,
                                        nodeId: "R2uls2cGeedOezadmH92BHu8",
                                        parentId: "oE5PvpfzuzLjD2o2VZ4OJEUN",
                                        x: 0,
                                        y: 0,
                                    },
                                    {
                                        accentColor: { label: "Green", color1: "#50D158", color2: "#1982F9" },
                                        treeId: "VIu0RhIaYuFjtCDLmHCtRpXj",
                                        treeName: "Moneys",
                                        category: "SKILL",
                                        children: [
                                            {
                                                accentColor: { label: "Green", color1: "#50D158", color2: "#1982F9" },
                                                treeId: "VIu0RhIaYuFjtCDLmHCtRpXj",
                                                treeName: "Moneys",
                                                category: "SKILL",
                                                children: [],
                                                data: {
                                                    name: "H",
                                                    isCompleted: false,
                                                    icon: { isEmoji: false, text: "" },
                                                    logs: [],
                                                    milestones: [],
                                                    motivesToLearn: [],
                                                    usefulResources: [],
                                                },
                                                isRoot: false,
                                                level: 3,
                                                nodeId: "bz8QsifzNWuC68BcjQ9KSrq6",
                                                parentId: "aIEQEcZwCzYjLK2hHkvso7vB",
                                                x: 0,
                                                y: 0,
                                            },
                                        ],
                                        data: {
                                            name: "M",
                                            isCompleted: false,
                                            icon: { isEmoji: false, text: "" },
                                            logs: [],
                                            milestones: [],
                                            motivesToLearn: [],
                                            usefulResources: [],
                                        },
                                        isRoot: false,
                                        level: 2,
                                        nodeId: "aIEQEcZwCzYjLK2hHkvso7vB",
                                        parentId: "oE5PvpfzuzLjD2o2VZ4OJEUN",
                                        x: 0,
                                        y: 0,
                                    },
                                ],
                                data: {
                                    name: "A",
                                    isCompleted: false,
                                    icon: { isEmoji: false, text: "" },
                                    logs: [],
                                    milestones: [],
                                    motivesToLearn: [],
                                    usefulResources: [],
                                },
                                isRoot: false,
                                level: 1,
                                nodeId: "oE5PvpfzuzLjD2o2VZ4OJEUN",
                                parentId: "ZaP524wLoByB2YUJZha99ELz",
                                x: 0,
                                y: 0,
                            },
                            {
                                accentColor: { label: "Green", color1: "#50D158", color2: "#1982F9" },
                                treeId: "VIu0RhIaYuFjtCDLmHCtRpXj",
                                treeName: "Moneys",
                                category: "SKILL",
                                children: [
                                    {
                                        accentColor: { label: "Green", color1: "#50D158", color2: "#1982F9" },
                                        treeId: "VIu0RhIaYuFjtCDLmHCtRpXj",
                                        treeName: "Moneys",
                                        category: "SKILL",
                                        children: [
                                            {
                                                accentColor: { label: "Green", color1: "#50D158", color2: "#1982F9" },
                                                treeId: "VIu0RhIaYuFjtCDLmHCtRpXj",
                                                treeName: "Moneys",
                                                category: "SKILL",
                                                children: [],
                                                data: {
                                                    name: "Ghh",
                                                    isCompleted: false,
                                                    icon: { isEmoji: false, text: "" },
                                                    logs: [],
                                                    milestones: [],
                                                    motivesToLearn: [],
                                                    usefulResources: [],
                                                },
                                                isRoot: false,
                                                level: 3,
                                                nodeId: "qiDTAMbKL2LqI7oPTlDISWUd",
                                                parentId: "8Gp9OHcp6orUxdHjSfpaVUAH",
                                                x: 0,
                                                y: 0,
                                            },
                                        ],
                                        data: {
                                            name: "G",
                                            isCompleted: false,
                                            icon: { isEmoji: false, text: "" },
                                            logs: [],
                                            milestones: [],
                                            motivesToLearn: [],
                                            usefulResources: [],
                                        },
                                        isRoot: false,
                                        level: 2,
                                        nodeId: "8Gp9OHcp6orUxdHjSfpaVUAH",
                                        parentId: "nFC97sH2HjHgdirs9DcHO4wb",
                                        x: 0,
                                        y: 0,
                                    },
                                ],
                                data: {
                                    name: "C",
                                    isCompleted: false,
                                    icon: { isEmoji: false, text: "" },
                                    logs: [],
                                    milestones: [],
                                    motivesToLearn: [],
                                    usefulResources: [],
                                },
                                isRoot: false,
                                level: 1,
                                nodeId: "nFC97sH2HjHgdirs9DcHO4wb",
                                parentId: "ZaP524wLoByB2YUJZha99ELz",
                                x: 0,
                                y: 0,
                            },
                        ],
                        x: 0,
                        y: 0,
                        data: {
                            name: "Moneys",
                            isCompleted: false,
                            icon: { isEmoji: false, text: "M" },
                            logs: [],
                            milestones: [],
                            motivesToLearn: [],
                            usefulResources: [],
                        },
                    },
                    {
                        treeName: "Brain",
                        accentColor: { label: "Purple", color1: "#BF5AF2", color2: "#5A7BF2" },
                        isRoot: false,
                        parentId: "homepageRoot",
                        treeId: "CXCHHuWKSVVIhTn2wOKjr94x",
                        level: 0,
                        nodeId: "aQbWCZDIHv4j0hsGnvwq6Y1n",
                        category: "SKILL_TREE",
                        children: [],
                        x: 0,
                        y: 0,
                        data: {
                            name: "Brain",
                            isCompleted: true,
                            icon: { isEmoji: false, text: "B" },
                            logs: [],
                            milestones: [],
                            motivesToLearn: [],
                            usefulResources: [],
                        },
                    },
                ],
                canvasDisplaySettings
            ),
        [canvasDisplaySettings, userTrees]
    );

    // useHandleInitialTreeCoordinates(userTrees, screenDimensions, canvasDisplaySettings);

    useHandleNavigationListener(navigation, clearSelectedNodeId);

    const canvasRef = useCanvasRef();

    const lol = {
        selectedNodeIdState,
        canvasRef,
        homepageTree,
        navigation,
        openCanvasSettingsModal,
    };

    return (
        <>
            <HomepageTree lol={lol} />
            <ProgressIndicatorAndName tree={homepageTree} />
            <OpenSettingsMenu openModal={openCanvasSettingsModal} show={selectedNodeId === null} />
            <ShareTreeLayout
                canvasRef={canvasRef}
                shouldShare={selectedNodeId === null}
                takingScreenshotState={takingScreenShotState}
                tree={homepageTree}
            />
            <CanvasSettingsModal open={canvasSettings} closeModal={closeCanvasSettingsModal} />
        </>
    );
}

export default HomepageContents;
