import { test, expect } from "@jest/globals";
import { minifyDragAndDropZones } from "./coordinateFunctions";
import { DnDZone, NodeCoordinate } from "../../types";

test("minifyDragAndDropZones1", () => {
    const arg1: DnDZone[] = [
        { x: 245, y: 541, height: 37.5, width: 60, type: "PARENT", ofNode: "zha0d2DFn5hG7teJN1iTNddC" },
        { x: 225, y: 578.5, height: 45, width: 50, type: "LEFT_BROTHER", ofNode: "zha0d2DFn5hG7teJN1iTNddC" },
        { x: 275, y: 578.5, height: 45, width: 50, type: "RIGHT_BROTHER", ofNode: "zha0d2DFn5hG7teJN1iTNddC" },
        { height: 37.5, width: 60, x: 245, y: 623.5, type: "CHILDREN", ofNode: "zha0d2DFn5hG7teJN1iTNddC" },
        { x: 345, y: 541, height: 37.5, width: 60, type: "PARENT", ofNode: "dbzv4izY0uNlPNTActXtJtjK" },
        { x: 325, y: 578.5, height: 45, width: 50, type: "LEFT_BROTHER", ofNode: "dbzv4izY0uNlPNTActXtJtjK" },
        { x: 375, y: 578.5, height: 45, width: 50, type: "RIGHT_BROTHER", ofNode: "dbzv4izY0uNlPNTActXtJtjK" },
        { height: 37.5, width: 60, x: 345, y: 623.5, type: "CHILDREN", ofNode: "dbzv4izY0uNlPNTActXtJtjK" },
        { x: 445, y: 541, height: 37.5, width: 60, type: "PARENT", ofNode: "3bRB2n8Ov2duo9lrPL1yL0ml" },
        { x: 425, y: 578.5, height: 45, width: 50, type: "LEFT_BROTHER", ofNode: "3bRB2n8Ov2duo9lrPL1yL0ml" },
        { x: 475, y: 578.5, height: 45, width: 50, type: "RIGHT_BROTHER", ofNode: "3bRB2n8Ov2duo9lrPL1yL0ml" },
        { height: 37.5, width: 60, x: 445, y: 623.5, type: "CHILDREN", ofNode: "3bRB2n8Ov2duo9lrPL1yL0ml" },
        { x: 345, y: 421, height: 37.5, width: 60, type: "PARENT", ofNode: "uupBzkzwRl2y3dT7MtO5Qp7A" },
        { x: 325, y: 458.5, height: 45, width: 50, type: "LEFT_BROTHER", ofNode: "uupBzkzwRl2y3dT7MtO5Qp7A" },
        { x: 375, y: 458.5, height: 45, width: 50, type: "RIGHT_BROTHER", ofNode: "uupBzkzwRl2y3dT7MtO5Qp7A" },
        { height: 37.5, width: 60, x: 345, y: 503.5, type: "CHILDREN", ofNode: "uupBzkzwRl2y3dT7MtO5Qp7A" },
        { height: 37.5, width: 60, x: 345, y: 383.5, type: "CHILDREN", ofNode: "nONDkdGOmaXO90OAEGIW1AJl" },
    ];

    const arg2: NodeCoordinate[] = [
        { id: "zha0d2DFn5hG7teJN1iTNddC", level: 2, parentId: "uupBzkzwRl2y3dT7MtO5Qp7A", x: 275, y: 601 },
        { id: "dbzv4izY0uNlPNTActXtJtjK", level: 2, parentId: "uupBzkzwRl2y3dT7MtO5Qp7A", x: 375, y: 601 },
        { id: "3bRB2n8Ov2duo9lrPL1yL0ml", level: 2, parentId: "uupBzkzwRl2y3dT7MtO5Qp7A", x: 475, y: 601 },
        { id: "uupBzkzwRl2y3dT7MtO5Qp7A", level: 1, parentId: "nONDkdGOmaXO90OAEGIW1AJl", x: 375, y: 481 },
        { id: "nONDkdGOmaXO90OAEGIW1AJl", level: 0, parentId: null, x: 375, y: 361 },
    ];

    const toExpect = [
        { x: 245, y: 541, height: 37.5, width: 60, type: "PARENT", ofNode: "zha0d2DFn5hG7teJN1iTNddC" },
        { x: 225, y: 578.5, height: 45, width: 50, type: "LEFT_BROTHER", ofNode: "zha0d2DFn5hG7teJN1iTNddC" },
        { height: 45, ofNode: "zha0d2DFn5hG7teJN1iTNddC", type: "RIGHT_BROTHER", x: 275, y: 578.5, width: 100 },
        { height: 37.5, width: 60, x: 245, y: 623.5, type: "CHILDREN", ofNode: "zha0d2DFn5hG7teJN1iTNddC" },
        { x: 345, y: 541, height: 37.5, width: 60, type: "PARENT", ofNode: "dbzv4izY0uNlPNTActXtJtjK" },
        { height: 45, ofNode: "dbzv4izY0uNlPNTActXtJtjK", type: "RIGHT_BROTHER", x: 375, y: 578.5, width: 100 },
        { height: 37.5, width: 60, x: 345, y: 623.5, type: "CHILDREN", ofNode: "dbzv4izY0uNlPNTActXtJtjK" },
        { x: 445, y: 541, height: 37.5, width: 60, type: "PARENT", ofNode: "3bRB2n8Ov2duo9lrPL1yL0ml" },
        { x: 475, y: 578.5, height: 45, width: 50, type: "RIGHT_BROTHER", ofNode: "3bRB2n8Ov2duo9lrPL1yL0ml" },
        { height: 37.5, width: 60, x: 445, y: 623.5, type: "CHILDREN", ofNode: "3bRB2n8Ov2duo9lrPL1yL0ml" },
        { width: 60, ofNode: "uupBzkzwRl2y3dT7MtO5Qp7A", type: "PARENT", x: 345, y: 383.5, height: 75 },
        { x: 325, y: 458.5, height: 45, width: 50, type: "LEFT_BROTHER", ofNode: "uupBzkzwRl2y3dT7MtO5Qp7A" },
        { x: 375, y: 458.5, height: 45, width: 50, type: "RIGHT_BROTHER", ofNode: "uupBzkzwRl2y3dT7MtO5Qp7A" },
        { height: 37.5, width: 60, x: 345, y: 503.5, type: "CHILDREN", ofNode: "uupBzkzwRl2y3dT7MtO5Qp7A" },
    ];

    expect(minifyDragAndDropZones(arg1, arg2)).toStrictEqual(toExpect);
});

