// Token utility functions
export const isTokenExpired = (token: string): boolean => {
  try {
    // JWT token'ı decode et (base64)
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Date.now() / 1000;

    // exp field'ı varsa ve geçmişse true döndür
    if (payload.exp && payload.exp < currentTime) {
      return true;
    }

    return false;
  } catch {
    // Token parse edilemiyorsa expired say
    return true;
  }
};

export const getTokenFromStorage = (): string | null => {
  try {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      return null;
    }

    // Token expired ise null döndür ve temizle
    if (isTokenExpired(token)) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      return null;
    }

    return token;
  } catch (error) {
    console.error("Error getting token from storage:", error);
    return null;
  }
};

export const clearTokens = (): void => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};
