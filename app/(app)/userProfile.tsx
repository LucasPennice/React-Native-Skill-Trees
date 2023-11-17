import AppButton from "@/components/AppButton";
import AppText from "@/components/AppText";
import { useAppDispatch, useAppSelector } from "@/redux/reduxHooks";
import { selectHomeTree } from "@/redux/slices/homeTreeSlice";
import { selectAllNodeIds, selectNodesTable } from "@/redux/slices/nodesSlice";
import { selectOnboarding } from "@/redux/slices/onboardingSlice";
import { selectSyncSlice, setShouldWaitForClerkToLoad } from "@/redux/slices/syncSlice";
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
        throw new Error(`There was an error creating your backup\nPlease contact the developer ${error}`);
    }
};

function UserProfile() {
    return (
        <View style={{ flex: 1, padding: 10, gap: 20 }}>
            <AppText fontSize={18} children={"My Profile"} />

            <SignOutButton />
        </View>
    );
}

export default UserProfile;

const SignOutButton = () => {
    const { signOut, isLoaded } = useAuth();

    const { setSubmitLoading, setSubmitError, submitState } = useHandleButtonState();

    const dispatch = useAppDispatch();

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

    const runOnSignOut = () => {
        mixpanel.reset();
        dispatch(setShouldWaitForClerkToLoad(true));
    };

    const handleSignOut = async () => {
        try {
            setSubmitLoading();

            await updateBackup(userId!, newUserBackup);

            runOnSignOut();

            signOut();
        } catch (error) {
            setSubmitError();
            Alert.alert("Error creating a backup", `All progress after ${new Date().toString()} will be lost\nQuit anyway?`, [
                { text: "No", style: "default", isPreferred: true },
                {
                    text: "Yes",
                    style: "destructive",
                    onPress: () => {
                        runOnSignOut();

                        signOut();
                    },
                },
            ]);
        }
    };

    return <AppButton disabled={!isLoaded} onPress={handleSignOut} text={{ idle: "Sign Out" }} state={submitState} />;
};
