import React, { Suspense } from "react";
import TriggerAiContainer from "./_components/trigger-ai-container";

const TriggerAiPage = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <TriggerAiContainer />
      </Suspense>
    </div>
  );
};

export default TriggerAiPage;
