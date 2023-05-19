import { Skill } from "../../types";

function useUpdateTreeWithNewSkillDetails(updatedSkill: Skill) {
    const updateSkillDetails = () => {
        console.log("save changes to storage");
    };

    return updateSkillDetails;
}

export default useUpdateTreeWithNewSkillDetails;
