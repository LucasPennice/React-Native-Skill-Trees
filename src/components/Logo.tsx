import { View } from "react-native";
import AppText from "./AppText";
import LogoIcon from "./Icons/LogoIcon";

const Logo = () => {
    return (
        <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
            <LogoIcon />
            <AppText children={"Skill Trees"} fontSize={24} style={{ fontFamily: "helveticaBold", paddingTop: 4 }} />
        </View>
    );
};

export default Logo;
