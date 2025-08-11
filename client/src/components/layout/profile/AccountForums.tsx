import { useQuery } from "@tanstack/react-query";
import { ForumType } from "../../../types/forum.types.ts";
import { getAllClientForums } from "../../../services/api/forum/get-forums.api.ts";
import { Form } from "../../ui/form/Form.tsx";
import { LoadingOverlay } from "../../ui/loading-overlay/LoadingOverlay.tsx";
import { ForumCard } from "../forums/ForumCard.tsx";

export const AccountForums = ({ userId }: { userId: string }) => {
  const { data, isLoading, isError } = useQuery<Array<ForumType>>({
    queryKey: ["clientForums", userId],
    queryFn: () => getAllClientForums(userId || ""),
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
          <p>Failed to load your forums. Please try again later.</p>
        </div>
      </Form>
    );
  }

  return (
    <Form
      className="account-own-ideas-form"
      style={{ width: data.length === 0 ? "50%" : "60%" }}
    >
      <h2 id="header">Forums</h2>
      <div id="ideas">
        {data.length > 0 ? (
          data.map((forum: ForumType, index) => (
            <ForumCard key={index} forum={forum} />
          ))
        ) : (
          <p>You have no forums yet.</p>
        )}
      </div>
    </Form>
  );
};
