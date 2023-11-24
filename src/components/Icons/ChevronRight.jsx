import * as React from "react";
import { Path, Svg } from "react-native-svg";
import { colors } from "../../parameters";

const ChevronRight = (props) => (
    <Svg width={30} height={30} fill="none" viewBox="0 0 24 24" {...props}>
        <Path stroke={props.color ?? colors.accent} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="m10 8 4 4-4 4" />
    </Svg>
);
export default ChevronRight;
