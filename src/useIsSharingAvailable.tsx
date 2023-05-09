import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import * as Print from "expo-print";
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

        const imageURI = FileSystem.documentDirectory + `${parsedFileName}` + ".png";

        await FileSystem.writeAsStringAsync(imageURI, base64Code, { encoding: FileSystem.EncodingType.Base64 });

        await MediaLibrary.saveToLibraryAsync(imageURI);

        await Sharing.shareAsync(imageURI);
    } catch (error) {
        Alert.alert("Could not share png");
    }
}

export async function sharePDF(html: string) {
    try {
        const { uri } = await Print.printToFileAsync({
            html,
            base64: true,
            margins: { bottom: 0, left: 0, right: 0, top: 0 },
        });

        await Sharing.shareAsync(uri, { UTI: ".pdf", mimeType: "application/pdf" });
    } catch (error) {
        Alert.alert("Could not share pdf");
    }
}
