import { colors } from "@/parameters";
import { Text, TextProps } from "react-native";

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
            allowFontScaling={false}
            {...textProps}
            style={[
                {
                    fontFamily: "helvetica",
                    fontSize,
                    lineHeight: fontSize,
                    color: colors.white,
                },
                style,
            ]}>
            {children}
        </Text>
    );
}

export default AppText;
