import { View } from "react-native";
import TreeView from "./canvas/TreeView";
import ChildrenHoistSelectorModal from "./modals/ChildrenHoistSelector";
import ProgressIndicatorAndName from "./components/ProgressIndicatorAndName";
import SettingsMenu from "./components/SettingsMenu";
import TreeSelectorModal from "./modals/TreeSelectorModal";
import ChooseTree from "./ChooseTree";
import { CIRCLE_SIZE, colors } from "./canvas/parameters";
import { useAppSelector } from "../../redux/reduxHooks";
import { selectCurrentTree } from "../../redux/currentTreeSlice";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import AppText from "../../AppText";
import { centerFlex } from "../../types";
import { useState } from "react";

export const NAV_HEGIHT = 65;

function HomePage() {
    const { value: currentTree } = useAppSelector(selectCurrentTree);

    const [foo, setFoo] = useState({ x: 0, y: 0 });

    const startingPosition = { x: 0, y: 0 };

    const position = useSharedValue(startingPosition);

    const panGesture = Gesture.Pan()
        .onUpdate((e) => {
            position.value = { x: e.translationX + startingPosition.x, y: e.translationY + startingPosition.y };

            const x = parseInt(`${position.value.x}`);
            const y = parseInt(`${position.value.y}`);

            runOnJS(setFoo)({ x, y });
        })
        .onEnd((e) => {
            position.value = startingPosition;
        })
        .activateAfterLongPress(0);

    const animatedStyle = useAnimatedStyle(() => ({
        left: withSpring(position.value.x, { damping: 27, stiffness: 500 }),
        top: withSpring(position.value.y, { damping: 27, stiffness: 500 }),
    }));

    //Para evitar tantos rerenders de tree view
    //Le voy a pasar un prop que sea que sea sobre que rectangulo esta el new node (o directamente el arbol al q animar y a la goma)
    //Para eso probablemente tenga que hoistear bastantes giladas de TreeView
    //Antes de hacer eso tengo que refactorizar HomePage

    return (
        <View style={{ position: "relative", backgroundColor: colors.background }}>
            <TreeView foo={foo} />
            <GestureDetector gesture={panGesture}>
                <Animated.View
                    style={[
                        animatedStyle,
                        centerFlex,
                        {
                            position: "absolute",
                            width: 2 * CIRCLE_SIZE,
                            height: 2 * CIRCLE_SIZE,
                            backgroundColor: colors.background,
                            borderWidth: 2,
                            borderRadius: CIRCLE_SIZE,
                            borderColor: colors.accent,
                        },
                    ]}>
                    <AppText style={{ fontSize: 22, color: "white", transform: [{ translateY: -2 }] }}>+</AppText>
                </Animated.View>
            </GestureDetector>
            <ProgressIndicatorAndName />
            <ChooseTree />
            {currentTree !== undefined && <SettingsMenu />}

            <TreeSelectorModal />
            <ChildrenHoistSelectorModal />
        </View>
    );
}

export default HomePage;
