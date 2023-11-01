import AppButton from "@/components/AppButton";
import AppText from "@/components/AppText";
import { DefineGradients, HierarchicalPath, RadialPath } from "@/components/takingScreenshot/TakingScreenshotLoadingScreenModal";
import { getTextWidth } from "@/components/treeRelated/general/StaticNodeList";
import { getTextCoordinates } from "@/components/treeRelated/general/useHandleNodeAnimatedCoordinates";
import { completedSkillTreeTable } from "@/functions/extractInformationFromTree";
import { getLabelTextColor } from "@/functions/misc";
import { nodeToCircularPath } from "@/functions/svg/toSvg";
import { NodeCoordinate } from "@/types";
import { useFont } from "@shopify/react-native-skia";
import { router } from "expo-router";
import { Dimensions, StyleSheet, View } from "react-native";
import { Defs, LinearGradient, Path, Stop, Svg } from "react-native-svg";
import { CIRCLE_SIZE, HOMEPAGE_TREE_ID, HOMETREE_ROOT_ID, NODE_ICON_FONT_SIZE, centerFlex, colors } from "../../src/parameters";
import { Fragment } from "react";

const TEXT_AND_BUTTON_HEIGHT = 150;

function WelcomeScreen() {
    const { width } = Dimensions.get("window");

    const openCreateNewTree = () => {
        //@ts-ignore
        router.push({ pathname: "/myTrees", params: { openNewTreeModal: true } });
    };

    return (
        <View style={[centerFlex, { flex: 1, justifyContent: "flex-end", position: "relative" }]}>
            <OnboardingTree />

            <View style={{ marginBottom: 10 }}>
                <AppText
                    children={"Visualize your life goals and"}
                    fontSize={18}
                    style={{ color: "#E6E8E6", fontFamily: "helveticaBold", textAlign: "center", marginBottom: 5 }}
                />
                <AppText
                    children={"become who you are destined to be"}
                    fontSize={18}
                    style={{ color: "#E6E8E6", fontFamily: "helveticaBold", textAlign: "center" }}
                />
            </View>

            <AppButton
                onPress={openCreateNewTree}
                text={{ idle: "Start your journey" }}
                color={{ idle: colors.accent }}
                pressableStyle={{ width, paddingHorizontal: 10, marginVertical: 20 }}
                style={{ backgroundColor: colors.accent, borderRadius: 30 }}
                textStyle={{ fontFamily: "helveticaBold" }}
            />
        </View>
    );
}

function useSkiaFonts() {
    const labelFont = useFont(require("../../assets/Helvetica.ttf"), 12);
    const nodeLetterFont = useFont(require("../../assets/Helvetica.ttf"), NODE_ICON_FONT_SIZE);
    const emojiFont = useFont(require("../../assets/NotoEmoji-Regular.ttf"), NODE_ICON_FONT_SIZE);

    if (!labelFont || !nodeLetterFont || !emojiFont) return undefined;

    return { labelFont, nodeLetterFont, emojiFont };
}

