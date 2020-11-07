export default {
    BASE_URL: 'https://www.instagram.com',
    LOGIN_URL: 'https://www.instagram.com/accounts/login/ajax/',
    ACCOUNT_JSON_INFO: (username: String) => `https://www.instagram.com/${username}/?__a=1`,
    FOLLOW_URL: (id: Number) => `https://www.instagram.com/web/friendships/${id}/follow/`,
    LIKE_URL: (id: Number) => `https://www.instagram.com/web/likes/${id}/like/`,
    MEDIA_JSON_INFO: (shortcode: string) => `https://www.instagram.com/p/${shortcode}/?__a=1`
}
