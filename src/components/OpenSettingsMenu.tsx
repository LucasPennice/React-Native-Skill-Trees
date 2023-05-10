import { Pressable, View } from "react-native";
import AppText from "./AppText";
import { centerFlex, colors } from "../parameters";

function OpenSettingsMenu({ openModal }: { openModal: () => void }) {
    return (
        <View style={{ position: "absolute", top: 70, left: 70 }}>
            <Pressable style={[centerFlex, { width: 50, height: 50, borderRadius: 10, backgroundColor: colors.darkGray }]} onPress={openModal}>
                <AppText style={{ color: colors.background, fontFamily: "helveticaBold" }} fontSize={16}>
                    🧻
                </AppText>
            </Pressable>
        </View>
    );
}

export default OpenSettingsMenu;
