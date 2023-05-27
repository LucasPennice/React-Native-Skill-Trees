import { SkiaDomView } from "@shopify/react-native-skia";
import { usePermissions } from "expo-media-library";
import { RefObject, useCallback, useEffect } from "react";
import { Alert, Pressable } from "react-native";
import { centerFlex, colors } from "../../parameters";
import { Skill, Tree } from "../../types";
import ShareScreenshotIcon from "../Icons/ShareScreenshotIcon";
import TakingScreenshotLoadingScreenModal from "./TakingScreenshotLoadingScreenModal";

type Props = {
    shouldShare: boolean;
    takingScreenShotState: [boolean, (v: boolean) => void];
    tree: Tree<Skill>;
    canvasRef: RefObject<SkiaDomView>;
};

function ShareTreeLayout({ shouldShare, takingScreenShotState, tree, canvasRef }: Props) {
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

    return (
        <>
            {shouldShare && (
                <Pressable
                    onPress={() => {
                        if (!canvasRef.current) return Alert.alert("Please try again");
                        setIsTakingScreenshot(true);
                    }}
                    style={[
                        centerFlex,
                        {
                            position: "absolute",
                            width: 50,
                            height: 50,
                            top: 70,
                            left: 10,
                            backgroundColor: colors.darkGray,
                            borderRadius: 10,
                        },
                    ]}>
                    <ShareScreenshotIcon />
                </Pressable>
            )}
            <TakingScreenshotLoadingScreenModal canvasRef={canvasRef.current!} takingScreenShotState={takingScreenShotState} tree={tree} />
        </>
    );
}

export default ShareTreeLayout;
