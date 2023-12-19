import { useEffect, useState } from "react";
import { Platform } from "react-native";
import Purchases, { CustomerInfo, LOG_LEVEL, PurchasesOffering } from "react-native-purchases";
import useMongoCompliantUserId from "./useMongoCompliantUserId";
import { useUser } from "@clerk/clerk-expo";

const APIKeys = {
    apple: "your_revenuecat_apple_api_key",
    google: "goog_izdkwbdXBVUNVXiQOANCaxPsjlu",
};

const useFetchOffers = () => {
    const [currentOffering, setCurrentOffering] = useState<PurchasesOffering | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const offerings = await Purchases.getOfferings();

                setCurrentOffering(offerings.current);
            } catch (error) {
                console.error(error);
            }
        })();
    }, []);

    return currentOffering;
};

const getIsPro = (customerInfo: null | CustomerInfo) => {
    if (customerInfo === null) return null;

    return customerInfo.entitlements.active.Pro !== undefined;
};

const useUserSubscriptionInformation = () => {
    const [customerInfo, setCustomerInfo] = useState<null | CustomerInfo>(null);

    const isProUser: boolean | null = getIsPro(customerInfo);

    const handleCustomerInfoUpdate = (customerInfo: CustomerInfo) => {
        try {
            setCustomerInfo(customerInfo);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        Purchases.addCustomerInfoUpdateListener(handleCustomerInfoUpdate);

        return () => {
            Purchases.removeCustomerInfoUpdateListener(handleCustomerInfoUpdate);
        };
    }, []);

    return { isProUser, customerInfo };
};

export type SubscriptionHandler = {
    currentOffering: PurchasesOffering | null;
    customerInfo: CustomerInfo | null;
    isProUser: boolean | null;
    onFreeTrial: boolean | null;
};

//🚨 Ideally we only run this hook once and pass it's value to the context provider

function useSubscriptionHandler(): SubscriptionHandler {
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
    const userId = useMongoCompliantUserId();

    useEffect(() => {
        (async () => {
            try {
                if (Platform.OS === "android") {
                    Purchases.configure({ apiKey: APIKeys.google });
                } else {
                    Purchases.configure({ apiKey: APIKeys.apple });
                }
            } catch (error) {
                console.error(error);
            }
        })();
    }, []);

    useEffect(() => {
        (async () => {
            if (userId === null) return;

            await Purchases.logIn(userId);
        })();
    }, [userId]);

    const { user } = useUser();

    useEffect(() => {
        if (user === null) return;
        if (user === undefined) return;
        if (userId === null) return;

        Purchases.setDisplayName(user.username);
        Purchases.setEmail(user.primaryEmailAddress?.emailAddress ?? null);
        Purchases.setMixpanelDistinctID(userId);
    }, [user, userId]);

    const currentOffering = useFetchOffers();
    const { isProUser, customerInfo } = useUserSubscriptionInformation();

    const onFreeTrial: boolean | null = false;

    return { currentOffering, isProUser, customerInfo, onFreeTrial };
}

export default useSubscriptionHandler;
