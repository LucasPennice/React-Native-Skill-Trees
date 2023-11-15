import AppButton from "@/components/AppButton";
import { useAuth } from "@clerk/clerk-expo";
import { View } from "react-native";

function UserProfile() {
    const { signOut } = useAuth();

    return (
        <View style={{ flex: 1 }}>
            <AppButton onPress={signOut} />
        </View>
    );
}

export default UserProfile;
