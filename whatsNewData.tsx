import { colors } from "@/parameters";
import FontAwesome from "@expo/vector-icons/FontAwesome";

export type WhatsNewData = {
    title?: string;
    version: string;
    row: { title: string; subtitle: string; icon: React.JSX.Element }[];
};

export const whatsNewDataArray: WhatsNewData[] = [
    {
        version: "1.0.58",
        row: [
            {
                title: "Share how far you've come",
                subtitle: "Navigate to a Skill Tree and tap the camera icon at the top left ",
                icon: <FontAwesome name={"camera"} size={32} color={colors.softPurle} />,
            },
            {
                title: "Share Your Skill Trees",
                subtitle: "Go to 'My Trees' and click 'Share' at the top right",
                icon: <FontAwesome name={"send"} size={32} color={colors.softPurle} />,
            },
            {
                title: "Cloud Sync",
                subtitle: "We save your progress daily to our database after you log in",
                icon: <FontAwesome name={"cloud"} size={32} color={colors.softPurle} />,
            },
        ],
    },
];
