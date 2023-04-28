import { StyleProp, ViewStyle } from "react-native";

export const CIRCLE_SIZE = 15;
export const CIRCLE_SIZE_SELECTED = CIRCLE_SIZE * 3;

//Added range to detect a touch on a circle on every side
export const TOUCH_BUFFER = 15;

export const DISTANCE_BETWEEN_CHILDREN = 100;
export const DISTANCE_BETWEEN_GENERATIONS = 25 + 50 + 3 * CIRCLE_SIZE;

export const NAV_HEGIHT = 65;

export const CANVAS_SPRING = { damping: 29 };
export const MENU_DAMPENING = { damping: 20, stiffness: 300 };
export const MENU_HIGH_DAMPENING = { damping: 26, stiffness: 300 };

export const PARENT_DND_ZONE_DIMENTIONS = { width: 4 * CIRCLE_SIZE, height: 25 };
export const ONLY_CHILDREN_DND_ZONE_DIMENTIONS = { ...PARENT_DND_ZONE_DIMENTIONS, height: 50 };
export const BROTHER_DND_ZONE_HEIGHT = 3 * CIRCLE_SIZE;

export const CANVAS_HORIZONTAL_PADDING = 200;
export const CANVAS_VERTICAL_PADDING = 200;

export const colors = {
    background: "#000000",
    darkGray: "#181A1C",
    line: "#515053",
    unmarkedText: "#96959B",
    red: "#FE453A",
    accent: "#1982F9",
    yellow: "#FED739",
    orange: "#FF9F23",
    green: "#50D158",
    teal: "#40C8E0",
    blue: "#1982F9",
    purple: "#BF5AF2",
    pink: "#FC385F",
};

export const centerFlex: StyleProp<ViewStyle> = { display: "flex", justifyContent: "center", alignItems: "center" };

export const possibleTreeColors = ["#FE453A", "#FED739", "#FF9F23", "#50D158", "#40C8E0", "#1982F9", "#BF5AF2", "#FC385F"];

