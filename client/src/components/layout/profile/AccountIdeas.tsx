import { useQuery } from "@tanstack/react-query";
import { IdeaType } from "../../../types/idea.types.ts";
import { getAllClientIdeas } from "../../../services/api/idea/get-ideas.api.ts";
import { Form } from "../../ui/form/Form.tsx";
import { LoadingOverlay } from "../../ui/loading-overlay/LoadingOverlay.tsx";
import { Idea } from "../../features/ideas/Idea.tsx";

export const AccountIdeas = ({ userId }: { userId: string }) => {
  const { data, isLoading, isError } = useQuery<Array<IdeaType>>({
    queryKey: ["clientIdeas", userId],
    queryFn: () => getAllClientIdeas(userId || ""),
    enabled: !!userId,
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
    <Form
      className="account-own-ideas-form"
      style={{ width: data.length === 0 ? "50%" : "60%" }}
    >
      <h2 id="header">Ideas</h2>
      <div id="ideas">
        {data.length > 0 ? (
          data.map((idea: IdeaType, index) => <Idea key={index} idea={idea} />)
        ) : (
          <p>You have no ideas yet.</p>
        )}
      </div>
    </Form>
  );
};
