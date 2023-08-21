import { useAppDispatch, useAppSelector } from "./redux/reduxHooks";
import { populateUserId, selectUserId } from "./redux/slices/userSlice";

function useHandleUserId() {
    const userId = useAppSelector(selectUserId);
    const dispatch = useAppDispatch();

    if (userId === "") {
        dispatch(populateUserId());
    }
}

export default useHandleUserId;
