import { TouchableOpacity } from "react-native-gesture-handler";
import AppText from "../../AppText";
import { colors } from "../../../parameters";
import { generalStyles } from "../../../styles";

function Viewing({ goToSkillPage }: { goToSkillPage: () => void }) {
    return (
        <TouchableOpacity style={[generalStyles.btn, { backgroundColor: "#282A2C", marginBottom: 10 }]} onPress={goToSkillPage}>
            <AppText style={{ color: colors.accent }} fontSize={16}>
                Go To Skill Page
            </AppText>
        </TouchableOpacity>
    );
}

export default Viewing;
