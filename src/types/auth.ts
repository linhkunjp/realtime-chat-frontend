export interface AuthData {
    email: string;
    password: string;
    username?: string;
    guestId?: string | null;
}