import React from "react";
import LoginForm from "./_components/login-form";

const LoginPage = () => {
  return (
    <div className="h-full bg-[linear-gradient(180deg,_#F1FFC5_0%,_#F6FFDA_54.81%,_#FFFFFF_99.04%)] py-10">
      <div className="w-full h-full lg:h-[86%] flex items-center justify-center">
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
