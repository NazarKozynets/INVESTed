import {PulseLoader} from "react-spinners";
import React from "react";

interface LoadingBarProps {
    color?: string;
    size?: number;
    loading?: boolean;
    style?: React.CSSProperties;
}

export const LoadingBar = ({ color, size = 10, loading = true, style }: LoadingBarProps) => {
    return (
        <PulseLoader
            color={color ?? "white"}
            loading={loading}
            size={size}
            style={style}
        />
    );
};