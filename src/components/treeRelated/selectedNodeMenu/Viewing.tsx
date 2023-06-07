import { TouchableOpacity } from "react-native-gesture-handler";
import AppText from "../../AppText";
import { colors } from "../../../parameters";
import { generalStyles } from "../../../styles";
import { Skill, Tree } from "../../../types";
import { useRoute } from "@react-navigation/native";
import { RouteName } from "../../../../App";
import { View } from "react-native";

function Viewing({ functions, selectedNode }: { functions: { goToSkillPage: () => void; goToTreePage: () => void }; selectedNode: Tree<Skill> }) {
    const route = useRoute();

    const treePageRoute: RouteName = "ViewingSkillTree";

    const isNotOnTreePage = route.name !== treePageRoute;

    const { goToSkillPage, goToTreePage } = functions;

    const { category, treeName } = selectedNode;

    return (
        <>
            {category !== "SKILL" && (
                <AppText style={{ color: "#FFFFFF", fontFamily: "helveticaBold", marginBottom: 10 }} fontSize={24}>
                    {treeName}
                </AppText>
            )}

            {category === "SKILL" && (
                <TouchableOpacity style={[generalStyles.btn, { backgroundColor: "#282A2C", marginBottom: 10 }]} onPress={goToSkillPage}>
                    <AppText style={{ color: colors.accent }} fontSize={16}>
                        Go To Skill Page
                    </AppText>
                </TouchableOpacity>
            )}
            {category !== "SKILL" && <TreeStats />}

            {category === "SKILL_TREE" && (
                <AppText style={{ color: colors.accent }} fontSize={16}>
                    Edit tree button
                </AppText>
            )}

            {category !== "USER" && isNotOnTreePage && (
                <TouchableOpacity style={[generalStyles.btn, { backgroundColor: "#282A2C", marginBottom: 10 }]} onPress={goToTreePage}>
                    <AppText style={{ color: colors.accent }} fontSize={16}>
                        Go To Tree Page
                    </AppText>
                </TouchableOpacity>
            )}
        </>
    );
}

function TreeStats() {
    return (
        <View>
            <AppText style={{ color: colors.accent }} fontSize={16}>
                Overal completion percentage
            </AppText>
            <AppText style={{ color: colors.accent }} fontSize={16}>
                Overal completion quantity
            </AppText>
            <AppText style={{ color: colors.accent }} fontSize={16}>
                Show biggest tree
            </AppText>
            <AppText style={{ color: colors.accent }} fontSize={16}>
                show most complete tree and biggest
            </AppText>
            <AppText style={{ color: colors.accent }} fontSize={16}>
                Show achievements
            </AppText>
        </View>
    );
}

export default Viewing;
