import { Redirect } from "expo-router";
import { routes } from "../routes";
//🚨 IGNORE THIS PAGE 🚨

function Index() {
    return <Redirect href={routes.home.route} />;
}

export default Index;
