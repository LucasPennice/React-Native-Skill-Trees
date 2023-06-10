import { useRef } from "react";
import { Swipeable } from "react-native-gesture-handler";
import Animated, { Layout } from "react-native-reanimated";
import { centerFlex } from "../../parameters";
import { LeftAction, RightAction } from "./DisplayDetails/ActionButtons";
import { ObjectWithId } from "../../types";

type OnPressSkillDetail = (id: string) => void;

type Props<T> = {
    Header: JSX.Element;
    data: T[];
    RenderData: ({ data, onPress }: { data: T; onPress?: OnPressSkillDetail }) => JSX.Element;
    functions: {
        openModal: (ref: Swipeable | null, data?: T) => () => void;
        deleteData: (id: string) => void;
        onPress?: OnPressSkillDetail;
    };
};

function RenderSkillDetails<T extends ObjectWithId>({ Header, data, RenderData, functions }: Props<T>) {
    return (
        <Animated.View layout={Layout.duration(200)} style={[centerFlex, { alignItems: "flex-start", marginBottom: 10 }]}>
            {Header}

            {data.map((d, key) => (
                <RenderSwipeableData<T> key={d.id} data={d} functions={functions}>
                    {RenderData({ data: d, onPress: functions.onPress })}
                </RenderSwipeableData>
            ))}
        </Animated.View>
    );
}

function RenderSwipeableData<T extends ObjectWithId>({
    children,
    data,
    functions,
}: {
    children: JSX.Element;
    data: T;
    functions: Props<T>["functions"];
}) {
    const ref = useRef<Swipeable | null>(null);
    const { deleteData, openModal } = functions;
    return (
        <Animated.View layout={Layout.duration(200)} style={{ marginTop: 10 }}>
            <Swipeable
                ref={ref}
                renderLeftActions={LeftAction(openModal(ref.current, data))}
                renderRightActions={RightAction(() => deleteData(data.id))}>
                {children}
            </Swipeable>
        </Animated.View>
    );
}

export default RenderSkillDetails;
