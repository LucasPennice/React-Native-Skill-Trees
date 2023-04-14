import { ScrollView } from "react-native";
import AppText from "../../components/AppText";
import { colors } from "../homepage/canvas/parameters";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StackNavigatorParams } from "../../../App";

type Props = NativeStackScreenProps<StackNavigatorParams, "SkillPage">;

function SkillPage({ route }: Props) {
    const currentSkill = route.params ?? undefined;

    if (!currentSkill) return <></>;

    return (
        <ScrollView style={{ backgroundColor: colors.background, flex: 1, paddingHorizontal: 10 }}>
            <AppText fontSize={32} style={{ color: "white", fontFamily: "helveticaBold", marginBottom: 5 }}>
                {currentSkill.name}
            </AppText>
        </ScrollView>
    );
}

export default SkillPage;
