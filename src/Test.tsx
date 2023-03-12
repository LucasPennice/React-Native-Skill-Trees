import { useEffect } from "react";
import { Canvas, Rect, mix, useSharedValueEffect, useValue } from "@shopify/react-native-skia";
import { useSharedValue, withRepeat, withTiming } from "react-native-reanimated";

const MyComponent = () => {
    const x = useValue(0);
    const progress = useSharedValue(0);

    useEffect(() => {
        progress.value = withRepeat(withTiming(1, { duration: 3000 }), -1, true);
    }, [progress]);

    useSharedValueEffect(() => {
        x.current = mix(progress.value, 0, 100);
    }, progress); // you can pass other shared values as extra parameters

    return (
        <Canvas style={{ width: 500, height: 500 }}>
            <Rect x={x} y={100} width={10} height={10} color="red" />
        </Canvas>
    );
};

export default MyComponent;
