interface UserProfileIconProps {
    onClick?: () => void;
    username: string;
    size?: number;
}

export const UserProfileIcon = ({onClick, username, size = 40} : UserProfileIconProps) => {
    const initial = username && username.length > 0 ? username.charAt(0).toUpperCase() : "?";

    const resolvedBackgroundColor = username ? generateColorFromString(username) : "#ccc";

    return (
        <div
            onClick={() => onClick && onClick()}
            className="user-avatar"
            style={{
                width: size,
                height: size,
                borderRadius: "50%",
                backgroundColor: resolvedBackgroundColor,
                color: 'white',
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: `${size * 0.5}px`,
                fontWeight: "bold",
            }}
        >
            {initial}
        </div>
    );
};

const generateColorFromString = (str: string) => {
    const colors = [
        "#FF5733", "#33FF57", "#3357FF", "#F033FF", "#FF33A8",
        "#33FFF5", "#8F33FF", "#FF8F33", "#33FF8F", "#FF3362"
    ];

    if (!str || str.length === 0) return "#ccc";

    const hash = str.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
};
