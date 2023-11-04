import { StyleSheet, ViewStyle } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { colors } from "../parameters";
import { generalStyles } from "../styles";
import AppText from "./AppText";
import ChevronRight from "./Icons/ChevronRight";

function GoToPageButton({ onPress, title, containerStyles }: { onPress: () => void; title: string; containerStyles?: ViewStyle }) {
    const styles = StyleSheet.create({
        container: {
            flexDirection: "row",
            justifyContent: "space-between",
            paddingHorizontal: 10,
            paddingVertical: 10,
            borderColor: "#282A2C",
            borderWidth: 2,
            width: "100%",
        },
    });

    return (
        <TouchableOpacity style={[generalStyles.btn, styles.container, containerStyles]} onPressIn={onPress} delayPressIn={80}>
            <AppText children={title} fontSize={14} />
            <ChevronRight color={colors.white} />
        </TouchableOpacity>
    );
}

export default GoToPageButton;
