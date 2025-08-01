import {Form} from "../../ui/form/Form.tsx";
import {useState} from "react";
import {useQuery} from "@tanstack/react-query";
import {LoadingOverlay} from "../../ui/loading-overlay/LoadingOverlay.tsx";
import {getAllClientIdeas} from "../../../services/api/idea/get-ideas.api.ts";
import {IdeaType} from "../../../types/idea.types.ts";
import {Idea} from "../../features/ideas/Idea.tsx";
import {AnimatePresence, motion} from "framer-motion";
import {ForumType} from "../../../types/forum.types.ts";
import {getAllClientForums} from "../../../services/api/forum/get-forums.api.ts";
import {ForumCard} from "../forums/ForumCard.tsx";
import {AccountSettingsForm} from "./AccountSettingsForm.tsx";

const AccountOwnIdeas = ({userId}: { userId: string }) => {
    const {data, isLoading, isError} = useQuery<Array<IdeaType>>({
        queryKey: ["clientIdeas", userId],
        queryFn: () => getAllClientIdeas(userId || ""),
        enabled: !!userId,
        staleTime: 5 * 60 * 1000,
    });

    if (isLoading) {
        return (
            <Form>
                <LoadingOverlay/>
            </Form>
        );
    }

    if (isError || !data) {
        return (
            <Form className="account-own-ideas-form">
                <div>
                    <p>Failed to load ideas. Please try again later.</p>
                </div>
            </Form>
        );
    }

    return (
        <Form
            className="account-own-ideas-form"
            style={{width: data.length === 0 ? "50%" : "60%"}}
        >
            <h2 id="header">Ideas</h2>
            <div id="ideas">
                {data.length > 0 ? (
                    data.map((idea: IdeaType, index) => <Idea key={index} idea={idea}/>)
                ) : (
                    <p>You have no ideas yet.</p>
                )}
            </div>
        </Form>
    );
};

const AccountOwnForums = ({userId}: { userId: string }) => {
    const {data, isLoading, isError} = useQuery<Array<ForumType>>({
        queryKey: ["clientForums", userId],
        queryFn: () => getAllClientForums(userId || ""),
        enabled: !!userId,
        staleTime: 5 * 60 * 1000,
    });

    if (isLoading) {
        return (
            <Form>
                <LoadingOverlay/>
            </Form>
        );
    }

    if (isError || !data) {
        return (
            <Form className="account-own-ideas-form">
                <div>
                    <p>Failed to load your forums. Please try again later.</p>
                </div>
            </Form>
        );
    }

    return (
        <Form
            className="account-own-ideas-form"
            style={{width: data.length === 0 ? "50%" : "60%"}}
        >
            <h2 id="header">Forums</h2>
            <div id="ideas">
                {data.length > 0 ? (
                    data.map((forum: ForumType, index) => (
                        <ForumCard key={index} forum={forum}/>
                    ))
                ) : (
                    <p>You have no forums yet.</p>
                )}
            </div>
        </Form>
    );
};

interface PrivateProfileProps {
    userId: string;
    canEdit: boolean;
}

export const ProfileUserProjects = ({userId, canEdit}: PrivateProfileProps) => {
    const [selectedForm, setSelectedForm] = useState<number>(1);

    const handleFormChange = (formIndex: number) => {
        if (formIndex !== selectedForm) setSelectedForm(formIndex);
        else setSelectedForm(1);
    };

    const renderContent = () => {
        switch (selectedForm) {
            case 1:
                return <AccountOwnIdeas userId={userId}/>;
            case 2:
                return <AccountOwnForums userId={userId}/>;
            case 3:
                return canEdit ? <AccountSettingsForm/> : null;
            default:
                return null;
        }
    };

    return (
        <div className="private-profile-section">
            <div id="top-buttons">
                <p
                    className={`top-buttons-title ${selectedForm == 1 ? "current" : ""}`}
                    onClick={() => handleFormChange(1)}
                >
                    Ideas
                </p>
                <p
                    className={`top-buttons-title ${selectedForm == 2 ? "current" : ""}`}
                    onClick={() => handleFormChange(2)}
                >
                    Forums
                </p>
                {canEdit && (
                    <p
                        className={`top-buttons-title ${selectedForm == 3 ? "current" : ""}`}
                        onClick={() => handleFormChange(3)}
                    >
                        Settings
                    </p>
                )}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={selectedForm}
                    className={`in-out-form-container ${selectedForm ? "visible" : ""}`}
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    exit={{opacity: 0}}
                    transition={{duration: 0.3, ease: "easeInOut"}}
                >
                    {renderContent()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
