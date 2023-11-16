import { generateMongoCompliantId } from "@/functions/misc";
import { Milestone, MotiveToLearn, SkillLogs, SkillResource } from "../../types";

export const getDefaultFns = {
    milestones: (): Milestone => {
        return { complete: false, completedOn: undefined, description: "", title: "", id: generateMongoCompliantId() };
    },
    logs: (): SkillLogs => {
        return { date: new Date().toLocaleDateString(), text: "", id: generateMongoCompliantId() };
    },
    motivesToLearn: (): MotiveToLearn => {
        return { text: "", id: generateMongoCompliantId() };
    },

    usefulResources: (): SkillResource => {
        return { description: "", title: "", url: undefined, id: generateMongoCompliantId() };
    },
};
