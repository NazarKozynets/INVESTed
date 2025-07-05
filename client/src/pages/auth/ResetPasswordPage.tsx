import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { resetPassword } from "../../services/auth/auth.api.ts";
import Button from "../../components/ui/button/Button.tsx";
import { TextInput } from "../../components/ui/text-input/TextInput.tsx";
import { Form } from "../../components/ui/form/Form.tsx";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      toast.error("Invalid or missing token.");
      navigate("/");
    }
  }, [token, navigate]);

  const handleReset = async () => {
    if (!token) return;

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    const res = await resetPassword(token, newPassword.trim());
    if (res) {
      toast.success("Password successfully reset!");
      navigate("/");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Form className="auth-form" style={{ marginTop: 100 }}>
        <div className="auth-form-content">
          <div id="title-block">
            <p id="title">Reset Password</p>
            <p id="subtitle">Enter a new password for your account</p>
          </div>
          <div id="inputs-block">
            <TextInput
              name="newPassword"
              type="password"
              placeholder="New Password"
              value={newPassword}
              setValue={setNewPassword}
            />
            <TextInput
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              id="input"
              value={confirmPassword}
              setValue={setConfirmPassword}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleReset();
                }
              }}
            />
          </div>
          <div id="buttons-block">
            <Button text="Reset Password" onClick={handleReset} />
          </div>
        </div>
      </Form>
    </div>
  );
};

export default ResetPasswordPage;
