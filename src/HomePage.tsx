import { Canvas, Circle } from "@shopify/react-native-skia";
import { Button, Text, View } from "react-native";
import CanvasTest from "./canvas/CanvasTest";
import { useAppDispatch, useAppSelector } from "./reduxHooks";
import MyComponent from "./Test";

function HomePage() {
    // const isLogged = useAppSelector((state) => state.coordinatesInCanvas);

    // console.log(isLogged);
    // const dispatch = useAppDispatch();

    return (
        <View style={{}}>
            <CanvasTest />
            {/* <MyComponent /> */}
        </View>
    );
}

export default HomePage;
