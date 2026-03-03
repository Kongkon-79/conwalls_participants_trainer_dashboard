import { Download, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Stakeholder } from "./TimeTable";

interface ListViewProps {
  stakeholders: Stakeholder[];
}

export default function ListView({ stakeholders }: ListViewProps) {
  console.log("Rendering ListView with stakeholders:", stakeholders);
  return (
    <div className="space-y-6">
      {stakeholders.map((stakeholder) => (
        <div key={stakeholder._id}>
          {/* Group header row */}
          <div className="flex items-center justify-between mb-6">
            <button className="flex items-center gap-3 bg-transparent text-[#00253E] text-lg md:text-xl lg:text-[22px] font-semibold px-4 py-2 rounded-[8px] border-y border-x-[4px] border-[#BADA55]">
              <User size={24} className="bg-[#BADA55] p-1 rounded-[8px]" />
              {stakeholder.name}
            </button>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="h-[46px] flex items-center gap-1.5 border border-[#BADA55] text-[#00253E] text-base font-medium px-5 py-1.5 rounded-[8px] hover:bg-gray-50"
              >
                <Download size={12} />
                Export PDF
              </Button>
              {/* <Button
                size="sm"
                className="h-[46px] bg-[#BADA55] flex items-center gap-1.5 border border-[#BADA55] text-[#00253E] text-base font-medium px-5 py-1.5 rounded-[8px] "
              >
                <Clock size={12} />
                Timetable
              </Button> */}
            </div>
          </div>

          {/* Measures table */}
          <div className="border border-gray-200 rounded-[16px] overflow-hidden">
            {stakeholder.measures.length === 0 ? (
              <div className="px-5 py-4 text-xs text-gray-400 bg-white">
                No measures found.
              </div>
            ) : (
              stakeholder.measures.map((measure, idx) => (
                <div
                  key={measure._id}
                  className={`bg-[#F2F2F2] border-l-[6px] border-[#BADA55] rounded-[16px] flex items-stretch ${
                    idx !== stakeholder.measures.length - 1
                      ? "border-b border-gray-200"
                      : ""
                  }`}
                >
                  {/* Week cell */}
                  <div className="w-28 flex items-center px-4">
                    <span className="text-lg md:text-xl text-black font-semibold leading-[110%] ">
                      Week {measure.startWeeks}
                    </span>
                  </div>

                  {/* Content cell */}
                  <div className="flex-1  px-5 py-3">
                    <p className="text-xl md:text-2xl lg:text-3xl text-black font-semibold leading-[110%] pb-1">
                      {measure.name}
                    </p>
                    <span
                      className={`inline-block mt-1.5 text-base md:text-lg font-semibold leading-[110%] rounded-full px-3 py-1 ${measure?.category === "communication" ? "bg-[#BADA55] text-[#00253E]" : measure?.category === "involvement" ? "bg-[#00253E] text-white" : "bg-[#9E1F62] text-white"}`}
                    >
                      {measure.category}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Change Ambassador */}
          <div className="h-[75px] bg-[#F2F2F2] px-4  rounded-[16px] mt-6 border">
            <p className="text-xl md:text-2xl lg:text-3xl text-black font-semibold leading-[110%] mt-4">
              Change Ambassador :{" "}
              <span className="text-[#00253E] font-semibold text-lg md:text-xl leading-[110%]">
                {stakeholder.name}
              </span>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
