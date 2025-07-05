import { useState } from "react";
import { Form } from "../../components/ui/form/Form.tsx";
import { AnimatePresence, motion } from "framer-motion";
import { contentForInfoForm } from "../auth/AuthPage.tsx";
import "../../styles/pages/_aboutUsPage.scss";

export const AboutUsPage = () => {
  const [pageIndex, setPageIndex] = useState(0);

  const nextPage = () =>
    setPageIndex((prev) =>
      prev < contentForInfoForm.length - 1 ? prev + 1 : prev,
    );
  const prevPage = () => setPageIndex((prev) => (prev > 0 ? prev - 1 : prev));

  return (
    <section>
      <div className="about-us-content-container">
        <button
          onClick={prevPage}
          className="about-us-nav-btn"
          id="left-button"
        >
          {"<"}
        </button>
        <Form className="info-form" style={{ margin: 0 }}>
          <AnimatePresence mode="wait">
            <motion.div
              className="info-form-content"
              key={pageIndex}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, ease: "backInOut" }}
            >
              <p id="title">{contentForInfoForm[pageIndex].title}</p>
              <p id="subtitle">{contentForInfoForm[pageIndex].subTitle}</p>
              <p id="desc">{contentForInfoForm[pageIndex].desc}</p>
            </motion.div>
          </AnimatePresence>
        </Form>
        <button
          onClick={nextPage}
          className="about-us-nav-btn"
          id="right-button"
        >
          {">"}
        </button>
      </div>

      <div className="about-us-content-pagination">
        {contentForInfoForm.map((_, index) => (
          <span
            key={index}
            className={`pagination-dot ${pageIndex === index ? "active" : ""}`}
            onClick={() => setPageIndex(index)}
          />
        ))}
      </div>
    </section>
  );
};
