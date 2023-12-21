import { HandleModalsContext } from "app/(app)/_layout";
import { router } from "expo-router";
import { useCallback, useContext } from "react";
import { useAppSelector } from "./redux/reduxHooks";
import { selectUserVariables } from "./redux/slices/userVariablesSlice";

function useRunOnAuth() {
    const { openOnboardingFeedbackModal } = useContext(HandleModalsContext);
    const { nthAppOpen, appNumberWhenFinishedOnboarding, onboardingExperience } = useAppSelector(selectUserVariables);

    const runOnSignIn = useCallback(() => {
        router.push({ pathname: "/(app)/home", params: { handleLogInSync: "true" } });

        const finishedAppOpenOnThisSession = appNumberWhenFinishedOnboarding !== null && appNumberWhenFinishedOnboarding === nthAppOpen;

        if (finishedAppOpenOnThisSession && !onboardingExperience) openOnboardingFeedbackModal();
    }, [appNumberWhenFinishedOnboarding, nthAppOpen]);

    const runOnSignUp = useCallback(() => {
        router.push({ pathname: "/(app)/home", params: { handleSignUpSync: "true" } });

        const finishedAppOpenOnThisSession = appNumberWhenFinishedOnboarding !== null && appNumberWhenFinishedOnboarding === nthAppOpen;

        if (finishedAppOpenOnThisSession && !onboardingExperience) openOnboardingFeedbackModal();
    }, [appNumberWhenFinishedOnboarding, nthAppOpen]);

    return { runOnSignUp, runOnSignIn };
}

export default useRunOnAuth;
