import AppButton from "@/components/AppButton";
import AppText from "@/components/AppText";
import ChevronRight from "@/components/Icons/ChevronRight";
import CrownIcon from "@/components/Icons/CrownIcon";
import TicketIcon from "@/components/Icons/TicketIcon";
import { colors } from "@/parameters";
import { useAppDispatch, useAppSelector } from "@/redux/reduxHooks";
import { selectSyncSlice, setShouldWaitForClerkToLoad, updateLastBackupTime } from "@/redux/slices/syncSlice";
import useUpdateBackup from "@/useUpdateBackup";
import { useAuth, useUser } from "@clerk/clerk-expo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { SubscriptionContext, mixpanel } from "app/_layout";
import * as Application from "expo-application";
import { router } from "expo-router";
import { Alert, Image, StyleSheet, TouchableOpacity, View } from "react-native";

import LoadingIcon from "@/components/LoadingIcon";
import { useContext, useState } from "react";
import { CustomerInfo } from "react-native-purchases";

const style = StyleSheet.create({
    container: { flex: 1, padding: 15, gap: 20 },
    settingContainer: { flex: 1, gap: 15 },
    versionText: { textAlign: "center", color: colors.line, marginVertical: 10 },
});

function AccountPage() {
    return <View style={style.container}></View>;
}

export default AccountPage;