test("minifyDragAndDropZonesEmptyTree", () => {
    const arg1: DnDZone[] = [{ height: 37.5, width: 60, x: 345, y: 503.5, type: "CHILDREN", ofNode: "qNwFCjmGxS0EaijoNOONEKLd" }];

    const arg2: NodeCoordinate[] = [{ id: "qNwFCjmGxS0EaijoNOONEKLd", level: 0, parentId: null, x: 375, y: 481 }];

    const toExpect = [{ height: 37.5, width: 60, x: 345, y: 503.5, type: "CHILDREN", ofNode: "qNwFCjmGxS0EaijoNOONEKLd" }];

    expect(minifyDragAndDropZones(arg1, arg2)).toStrictEqual(toExpect);
});

test("minifyDragAndDropZonesBigTree", () => {
    const arg1: DnDZone[] = [
        { x: 157.5, y: 481, height: 37.5, width: 60, type: "PARENT", ofNode: "zha0d2DFn5hG7teJN1iTNddC" },
        { x: 137.5, y: 518.5, height: 45, width: 50, type: "LEFT_BROTHER", ofNode: "zha0d2DFn5hG7teJN1iTNddC" },
        { x: 187.5, y: 518.5, height: 45, width: 50, type: "RIGHT_BROTHER", ofNode: "zha0d2DFn5hG7teJN1iTNddC" },
        { height: 37.5, width: 60, x: 157.5, y: 563.5, type: "CHILDREN", ofNode: "zha0d2DFn5hG7teJN1iTNddC" },
        { x: 207.5, y: 601, height: 37.5, width: 60, type: "PARENT", ofNode: "vufrR1SUTJQCrw6SczP7n0Yy" },
        { x: 187.5, y: 638.5, height: 45, width: 50, type: "LEFT_BROTHER", ofNode: "vufrR1SUTJQCrw6SczP7n0Yy" },
        { x: 237.5, y: 638.5, height: 45, width: 50, type: "RIGHT_BROTHER", ofNode: "vufrR1SUTJQCrw6SczP7n0Yy" },
        { height: 37.5, width: 60, x: 207.5, y: 683.5, type: "CHILDREN", ofNode: "vufrR1SUTJQCrw6SczP7n0Yy" },
        { x: 307.5, y: 601, height: 37.5, width: 60, type: "PARENT", ofNode: "brX2rMv4OEudGpfWp57jtPpb" },
        { x: 287.5, y: 638.5, height: 45, width: 50, type: "LEFT_BROTHER", ofNode: "brX2rMv4OEudGpfWp57jtPpb" },
        { x: 337.5, y: 638.5, height: 45, width: 50, type: "RIGHT_BROTHER", ofNode: "brX2rMv4OEudGpfWp57jtPpb" },
        { height: 37.5, width: 60, x: 307.5, y: 683.5, type: "CHILDREN", ofNode: "brX2rMv4OEudGpfWp57jtPpb" },
        { x: 257.5, y: 481, height: 37.5, width: 60, type: "PARENT", ofNode: "OJavMoLMKDnzGf7trvdoJNNM" },
        { x: 237.5, y: 518.5, height: 45, width: 50, type: "LEFT_BROTHER", ofNode: "OJavMoLMKDnzGf7trvdoJNNM" },
        { x: 287.5, y: 518.5, height: 45, width: 50, type: "RIGHT_BROTHER", ofNode: "OJavMoLMKDnzGf7trvdoJNNM" },
        { height: 37.5, width: 60, x: 257.5, y: 563.5, type: "CHILDREN", ofNode: "OJavMoLMKDnzGf7trvdoJNNM" },
        { x: 357.5, y: 481, height: 37.5, width: 60, type: "PARENT", ofNode: "Ax0tNs0OhO7UjTXVjyHoRnHI" },
        { x: 337.5, y: 518.5, height: 45, width: 50, type: "LEFT_BROTHER", ofNode: "Ax0tNs0OhO7UjTXVjyHoRnHI" },
        { x: 387.5, y: 518.5, height: 45, width: 50, type: "RIGHT_BROTHER", ofNode: "Ax0tNs0OhO7UjTXVjyHoRnHI" },
        { height: 37.5, width: 60, x: 357.5, y: 563.5, type: "CHILDREN", ofNode: "Ax0tNs0OhO7UjTXVjyHoRnHI" },
        { x: 457.5, y: 481, height: 37.5, width: 60, type: "PARENT", ofNode: "HgwdMIRLq0GYOvkH0HfI3uPC" },
        { x: 437.5, y: 518.5, height: 45, width: 50, type: "LEFT_BROTHER", ofNode: "HgwdMIRLq0GYOvkH0HfI3uPC" },
        { x: 487.5, y: 518.5, height: 45, width: 50, type: "RIGHT_BROTHER", ofNode: "HgwdMIRLq0GYOvkH0HfI3uPC" },
        { height: 37.5, width: 60, x: 457.5, y: 563.5, type: "CHILDREN", ofNode: "HgwdMIRLq0GYOvkH0HfI3uPC" },
        { x: 557.5, y: 481, height: 37.5, width: 60, type: "PARENT", ofNode: "fhKCPngB36DZXe6ZRxRJ13Dn" },
        { x: 537.5, y: 518.5, height: 45, width: 50, type: "LEFT_BROTHER", ofNode: "fhKCPngB36DZXe6ZRxRJ13Dn" },
        { x: 587.5, y: 518.5, height: 45, width: 50, type: "RIGHT_BROTHER", ofNode: "fhKCPngB36DZXe6ZRxRJ13Dn" },
        { height: 37.5, width: 60, x: 557.5, y: 563.5, type: "CHILDREN", ofNode: "fhKCPngB36DZXe6ZRxRJ13Dn" },
        { x: 657.5, y: 481, height: 37.5, width: 60, type: "PARENT", ofNode: "dbzv4izY0uNlPNTActXtJtjK" },
        { x: 637.5, y: 518.5, height: 45, width: 50, type: "LEFT_BROTHER", ofNode: "dbzv4izY0uNlPNTActXtJtjK" },
        { x: 687.5, y: 518.5, height: 45, width: 50, type: "RIGHT_BROTHER", ofNode: "dbzv4izY0uNlPNTActXtJtjK" },
        { height: 37.5, width: 60, x: 657.5, y: 563.5, type: "CHILDREN", ofNode: "dbzv4izY0uNlPNTActXtJtjK" },
        { x: 757.5, y: 481, height: 37.5, width: 60, type: "PARENT", ofNode: "3bRB2n8Ov2duo9lrPL1yL0ml" },
        { x: 737.5, y: 518.5, height: 45, width: 50, type: "LEFT_BROTHER", ofNode: "3bRB2n8Ov2duo9lrPL1yL0ml" },
        { x: 787.5, y: 518.5, height: 45, width: 50, type: "RIGHT_BROTHER", ofNode: "3bRB2n8Ov2duo9lrPL1yL0ml" },
        { height: 37.5, width: 60, x: 757.5, y: 563.5, type: "CHILDREN", ofNode: "3bRB2n8Ov2duo9lrPL1yL0ml" },
        { x: 457.5, y: 361, height: 37.5, width: 60, type: "PARENT", ofNode: "uupBzkzwRl2y3dT7MtO5Qp7A" },
        { x: 437.5, y: 398.5, height: 45, width: 50, type: "LEFT_BROTHER", ofNode: "uupBzkzwRl2y3dT7MtO5Qp7A" },
        { x: 487.5, y: 398.5, height: 45, width: 50, type: "RIGHT_BROTHER", ofNode: "uupBzkzwRl2y3dT7MtO5Qp7A" },
        { height: 37.5, width: 60, x: 457.5, y: 443.5, type: "CHILDREN", ofNode: "uupBzkzwRl2y3dT7MtO5Qp7A" },
        { x: 557.5, y: 361, height: 37.5, width: 60, type: "PARENT", ofNode: "wHZaWvPpiOA9Pddd0Qk67qW1" },
        { x: 537.5, y: 398.5, height: 45, width: 50, type: "LEFT_BROTHER", ofNode: "wHZaWvPpiOA9Pddd0Qk67qW1" },
        { x: 587.5, y: 398.5, height: 45, width: 50, type: "RIGHT_BROTHER", ofNode: "wHZaWvPpiOA9Pddd0Qk67qW1" },
        { height: 37.5, width: 60, x: 557.5, y: 443.5, type: "CHILDREN", ofNode: "wHZaWvPpiOA9Pddd0Qk67qW1" },
        { height: 37.5, width: 60, x: 507.5, y: 323.5, type: "CHILDREN", ofNode: "nONDkdGOmaXO90OAEGIW1AJl" },
    ];

    const arg2: NodeCoordinate[] = [
        { id: "zha0d2DFn5hG7teJN1iTNddC", level: 2, parentId: "uupBzkzwRl2y3dT7MtO5Qp7A", x: 187.5, y: 541 },
        { id: "vufrR1SUTJQCrw6SczP7n0Yy", level: 3, parentId: "OJavMoLMKDnzGf7trvdoJNNM", x: 237.5, y: 661 },
        { id: "brX2rMv4OEudGpfWp57jtPpb", level: 3, parentId: "OJavMoLMKDnzGf7trvdoJNNM", x: 337.5, y: 661 },
        { id: "OJavMoLMKDnzGf7trvdoJNNM", level: 2, parentId: "uupBzkzwRl2y3dT7MtO5Qp7A", x: 287.5, y: 541 },
        { id: "Ax0tNs0OhO7UjTXVjyHoRnHI", level: 2, parentId: "uupBzkzwRl2y3dT7MtO5Qp7A", x: 387.5, y: 541 },
        { id: "HgwdMIRLq0GYOvkH0HfI3uPC", level: 2, parentId: "uupBzkzwRl2y3dT7MtO5Qp7A", x: 487.5, y: 541 },
        { id: "fhKCPngB36DZXe6ZRxRJ13Dn", level: 2, parentId: "uupBzkzwRl2y3dT7MtO5Qp7A", x: 587.5, y: 541 },
        { id: "dbzv4izY0uNlPNTActXtJtjK", level: 2, parentId: "uupBzkzwRl2y3dT7MtO5Qp7A", x: 687.5, y: 541 },
        { id: "3bRB2n8Ov2duo9lrPL1yL0ml", level: 2, parentId: "uupBzkzwRl2y3dT7MtO5Qp7A", x: 787.5, y: 541 },
        { id: "uupBzkzwRl2y3dT7MtO5Qp7A", level: 1, parentId: "nONDkdGOmaXO90OAEGIW1AJl", x: 487.5, y: 421 },
        { id: "wHZaWvPpiOA9Pddd0Qk67qW1", level: 1, parentId: "nONDkdGOmaXO90OAEGIW1AJl", x: 587.5, y: 421 },
        { id: "nONDkdGOmaXO90OAEGIW1AJl", level: 0, parentId: null, x: 537.5, y: 301 },
    ];

    const toExpect = [
        { x: 157.5, y: 481, height: 37.5, width: 60, type: "PARENT", ofNode: "zha0d2DFn5hG7teJN1iTNddC" },
        { x: 137.5, y: 518.5, height: 45, width: 50, type: "LEFT_BROTHER", ofNode: "zha0d2DFn5hG7teJN1iTNddC" },
        { height: 45, ofNode: "zha0d2DFn5hG7teJN1iTNddC", type: "RIGHT_BROTHER", x: 187.5, y: 518.5, width: 100 },
        { height: 37.5, width: 60, x: 157.5, y: 563.5, type: "CHILDREN", ofNode: "zha0d2DFn5hG7teJN1iTNddC" },
        { x: 207.5, y: 601, height: 37.5, width: 60, type: "PARENT", ofNode: "vufrR1SUTJQCrw6SczP7n0Yy" },
        { x: 187.5, y: 638.5, height: 45, width: 50, type: "LEFT_BROTHER", ofNode: "vufrR1SUTJQCrw6SczP7n0Yy" },
        { height: 45, ofNode: "vufrR1SUTJQCrw6SczP7n0Yy", type: "RIGHT_BROTHER", x: 237.5, y: 638.5, width: 100 },
        { height: 37.5, width: 60, x: 207.5, y: 683.5, type: "CHILDREN", ofNode: "vufrR1SUTJQCrw6SczP7n0Yy" },
        { x: 307.5, y: 601, height: 37.5, width: 60, type: "PARENT", ofNode: "brX2rMv4OEudGpfWp57jtPpb" },
        { x: 337.5, y: 638.5, height: 45, width: 50, type: "RIGHT_BROTHER", ofNode: "brX2rMv4OEudGpfWp57jtPpb" },
        { height: 37.5, width: 60, x: 307.5, y: 683.5, type: "CHILDREN", ofNode: "brX2rMv4OEudGpfWp57jtPpb" },
        { x: 257.5, y: 481, height: 37.5, width: 60, type: "PARENT", ofNode: "OJavMoLMKDnzGf7trvdoJNNM" },
        { height: 45, ofNode: "OJavMoLMKDnzGf7trvdoJNNM", type: "RIGHT_BROTHER", x: 287.5, y: 518.5, width: 100 },
        { height: 37.5, width: 60, x: 257.5, y: 563.5, type: "CHILDREN", ofNode: "OJavMoLMKDnzGf7trvdoJNNM" },
        { x: 357.5, y: 481, height: 37.5, width: 60, type: "PARENT", ofNode: "Ax0tNs0OhO7UjTXVjyHoRnHI" },
        { height: 45, ofNode: "Ax0tNs0OhO7UjTXVjyHoRnHI", type: "RIGHT_BROTHER", x: 387.5, y: 518.5, width: 100 },
        { height: 37.5, width: 60, x: 357.5, y: 563.5, type: "CHILDREN", ofNode: "Ax0tNs0OhO7UjTXVjyHoRnHI" },
        { x: 457.5, y: 481, height: 37.5, width: 60, type: "PARENT", ofNode: "HgwdMIRLq0GYOvkH0HfI3uPC" },
        { height: 45, ofNode: "HgwdMIRLq0GYOvkH0HfI3uPC", type: "RIGHT_BROTHER", x: 487.5, y: 518.5, width: 100 },
        { height: 37.5, width: 60, x: 457.5, y: 563.5, type: "CHILDREN", ofNode: "HgwdMIRLq0GYOvkH0HfI3uPC" },
        { x: 557.5, y: 481, height: 37.5, width: 60, type: "PARENT", ofNode: "fhKCPngB36DZXe6ZRxRJ13Dn" },
        { height: 45, ofNode: "fhKCPngB36DZXe6ZRxRJ13Dn", type: "RIGHT_BROTHER", x: 587.5, y: 518.5, width: 100 },
        { height: 37.5, width: 60, x: 557.5, y: 563.5, type: "CHILDREN", ofNode: "fhKCPngB36DZXe6ZRxRJ13Dn" },
        { x: 657.5, y: 481, height: 37.5, width: 60, type: "PARENT", ofNode: "dbzv4izY0uNlPNTActXtJtjK" },
        { height: 45, ofNode: "dbzv4izY0uNlPNTActXtJtjK", type: "RIGHT_BROTHER", x: 687.5, y: 518.5, width: 100 },
        { height: 37.5, width: 60, x: 657.5, y: 563.5, type: "CHILDREN", ofNode: "dbzv4izY0uNlPNTActXtJtjK" },
        { x: 757.5, y: 481, height: 37.5, width: 60, type: "PARENT", ofNode: "3bRB2n8Ov2duo9lrPL1yL0ml" },
        { x: 787.5, y: 518.5, height: 45, width: 50, type: "RIGHT_BROTHER", ofNode: "3bRB2n8Ov2duo9lrPL1yL0ml" },
        { height: 37.5, width: 60, x: 757.5, y: 563.5, type: "CHILDREN", ofNode: "3bRB2n8Ov2duo9lrPL1yL0ml" },
        { x: 457.5, y: 361, height: 37.5, width: 60, type: "PARENT", ofNode: "uupBzkzwRl2y3dT7MtO5Qp7A" },
        { x: 437.5, y: 398.5, height: 45, width: 50, type: "LEFT_BROTHER", ofNode: "uupBzkzwRl2y3dT7MtO5Qp7A" },
        { height: 45, ofNode: "uupBzkzwRl2y3dT7MtO5Qp7A", type: "RIGHT_BROTHER", x: 487.5, y: 398.5, width: 100 },
        { height: 37.5, width: 60, x: 457.5, y: 443.5, type: "CHILDREN", ofNode: "uupBzkzwRl2y3dT7MtO5Qp7A" },
        { x: 557.5, y: 361, height: 37.5, width: 60, type: "PARENT", ofNode: "wHZaWvPpiOA9Pddd0Qk67qW1" },
        { x: 587.5, y: 398.5, height: 45, width: 50, type: "RIGHT_BROTHER", ofNode: "wHZaWvPpiOA9Pddd0Qk67qW1" },
        { height: 37.5, width: 60, x: 557.5, y: 443.5, type: "CHILDREN", ofNode: "wHZaWvPpiOA9Pddd0Qk67qW1" },
        { height: 37.5, width: 60, x: 507.5, y: 323.5, type: "CHILDREN", ofNode: "nONDkdGOmaXO90OAEGIW1AJl" },
    ];

    expect(minifyDragAndDropZones(arg1, arg2)).toStrictEqual(toExpect);
});
