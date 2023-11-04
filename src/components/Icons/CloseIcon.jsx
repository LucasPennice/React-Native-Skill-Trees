import * as React from "react";
import { Path, Svg } from "react-native-svg";
import { colors } from "../../parameters";
const CloseIcon = (props) => (
    <Svg xmlns="http://www.w3.org/2000/svg" width={30} height={30} fill="none" viewBox="0 0 24 24" {...props}>
        <Path
            stroke={colors.line}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.2}
            d="m9 9 3 3m0 0 3 3m-3-3-3 3m3-3 3-3m-3 12a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z"
        />
    </Svg>
);
export default CloseIcon;
