import AppButton from "@/components/AppButton";
import AppText from "@/components/AppText";
import { useAppSelector } from "@/redux/reduxHooks";
import { selectHomeTree } from "@/redux/slices/homeTreeSlice";
import { selectAllNodeIds, selectNodesTable } from "@/redux/slices/nodesSlice";
import { selectOnboarding } from "@/redux/slices/onboardingSlice";
import { selectSyncSlice } from "@/redux/slices/syncSlice";
import { selectAllTreesEntities, selectTreeIds } from "@/redux/slices/userTreesSlice";
import useMongoCompliantUserId from "@/useMongoCompliantUserId";
import { useAuth } from "@clerk/clerk-expo";
import { useHandleButtonState } from "app/signUp";
import axiosClient from "axiosClient";
import { Alert, View } from "react-native";
import { mixpanel } from "./_layout";
import { UserBackup } from "./home";

const updateBackup = async (userId: string, newUserBackup: UserBackup) => {
    try {
        await axiosClient.patch(`backup/${userId}`, newUserBackup);
    } catch (error) {
        Alert.alert("There was an error creating your backup", `Please contact the developer ${error}`);
    }
};

function UserProfile() {
    const { signOut } = useAuth();

    const { setSubmitLoading, setSubmitError, submitState } = useHandleButtonState();

    const userId = useMongoCompliantUserId();
    const nodesTable = useAppSelector(selectNodesTable);
    const nodesIds = useAppSelector(selectAllNodeIds);
    const treesTable = useAppSelector(selectAllTreesEntities);
    const treesIds = useAppSelector(selectTreeIds);
    const homeTree = useAppSelector(selectHomeTree);
    const onboarding = useAppSelector(selectOnboarding);
    const { lastUpdateUTC_Timestamp } = useAppSelector(selectSyncSlice);

    const newUserBackup: UserBackup = {
        nodeSlice: { entities: nodesTable, ids: nodesIds },
        userTreesSlice: { entities: treesTable, ids: treesIds },
        homeTree,
        onboarding,
        lastUpdateUTC_Timestamp,
    };

    const handleSignOut = async () => {
        try {
            setSubmitLoading();

            mixpanel.reset();

            await updateBackup(userId!, newUserBackup);

            signOut();
        } catch (error) {
            setSubmitError();
        }
    };

    return (
        <View style={{ flex: 1, padding: 10, gap: 20 }}>
            <AppText fontSize={18} children={"My Profile"} />

            <AppButton onPress={handleSignOut} text={{ idle: "Sign Out" }} state={submitState} />
        </View>
    );
}

export default UserProfile;
