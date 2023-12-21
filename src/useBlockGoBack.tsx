import { useNavigation } from "expo-router";
import { useEffect } from "react";

const useBlockGoBack = (condition?: boolean) => {
    const navigation = useNavigation();

    useEffect(() => {
        if (condition === false) return;

        navigation.addListener("beforeRemove", (e) => {
            e.preventDefault();
        });

        return () => {
            navigation.removeListener("beforeRemove", (e) => {
                e.preventDefault();
            });
        };
    }, [condition]);
};

export default useBlockGoBack;
