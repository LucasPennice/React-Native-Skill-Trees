import { useEffect, useState } from "react";
import { Platform } from "react-native";
import Purchases, { CustomerInfo, LOG_LEVEL, PurchasesOffering } from "react-native-purchases";
import useMongoCompliantUserId from "./useMongoCompliantUserId";

const APIKeys = {
    apple: "your_revenuecat_apple_api_key",
    google: "goog_izdkwbdXBVUNVXiQOANCaxPsjlu",
};

const useFetchOffers = () => {
    const [currentOffering, setCurrentOffering] = useState<PurchasesOffering | null>(null);
    const userId = useMongoCompliantUserId();

    useEffect(() => {
        if (userId === null) return;

        (async () => {
            try {
                const offerings = await Purchases.getOfferings();

                setCurrentOffering(offerings.current);
            } catch (error) {
                console.error(error);
            }
        })();
    }, [userId]);

    return currentOffering;
};

const getIsPro = (customerInfo: null | CustomerInfo) => {
    if (customerInfo === null) return null;

    return customerInfo.entitlements.active.Pro !== undefined;
};

const useUserSubscriptionInformation = () => {
    const [customerInfo, setCustomerInfo] = useState<null | CustomerInfo>(null);
    const userId = useMongoCompliantUserId();

    const isProUser: boolean | null = getIsPro(customerInfo);

    const handleCustomerInfoUpdate = (customerInfo: CustomerInfo) => {
        try {
            setCustomerInfo(customerInfo);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (userId === null) return;

        Purchases.addCustomerInfoUpdateListener(handleCustomerInfoUpdate);

        return () => {
            Purchases.removeCustomerInfoUpdateListener(handleCustomerInfoUpdate);
        };
    }, [userId]);

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
            if (userId === null) return;

            try {
                if (Platform.OS === "android") {
                    Purchases.configure({ apiKey: APIKeys.google, appUserID: userId });
                } else {
                    Purchases.configure({ apiKey: APIKeys.apple, appUserID: userId });
                }
            } catch (error) {
                console.error(error);
            }
        })();
    }, [userId]);

    const currentOffering = useFetchOffers();
    const { isProUser, customerInfo } = useUserSubscriptionInformation();

    const onFreeTrial: boolean | null = false;

    return { currentOffering, isProUser, customerInfo, onFreeTrial };
}

export default useSubscriptionHandler;