//@ts-ignore
export const bigasstree: any = {
    treeName: "sexo",
    accentColor: colors.teal,
    isRoot: true,
    treeId: "hhgtht",
    data: { id: "qwdqwd", name: "M", isCompleted: false },
    children: [
        {
            accentColor: "#FE453A",
            data: { id: "PwdDIQKgTd4thrrCIyAMvxba", name: "O", isCompleted: false },
            children: [
                {
                    data: { id: "GYgNwPsZUyZwSqqNGCifTu4j", name: "E", isCompleted: true },
                    parentId: "PwdDIQKgTd4thrrCIyAMvxba",
                    children: [
                        { data: { id: "b0t8rwWhXRKvhWSOg63xxnjd", name: "A", isCompleted: true }, parentId: "GYgNwPsZUyZwSqqNGCifTu4j", level: null },
                        {
                            data: { id: "HeqGZJeHMQk6Wy4DXJ5SkRCN", name: "D", isCompleted: true },
                            parentId: "GYgNwPsZUyZwSqqNGCifTu4j",
                            children: [
                                {
                                    data: { id: "WBNuDHHyBSZ5oFFy9fGaxPi2", name: "B", isCompleted: true },
                                    parentId: "HeqGZJeHMQk6Wy4DXJ5SkRCN",
                                    level: 4,
                                },
                                {
                                    data: { id: "nC7CICKKNVqllGO39FtILT5J", name: "C", isCompleted: true },
                                    parentId: "HeqGZJeHMQk6Wy4DXJ5SkRCN",
                                    level: 4,
                                },
                                {
                                    data: { name: "H", isCompleted: false, id: "LDzB2dTftEh5MIgNXXXwI7Yh" },
                                    parentId: "HeqGZJeHMQk6Wy4DXJ5SkRCN",
                                    x: null,
                                    level: 4,
                                },
                                {
                                    data: { name: "N", isCompleted: false, id: "UTOhW3HYarlRJDtpUJ9eXJ8r" },
                                    parentId: "HeqGZJeHMQk6Wy4DXJ5SkRCN",
                                    x: 100,
                                    level: 4,
                                },
                                {
                                    data: { name: "U", isCompleted: false, id: "ZMWWB7XbbFn0ulNFE9JWafPv" },
                                    parentId: "HeqGZJeHMQk6Wy4DXJ5SkRCN",
                                    x: 200,
                                    level: 4,
                                },
                                {
                                    data: { name: "J", isCompleted: false, id: "azKldOVLAD8rBAtbG4bs02ui" },
                                    parentId: "HeqGZJeHMQk6Wy4DXJ5SkRCN",
                                    x: 300,
                                    level: 4,
                                },
                                {
                                    data: { name: "Gg", isCompleted: false, id: "RkpvgNMvtsrEIHPE4D3fYhUe" },
                                    parentId: "HeqGZJeHMQk6Wy4DXJ5SkRCN",
                                    x: 400,
                                    level: 4,
                                },
                            ],
                            level: 3,
                        },
                    ],
                    level: 2,
                },
                {
                    data: { name: "V", isCompleted: true, id: "NFD4JLxMd49ZalvJy0hPInZs" },
                    parentId: "PwdDIQKgTd4thrrCIyAMvxba",
                    children: [
                        {
                            data: { id: "deVbVxx7zrtQ1LEGjIQvoC1c", name: "Ccc", isCompleted: true },
                            parentId: "NFD4JLxMd49ZalvJy0hPInZs",
                            isRoot: false,
                            children: [
                                {
                                    data: { name: "V", isCompleted: false, id: "qkuNawzGqb9XLcALmxMIh8Ko" },
                                    parentId: "deVbVxx7zrtQ1LEGjIQvoC1c",
                                    level: 1,
                                    y: null,
                                },
                            ],
                            level: null,
                        },
                        // {
                        //     data: { name: "Brain", isCompleted: true, id: "hdcnmNstaaoE2B67Y2PcFaXe" },
                        //     parentId: "NFD4JLxMd49ZalvJy0hPInZs",
                        //     children: [
                        //         {
                        //             data: { name: "J", isCompleted: false, id: "CCNSIlZJL30p7L0k4BvinuCU" },
                        //             parentId: "hdcnmNstaaoE2B67Y2PcFaXe",
                        //             level: 1,
                        //             y: null,
                        //         },
                        //     ],
                        //     level: null,
                        // },
                    ],
                    level: null,
                },
                {
                    data: { id: "YyzrFR5TdsMQWS1VqnTwoiBo", name: "Olis", isCompleted: true },
                    parentId: "PwdDIQKgTd4thrrCIyAMvxba",
                    children: [
                        {
                            data: { id: "mFSXLb8hkeQ1b1Ad8qmkQL2b", name: "M", isCompleted: true },
                            parentId: "YyzrFR5TdsMQWS1VqnTwoiBo",
                            children: [
                                {
                                    data: { id: "CcQEJSA9enqrO6IagnNJlVs7", name: "I", isCompleted: true },
                                    parentId: "mFSXLb8hkeQ1b1Ad8qmkQL2b",
                                    level: null,
                                },
                                {
                                    data: { name: "Peter", isCompleted: true, id: "FBhcwbiHwmKglqbrk9V2mv5r" },
                                    parentId: "mFSXLb8hkeQ1b1Ad8qmkQL2b",
                                    level: null,
                                },
                                {
                                    data: { id: "ylinc2QVj5NejYnkBHGQsqFS", name: "K", isCompleted: true },
                                    parentId: "mFSXLb8hkeQ1b1Ad8qmkQL2b",
                                    level: null,
                                },
                                {
                                    data: { id: "OUWea3GMfqGiq5a3D855MLZA", name: "L", isCompleted: true },
                                    parentId: "mFSXLb8hkeQ1b1Ad8qmkQL2b",
                                    level: null,
                                },
                            ],
                            level: null,
                        },
                    ],
                    level: null,
                },
                {
                    data: { id: "2fHFHxAJBuznIYcXnpuvdfzZ", name: "Vbn", isCompleted: true },
                    parentId: "PwdDIQKgTd4thrrCIyAMvxba",
                    children: [
                        { data: { id: "8NEyfvkhvO2okEtWbozmvqlT", name: "V", isCompleted: true }, parentId: "2fHFHxAJBuznIYcXnpuvdfzZ", level: null },
                        { data: { id: "Mh4sD4ZA3hITFlHVfI83CTAL", name: "J", isCompleted: true }, parentId: "2fHFHxAJBuznIYcXnpuvdfzZ", level: null },
                    ],
                    level: null,
                },
            ],
            level: 1,
            parentId: "lol",
        },
        {
            accentColor: "#FF9F23",
            isRoot: false,
            data: { id: "nNk1y7AMZy8HjCbw98MMgVkt", name: "Bzbsbx", isCompleted: true },
            children: [
                { data: { name: "Ncndnd", isCompleted: false, id: "3a4GYZiCbLOR6v2cWY3RKg1N" }, parentId: "nNk1y7AMZy8HjCbw98MMgVkt", level: null },
                {
                    data: { name: "Dhjdjd", isCompleted: false, id: "fhkZn7OxU5pZTYLF8WsxVkCd" },
                    parentId: "nNk1y7AMZy8HjCbw98MMgVkt",
                    children: [
                        {
                            data: { name: "Nsnsn", isCompleted: true, id: "6dY22wGk3UokVBvqo45DEiBq" },
                            parentId: "fhkZn7OxU5pZTYLF8WsxVkCd",
                            level: null,
                        },
                        {
                            data: { name: "Holas", isCompleted: true, id: "4zcot4mPH3OMv8s5RzGSannk" },
                            parentId: "fhkZn7OxU5pZTYLF8WsxVkCd",
                            level: null,
                        },
                    ],
                    level: null,
                },
                {
                    data: { name: "Jdjdjd", isCompleted: true, id: "x5tRfZNx7fLAc2HbZ5PTJBVF" },
                    parentId: "nNk1y7AMZy8HjCbw98MMgVkt",
                    children: [
                        { data: { name: "B", isCompleted: true, id: "CBL0qgf27FYBrYggcVMfwnBN" }, parentId: "x5tRfZNx7fLAc2HbZ5PTJBVF", level: null },
                        {
                            data: { name: "Pito", isCompleted: true, id: "ORCYD6S8Eih0yclJr1IcfNsx" },
                            parentId: "x5tRfZNx7fLAc2HbZ5PTJBVF",
                            level: null,
                        },
                        {
                            data: { name: "Fi", isCompleted: true, id: "WpyF5TIcn6wupYhwJLFYzOgU" },
                            parentId: "x5tRfZNx7fLAc2HbZ5PTJBVF",
                            level: null,
                        },
                    ],
                    level: null,
                },
                { data: { name: "Vv", isCompleted: false, id: "4ddET65BWpTd8qB1exjaymtU" }, parentId: "nNk1y7AMZy8HjCbw98MMgVkt", level: null },
                { data: { name: "Ncnd", isCompleted: false, id: "kVkt0JKVroMvTHRcM8PaMpfn" }, parentId: "nNk1y7AMZy8HjCbw98MMgVkt", level: null },
                {
                    data: { name: "Hdrjjd", isCompleted: true, id: "bhy5jcvJyHFND2z0o8Dl1xvf" },
                    parentId: "nNk1y7AMZy8HjCbw98MMgVkt",
                    children: [
                        {
                            data: { name: "Balls", isCompleted: true, id: "GzvQEVcu2nu5oq1cWhwCGLmz" },
                            parentId: "bhy5jcvJyHFND2z0o8Dl1xvf",
                            level: null,
                        },
                        {
                            data: { name: "Bsnsn", isCompleted: true, id: "zwWxd1NiGV6gg6XI0ycri9Js" },
                            parentId: "bhy5jcvJyHFND2z0o8Dl1xvf",
                            level: null,
                        },
                    ],
                    level: null,
                },
            ],
            level: 1,
            parentId: "lol",
        },
        // {
        //     accentColor: "#FF9F23",
        //     isRoot: false,
        //     data: { id: "zMbvcaRaNGmy2sh30uaXeYdO", name: "Bolas", isCompleted: true },
        //     children: [
        //         {
        //             data: { name: "Bbb", isCompleted: false, id: "cfnau2QhgLi8eB3efu4bQgFm" },
        //             parentId: "zMbvcaRaNGmy2sh30uaXeYdO",
        //             children: [
        //                 {
        //                     data: { name: "Mmmm", isCompleted: false, id: "gYgseEk3sVeEm1bmXuPCPBpN" },
        //                     parentId: "cfnau2QhgLi8eB3efu4bQgFm",
        //                     children: [
        //                         {
        //                             data: { name: "Ccc", isCompleted: false, id: "x3tN42aEy9nzthm4Ze78bHqy" },
        //                             parentId: "gYgseEk3sVeEm1bmXuPCPBpN",
        //                             level: null,
        //                         },
        //                         {
        //                             data: { name: "Vvv", isCompleted: true, id: "xAleshtfs7cM8LcVttB9x5Oc" },
        //                             parentId: "gYgseEk3sVeEm1bmXuPCPBpN",
        //                             level: null,
        //                         },
        //                     ],
        //                     level: null,
        //                 },
        //                 {
        //                     data: { name: "Mmm", isCompleted: true, id: "lv7ol4SlPMBDmb1lqOIGegI8" },
        //                     parentId: "cfnau2QhgLi8eB3efu4bQgFm",
        //                     children: [
        //                         {
        //                             data: { name: "Vvv", isCompleted: true, id: "PwCwSvW8GpOLRAKDMCUHAN2k" },
        //                             parentId: "lv7ol4SlPMBDmb1lqOIGegI8",
        //                             level: null,
        //                         },
        //                         {
        //                             data: { name: "V", isCompleted: false, id: "Sue356z8SjavH6FXgkrrAY96" },
        //                             parentId: "lv7ol4SlPMBDmb1lqOIGegI8",
        //                             level: null,
        //                         },
        //                     ],
        //                     level: null,
        //                 },
        //                 {
        //                     data: { name: "Mnxf", isCompleted: true, id: "sN1AEsV3qJTsG4QlYwGZ9qa8" },
        //                     parentId: "cfnau2QhgLi8eB3efu4bQgFm",
        //                     children: [
        //                         {
        //                             data: { name: "Bbvv", isCompleted: true, id: "KZ18vJBcT1grc54fXkIi9iCQ" },
        //                             parentId: "sN1AEsV3qJTsG4QlYwGZ9qa8",
        //                             level: null,
        //                         },
        //                         {
        //                             data: { name: "Vvv", isCompleted: true, id: "lfmOfDdctsjiEfBOQGMxjfCZ" },
        //                             parentId: "sN1AEsV3qJTsG4QlYwGZ9qa8",
        //                             level: null,
        //                         },
        //                     ],
        //                     level: null,
        //                 },
        //                 {
        //                     data: { name: "Hhhh", isCompleted: false, id: "jPBj91Txw0ZHpYjRQbYWV0kS" },
        //                     parentId: "cfnau2QhgLi8eB3efu4bQgFm",
        //                     level: null,
        //                 },
        //             ],
        //             level: null,
        //         },
        //     ],
        //     level: 1,
        //     parentId: "lol",
        // },
        // {
        //     accentColor: "#FF9F23",
        //     isRoot: false,
        //     data: { id: "qDMlrSy7XjFtBtg7cMcKGxgU", name: "V", isCompleted: false },
        //     children: [
        //         { data: { name: "B", isCompleted: false, id: "zS4fesTbzlAVxF4QnNJQ14Ot" }, parentId: "qDMlrSy7XjFtBtg7cMcKGxgU", level: null },
        //         {
        //             data: { name: "S", isCompleted: false, id: "Bqc5bw83BN6kEPNx7moTAAp2" },
        //             parentId: "qDMlrSy7XjFtBtg7cMcKGxgU",
        //             children: [
        //                 {
        //                     data: { name: "S", isCompleted: false, id: "OMLfIcT8vWaFeaemAzyItaVX" },
        //                     parentId: "Bqc5bw83BN6kEPNx7moTAAp2",
        //                     children: [
        //                         {
        //                             data: { name: "N", isCompleted: false, id: "5yxVZBPFDWbD4koKCF2F1pt6" },
        //                             parentId: "OMLfIcT8vWaFeaemAzyItaVX",
        //                             children: [
        //                                 {
        //                                     data: { name: "M", isCompleted: true, id: "fANy87CA3ekYDP6vB3zJ0fxw" },
        //                                     parentId: "5yxVZBPFDWbD4koKCF2F1pt6",
        //                                     level: null,
        //                                 },
        //                             ],
        //                             level: null,
        //                         },
        //                         {
        //                             data: { name: "K", isCompleted: false, id: "wMrtmYv6fZ5fwKWvBUYQSkjM" },
        //                             parentId: "OMLfIcT8vWaFeaemAzyItaVX",
        //                             children: [
        //                                 {
        //                                     data: { name: "B", isCompleted: true, id: "nqTxqixG7lWykOBWZmHqD2TR" },
        //                                     parentId: "wMrtmYv6fZ5fwKWvBUYQSkjM",
        //                                     level: null,
        //                                 },
        //                                 {
        //                                     data: { name: "H", isCompleted: true, id: "xzji1gGlLlufkVtmxlmIUCpg" },
        //                                     parentId: "wMrtmYv6fZ5fwKWvBUYQSkjM",
        //                                     level: null,
        //                                 },
        //                             ],
        //                             level: null,
        //                         },
        //                     ],
        //                     level: null,
        //                 },
        //             ],
        //             level: null,
        //         },
        //         { data: { name: "H", isCompleted: false, id: "E2ILKn6kiATwoetLJKAOLpv3" }, parentId: "qDMlrSy7XjFtBtg7cMcKGxgU", level: null },
        //     ],
        //     level: 1,
        //     parentId: "lol",
        // },
        {
            accentColor: "#40C8E0",
            isRoot: false,
            level: 1,
            data: { id: "oSzZmMqQzzsJJ2lwyl1mYUsI", name: "Holis", isCompleted: true },
            children: [
                {
                    data: { name: "Martin tryas", isCompleted: false, id: "IP0omeREl8MlJKv6YDPK6kMk" },
                    parentId: "oSzZmMqQzzsJJ2lwyl1mYUsI",
                    level: 2,
                    x: 0,
                    y: 120,
                },
                {
                    data: { name: "Yygy hhjh", isCompleted: false, id: "akpugemPWpWdtfFjL801yTu8" },
                    parentId: "oSzZmMqQzzsJJ2lwyl1mYUsI",
                    level: 2,
                    x: 100,
                    y: 120,
                },
            ],
            parentId: "lol",
        },
    ],
};
