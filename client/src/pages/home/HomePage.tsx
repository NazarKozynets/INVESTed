import { SortedIdeas } from "../../components/layout/ideas/SortedIdeas.tsx";
import { SortedForums } from "../../components/layout/forums/SortedForums.tsx";

export const HomePage = () => {
  return (
    <section
      className="home-page"
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <SortedIdeas
        seeMoreBtnOnClick={() => (window.location.href = "/ideas/all")}
      />
      <SortedForums />
    </section>
  );
};
