import { colors } from "@/parameters";
import { StyleSheet, View, ViewStyle } from "react-native";

const Spacer = ({ style }: { style?: ViewStyle }) => {
    const styles = StyleSheet.create({
        container: { width: "100%", height: 2, backgroundColor: colors.darkGray, borderRadius: 10 },
    });

    return <View style={[styles.container, style]} />;
};

export default Spacer;
