import {Form} from "../../ui/form/Form.tsx";
import {useState} from "react";
import {TextInput} from "../../ui/text-input/TextInput.tsx";
import {useAuth} from "../../../context/AuthContext.tsx";
import Button from "../../ui/button/Button.tsx";
import {updateProfileFields} from "../../../services/profile/client-profile.api.ts";
import {UpdateProfileFieldsRequestData} from "../../../types/profile.types.ts";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {toast} from "react-toastify";
import {validateEmail} from "../../../utils/functions/validations.ts";
import {LoadingOverlay} from "../../ui/loading-overlay/LoadingOverlay.tsx";
import {getAllClientIdeas} from "../../../services/idea/get-ideas.api.ts";
import {IdeaType} from "../../../types/idea.types.ts";
import {Idea} from "../../features/ideas/Idea.tsx";

const AccountOwnIdeas = () => {
    const { authState } = useAuth();

    const id = authState?.userData?.userId;

    const { data, isLoading, isError } = useQuery<Array<IdeaType>>({
        queryKey: ["clientIdeas", id],
        queryFn: () => getAllClientIdeas(id || ""),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    });

    if (isLoading) {
        return (
            <Form>
                <LoadingOverlay />
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
        <Form className="account-own-ideas-form" style={{width: data.length === 0 ? '50%' : '60%'}}>
                <h2 id="header">My Ideas</h2>
               <div id="ideas">
                   {data.length > 0 ? data.map((idea: IdeaType, index) => (
                       <Idea key={index} idea={idea} />
                   )) : (
                       <p>You have no ideas yet.</p>
                   )}
               </div>
        </Form>
    );
};

const AccountSettingsForm = () => {
    const queryClient = useQueryClient();
    const {authState, checkSession} = useAuth();

    const [newUsername, setNewUsername] = useState("");
    const [newEmail, setNewEmail] = useState("");

    const {mutate, isPending} = useMutation({
        mutationFn: (data: UpdateProfileFieldsRequestData) => updateProfileFields(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['profile', authState.userData?.username]
            });

            checkSession().then(() => {
                if (newUsername && newUsername !== authState.userData?.username) {
                    window.location.href = `/profile/${newUsername}`;
                }
            });

            setNewUsername("");
            setNewEmail("");
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast.dismiss();

        if (newUsername && !newUsername.trim()) {
            toast.error("Username is required", {toastId: "username-error"});
            return;
        }

        if (newEmail && !validateEmail(newEmail)) {
            toast.error("Please enter a valid email address", {toastId: "email-error"});
            return;
        }

        // if (!validatePassword(passwordInput)) {
        //     toast.error(
        //         "Password must be: 8+ characters, 1 letter, 1 number, 1 special character",
        //         { toastId: "password-error" }
        //     );
        //     return;
        // }

        // if (passwordInput !== confirmPassword) {
        //     toast.error("Passwords do not match", { toastId: "confirm-password-error" });
        //     return;
        // }

        mutate({
            id: authState.userData?.userId!,
            username: newUsername.trim(),
            email: newEmail.trim()
        });
    };

    if (isPending) {
        return <Form><LoadingOverlay/></Form>
    }

    return (
        <Form className="account-settings-form">
            <div id="element">
                <p>Username: {authState.userData?.username}</p>
                <TextInput className="account-settings-input" name={"username"} placeholder={"Input new username"}
                           value={newUsername} setValue={setNewUsername} type={"text"}/>
                <p>Email: {authState.userData?.email}</p>
                <TextInput className="account-settings-input" name={"email"} placeholder={"Input new email"}
                           value={newEmail} setValue={setNewEmail} type={"email"}/>
            </div>

            <div className={`in-out-form-container ${newUsername || newEmail ? "visible" : ""}`}
                 style={{margin: '20px auto 0', width: '30%'}}>
                <Button text="Update profile" onClick={(e) => handleSubmit(e)} className="update-account-settings-btn"/>
            </div>
        </Form>
    )
};

export const PrivateProfile = () => {
    const [selectedForm, setSelectedForm] = useState<number | null>(null)

    const handleFormChange = (formIndex: number) => {
        if (formIndex !== selectedForm)
            setSelectedForm(formIndex);
        else
            setSelectedForm(null);
    }

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
                    Chats
                </p>
                <p
                    className={`top-buttons-title ${selectedForm == 3 ? "current" : ""}`}
                    onClick={() => handleFormChange(3)}
                >
                    Settings
                </p>
            </div>

            <div className={`in-out-form-container ${selectedForm ? "visible" : ""}`}>
                {selectedForm == 1 ? (<AccountOwnIdeas/>) : selectedForm == 2 ? (<p>chats</p>) :
                    <AccountSettingsForm/>}
            </div>
        </div>
    )
};
