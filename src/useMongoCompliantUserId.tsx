import { useAuth } from "@clerk/clerk-expo";

const idToHexString = (userId: string) => {
    const encoder = new TextEncoder();

    const uint8Array = encoder.encode(userId);

    const hexEncoded: string = Array.from(uint8Array)
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");

    return hexEncoded;
};

// const hexToOriginalString = (hexString: string) => {
//     const hexDecodedUint8Array = new Uint8Array(hexString.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)));
//     const decoder = new TextDecoder();
//     const decodedString: string = decoder.decode(hexDecodedUint8Array);

//     return decodedString;
// };

function useMongoCompliantUserId() {
    const { userId } = useAuth();

    if (userId === null || userId === undefined) return null;

    return idToHexString(userId);
}

export default useMongoCompliantUserId;
