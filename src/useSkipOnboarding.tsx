import { batch } from "react-redux";
import { useAppDispatch } from "./redux/reduxHooks";
import { completeCustomizeHomeTree, completeOnboardingExperienceSurvey } from "./redux/slices/userVariablesSlice";

function useSkipOnboarding() {
    const dispatch = useAppDispatch();

    const skipOnboarding = () => {
        batch(() => {
            dispatch(completeOnboardingExperienceSurvey());
            dispatch(completeCustomizeHomeTree());
        });
    };

    return skipOnboarding;
}

export default useSkipOnboarding;
