import { useEffect, useState } from "react";
import { ImageFormat, SkiaDomView } from "@shopify/react-native-skia";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
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

export async function shareCanvasScreenshot(canvasRef: SkiaDomView | null, setIsTakingScreenshot: (v: boolean) => void, fileName: string) {
    if (!canvasRef) return Alert.alert("Please try again");

    try {
        setIsTakingScreenshot(true);

        const imagesArray = [
            canvasRef.makeImageSnapshot(),
            canvasRef.makeImageSnapshot(),
            canvasRef.makeImageSnapshot(),
            canvasRef.makeImageSnapshot(),
            canvasRef.makeImageSnapshot(),
        ];

        const encodedImages = imagesArray.map((image) => image.encodeToBase64(ImageFormat.PNG, 99));

        let tentativeBestEncodedImage: string | null = null;

        for (let index = 0; index < encodedImages.length; index++) {
            const encodedImage = encodedImages[index];

            if (tentativeBestEncodedImage === null || encodedImage.length > tentativeBestEncodedImage.length) {
                tentativeBestEncodedImage = encodedImage;
            }
        }

        await new Promise((resolve) =>
            setTimeout(async () => {
                const data = `data:image/png;base64,${tentativeBestEncodedImage}`;
                const base64Code = data.split("data:image/png;base64,")[1];

                const directoryURI = FileSystem.documentDirectory + `${fileName}` + ".png";

                await FileSystem.writeAsStringAsync(directoryURI, base64Code, {
                    encoding: FileSystem.EncodingType.Base64,
                });

                await MediaLibrary.saveToLibraryAsync(directoryURI);

                await Sharing.shareAsync(directoryURI);

                resolve("");
            }, 1000)
        );
    } catch (error) {
        Alert.alert("Could not generate image, please try again");
    } finally {
        setIsTakingScreenshot(false);
    }
}
