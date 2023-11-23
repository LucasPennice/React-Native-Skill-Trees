import { mixpanel } from "app/(app)/_layout";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

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

//Base64Code does includes "data:image/png;base64,"
export async function sharePNG(fileName: string, data: string) {
    try {
        const parsedFileName = fileName.replace(/\s/g, "");

        const base64Code = data.split("data:image/png;base64,")[1];

        const imageURI = `${FileSystem.documentDirectory}${parsedFileName}.png`;

        await FileSystem.writeAsStringAsync(imageURI, base64Code, { encoding: FileSystem.EncodingType.Base64 });

        await MediaLibrary.saveToLibraryAsync(imageURI);

        await Sharing.shareAsync(imageURI);
    } catch (error) {
        console.error(error);
        Alert.alert("There was an error sharing your skill tree");
        mixpanel.track(`appError`, { message: error, stack: error });
    }
}
