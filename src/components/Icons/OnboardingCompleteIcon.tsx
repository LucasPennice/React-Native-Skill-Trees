import * as React from "react";
import Svg, { SvgProps, Circle, Path } from "react-native-svg";

const OnboardingCompletionIcon = (props: SvgProps) => (
    <Svg width={25} height={25} fill="none" {...props}>
        <Circle cx={12.5} cy={12.5} r={11.5} fill={props.fill ?? "#000"} stroke={props.stroke ?? "#50D158"} strokeWidth={2} />
        <Path stroke={props.stroke ?? "#50D158"} strokeWidth={2} d="m7 12.5 4 4 8-8" />
    </Svg>
);
export default OnboardingCompletionIcon;
