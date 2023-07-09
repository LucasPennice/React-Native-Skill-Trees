import { TouchableOpacity } from "react-native-gesture-handler";
import { generalStyles } from "../styles";
import { centerFlex, colors } from "../parameters";
import AppText from "./AppText";
import ChevronRight from "./Icons/ChevronRight";

function GoToPageButton({ onPress, title }: { onPress: () => void; title: string }) {
    return (
        <TouchableOpacity
            style={[
                generalStyles.btn,
                centerFlex,
                {
                    flexDirection: "row",
                    justifyContent: "space-between",
                    paddingHorizontal: 10,
                    paddingVertical: 10,
                    backgroundColor: "#282A2C",
                    marginTop: 10,
                    width: "100%",
                },
            ]}
            onPressIn={onPress}
            delayPressIn={80}>
            <AppText style={{ color: colors.unmarkedText }} fontSize={16}>
                {title}
            </AppText>
            <ChevronRight />
        </TouchableOpacity>
    );
}

export default GoToPageButton;
