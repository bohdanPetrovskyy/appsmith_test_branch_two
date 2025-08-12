export default {
	  isLoading: true, 

    // Extract the expiry timestamp from the access token payload
    async getJWTByRefreshToken(accessToken, refreshToken) {
        try {
            const response = await fetch(`https://jwt-issuer-qa.api.festcloud.ai/hasura/token`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,  // Fixed template literal
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refreshToken }),
            });

            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);  // Fixed template literal
            }

            const data = await response.json();

            // Store the new tokens
            await storeValue('accessToken', data.token);
            await storeValue('refreshToken', data.refreshToken);

            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    },

    isTokenExpired(token) {
        try {
            const decoded = jwt_decode(token);  // You need to make sure jwt_decode is imported
            const now = Date.now().valueOf() / 1000;

            if (!decoded.exp) return true;

            return now > decoded.exp;
        } catch (error) {
            console.error('Error decoding token:', error);
            return null;
        }
    },

    async validateToken() {
        const accessToken = appsmith.store.accessToken;
        const refreshToken = appsmith.store.refreshToken;

        // Check if the token is expired
        if (accessToken && refreshToken) {
            if (this.isTokenExpired(accessToken)) {
                // Refresh token logic
                const res = await this.getJWTByRefreshToken(accessToken, refreshToken);
                return res;
            }

            return true;
        } else {
            console.error('Error. No token and refresh token from store');
            return false;
        }
    },
  
};
