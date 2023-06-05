import { Dimensions, Pressable, View } from "react-native";
import AppText from "../../components/AppText";
import WSAddIcon from "../../components/Icons/WelcomeScreenIcons/WSAddIcon";
import WSExportTreeIcon from "../../components/Icons/WelcomeScreenIcons/WSExportTreeIcon";
import WSShareScreenshotIcon from "../../components/Icons/WelcomeScreenIcons/WSShareScreenshotIcon";
import { centerFlex, colors } from "../../parameters";
import { generalStyles } from "../../styles";

function WelcomeScreen({ openCreateNewTree }: { openCreateNewTree: () => void }) {
    const { width } = Dimensions.get("screen");

    return (
        <View style={[centerFlex, { flex: 1, justifyContent: "space-around" }]}>
            <View style={centerFlex}>
                <AppText fontSize={42} style={{ color: "#FFFFFF", fontFamily: "helveticaBold", marginBottom: 10 }}>
                    Welcome to
                </AppText>
                <AppText fontSize={42} style={{ color: "#FFFFFF", fontFamily: "helveticaBold" }}>
                    Skill Trees
                </AppText>
            </View>

            <View>
                <View
                    style={[
                        centerFlex,
                        { flexDirection: "row", gap: 10, justifyContent: "flex-start", width, maxWidth: 350, minHeight: 50, marginBottom: 30 },
                    ]}>
                    <WSAddIcon />

                    <View>
                        <AppText
                            fontSize={18}
                            style={{ color: "#FFFFFF", fontFamily: "helveticaBold", lineHeight: 20, maxWidth: 300, marginBottom: 3 }}>
                            Create you own Skill Trees
                        </AppText>
                        <AppText fontSize={16} style={{ color: colors.unmarkedText, fontFamily: "helvetica", maxWidth: 300, lineHeight: 20 }}>
                            Use RPG-style skill trees for representing real-life goals or skills
                        </AppText>
                    </View>
                </View>
                <View
                    style={[
                        centerFlex,
                        { flexDirection: "row", gap: 10, justifyContent: "flex-start", width, maxWidth: 350, minHeight: 50, marginBottom: 30 },
                    ]}>
                    <WSShareScreenshotIcon />

                    <View>
                        <AppText
                            fontSize={18}
                            style={{ color: "#FFFFFF", fontFamily: "helveticaBold", lineHeight: 20, maxWidth: 300, marginBottom: 3 }}>
                            Share you progress
                        </AppText>
                        <AppText fontSize={16} style={{ color: colors.unmarkedText, fontFamily: "helvetica", maxWidth: 300, lineHeight: 20 }}>
                            Let others know how far you've come in your journey
                        </AppText>
                    </View>
                </View>
                <View style={[centerFlex, { flexDirection: "row", gap: 10, justifyContent: "flex-start", width, maxWidth: 350, minHeight: 50 }]}>
                    <WSExportTreeIcon />

                    <View>
                        <AppText
                            fontSize={18}
                            style={{ color: "#FFFFFF", fontFamily: "helveticaBold", lineHeight: 20, maxWidth: 300, marginBottom: 3 }}>
                            Export your Skill Trees
                        </AppText>
                        <AppText fontSize={16} style={{ color: colors.unmarkedText, fontFamily: "helvetica", maxWidth: 300, lineHeight: 20 }}>
                            And complete them alongside your friends
                        </AppText>
                    </View>
                </View>
            </View>

            <View>
                <Pressable style={[generalStyles.btn, { backgroundColor: colors.accent }]} onPress={openCreateNewTree}>
                    <AppText fontSize={16} style={{ color: "#FFFFFF", fontFamily: "helvetica" }}>
                        Create your first Skill Tree
                    </AppText>
                </Pressable>
            </View>
        </View>
    );
}

export default WelcomeScreen;
