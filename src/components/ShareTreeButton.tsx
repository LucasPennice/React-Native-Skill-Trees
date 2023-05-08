import { Alert, Pressable } from "react-native";
import { shareCanvasScreenshot } from "../useIsSharingAvailable";
import { centerFlex, colors } from "../parameters";
import AppText from "./AppText";
import { Skill, Tree } from "../types";
import { SkiaDomView } from "@shopify/react-native-skia";
import TakingScreenshotLoadingScreenModal from "../pages/viewingSkillTree/modals/TakingScreenshotLoadingScreenModal";
import { RefObject } from "react";

type Props = {
    shouldShare: boolean;
    takingScreenShotState: [boolean, (v: boolean) => void];
    treeName: string;
    canvasRef: RefObject<SkiaDomView>;
};

function ShareTreeButton({ shouldShare, takingScreenShotState, treeName, canvasRef }: Props) {
    const [isTakingScreenshot, setIsTakingScreenshot] = takingScreenShotState;

    const fileName = treeName.replace(/\s/g, "");

    return (
        <>
            {shouldShare && (
                <Pressable
                    onPress={() => {
                        if (!canvasRef.current) return Alert.alert("Please try again");
                        shareCanvasScreenshot(canvasRef.current, setIsTakingScreenshot, fileName);
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
            <TakingScreenshotLoadingScreenModal open={isTakingScreenshot} />
        </>
    );
}

export default ShareTreeButton;
