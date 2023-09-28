import { TreeData } from "@/redux/slices/userTreesSlice";
import { SkiaDomView } from "@shopify/react-native-skia";
import { usePermissions } from "expo-media-library";
import { RefObject, useCallback, useEffect, useMemo } from "react";
import { Alert, Pressable } from "react-native";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";
import { centerFlex, colors } from "../../parameters";
import ShareScreenshotIcon from "../Icons/ShareScreenshotIcon";
import TakingScreenshotLoadingScreenModal from "./TakingScreenshotLoadingScreenModal";

type Props = {
    shouldShare: boolean;
    takingScreenshotState: readonly [boolean, { readonly openTakingScreenshotModal: () => void; readonly closeTakingScreenshotModal: () => void }];
    treeData: Omit<TreeData, "nodes">;
    canvasRef: RefObject<SkiaDomView>;
};

function ShareTreeScreenshot({ shouldShare, takingScreenshotState, treeData, canvasRef }: Props) {
    const [takingScreenshot, { openTakingScreenshotModal }] = takingScreenshotState;
    const [permissionResponse, requestPermission] = usePermissions();

    const handleScreenshotPermissions = useCallback(() => {
        if (!takingScreenshot) return;

        if (!permissionResponse) {
            requestPermission();
            return;
        }
        if (!permissionResponse.granted) {
            requestPermission();
            return;
        }
    }, []);

    useEffect(() => {
        handleScreenshotPermissions();
    }, [handleScreenshotPermissions]);

    const MemoizedModal = useMemo(() => {
        return (
            <TakingScreenshotLoadingScreenModal canvasRef={canvasRef.current!} takingScreenshotState={takingScreenshotState} treeData={treeData} />
        );
    }, [canvasRef, takingScreenshotState, treeData]);

    const opacity = useAnimatedStyle(() => {
        if (!shouldShare) return { opacity: withTiming(0.5, { duration: 150 }) };

        return { opacity: withTiming(1, { duration: 150 }) };
    }, [shouldShare]);

    return (
        <>
            <Animated.View style={[opacity, { position: "absolute", top: 70, left: 10 }]}>
                <Pressable
                    onPress={() => {
                        if (!shouldShare) return;
                        if (!canvasRef.current) return Alert.alert("Please try again");
                        openTakingScreenshotModal();
                    }}
                    style={[
                        centerFlex,
                        {
                            width: 50,
                            height: 50,
                            backgroundColor: colors.darkGray,
                            borderRadius: 10,
                        },
                    ]}>
                    <ShareScreenshotIcon />
                </Pressable>
            </Animated.View>

            {MemoizedModal}
        </>
    );
}

export default ShareTreeScreenshot;
