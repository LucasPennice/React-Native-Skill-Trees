import AppButton from "@/components/AppButton";
import AppText from "@/components/AppText";
import CloudIcon from "@/components/Icons/CloudIcon";
import { colors, dayInMilliseconds } from "@/parameters";
import { useAppSelector } from "@/redux/reduxHooks";
import { selectSyncSlice } from "@/redux/slices/syncSlice";
import useUpdateBackup from "@/useUpdateBackup";
import { mixpanel } from "app/_layout";
import { Alert, StyleSheet, View } from "react-native";

const style = StyleSheet.create({
    container: { flex: 1, padding: 10, gap: 20 },
    cloudContainer: { flexDirection: "row", backgroundColor: colors.darkGray, padding: 10, borderRadius: 10, alignItems: "center", gap: 10 },
});

function BackupScreen() {
    const { lastUpdateUTC_Timestamp } = useAppSelector(selectSyncSlice);
    const { backupState, handleUserBackup } = useUpdateBackup();

    const handleManualBackup = async () => {
        try {
            await handleUserBackup();
        } catch (error) {
            mixpanel.track(`CRASH`, { message: error, stack: error });

            Alert.alert(`There was an error creating your backup`, `Please contact the developer ${error}`);
        }
    };

    return (
        <View style={style.container}>
            <View style={style.cloudContainer}>
                <View>
                    <CloudIcon width={30} height={30} fill={colors.line} />
                </View>
                <AppText
                    children={`Last Backup: ${new Date(lastUpdateUTC_Timestamp).toString()}`}
                    fontSize={14}
                    style={{ paddingTop: 2, color: colors.unmarkedText }}
                />
            </View>

            <View style={style.cloudContainer}>
                <AppText
                    children={`Next Backup: ${new Date(lastUpdateUTC_Timestamp + dayInMilliseconds).toString()}`}
                    fontSize={14}
                    style={{ paddingTop: 2, color: colors.unmarkedText }}
                />
            </View>

            <AppButton
                onPress={handleManualBackup}
                state={backupState}
                style={{ alignItems: "flex-start", paddingLeft: 10 }}
                text={{ idle: "Back Up Now", success: "Back up Successful" }}
                color={{ idle: colors.line }}
            />
        </View>
    );
}

export default BackupScreen;
