module.exports = {
    name: "Skill Trees",
    slug: "SkillTrees",
    scheme: "skilltrees",
    experiments: {
        typedRoutes: true,
        tsconfigPaths: true,
    },
    version: "1.0.58",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
        image: "./assets/splash.png",
        resizeMode: "cover",
        backgroundColor: "#000000",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
        supportsTablet: true,
        infoPlist: {
            NSPhotoLibraryUsageDescription: "Allow $(PRODUCT_NAME) to access your photos.",
            NSPhotoLibraryAddUsageDescription: "Allow $(PRODUCT_NAME) to save photos.",
        },
        bundleIdentifier: "com.lucaspennice.skilltrees",
        config: {
            usesNonExemptEncryption: false,
        },
    },
    android: {
        adaptiveIcon: {
            foregroundImage: "./assets/adaptive-icon.png",
            backgroundImage: "./assets/backgroundImage.png",
        },
        icon: "./assets/icon.png",
        permissions: [
            "android.permission.READ_EXTERNAL_STORAGE",
            "android.permission.WRITE_EXTERNAL_STORAGE",
            "android.permission.ACCESS_MEDIA_LOCATION",
            "com.google.android.gms.permission.AD_ID",
        ],
        versionCode: 64,
        package: "com.lucaspennice.skilltrees",
        intentFilters: [
            {
                action: "VIEW",
                autoVerify: true,
                data: [
                    {
                        scheme: "https",
                        host: "www.skilltreesapp.com",
                        pathPrefix: "/redirect",
                    },
                    {
                        scheme: "http",
                        host: "www.skilltreesapp.com",
                        pathPrefix: "/redirect",
                    },
                ],
                category: ["DEFAULT", "BROWSABLE"],
            },
        ],
    },
    web: {
        favicon: "./assets/favicon.png",
    },
    plugins: [
        [
            "expo-media-library",
            {
                photosPermission: "Allow $(PRODUCT_NAME) to access your photos.",
                savePhotosPermission: "Allow $(PRODUCT_NAME) to save photos.",
                isAccessMediaLocationEnabled: true,
            },
        ],
        [
            "expo-build-properties",
            {
                ios: {
                    useFrameworks: "static",
                },
            },
        ],
        "expo-router",
    ],
    extra: {
        eas: {
            projectId: "86b83f4d-998c-4e50-b891-c28787c3e0c8",
        },
        expoPublicClerkPublishableKey: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
    },
};
