import * as React from "react";
import { Path, Svg } from "react-native-svg";
import { colors } from "../../parameters";

const ShareScreenshotIcon = (props) => (
    <Svg xmlns="http://www.w3.org/2000/svg" width={30} height={30} fill="none" viewBox="0 0 24 24" {...props}>
        <Path
            stroke={colors.unmarkedText}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.2}
            d="m9 13.5 6 3m0-9-6 3M18 21a3 3 0 1 1 0-6 3 3 0 0 1 0 6ZM6 15a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm12-6a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z"
        />
    </Svg>
);
export default ShareScreenshotIcon;
