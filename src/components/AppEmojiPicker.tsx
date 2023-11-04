import { colors } from "@/parameters";
import EmojiPicker, { emojisByCategory } from "rn-emoji-keyboard";

export const findEmoji = (emojiToFind: string) => {
    let foundEmoji: Emoji | undefined = undefined;

    for (const [, value] of Object.entries(emojisByCategory)) {
        const found = value.data.find((emoji) => emoji.emoji === emojiToFind);

        if (found) foundEmoji = { ...found, slug: "foo", unicode_version: "foo" };
    }

    if (!foundEmoji) throw new Error(`${emojiToFind} was not found, please screenshot this and send it to the email found in community page`);

    return foundEmoji;
};

const getCustomEmojis = () => {
    const newEmojiSet: typeof emojisByCategory = [];
    for (const [, value] of Object.entries(emojisByCategory)) {
        const newData = value.data.filter((emoji) => {
            return emoji.toneEnabled === false;
        });

        newEmojiSet.push({
            title: value.title,
            data: newData,
        });
    }
    return newEmojiSet;
};

const noTonedEmojis = getCustomEmojis();

export type Emoji = {
    emoji: string;
    name: string;
    slug: string;
    unicode_version: string;
    toneEnabled: boolean;
};

function AppEmojiPicker({
    state,
    onEmojiSelected,
    selectedEmojisName,
}: {
    state: [boolean, (v: boolean) => void];
    onEmojiSelected: (v: Emoji) => void;
    selectedEmojisName?: string[];
}) {
    const [open, setOpen] = state;
    return (
        <EmojiPicker
            selectedEmojis={selectedEmojisName}
            onEmojiSelected={onEmojiSelected}
            enableCategoryChangeGesture
            open={open}
            theme={{
                container: colors.darkGray,
                header: colors.white,
                search: { placeholder: colors.unmarkedText, text: colors.white, icon: colors.white, background: "#515053" },
                category: { container: "#515053", iconActive: colors.accent, icon: colors.white },
                emoji: { selected: `${colors.white}80` },
            }}
            enableSearchBar
            onClose={() => setOpen(false)}
            emojisByCategory={noTonedEmojis}
        />
    );
}

export default AppEmojiPicker;
