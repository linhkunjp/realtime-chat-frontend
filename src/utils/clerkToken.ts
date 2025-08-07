
import { useAuth } from '@clerk/vue';

export async function fetchClerkToken(): Promise<string | null> {
    const { getToken } = useAuth();

    if (getToken) {
        try {
            const token = await getToken.value();
            return token;
        } catch (e) {
            console.error("Failed to get Clerk token:", e);
            return null;
        }
    }

    return null;
}
