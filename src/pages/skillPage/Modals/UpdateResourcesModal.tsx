import { useEffect, useState } from "react";
import { Alert } from "react-native";
import AppText from "../../../components/AppText";
import AppTextInput from "../../../components/AppTextInput";
import FlingToDismissModal from "../../../components/FlingToDismissModal";
import { SkillModal, SkillResource } from "../../../types";
import { getDefaultFns } from "../functions";

type ModalProps = {
    state: SkillModal<SkillResource>;
    closeModal: () => void;
    mutateSkillResources: (newSkillResources: SkillResource[]) => void;
    resources: SkillResource[];
};

function UpdateResourcesModal({ closeModal, resources, mutateSkillResources, state }: ModalProps) {
    //Props
    const { data, open } = state;
    //Local State
    const [title, setTitle] = useState<SkillResource["title"]>(data.title);
    const [description, setDescription] = useState<SkillResource["description"]>(data.description);
    const [url, setUrl] = useState<SkillResource["url"]>(data.url);

    const newSkillResource: SkillResource = { description, title, url, id: state.data.id };

    const isEditing = checkIfEditing();

    const updateSkillDetailsIfNewLogValid = (newSkillResource: SkillResource, editing: boolean) => () => {
        const valid = title !== "";

        if (!valid) return Alert.alert("Title cannot be empty");

        if (editing) return updateMilestone(newSkillResource);

        addMilestone(newSkillResource);

        function addMilestone(newSkillResource: SkillResource) {
            const result = [...resources, newSkillResource];
            mutateSkillResources(result);
            closeModal();
        }
        function updateMilestone(newSkillResource: SkillResource) {
            const result = resources.map((milestone) => {
                if (milestone.id === newSkillResource.id) return newSkillResource;

                return milestone;
            });
            mutateSkillResources(result);
            closeModal();
        }
    };

    useEffect(() => {
        if (state.open) {
            setTitle(state.data.title);
            setDescription(state.data.description);
            setUrl(state.data.url);
            return;
        }

        const defaultResource = getDefaultFns.usefulResources();

        setTitle(defaultResource.title);
        setDescription(defaultResource.description);
        setUrl(defaultResource.url);
    }, [state]);

    return (
        <FlingToDismissModal
            closeModal={closeModal}
            open={open}
            leftHeaderButton={{ onPress: updateSkillDetailsIfNewLogValid(newSkillResource, isEditing), title: isEditing ? "Edit" : "Add" }}>
            <>
                <AppText fontSize={24} style={{ color: "#FFFFFF", fontFamily: "helveticaBold", marginBottom: 5 }}>
                    Resource Name
                </AppText>
                <AppTextInput placeholder={"Youtube Channel"} textState={[title, setTitle]} />
                <AppText fontSize={24} style={{ color: "#FFFFFF", fontFamily: "helveticaBold", marginBottom: 5, marginTop: 10 }}>
                    Description
                </AppText>
                <AppTextInput placeholder={"Software development tutorials"} textState={[description, setDescription]} />
                <AppText fontSize={24} style={{ color: "#FFFFFF", fontFamily: "helveticaBold", marginBottom: 5, marginTop: 10 }}>
                    Link to Resource
                </AppText>
                <AppTextInput placeholder={"https://url.com"} textState={[url ?? "", setUrl]} />
            </>
        </FlingToDismissModal>
    );

    function checkIfEditing() {
        let defaultResource = getDefaultFns.usefulResources();
        let defaultResourceWithNoId = {
            description: defaultResource.description,
            title: defaultResource.title,
            url: defaultResource.url,
        };

        let stateResource = state.data;
        let stateResourceWithNoId = {
            description: stateResource.description,
            title: stateResource.title,
            url: stateResource.url,
        };

        return JSON.stringify(defaultResourceWithNoId) !== JSON.stringify(stateResourceWithNoId);
    }
}

export default UpdateResourcesModal;
