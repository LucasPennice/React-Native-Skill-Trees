import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import Purchases, { LOG_LEVEL, PurchasesOffering } from "react-native-purchases";

const APIKeys = {
    apple: "your_revenuecat_apple_api_key",
    google: "goog_izdkwbdXBVUNVXiQOANCaxPsjlu",
};

const useFetchOffers = () => {
    const [currentOffering, setCurrentOffering] = useState<PurchasesOffering | null>(null);

    useEffect(() => {
        (async () => {
            try {
                if (Platform.OS === "android") {
                    Purchases.configure({ apiKey: APIKeys.google });
                } else {
                    Purchases.configure({ apiKey: APIKeys.apple });
                }

                const offerings = await Purchases.getOfferings();

                setCurrentOffering(offerings.current);
            } catch (error) {
                console.error(error);
            }
        })();
    }, []);

    return currentOffering;
};

const useUserSubscriptionInformation = () => {
    const [isProUser, setIsProUser] = useState<null | Boolean>(null);

    useEffect(() => {
        (async () => {
            try {
                const customerInfo = await Purchases.getCustomerInfo();

                const activeEntitlements = customerInfo.entitlements.active;

                if (Object.keys(activeEntitlements).length !== 0) return setIsProUser(true);

                return setIsProUser(false);
            } catch (error) {
                console.error(error);
            }
        })();
    }, []);

    return isProUser;
};

function useSubscriptionHandler() {
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

    const currentOffering = useFetchOffers();
    const isProUser = useUserSubscriptionInformation();

    useEffect(() => {
        if (isProUser === false) router.push("/(app)/paywall");
    }, [isProUser]);

    return currentOffering;
}

export default useSubscriptionHandler;
