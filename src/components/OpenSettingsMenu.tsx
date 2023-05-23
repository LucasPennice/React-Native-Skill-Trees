import { Pressable, View } from "react-native";
import { centerFlex, colors } from "../parameters";
import SettingsIcon from "./Icons/SettingsIcon";

function OpenSettingsMenu({ openModal }: { openModal: () => void }) {
    return (
        <View style={{ position: "absolute", top: 70, right: 10 }}>
            <Pressable style={[centerFlex, { width: 50, height: 50, borderRadius: 10, backgroundColor: colors.darkGray }]} onPress={openModal}>
                <SettingsIcon />
            </Pressable>
        </View>
    );
}

export default OpenSettingsMenu;
