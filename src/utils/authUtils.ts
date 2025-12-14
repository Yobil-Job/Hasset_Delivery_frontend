import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
    exp: number;
    role: string;
    sub: string;
}

export const isTokenExpired = (token: string): boolean => {
    try {
        const decoded = jwtDecode<DecodedToken>(token);
        const currentTime = Date.now() / 1000;
        return decoded.exp < currentTime;
    } catch (error) {
        return true;
    }
};

export const getRoleFromToken = (token: string): string | null => {
    try {
        const decoded = jwtDecode<DecodedToken>(token);
        return decoded.role;
    } catch (error) {
        return null;
    }
};
