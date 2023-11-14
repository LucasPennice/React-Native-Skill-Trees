import * as React from "react";
import Svg, { SvgProps, Path, Circle, Rect, Defs, LinearGradient, Stop } from "react-native-svg";
const LogoIcon = (props: SvgProps) => (
    <Svg width={50} height={50} fill="none" {...props}>
        <Path fill="url(#a)" d="M0 10C0 4.477 4.477 0 10 0h30c5.523 0 10 4.477 10 10v30c0 5.523-4.477 10-10 10H10C4.477 50 0 45.523 0 40V10Z" />
        <Circle cx={37.85} cy={34.015} r={3.562} stroke="#fff" strokeWidth={1.355} />
        <Circle cx={25} cy={34.015} r={3.562} stroke="#fff" strokeWidth={1.355} />
        <Circle cx={12.15} cy={34.015} r={3.562} stroke="#fff" strokeWidth={1.355} />
        <Circle cx={25} cy={16.056} r={3.562} stroke="#fff" strokeWidth={1.355} />
        <Path stroke="#fff" strokeWidth={1.224} d="M25.049 20.231c0 9.922 12.85 1.156 12.85 9.922M24.951 20.264c0 9.863-12.842 1.149-12.842 9.863" />
        <Rect width={1.224} height={10.971} x={24.388} y={19.548} fill="#fff" rx={0.612} />
        <Defs>
            <LinearGradient id="a" x1={0.684} x2={48.755} y1={0.195} y2={50.22} gradientUnits="userSpaceOnUse">
                <Stop stopColor="#BF5AF2" />
                <Stop offset={1} stopColor="#6287F7" />
            </LinearGradient>
        </Defs>
    </Svg>
);
export default LogoIcon;
