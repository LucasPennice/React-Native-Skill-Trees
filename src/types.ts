export type Book = {
    name: string;
    id: string;
};

export interface TreeNode<T> {
    node: T;
    children?: TreeNode<T>[];
    isRoot?: boolean;
}

export const treeMock: TreeNode<Book> = {
    isRoot: true,
    node: { id: `${Math.random() * 1000000}`, name: "Harry Potter 1" },
    children: [
        {
            node: { id: `${Math.random() * 1000000}`, name: "Harry Potter 2" },
            children: [
                {
                    node: { id: `${Math.random() * 1000000}`, name: "Harry Potter 3" },
                    children: [
                        { node: { id: `${Math.random() * 1000000}`, name: "Harry Potter 41" } },
                        { node: { id: `${Math.random() * 1000000}`, name: "Harry Potter 42" } },
                        { node: { id: `${Math.random() * 1000000}`, name: "Harry Potter 43" } },
                        { node: { id: `${Math.random() * 1000000}`, name: "Harry Potter 44" } },
                        { node: { id: `${Math.random() * 1000000}`, name: "Harry Potter 45" } },
                        {
                            node: { id: `${Math.random() * 1000000}`, name: "Harry Potter 46" },
                        },
                    ],
                },
            ],
        },
        {
            node: { id: `${Math.random() * 1000000}`, name: "Harry Potter 2.5" },
            children: [
                {
                    node: { id: `${Math.random() * 1000000}`, name: "Harry Potter 2.5 child" },
                },
            ],
        },
    ],
};
