export function load({ url }) {
    const video_id = url.searchParams.get('videoid') || '/dashboard';
    return {
        video_id
    };
}