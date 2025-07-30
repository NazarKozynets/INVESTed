interface UserProfileIconProps {
    onClick?: () => void;
    avatarUrl?: string | null;
    username: string | null | undefined;
    size?: number;
}

export const UserProfileIcon = ({
                                    onClick,
                                    avatarUrl,
                                    username = "Unknown",
                                    size = 40,
                                }: UserProfileIconProps) => {
    const initial =
        username && username.length > 0 ? username.charAt(0).toUpperCase() : "?";

    const resolvedBackgroundColor = username
        ? generateColorFromString(username)
        : "#ccc";

    return (
        <div
            onClick={() => onClick && onClick()}
            className="user-avatar"
            style={{
                width: size,
                height: size,
                borderRadius: "50%",
                backgroundColor: resolvedBackgroundColor,
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: `${size * 0.5}px`,
                fontWeight: "bold",
                userSelect: "none",
                overflow: "hidden",
                border: avatarUrl ? size >= 100 ? "2px solid white" : "1px solid white" : "none",
            }}
        >
            {avatarUrl ? <img src={avatarUrl} alt="" style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
                borderRadius: "6px",
            }}/> : initial}
        </div>
    );
};

const generateColorFromString = (str: string): string => {
    const colors = [
        "#FF5733",
        "#33FF57",
        "#3357FF",
        "#F033FF",
        "#FF33A8",
        "#33FFF5",
        "#8F33FF",
        "#FF8F33",
        "#33FF8F",
        "#FF3362",
        "#FFD700",
        "#00CED1",
        "#DC143C",
        "#7B68EE",
        "#00FF7F",
        "#FF69B4",
        "#CD5C5C",
        "#1E90FF",
        "#FF4500",
        "#ADFF2F",
    ];

    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
        hash = hash & hash;
    }

    const index = Math.abs(hash) % colors.length;
    return colors[index];
};
