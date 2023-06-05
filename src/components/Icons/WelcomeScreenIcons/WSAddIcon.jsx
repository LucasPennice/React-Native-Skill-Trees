import * as React from "react";
import { Path, Svg } from "react-native-svg";
import { colors } from "../../../parameters";
const WSAddIcon = (props) => (
    <Svg xmlns="http://www.w3.org/2000/svg" width={45} height={45} fill="none" viewBox="0 0 24 24" {...props}>
        <Path
            stroke={colors.accent}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.2}
            d="M8 12h4m0 0h4m-4 0v4m0-4V8m0 13a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z"
        />
    </Svg>
);
export default WSAddIcon;
