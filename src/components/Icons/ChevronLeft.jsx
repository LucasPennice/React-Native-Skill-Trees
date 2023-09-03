import * as React from "react";
import { Path, Svg } from "react-native-svg";

const ChevronLeft = (props) => (
    <Svg width={45} height={45} xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#BF5AF2" viewBox="0 0 24 24" {...props}>
        <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="m14 16-4-4 4-4" />
    </Svg>
);
export default ChevronLeft;
