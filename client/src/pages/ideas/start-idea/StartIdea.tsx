import { Form } from "../../../components/ui/form/Form.tsx";
import "../../../styles/pages/_startIdeaPage.scss";
import { TextInput } from "../../../components/ui/text-input/TextInput.tsx";
import Button from "../../../components/ui/button/Button.tsx";
import { formatDeadline } from "../../../utils/functions/formatters.ts";
import { useStartIdeaStore } from "../../../store/StartIdeaStore.ts";
import { startIdea } from "../../../services/api/idea/start-idea.api.ts";
import { StartIdeaRequest } from "../../../types/idea.types.ts";
import { parse } from "date-fns";
import { toast } from "react-toastify";
import { useEffect } from "react";

export const StartIdea = () => {
  const {
    projectName,
    description,
    targetAmount,
    deadline,
    errors,
    setProjectName,
    setDescription,
    setTargetAmount,
    setDeadline,
    clear,
  } = useStartIdeaStore();

  const isIdeaReady =
    projectName.trim() !== "" &&
    description.trim() !== "" &&
    targetAmount.trim() !== "" &&
    deadline.trim() !== "" &&
    !errors.projectName &&
    !errors.description &&
    !errors.targetAmount &&
    !errors.deadline;

  useEffect(() => {
    return () => {
      clear();
    };
  }, []);

  const handleSubmit = async () => {
    let formattedDeadlineString = deadline;
    if (!/^\d{2}-\d{2}-\d{4}$/.test(deadline)) {
      if (/^\d{8}$/.test(deadline)) {
        formattedDeadlineString = `${deadline.slice(0, 2)}-${deadline.slice(2, 4)}-${deadline.slice(4)}`;
      } else {
        return;
      }
    }

    const parsedDeadline = parse(
      formattedDeadlineString,
      "dd-MM-yyyy",
      new Date(),
    );
    if (isNaN(parsedDeadline.getTime())) {
      console.error("Invalid Date created from:", formattedDeadlineString);
      return;
    }

    parsedDeadline.setHours(23, 59, 59, 999);

    try {
      const startIdeaRequestBody: StartIdeaRequest = {
        ideaName: projectName,
        ideaDescription: description,
        targetAmount: parseInt(targetAmount),
        fundingDeadline: parsedDeadline,
        creatorId: null,
      };

      const response = await startIdea(startIdeaRequestBody);

      if (response?.id) {
        clear();
        toast.success("Idea created successfully.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <section className="section-start-idea">
      <p id="header">START YOUR OWN IDEA</p>
      <Form className="start-idea-form">
        <div className="form-content">
          <div className="form-section">
            <label htmlFor="idea-name">Idea name</label>
            <TextInput
              name="idea-name"
              placeholder="My Awesome Idea"
              value={projectName}
              setValue={setProjectName}
              type="text"
              className="form-input"
            />
            <p className="hint-text">
              Great idea names are short and memorable.
            </p>
            {errors.projectName && (
              <p className="error-text">{errors.projectName}</p>
            )}
          </div>

          <div className="form-section">
            <label htmlFor="description">Description</label>
            <TextInput
              name="description"
              placeholder="Describe your idea..."
              value={description}
              setValue={setDescription}
              type="text"
              className="form-input"
            />
            {errors.description && (
              <p className="error-text">{errors.description}</p>
            )}
          </div>

          <div className="form-section">
            <label htmlFor="target-amount">Target amount</label>
            <TextInput
              name="target-amount"
              placeholder="e.g., 1000"
              value={targetAmount}
              setValue={setTargetAmount}
              type="number"
              className="form-input"
            />
            <p className="hint-text">
              Specify the amount you aim to raise (in your currency).
            </p>
            {errors.targetAmount && (
              <p className="error-text">{errors.targetAmount}</p>
            )}
          </div>

          <div className="form-section">
            <label htmlFor="deadline">Funding deadline </label>
            <TextInput
              name="deadline"
              placeholder="DD-MM-YYYY"
              value={formatDeadline(deadline)}
              setValue={setDeadline}
              type="text"
              className="form-input"
            />
            <p className="hint-text">
              Set the date by which you want to collect the funds (e.g.,
              31-12-2025).
            </p>
            {errors.deadline && <p className="error-text">{errors.deadline}</p>}
          </div>

          <div
            className={`in-out-form-container ${isIdeaReady ? "visible" : ""}`}
          >
            <Button
              text="Start idea"
              className="start-idea-submit-btn"
              onClick={handleSubmit}
            />
          </div>
        </div>
      </Form>
    </section>
  );
};
