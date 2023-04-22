import { useEffect, useState } from "react";
import * as Sharing from "expo-sharing";

function useIsSharingAvailable() {
    const [isSharingAvailable, setIsSharingAvailable] = useState(false);

    useEffect(() => {
        (async () => {
            const canBeUsed = await Sharing.isAvailableAsync();
            setIsSharingAvailable(canBeUsed);
        })();
    }, []);
    return isSharingAvailable;
}

export default useIsSharingAvailable;