const OnboardingTree = () => {
    const { width, height } = Dimensions.get("window");

    const fonts = useSkiaFonts();

    const mockCoordinatesInsideCanvas: NodeCoordinate[] = [
        {
            accentColor: { label: "Orange", color1: "#FF9F23", color2: "#BF5AF2" },
            category: "USER",
            data: {
                name: "Life Skills",
                isCompleted: false,
                icon: { isEmoji: true, text: "😃" },
                logs: [],
                milestones: [],
                motivesToLearn: [],
                usefulResources: [],
            },
            isRoot: true,
            level: 0,
            nodeId: "homepageRoot",
            parentId: null,
            treeId: "HomepageTree",
            treeName: "Life Skills",
            x: 427.241693541847,
            y: 798.3467544685266,
        },
        {
            accentColor: { label: "Blue", color1: "#1982F9", color2: "#BF5AF2" },
            category: "SKILL_TREE",
            data: {
                name: "Education",
                isCompleted: false,
                icon: { isEmoji: true, text: "🧠" },
                logs: [],
                milestones: [],
                motivesToLearn: [],
                usefulResources: [],
            },
            isRoot: false,
            level: 1,
            nodeId: "48f11433ed140fc13567f129",
            parentId: "homepageRoot",
            treeId: "d5c56276e6f38a411b3aa61b",
            treeName: "Education",
            x: 559.658605941847,
            y: 798.3467544685266,
        },
        {
            accentColor: { label: "Blue", color1: "#1982F9", color2: "#BF5AF2" },
            category: "SKILL",
            data: {
                name: "Elementary",
                isCompleted: true,
                icon: { isEmoji: false, text: "" },
                logs: [],
                milestones: [],
                motivesToLearn: [],
                usefulResources: [],
            },
            isRoot: false,
            level: 2,
            nodeId: "cb8fe500a04dee2fba294044",
            parentId: "48f11433ed140fc13567f129",
            treeId: "d5c56276e6f38a411b3aa61b",
            treeName: "Education",
            x: 692.075518341847,
            y: 798.3467544685266,
        },
        {
            accentColor: { label: "Blue", color1: "#1982F9", color2: "#BF5AF2" },
            category: "SKILL",
            data: {
                name: "High School",
                isCompleted: true,
                icon: { isEmoji: false, text: "" },
                logs: [],
                milestones: [],
                motivesToLearn: [],
                usefulResources: [],
            },
            isRoot: false,
            level: 3,
            nodeId: "13293a343e36df0635cc2f87",
            parentId: "cb8fe500a04dee2fba294044",
            treeId: "d5c56276e6f38a411b3aa61b",
            treeName: "Education",
            x: 824.492430741847,
            y: 798.3467544685266,
        },
        {
            accentColor: { label: "Blue", color1: "#1982F9", color2: "#BF5AF2" },
            category: "SKILL",
            data: {
                name: "College",
                isCompleted: false,
                icon: { isEmoji: false, text: "" },
                logs: [],
                milestones: [],
                motivesToLearn: [],
                usefulResources: [],
            },
            isRoot: false,
            level: 4,
            nodeId: "3f62e8eb1295d6e1c437e0b3",
            parentId: "13293a343e36df0635cc2f87",
            treeId: "d5c56276e6f38a411b3aa61b",
            treeName: "Education",
            x: 956.909343141847,
            y: 798.3467544685266,
        },
        {
            accentColor: { label: "Blue", color1: "#1982F9", color2: "#BF5AF2" },
            category: "SKILL",
            data: {
                name: "Phd",
                isCompleted: false,
                icon: { isEmoji: false, text: "" },
                logs: [],
                milestones: [],
                motivesToLearn: [],
                usefulResources: [],
            },
            isRoot: false,
            level: 5,
            nodeId: "654843936120bdc75bdaa1a2",
            parentId: "3f62e8eb1295d6e1c437e0b3",
            treeId: "d5c56276e6f38a411b3aa61b",
            treeName: "Education",
            x: 1089.3262555418469,
            y: 798.3467544685266,
        },
        {
            accentColor: { label: "Yellow", color1: "#FED739", color2: "#FF9F23" },
            category: "SKILL_TREE",
            data: {
                name: "Sports",
                isCompleted: false,
                icon: { isEmoji: true, text: "🫀" },
                logs: [],
                milestones: [],
                motivesToLearn: [],
                usefulResources: [],
            },
            isRoot: false,
            level: 1,
            nodeId: "025f1eb582ede1f45d12a127",
            parentId: "homepageRoot",
            treeId: "a13392a32a1e1cc3545332de",
            treeName: "Sports",
            x: 508.0880885744205,
            y: 693.4749322292504,
        },
        {
            accentColor: { label: "Yellow", color1: "#FED739", color2: "#FF9F23" },
            category: "SKILL",
            data: {
                name: "Running",
                isCompleted: false,
                icon: { isEmoji: false, text: "" },
                logs: [],
                milestones: [],
                motivesToLearn: [],
                usefulResources: [],
            },
            isRoot: false,
            level: 2,
            nodeId: "4be9947908715dbc0ceb3552",
            parentId: "025f1eb582ede1f45d12a127",
            treeId: "a13392a32a1e1cc3545332de",
            treeName: "Sports",
            x: 445.1570076031035,
            y: 534.1195865234349,
        },
        {
            accentColor: { label: "Yellow", color1: "#FED739", color2: "#FF9F23" },
            category: "SKILL",
            data: {
                name: "Tennis",
                isCompleted: true,
                icon: { isEmoji: true, text: "🥎" },
                logs: [],
                milestones: [],
                motivesToLearn: [],
                usefulResources: [],
            },
            isRoot: false,
            level: 2,
            nodeId: "67bdf03728e90f4d8da2a6b7",
            parentId: "025f1eb582ede1f45d12a127",
            treeId: "a13392a32a1e1cc3545332de",
            treeName: "Sports",
            x: 521.0866805241506,
            y: 550.6976616446514,
        },
        {
            accentColor: { label: "Yellow", color1: "#FED739", color2: "#FF9F23" },
            category: "SKILL",
            data: {
                name: "Baseball",
                isCompleted: false,
                icon: { isEmoji: true, text: "⚾" },
                logs: [],
                milestones: [],
                motivesToLearn: [],
                usefulResources: [],
            },
            isRoot: false,
            level: 2,
            nodeId: "4e5eb964626fffaacf1b8332",
            parentId: "025f1eb582ede1f45d12a127",
            treeId: "a13392a32a1e1cc3545332de",
            treeName: "Sports",
            x: 588.934483606994,
            y: 588.6031099899742,
        },
        {
            accentColor: { label: "Yellow", color1: "#FED739", color2: "#FF9F23" },
            category: "SKILL",
            data: {
                name: "Voleyball",
                isCompleted: true,
                icon: { isEmoji: true, text: "🏐" },
                logs: [],
                milestones: [],
                motivesToLearn: [],
                usefulResources: [],
            },
            isRoot: false,
            level: 2,
            nodeId: "b17447fbe31b723bfc89a15d",
            parentId: "025f1eb582ede1f45d12a127",
            treeId: "a13392a32a1e1cc3545332de",
            treeName: "Sports",
            x: 642.8574122999814,
            y: 644.5715400072547,
        },
        {
            accentColor: { label: "Yellow", color1: "#FED739", color2: "#FF9F23" },
            category: "SKILL",
            data: {
                name: "Martial arts",
                isCompleted: true,
                icon: { isEmoji: true, text: "🥋" },
                logs: [],
                milestones: [],
                motivesToLearn: [],
                usefulResources: [],
            },
            isRoot: false,
            level: 2,
            nodeId: "1e1d26585627ddac483c18e3",
            parentId: "025f1eb582ede1f45d12a127",
            treeId: "a13392a32a1e1cc3545332de",
            treeName: "Sports",
            x: 678.2116602312858,
            y: 713.782988125612,
        },
        {
            accentColor: { label: "Green", color1: "#50D158", color2: "#1982F9" },
            category: "SKILL_TREE",
            data: {
                name: "Skill Trees",
                isCompleted: false,
                icon: { isEmoji: true, text: "🌲" },
                logs: [],
                milestones: [],
                motivesToLearn: [],
                usefulResources: [],
            },
            isRoot: false,
            level: 1,
            nodeId: "a03d92f7e92c08df3f5a4c53",
            parentId: "homepageRoot",
            treeId: "dcfa6e82257214440370679f",
            treeName: "Skill Trees",
            x: 342.028839309024,
            y: 696.9909052882995,
        },
        {
            accentColor: { label: "Green", color1: "#50D158", color2: "#1982F9" },
            category: "SKILL",
            data: {
                name: "Web launch",
                isCompleted: false,
                icon: { isEmoji: false, text: "" },
                logs: [],
                milestones: [],
                motivesToLearn: [],
                usefulResources: [],
            },
            isRoot: false,
            level: 2,
            nodeId: "71af630fad5de8356a832a5d",
            parentId: "a03d92f7e92c08df3f5a4c53",
            treeId: "dcfa6e82257214440370679f",
            treeName: "Skill Trees",
            x: 186.5082583430451,
            y: 687.9639300093683,
        },
        {
            accentColor: { label: "Green", color1: "#50D158", color2: "#1982F9" },
            category: "SKILL",
            data: {
                name: "iOS launch",
                isCompleted: false,
                icon: { isEmoji: false, text: "" },
                logs: [],
                milestones: [],
                motivesToLearn: [],
                usefulResources: [],
            },
            isRoot: false,
            level: 2,
            nodeId: "1d78ca1a9df6ef3393c66220",
            parentId: "a03d92f7e92c08df3f5a4c53",
            treeId: "dcfa6e82257214440370679f",
            treeName: "Skill Trees",
            x: 228.91660158969174,
            y: 622.8357500831427,
        },
        {
            accentColor: { label: "Green", color1: "#50D158", color2: "#1982F9" },
            category: "SKILL",
            data: {
                name: "Android launch",
                isCompleted: true,
                icon: { isEmoji: false, text: "" },
                logs: [],
                milestones: [],
                motivesToLearn: [],
                usefulResources: [],
            },
            isRoot: false,
            level: 2,
            nodeId: "4ba33132adecb6427043f98b",
            parentId: "a03d92f7e92c08df3f5a4c53",
            treeId: "dcfa6e82257214440370679f",
            treeName: "Skill Trees",
            x: 288.4045706955633,
            y: 572.8224584870004,
        },
        {
            accentColor: { label: "Green", color1: "#50D158", color2: "#1982F9" },
            category: "SKILL",
            data: {
                name: "50 users",
                isCompleted: true,
                icon: { isEmoji: false, text: "" },
                logs: [],
                milestones: [],
                motivesToLearn: [],
                usefulResources: [],
            },
            isRoot: false,
            level: 2,
            nodeId: "c40f31b98942977e1cb90b71",
            parentId: "a03d92f7e92c08df3f5a4c53",
            treeId: "dcfa6e82257214440370679f",
            treeName: "Skill Trees",
            x: 359.84909773896516,
            y: 542.2311696456843,
        },
        {
            accentColor: { label: "Green", color1: "#50D158", color2: "#1982F9" },
            category: "SKILL",
            data: {
                name: "100 users",
                isCompleted: true,
                icon: { isEmoji: false, text: "" },
                logs: [],
                milestones: [],
                motivesToLearn: [],
                usefulResources: [],
            },
            isRoot: false,
            level: 3,
            nodeId: "dfad8a78a9420b3933f3a288",
            parentId: "c40f31b98942977e1cb90b71",
            treeId: "dcfa6e82257214440370679f",
            treeName: "Skill Trees",
            x: 326.1527998375243,
            y: 414.1733772342633,
        },
        {
            accentColor: { label: "Green", color1: "#50D158", color2: "#1982F9" },
            category: "SKILL",
            data: {
                name: "500 users",
                isCompleted: true,
                icon: { isEmoji: false, text: "" },
                logs: [],
                milestones: [],
                motivesToLearn: [],
                usefulResources: [],
            },
            isRoot: false,
            level: 4,
            nodeId: "398e2b01672aa4e33179330a",
            parentId: "dfad8a78a9420b3933f3a288",
            treeId: "dcfa6e82257214440370679f",
            treeName: "Skill Trees",
            x: 292.4565019360834,
            y: 286.11558482284204,
        },
        {
            accentColor: { label: "Green", color1: "#50D158", color2: "#1982F9" },
            category: "SKILL",
            data: {
                name: "1000 users",
                isCompleted: true,
                icon: { isEmoji: false, text: "" },
                logs: [],
                milestones: [],
                motivesToLearn: [],
                usefulResources: [],
            },
            isRoot: false,
            level: 5,
            nodeId: "9d1e5d458c396b8e3ba3a4ed",
            parentId: "398e2b01672aa4e33179330a",
            treeId: "dcfa6e82257214440370679f",
            treeName: "Skill Trees",
            x: 258.76020403464247,
            y: 158.05779241142102,
        },
        {
            accentColor: { label: "Green", color1: "#50D158", color2: "#1982F9" },
            category: "SKILL",
            data: {
                name: "5000 users",
                isCompleted: false,
                icon: { isEmoji: false, text: "" },
                logs: [],
                milestones: [],
                motivesToLearn: [],
                usefulResources: [],
            },
            isRoot: false,
            level: 6,
            nodeId: "6b8a7945c3892a43aeb31c0d",
            parentId: "9d1e5d458c396b8e3ba3a4ed",
            treeId: "dcfa6e82257214440370679f",
            treeName: "Skill Trees",
            x: 225.06390613320156,
            y: 30,
        },
        {
            accentColor: { label: "Purple", color1: "#BF5AF2", color2: "#5A7BF2" },
            category: "SKILL_TREE",
            data: {
                name: "Software Development",
                isCompleted: false,
                icon: { isEmoji: true, text: "💻" },
                logs: [],
                milestones: [],
                motivesToLearn: [],
                usefulResources: [],
            },
            isRoot: false,
            level: 1,
            nodeId: "fd319e5f2a05d486557056b7",
            parentId: "homepageRoot",
            treeId: "1354d83c2417b8e9c67d07e3",
            treeName: "Software Development",
            x: 304.56527537066404,
            y: 848.1938718800512,
        },
        {
            accentColor: { label: "Purple", color1: "#BF5AF2", color2: "#5A7BF2" },
            category: "SKILL",
            data: {
                name: "CI/CD",
                isCompleted: false,
                icon: { isEmoji: false, text: "" },
                logs: [],
                milestones: [],
                motivesToLearn: [],
                usefulResources: [],
            },
            isRoot: false,
            level: 2,
            nodeId: "a95b7f81ea4c043ea7856b54",
            parentId: "fd319e5f2a05d486557056b7",
            treeId: "1354d83c2417b8e9c67d07e3",
            treeName: "Software Development",
            x: 257.8553464469979,
            y: 1001.9277461550305,
        },
        {
            accentColor: { label: "Purple", color1: "#BF5AF2", color2: "#5A7BF2" },
            category: "SKILL",
            data: {
                name: "Architecture",
                isCompleted: false,
                icon: { isEmoji: false, text: "" },
                logs: [],
                milestones: [],
                motivesToLearn: [],
                usefulResources: [],
            },
            isRoot: false,
            level: 2,
            nodeId: "fb6b8df11a720444cca0153c",
            parentId: "fd319e5f2a05d486557056b7",
            treeId: "1354d83c2417b8e9c67d07e3",
            treeName: "Software Development",
            x: 206.05262340314692,
            y: 943.9913561857695,
        },
        {
            accentColor: { label: "Purple", color1: "#BF5AF2", color2: "#5A7BF2" },
            category: "SKILL",
            data: {
                name: "Backend",
                isCompleted: true,
                icon: { isEmoji: false, text: "" },
                logs: [],
                milestones: [],
                motivesToLearn: [],
                usefulResources: [],
            },
            isRoot: false,
            level: 2,
            nodeId: "fad79cb1a937497779f723df",
            parentId: "fd319e5f2a05d486557056b7",
            treeId: "1354d83c2417b8e9c67d07e3",
            treeName: "Software Development",
            x: 173.29855364378972,
            y: 873.5121484800849,
        },
        {
            accentColor: { label: "Purple", color1: "#BF5AF2", color2: "#5A7BF2" },
            category: "SKILL",
            data: {
                name: "Django",
                isCompleted: false,
                icon: { isEmoji: false, text: "" },
                logs: [],
                milestones: [],
                motivesToLearn: [],
                usefulResources: [],
            },
            isRoot: false,
            level: 3,
            nodeId: "05443d1b2cbe74ba7664c795",
            parentId: "fad79cb1a937497779f723df",
            treeId: "1354d83c2417b8e9c67d07e3",
            treeName: "Software Development",
            x: 59.21243753288468,
            y: 947.8881030228081,
        },
        {
            accentColor: { label: "Purple", color1: "#BF5AF2", color2: "#5A7BF2" },
            category: "SKILL",
            data: {
                name: "Express",
                isCompleted: true,
                icon: { isEmoji: false, text: "" },
                logs: [],
                milestones: [],
                motivesToLearn: [],
                usefulResources: [],
            },
            isRoot: false,
            level: 3,
            nodeId: "1d549a88cb6627deb45b8a8a",
            parentId: "fad79cb1a937497779f723df",
            treeId: "1354d83c2417b8e9c67d07e3",
            treeName: "Software Development",
            x: 37.109946709914595,
            y: 873.2157622074334,
        },
        {
            accentColor: { label: "Purple", color1: "#BF5AF2", color2: "#5A7BF2" },
            category: "SKILL",
            data: {
                name: "Front end",
                isCompleted: true,
                icon: { isEmoji: false, text: "" },
                logs: [],
                milestones: [],
                motivesToLearn: [],
                usefulResources: [],
            },
            isRoot: false,
            level: 2,
            nodeId: "5806e5049d213546344419b4",
            parentId: "fd319e5f2a05d486557056b7",
            treeId: "1354d83c2417b8e9c67d07e3",
            treeName: "Software Development",
            x: 163.86427314584807,
            y: 770.6106915946004,
        },
        {
            accentColor: { label: "Purple", color1: "#BF5AF2", color2: "#5A7BF2" },
            category: "SKILL",
            data: {
                name: "Mobile",
                isCompleted: false,
                icon: { isEmoji: false, text: "" },
                logs: [],
                milestones: [],
                motivesToLearn: [],
                usefulResources: [],
            },
            isRoot: false,
            level: 3,
            nodeId: "831a5aebd35eabc0cd5616e8",
            parentId: "5806e5049d213546344419b4",
            treeId: "1354d83c2417b8e9c67d07e3",
            treeName: "Software Development",
            x: 30,
            y: 795.6662474364877,
        },
        {
            accentColor: { label: "Purple", color1: "#BF5AF2", color2: "#5A7BF2" },
            category: "SKILL",
            data: {
                name: "Web",
                isCompleted: true,
                icon: { isEmoji: false, text: "" },
                logs: [],
                milestones: [],
                motivesToLearn: [],
                usefulResources: [],
            },
            isRoot: false,
            level: 3,
            nodeId: "2793fcba06edf9fc6b1a3edf",
            parentId: "5806e5049d213546344419b4",
            treeId: "1354d83c2417b8e9c67d07e3",
            treeName: "Software Development",
            x: 38.15582866554263,
            y: 718.219743046649,
        },
        {
            accentColor: { label: "Magenta", color1: "#FC385F", color2: "#BF5AF2" },
            category: "SKILL_TREE",
            data: {
                name: "English",
                isCompleted: false,
                icon: { isEmoji: false, text: "E" },
                logs: [],
                milestones: [],
                motivesToLearn: [],
                usefulResources: [],
            },
            isRoot: false,
            level: 1,
            nodeId: "bd406cf14bd863b1864ccdb8",
            parentId: "homepageRoot",
            treeId: "aaef7335bdc162ccc6af6bfb",
            treeName: "English",
            x: 417.39278521884023,
            y: 930.3968877300811,
        },
        {
            accentColor: { label: "Magenta", color1: "#FC385F", color2: "#BF5AF2" },
            category: "SKILL",
            data: {
                name: "Module 3",
                isCompleted: false,
                icon: { isEmoji: false, text: "" },
                logs: [],
                milestones: [],
                motivesToLearn: [],
                usefulResources: [],
            },
            isRoot: false,
            level: 2,
            nodeId: "aecfd9fc10ecd39c1ae2e272",
            parentId: "bd406cf14bd863b1864ccdb8",
            treeId: "aaef7335bdc162ccc6af6bfb",
            treeName: "English",
            x: 485.056318568626,
            y: 1056.79292660348,
        },
        {
            accentColor: { label: "Magenta", color1: "#FC385F", color2: "#BF5AF2" },
            category: "SKILL",
            data: {
                name: "Module 2",
                isCompleted: false,
                icon: { isEmoji: false, text: "" },
                logs: [],
                milestones: [],
                motivesToLearn: [],
                usefulResources: [],
            },
            isRoot: false,
            level: 2,
            nodeId: "279c071f1919b1976e1d24c1",
            parentId: "bd406cf14bd863b1864ccdb8",
            treeId: "aaef7335bdc162ccc6af6bfb",
            treeName: "English",
            x: 407.54387689583353,
            y: 1062.4470209916353,
        },
        {
            accentColor: { label: "Magenta", color1: "#FC385F", color2: "#BF5AF2" },
            category: "SKILL",
            data: {
                name: "Module 1",
                isCompleted: false,
                icon: { isEmoji: false, text: "" },
                logs: [],
                milestones: [],
                motivesToLearn: [],
                usefulResources: [],
            },
            isRoot: false,
            level: 2,
            nodeId: "eff75ac172710b14e2774b71",
            parentId: "bd406cf14bd863b1864ccdb8",
            treeId: "aaef7335bdc162ccc6af6bfb",
            treeName: "English",
            x: 331.72779795164297,
            y: 1045.3569779560994,
        },
        {
            accentColor: { label: "Green", color1: "#50D158", color2: "#1982F9" },
            category: "SKILL_TREE",
            data: {
                name: "Business",
                isCompleted: false,
                icon: { isEmoji: false, text: "B" },
                logs: [],
                milestones: [],
                motivesToLearn: [],
                usefulResources: [],
            },
            isRoot: false,
            level: 1,
            nodeId: "0d7f3a29e5982380fe821be9",
            parentId: "homepageRoot",
            treeId: "8382cabfb188faed5f3b6f7c",
            treeName: "Business",
            x: 499.31608271803157,
            y: 909.430151582718,
        },
        {
            accentColor: { label: "Green", color1: "#50D158", color2: "#1982F9" },
            category: "SKILL",
            data: {
                name: "$100 MRR",
                isCompleted: false,
                icon: { isEmoji: false, text: "" },
                logs: [],
                milestones: [],
                motivesToLearn: [],
                usefulResources: [],
            },
            isRoot: false,
            level: 2,
            nodeId: "40c693191212357f21874635",
            parentId: "0d7f3a29e5982380fe821be9",
            treeId: "8382cabfb188faed5f3b6f7c",
            treeName: "Business",
            x: 571.3904718942161,
            y: 1020.5135486969095,
        },
        {
            accentColor: { label: "Green", color1: "#50D158", color2: "#1982F9" },
            category: "SKILL",
            data: {
                name: "$500 MRR",
                isCompleted: false,
                icon: { isEmoji: false, text: "" },
                logs: [],
                milestones: [],
                motivesToLearn: [],
                usefulResources: [],
            },
            isRoot: false,
            level: 3,
            nodeId: "6edf69af6311e03c2f264200",
            parentId: "40c693191212357f21874635",
            treeId: "8382cabfb188faed5f3b6f7c",
            treeName: "Business",
            x: 643.4648610704007,
            y: 1131.596945811101,
        },
        {
            accentColor: { label: "Green", color1: "#50D158", color2: "#1982F9" },
            category: "SKILL",
            data: {
                name: "$1K MRR",
                isCompleted: false,
                icon: { isEmoji: false, text: "" },
                logs: [],
                milestones: [],
                motivesToLearn: [],
                usefulResources: [],
            },
            isRoot: false,
            level: 4,
            nodeId: "3126d6450fc15851a410a480",
            parentId: "6edf69af6311e03c2f264200",
            treeId: "8382cabfb188faed5f3b6f7c",
            treeName: "Business",
            x: 715.5392502465852,
            y: 1242.6803429252925,
        },
    ];

    const mockRootCoordinateInsideCanvas: NodeCoordinate = {
        accentColor: { label: "Orange", color1: "#FF9F23", color2: "#BF5AF2" },
        category: "USER",
        data: {
            name: "Life Skills",
            isCompleted: false,
            icon: { isEmoji: true, text: "😃" },
            logs: [],
            milestones: [],
            motivesToLearn: [],
            usefulResources: [],
        },
        isRoot: true,
        level: 0,
        nodeId: "homepageRoot",
        parentId: null,
        treeId: "HomepageTree",
        treeName: "Life Skills",
        x: 427.241693541847,
        y: 798.3467544685266,
    };

    const mockTreeData = {
        accentColor: { label: "Orange", color1: "#FF9F23", color2: "#BF5AF2" },
        icon: { isEmoji: true, text: "😃" },
        rootNodeId: "homepageRoot",
        treeId: "HomepageTree",
        treeName: "Life Skills",
    };
    const mockSubtreesData = {
        d5c56276e6f38a411b3aa61b: {
            accentColor: { label: "Blue", color1: "#1982F9", color2: "#BF5AF2" },
            icon: { isEmoji: true, text: "🧠" },
            nodes: [
                "48f11433ed140fc13567f129",
                "cb8fe500a04dee2fba294044",
                "13293a343e36df0635cc2f87",
                "3f62e8eb1295d6e1c437e0b3",
                "654843936120bdc75bdaa1a2",
            ],
            rootNodeId: "48f11433ed140fc13567f129",
            treeId: "d5c56276e6f38a411b3aa61b",
            treeName: "Education",
        },
        a13392a32a1e1cc3545332de: {
            accentColor: { label: "Yellow", color1: "#FED739", color2: "#FF9F23" },
            icon: { isEmoji: true, text: "🫀" },
            nodes: [
                "025f1eb582ede1f45d12a127",
                "1e1d26585627ddac483c18e3",
                "b17447fbe31b723bfc89a15d",
                "4e5eb964626fffaacf1b8332",
                "67bdf03728e90f4d8da2a6b7",
                "4be9947908715dbc0ceb3552",
            ],
            rootNodeId: "025f1eb582ede1f45d12a127",
            treeId: "a13392a32a1e1cc3545332de",
            treeName: "Sports",
        },
        dcfa6e82257214440370679f: {
            accentColor: { label: "Green", color1: "#50D158", color2: "#1982F9" },
            icon: { isEmoji: true, text: "🌲" },
            nodes: [
                "a03d92f7e92c08df3f5a4c53",
                "c40f31b98942977e1cb90b71",
                "dfad8a78a9420b3933f3a288",
                "398e2b01672aa4e33179330a",
                "9d1e5d458c396b8e3ba3a4ed",
                "6b8a7945c3892a43aeb31c0d",
                "4ba33132adecb6427043f98b",
                "1d78ca1a9df6ef3393c66220",
                "71af630fad5de8356a832a5d",
            ],
            rootNodeId: "a03d92f7e92c08df3f5a4c53",
            treeId: "dcfa6e82257214440370679f",
            treeName: "Skill Trees",
        },
        "1354d83c2417b8e9c67d07e3": {
            accentColor: { label: "Purple", color1: "#BF5AF2", color2: "#5A7BF2" },
            icon: { isEmoji: true, text: "💻" },
            nodes: [
                "fd319e5f2a05d486557056b7",
                "5806e5049d213546344419b4",
                "fad79cb1a937497779f723df",
                "fb6b8df11a720444cca0153c",
                "a95b7f81ea4c043ea7856b54",
                "2793fcba06edf9fc6b1a3edf",
                "831a5aebd35eabc0cd5616e8",
                "1d549a88cb6627deb45b8a8a",
                "05443d1b2cbe74ba7664c795",
            ],
            rootNodeId: "fd319e5f2a05d486557056b7",
            treeId: "1354d83c2417b8e9c67d07e3",
            treeName: "Software Development",
        },
        aaef7335bdc162ccc6af6bfb: {
            accentColor: { label: "Magenta", color1: "#FC385F", color2: "#BF5AF2" },
            icon: { isEmoji: false, text: "E" },
            nodes: ["bd406cf14bd863b1864ccdb8", "eff75ac172710b14e2774b71", "279c071f1919b1976e1d24c1", "aecfd9fc10ecd39c1ae2e272"],
            rootNodeId: "bd406cf14bd863b1864ccdb8",
            treeId: "aaef7335bdc162ccc6af6bfb",
            treeName: "English",
        },
        "8382cabfb188faed5f3b6f7c": {
            accentColor: { label: "Green", color1: "#50D158", color2: "#1982F9" },
            icon: { isEmoji: false, text: "B" },
            nodes: ["0d7f3a29e5982380fe821be9", "40c693191212357f21874635", "6edf69af6311e03c2f264200", "3126d6450fc15851a410a480"],
            rootNodeId: "0d7f3a29e5982380fe821be9",
            treeId: "8382cabfb188faed5f3b6f7c",
            treeName: "Business",
        },
    };

    const mockSvgDimensions = { height: 1272.6803429252925, width: 1119.3262555418469 };

    const treeCompletionTable = completedSkillTreeTable(mockCoordinatesInsideCanvas);

    const styles = StyleSheet.create({
        container: {
            width: width,
            height: height - TEXT_AND_BUTTON_HEIGHT,
            top: 0,
            position: "relative",
            overflow: "hidden",
        },
    });

    if (!fonts) return <></>;

    return (
        <View style={styles.container}>
            <View
                style={{
                    transform: [
                        { translateX: -mockRootCoordinateInsideCanvas.x + width / 2 },
                        { translateY: -mockRootCoordinateInsideCanvas.y + (height - TEXT_AND_BUTTON_HEIGHT) / 2 },
                    ],
                }}>
                <Svg width={mockSvgDimensions.width} height={mockSvgDimensions.height}>
                    <Defs>
                        <LinearGradient id="gray" x1="0%" x2="100%" y1="0%" y2="100%">
                            <Stop offset="0%" stopColor={"#515053"} stopOpacity={1} />
                            <Stop offset="100%" stopColor={"#2C2C2D"} stopOpacity={1} />
                        </LinearGradient>
                    </Defs>
                    <Defs>
                        <LinearGradient id={`${HOMEPAGE_TREE_ID}`} x1="0%" x2="100%" y1="0%" y2="100%">
                            <Stop offset="0%" stopColor={mockTreeData.accentColor.color1} stopOpacity={1} />
                            <Stop offset="100%" stopColor={mockTreeData.accentColor.color2} stopOpacity={1} />
                        </LinearGradient>
                    </Defs>

                    <DefineGradients subTreesData={mockSubtreesData} />

                    {mockCoordinatesInsideCanvas.map((node, idx) => {
                        const strokeDashoffset =
                            node.category === "SKILL_TREE"
                                ? 2 * Math.PI * CIRCLE_SIZE - (2 * Math.PI * CIRCLE_SIZE * treeCompletionTable[node.treeId]!.percentage) / 100
                                : undefined;

                        return (
                            <Fragment key={idx}>
                                {!node.isRoot && mockTreeData.treeId === HOMEPAGE_TREE_ID && (
                                    <RadialPath
                                        node={node}
                                        coordinatesInsideCanvas={mockCoordinatesInsideCanvas}
                                        rootNodeInsideCanvas={mockRootCoordinateInsideCanvas}
                                    />
                                )}
                                {!node.isRoot && mockTreeData.treeId !== HOMEPAGE_TREE_ID && (
                                    <HierarchicalPath node={node} coordinatesInsideCanvas={mockCoordinatesInsideCanvas} />
                                )}

                                <Path stroke={`url(#gray)`} strokeLinecap="round" strokeWidth={2} d={nodeToCircularPath(node)} />

                                <Path
                                    stroke={
                                        (node.category === "SKILL" && node.data.isCompleted) || node.category !== "SKILL"
                                            ? `url(#${node.treeId})`
                                            : undefined
                                    }
                                    strokeLinecap="round"
                                    strokeWidth={2}
                                    d={nodeToCircularPath(node)}
                                    strokeDasharray={node.category === "SKILL_TREE" ? 2 * Math.PI * CIRCLE_SIZE : undefined}
                                    strokeDashoffset={strokeDashoffset}
                                    fillOpacity={node.category === "USER" ? 1 : 0}
                                    fill={node.nodeId === HOMETREE_ROOT_ID ? `url(#${node.treeId})` : undefined}
                                />
                            </Fragment>
                        );
                    })}
                </Svg>
                {mockCoordinatesInsideCanvas.map((node) => {
                    const text = node.data.icon.isEmoji ? node.data.icon.text : node.data.name[0];
                    const font = node.data.icon.isEmoji ? fonts.emojiFont : fonts.nodeLetterFont;
                    const fontFamily = node.data.icon.isEmoji ? "emojisMono" : "helvetica";
                    const { x: textX, y: textY } = getTextCoordinates({ x: node.x, y: node.y }, getTextWidth(text, node.data.icon.isEmoji, font));

                    let color: string;

                    switch (node.category) {
                        case "SKILL":
                            color = "#515053";
                            break;
                        case "SKILL_TREE":
                            color = node.accentColor.color1;
                            break;
                        default:
                            color = getLabelTextColor(node.accentColor.color1);
                            break;
                    }

                    return (
                        <AppText
                            key={node.nodeId}
                            fontSize={NODE_ICON_FONT_SIZE}
                            children={text}
                            style={{ fontFamily, position: "absolute", left: textX, top: textY - 20, color, lineHeight: 30 }}
                        />
                    );
                })}
            </View>
        </View>
    );
};

export default WelcomeScreen;
