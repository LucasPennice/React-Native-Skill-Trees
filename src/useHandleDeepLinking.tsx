import useMongoCompliantUserId from "@/useMongoCompliantUserId";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import { useEffect } from "react";
import { Alert } from "react-native";
import { RoutesParams } from "routes";

const manuallyParseParams = (url: string) => {
    //
    const splitUrl = url.split("?");
    const paramArray = splitUrl.slice(1);

    const result: { [key: string]: string } = {};

    paramArray.forEach((s) => {
        const [key, data] = s.split("=");

        result[key] = data;
    });

    return result;
};

const onUrlChange = (url: string | null, shouldHandle: boolean, userId: string | null) => {
    if (url === null || !url.includes("https://www.skilltreesapp.com")) return;
    if (!shouldHandle) return;

    const { path: action } = Linking.parse(url);

    const queryParams = manuallyParseParams(url);

    //Handle import case
    if (action === "redirect/import") {
        if (!queryParams) return Alert.alert("Invalid import link");
        if (queryParams.userId === undefined) return Alert.alert("User id doesn't exist in import link");
        if (queryParams.treesToImportIds === undefined) return Alert.alert("The trees to import do not exist at the provided import link.");

        //HANDLES THE ROUTING FOR INITIAL AND SUBSEQUENT EVENTS - AND THE PARAM SETTING FOR ONLY THE FIRST EVENT
        router.push({
            pathname: `/(app)/myTrees`,
            //@ts-ignore
            params: { userIdImport: queryParams.userId, treesToImportIds: queryParams.treesToImportIds } as RoutesParams["myTrees"],
        });

        //PARAM SETTING FOR ONLY SUBSEQUENT EVENTS
        //@ts-ignore
        router.setParams({ userIdImport: queryParams.userId, treesToImportIds: queryParams.treesToImportIds } as RoutesParams["myTrees"]);
        return;
    }
};

const useHandleDeepLinking = (shouldHandle: boolean) => {
    const url = Linking.useURL();

    const userId = useMongoCompliantUserId();

    useEffect(() => {
        onUrlChange(url, shouldHandle, userId);
    }, [userId, shouldHandle]);

    useEffect(() => {
        const eventEmmiter = Linking.addEventListener("url", (e) => {
            const url = e.url;

            onUrlChange(url, shouldHandle, userId);
        });

        return () => {
            eventEmmiter.remove();
        };
    }, [userId, shouldHandle]);
};

export default useHandleDeepLinking;
