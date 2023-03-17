import { Text, View } from "react-native";
import { selectCurrentTree } from "../currentTreeSlice";
import { useAppSelector } from "../reduxHooks";

function TreeName() {
    const { value: currentTree } = useAppSelector(selectCurrentTree);

    if (!currentTree) return;

    return (
        <View
            style={{
                position: "absolute",

                left: 80,
                top: 20,
                backgroundColor: "white",
                padding: 10,
                borderRadius: 10,
                shadowColor: "#000",
                shadowOffset: {
                    width: 0,
                    height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,

                elevation: 5,
            }}>
            <Text style={{ fontSize: 24, fontWeight: "bold" }}>{currentTree.treeName ?? "Tree Name"}</Text>
        </View>
    );
}

export default TreeName;
