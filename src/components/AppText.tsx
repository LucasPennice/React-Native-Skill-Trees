import { Text, TextProps } from "react-native";

function AppText(props: TextProps) {
    return (
        <Text {...props} style={[{ fontFamily: "helvetica" }, props.style]}>
            {props.children}
        </Text>
    );
}

export default AppText;
