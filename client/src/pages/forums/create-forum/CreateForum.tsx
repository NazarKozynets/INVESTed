import { Form } from "../../../components/ui/form/Form.tsx";
import "../../../styles/pages/_startIdeaPage.scss";
import { TextInput } from "../../../components/ui/text-input/TextInput.tsx";
import Button from "../../../components/ui/button/Button.tsx";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { useCreateForumStore } from "../../../store/CreateForumStore.ts";
import { CreateForumRequest } from "../../../types/forum.types.ts";
import { createForum } from "../../../services/api/forum/create-forum.api.ts";
import { uploadImageFile } from "../../../services/api/cloudinary/cloudinary.api.ts";
import { CloudinaryFolderType } from "../../../types/cloudinary.types.ts";
import ImageUploader from "../../../components/ui/image-uploader/ImageUploader.tsx";
import { LoadingBar } from "../../../components/ui/loading-bar/LoadingBar.tsx";

export const CreateForum = () => {
  const {
    forumTitle,
    forumDescription,
    selectedImage,
    errors,
    setForumTitle,
    setForumDescription,
    setSelectedImage,
    clear,
  } = useCreateForumStore();

  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const isForumReady =
    forumTitle.trim() !== "" &&
    forumDescription.trim() !== "" &&
    !errors.forumTitle &&
    !errors.forumDescription;

  useEffect(() => {
    return () => {
      clear();
    };
  }, []);

  const handleImageChange = async (file: File | null) => {
    if (!file) {
      setSelectedImage(null);
      return;
    }

    try {
      setIsUploadingImage(true);
      const response = await uploadImageFile({
        folderType: CloudinaryFolderType.Forums,
        file: file,
      });
      setSelectedImage(response);
      toast.success("Image uploaded successfully.");
    } catch (error: any) {
      console.error(
        "Error uploading image:",
        error.response?.data || error.message,
      );
      setSelectedImage(null);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const createForumRequestBody: CreateForumRequest = {
        forumTitle: forumTitle.trim(),
        forumDescription: forumDescription.trim(),
        forumImageUrl: selectedImage,
        creatorId: null,
      };
      const response = await createForum(createForumRequestBody);

      if (response?.id) {
        clear();
        toast.success("Forum created successfully.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <section className="section-start-idea">
      <div id="header-create-forum">
        <p>GOT A QUESTION?</p>
        <p>SOMEONE HAS AN ANSWER!</p>
      </div>
      <Form className="start-idea-form">
        <div className="form-content">
          <div className="form-section">
            <label htmlFor="idea-name">Forum title</label>
            <TextInput
              name="idea-name"
              placeholder="What's your favourite programming language?"
              value={forumTitle}
              setValue={setForumTitle}
              type="text"
              className="form-input"
            />
            <p className="hint-text">
              Great questions are short and memorable.
            </p>
            {errors.forumTitle && (
              <p className="error-text">{errors.forumTitle}</p>
            )}
          </div>

          <div className="form-section">
            <label htmlFor="description">Detailed description</label>
            <TextInput
              name="description"
              placeholder="Describe your question here..."
              value={forumDescription}
              setValue={setForumDescription}
              type="text"
              className="form-input"
            />
            {errors.forumDescription && (
              <p className="error-text">{errors.forumDescription}</p>
            )}
          </div>
          <div className="form-section">
            <label>Upload image</label>
            {isUploadingImage ? (
              <LoadingBar />
            ) : (
              <ImageUploader
                imageUrl={selectedImage}
                onImageChange={handleImageChange}
              />
            )}
          </div>
          <div
            className={`in-out-form-container ${isForumReady ? "visible" : ""}`}
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
