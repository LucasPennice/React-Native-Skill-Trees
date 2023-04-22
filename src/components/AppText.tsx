import { Platform, Text, TextProps } from "react-native";

function AppText({
    style,
    fontSize,
    children,
    textProps,
}: {
    style?: TextProps["style"];
    fontSize: number;
    children: React.ReactNode;
    textProps?: TextProps;
}) {
    return (
        <Text
            {...textProps}
            style={[
                {
                    fontFamily: "helvetica",
                    fontSize,
                    lineHeight: fontSize,
                },
                style,
            ]}>
            {children}
        </Text>
    );
}

export default AppText;
