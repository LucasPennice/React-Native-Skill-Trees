import { expect, test } from "@jest/globals";
import { invertTree } from "./general";

const toInvert = {
    data: "tree",
    children: [
        {
            data: "a",
            children: [
                { data: "1", children: [] },
                { data: "2", children: [] },
                { data: "3", children: [] },
            ],
        },
    ],
};
const expectedInverted = {
    data: "tree",
    children: [
        {
            data: "a",
            children: [
                { data: "3", children: [] },
                { data: "2", children: [] },
                { data: "1", children: [] },
            ],
        },
    ],
};

test("invertTree", () => {
    expect(invertTree<typeof toInvert>(toInvert)).toStrictEqual(expectedInverted);
});
