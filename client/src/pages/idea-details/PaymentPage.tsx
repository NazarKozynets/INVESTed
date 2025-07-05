import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InvestIdeaRequest } from "../../types/idea.types.ts";
import { investIdea } from "../../services/idea/idea-actions.api.ts";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.tsx";
import { Form } from "../../components/ui/form/Form.tsx";
import { TextInput } from "../../components/ui/text-input/TextInput.tsx";
import Button from "../../components/ui/button/Button.tsx";

export const PaymentPage = () => {
  const queryClient = useQueryClient();
  const [fundingAmount, setFundingAmount] = useState<string>("");
  const { ideaId } = useParams();
  const { authState } = useAuth();

  const investMutation = useMutation({
    mutationFn: (amount: number) => {
      const reqBody: InvestIdeaRequest = {
        ideaId: ideaId as string,
        fundingAmount: amount,
      };
      return investIdea(reqBody);
    },
    onSuccess: () => {
      toast.success("Investment successful!");
      setFundingAmount("");
      queryClient.invalidateQueries({ queryKey: ["idea-details", ideaId] });
    },
    onError: (error) => {
      console.error(error);
      toast.error("Investment failed. Try again.");
    },
  });

  const handleInvest = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(fundingAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    investMutation.mutate(amount);
  };

  if (authState.userData?.role !== "Client") window.history.back();

  return (
    <div>
      <h1
        style={{ textAlign: "center", marginBottom: "1rem", marginTop: "5rem" }}
      >
        Support the Idea
      </h1>
      <p
        style={{
          textAlign: "center",
          color: "#ccc",
          marginBottom: "2rem",
          fontSize: 18,
        }}
      >
        Enter the amount you'd like to invest. Your support helps turn ideas
        into reality!
      </p>

      <Form className="idea-details__invest-form">
        <TextInput
          name="fundingAmount"
          type="number"
          placeholder="Enter amount"
          value={fundingAmount}
          setValue={setFundingAmount}
          min="1"
          step="0.01"
        />
        <Button
          style={{ height: 45 }}
          onClick={handleInvest}
          text={investMutation.isPending ? "Investing..." : "Invest"}
          disabled={investMutation.isPending}
        />
      </Form>
    </div>
  );
};
