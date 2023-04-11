import { Platform, Text, TextProps } from "react-native";

function AppText({ style, fontSize, children }: { style: TextProps["style"]; fontSize: number; children: React.ReactNode }) {
    return (
        <Text
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
