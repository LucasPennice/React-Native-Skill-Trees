import { mixpanel } from "app/_layout";
import Purchases, { PurchasesPackage } from "react-native-purchases";

export const BACKGROUND_COLOR = "#101111";
export const PRICE_CARD_HEIGHT = 140;
export const PRICE_CARD_SMALL_HEIGHT = 100;

export const handlePurchase =
    (selectedPackage: PurchasesPackage, onSuccess: () => void, setLoading: (v: boolean) => void, eventName: string) => async () => {
        try {
            setLoading(true);

            await Purchases.purchasePackage(selectedPackage);

            mixpanel.track(`${eventName} - ${selectedPackage.identifier}`);

            onSuccess();
        } catch (e) {
            //@ts-ignore
            if (!e.userCancelled) mixpanel.track("PAYWALL Purchase Error", { error: e });
        } finally {
            setLoading(false);
        }
    };

export const restorePurchase = (setLoading: (v: boolean) => void, onRestorePurchase: () => void, eventName: string) => async () => {
    try {
        setLoading(true);
        const restore = await Purchases.restorePurchases();

        if (restore.activeSubscriptions.length !== 0) {
            onRestorePurchase();

            mixpanel.track(`${eventName}`);
        }
    } catch (error) {
        //@ts-ignore
        mixpanel.track("PAYWALL Restore Error", { error });
    } finally {
        setLoading(false);
    }
};

export const getSubscribeButtonText = (selected: string) => {
    if (selected === "pro_lifetime") return "Start your journey, forever";
    if (selected === "pro_monthly_1:p1m") return "Start your journey";
    return "Start your 7 days free trial";
};
