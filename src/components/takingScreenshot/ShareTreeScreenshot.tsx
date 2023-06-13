import { SkiaDomView } from "@shopify/react-native-skia";
import { usePermissions } from "expo-media-library";
import { RefObject, useCallback, useEffect, useMemo } from "react";
import { Alert, Pressable } from "react-native";
import { centerFlex, colors } from "../../parameters";
import { Skill, Tree } from "../../types";
import TakingScreenshotLoadingScreenModal from "./TakingScreenshotLoadingScreenModal";
import ShareScreenshotIcon from "../Icons/ShareScreenshotIcon";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";

type Props = {
    shouldShare: boolean;
    takingScreenShotState: [boolean, (v: boolean) => void];
    tree: Tree<Skill>;
    canvasRef: RefObject<SkiaDomView>;
};

function ShareTreeScreenshot({ shouldShare, takingScreenShotState, tree, canvasRef }: Props) {
    const [isTakingScreenshot, setIsTakingScreenshot] = takingScreenShotState;
    const [permissionResponse, requestPermission] = usePermissions();

    const handleScreenshotPermissions = useCallback(() => {
        if (!isTakingScreenshot) return;

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
        return <TakingScreenshotLoadingScreenModal canvasRef={canvasRef.current!} takingScreenShotState={takingScreenShotState} tree={tree} />;
    }, [canvasRef, takingScreenShotState, tree]);

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
                        setIsTakingScreenshot(true);
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
