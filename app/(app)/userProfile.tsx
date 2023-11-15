import AppButton from "@/components/AppButton";
import AppText from "@/components/AppText";
import { useAuth } from "@clerk/clerk-expo";
import { View } from "react-native";

function UserProfile() {
    const { signOut } = useAuth();

    return (
        <View style={{ flex: 1, padding: 10, gap: 20 }}>
            <AppText fontSize={18} children={"My Profile"} />

            <AppButton onPress={signOut} text={{ idle: "Sign Out" }} />
        </View>
    );
}

export default UserProfile;
