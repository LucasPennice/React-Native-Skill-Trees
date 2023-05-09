import { SkiaDomView } from "@shopify/react-native-skia";
import { RefObject } from "react";
import { Alert, Pressable } from "react-native";
import { centerFlex, colors } from "../../parameters";
import { Skill, Tree } from "../../types";
import AppText from "../AppText";
import TakingScreenshotLoadingScreenModal from "./TakingScreenshotLoadingScreenModal";

type Props = {
    shouldShare: boolean;
    takingScreenShotState: [boolean, (v: boolean) => void];
    tree: Tree<Skill>;
    canvasRef: RefObject<SkiaDomView>;
};

function ShareTreeButton({ shouldShare, takingScreenShotState, tree, canvasRef }: Props) {
    const [isTakingScreenshot, setIsTakingScreenshot] = takingScreenShotState;

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
                    <AppText fontSize={24} style={{ lineHeight: 33 }}>
                        🌎
                    </AppText>
                </Pressable>
            )}
            <TakingScreenshotLoadingScreenModal canvasRef={canvasRef.current!} takingScreenShotState={takingScreenShotState} tree={tree} />
        </>
    );
}

export default ShareTreeButton;
