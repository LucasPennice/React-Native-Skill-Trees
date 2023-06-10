import { makeid } from "../../functions/misc";
import { Milestone, MotiveToLearn, SkillLogs, SkillResource } from "../../types";

export const getDefaultFns = {
    milestones: (): Milestone => {
        return { complete: false, completedOn: undefined, description: "", title: "", id: makeid(24) };
    },
    logs: (): SkillLogs => {
        return { date: new Date().toLocaleDateString(), text: "", id: makeid(24) };
    },
    motivesToLearn: (): MotiveToLearn => {
        return { text: "", id: makeid(24) };
    },

    usefulResources: (): SkillResource => {
        return { description: "", title: "", url: undefined, id: makeid(24) };
    },
};
