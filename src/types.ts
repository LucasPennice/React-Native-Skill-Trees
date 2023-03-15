import { StyleProp, ViewStyle } from "react-native/types";

export type Book = {
    name: string;
    id: string;
};

export interface TreeNode<T> {
    node: T;
    children?: TreeNode<T>[];
    isRoot?: boolean;
    isCompleted?: boolean;
}

export const MENU_DAMPENING = { damping: 20, stiffness: 300 };

export const treeMock: TreeNode<Book> = {
    isRoot: true,
    node: { id: `Harry Potter 1`, name: "Harry Potter 1" },
    children: [
        {
            node: { id: `Harry Potter 2`, name: "Harry Potter 2" },
            children: [
                {
                    node: { id: `Harry Potter 3`, name: "Harry Potter 3" },
                    children: [
                        { node: { id: `Harry Potter 41`, name: "Harry Potter 41" } },
                        { node: { id: `Harry Potter 42`, name: "Harry Potter 42" } },
                        { node: { id: `Harry Potter 43`, name: "Harry Potter 43" } },
                    ],
                },
            ],
        },
        {
            node: { id: "Harry Potter 2.5", name: "Harry Potter 2.5" },
            children: [
                {
                    node: { id: "Harry Potter 2.5 child", name: "Harry Potter 2.5 child" },
                },
            ],
        },
    ],
};

export const mockSkillTreeArray: TreeNode<Book>[] = [
    {
        isRoot: true,
        node: { id: `Coding`, name: "Coding" },
        children: [
            {
                node: { id: `Management`, name: "Management" },
                children: [
                    {
                        node: { id: `Lead Gen`, name: "Lead Gen" },
                        children: [
                            {
                                node: { id: `Strategy`, name: "Strategy" },
                                children: [{ node: { id: "Cashflow Management", name: "Cashflow Management" } }],
                            },
                        ],
                    },
                ],
            },
            {
                node: { id: "English", name: "English" },
                children: [
                    {
                        node: {
                            id: "Public Speaking",
                            name: "Public Speaking",
                        },
                        children: [{ node: { name: "Sales", id: "Sales" }, children: [{ node: { id: "Leadership", name: "Leadership" } }] }],
                    },
                ],
            },
        ],
    },
    {
        isRoot: true,
        node: { id: `People Management`, name: "People Management" },
        children: [
            {
                node: { id: `Confidence`, name: "Confidence" },
            },
            {
                node: { id: "Energy Investments", name: "Energy Investments" },
                children: [
                    {
                        node: { id: `Copywriting`, name: "Copywriting" },
                    },
                ],
            },
        ],
    },
];

export const centerFlex: StyleProp<ViewStyle> = { display: "flex", justifyContent: "center", alignItems: "center" };
