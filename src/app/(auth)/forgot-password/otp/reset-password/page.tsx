import React, { Suspense } from "react";
import ResetPasswordForm from "./_components/reset-password-form";
const ResetPasswordPage = () => {
  return (
    <div className="h-screen bg-[linear-gradient(180deg,_#F1FFC5_0%,_#F6FFDA_54.81%,_#FFFFFF_99.04%)]">
      <div className="w-full h-full lg:h-[86%] flex items-center justify-center">
        <Suspense fallback={<div className="text-center">Wird geladen...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
};
export default ResetPasswordPage;
