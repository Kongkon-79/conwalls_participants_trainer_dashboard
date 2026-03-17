import React, { Suspense } from "react";
import KickOffStoryAiContainer from "./_components/kick-off-story-ai-container";

const KickOffStory = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <KickOffStoryAiContainer />
      </Suspense>
    </div>
  );
};

export default KickOffStory;
