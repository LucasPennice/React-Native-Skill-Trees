import { useState } from "react";
import { Dimensions, Pressable, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Animated, { FadeInDown, FadeOutUp } from "react-native-reanimated";
import EmojiJson from "../../assets/emoji.json";
import { centerFlex, colors } from "../parameters";
import AppText from "./AppText";

function EmojiSelector({
    onEmojiClick,
    selectedEmoji,
    containerWidth,
    displaceScroll,
}: {
    selectedEmoji: string | null;
    onEmojiClick: (clickedIcon: string) => void;
    containerWidth?: number;
    displaceScroll?: boolean;
}) {
    const [selectedGroup, setSelectedGroup] = useState("SmileysAndEmotions");
    const { width } = Dimensions.get("window");

    const keys = Object.keys(EmojiJson);

    //@ts-ignore
    const emojisToRender = EmojiJson[selectedGroup];

    const EMOJI_SIZE = 40;

    const columnsNumber = parseInt(`${(containerWidth ?? width - 20) / EMOJI_SIZE}`);

    return (
        <View
            style={{
                backgroundColor: "#282A2C",
                borderRadius: 10,
                paddingHorizontal: 5,
                paddingBottom: 10,
            }}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                    paddingRight: displaceScroll ? 90 : undefined,
                }}
                style={[
                    {
                        paddingTop: 5,
                        marginBottom: 15,
                        borderBottomWidth: 1,
                        borderColor: colors.line,
                    },
                ]}>
                {keys.map((key) => {
                    const uncapitalizedText = key.split(/(?=[A-Z])/)[0];
                    const text = `${uncapitalizedText[0].toUpperCase()}${uncapitalizedText.slice(1)}`;
                    return (
                        <Pressable key={key} onPress={() => setSelectedGroup(key)} style={{ paddingHorizontal: 10, paddingVertical: 5 }}>
                            <AppText fontSize={20} style={{ color: key === selectedGroup ? colors.accent : "#FFFFFF", lineHeight: 30, height: 35 }}>
                                {text}
                            </AppText>
                        </Pressable>
                    );
                })}
            </ScrollView>
            <Animated.FlatList
                showsVerticalScrollIndicator={false}
                entering={FadeInDown}
                exiting={FadeOutUp}
                key={selectedGroup}
                data={emojisToRender as string[]}
                style={{ height: 200 }}
                initialNumToRender={30}
                numColumns={columnsNumber}
                renderItem={({ item }) => {
                    return (
                        <Pressable
                            style={[
                                centerFlex,
                                {
                                    width: EMOJI_SIZE,
                                    height: EMOJI_SIZE,
                                    borderRadius: 10,
                                    backgroundColor: selectedEmoji === item ? `${colors.accent}6D` : undefined,
                                },
                            ]}
                            onPress={() => onEmojiClick(item)}>
                            <AppText fontSize={25} style={{ lineHeight: 29, color: "#FFFFFF", fontFamily: "emojisMono" }}>
                                {item}
                            </AppText>
                        </Pressable>
                    );
                }}></Animated.FlatList>
        </View>
    );
}

export default EmojiSelector;
