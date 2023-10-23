import { generate24CharHexId } from "@/functions/misc";
import { Milestone, MotiveToLearn, SkillLogs, SkillResource } from "../../types";

export const getDefaultFns = {
    milestones: (): Milestone => {
        return { complete: false, completedOn: undefined, description: "", title: "", id: generate24CharHexId() };
    },
    logs: (): SkillLogs => {
        return { date: new Date().toLocaleDateString(), text: "", id: generate24CharHexId() };
    },
    motivesToLearn: (): MotiveToLearn => {
        return { text: "", id: generate24CharHexId() };
    },

    usefulResources: (): SkillResource => {
        return { description: "", title: "", url: undefined, id: generate24CharHexId() };
    },
};
