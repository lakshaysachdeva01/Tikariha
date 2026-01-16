const { API_BASE_URL } = require('../config/config');
const { getWebsiteID, fetchData } = require('../utils/helper');

const normalizeGallery = (albums = []) => {
    return albums.map(album => {
      const images = Array.isArray(album.multiImages) ? album.multiImages : [];
      const videos = Array.isArray(album.videoLink)
        ? album.videoLink.map(v => v.link).filter(Boolean)
        : [];
  
      return {
        id: album._id,
        title: album.albumName,
        mediaDetails: {
          mediaType:
            images.length > 0 ? "IMAGE" :
            videos.length > 0 ? "VIDEO" : null,
          images,
          videoLinks: videos
        },
        createdAt: album.createdAt
      };
    });
  };
  exports.getgallery = async () => {
    try {
        const websiteID = await getWebsiteID(); 
        const response = await fetchData(
            `${API_BASE_URL}/website/${websiteID}/gallery/get-all`
        );

        console.log("API RESPONSE FULL:", JSON.stringify(response, null, 2)); // Full response
        
        // Check if response exists and has data
        if (response && Array.isArray(response)) {
            // If response is directly an array
            console.log("Returning direct array with", response.length, "items");
            return response;
        } else if (response && response.data && Array.isArray(response.data)) {
            // If response has data property
            console.log("Returning response.data array with", response.data.length, "items");
            return response.data;
        } else if (response && Array.isArray(response.data)) {
            // Another check
            console.log("Returning response.data array (alternative) with", response.data.length, "items");
            return response.data;
        }
        
        console.log("No valid data found in response, returning empty array");
        return [];
    } catch (error) {
        console.error("Error in getgallery:", error);
        return [];
    }
};
  
  exports.getgalleryalbum = async (title) => {
    try {
      const websiteID = await getWebsiteID();
      const response = await fetchData(
        `${API_BASE_URL}/website/${websiteID}/gallery/get-all`
      );
  
      const rawData = Array.isArray(response?.data) ? response.data : [];
      const gallery = normalizeGallery(rawData);
  
      return gallery.filter(
        album => album.title.toLowerCase() === title.toLowerCase()
      );
    } catch (err) {
      console.error("❌ getgalleryalbum failed:", err);
      return [];
    }
  };

  
  exports.getLatestGalleryImages = async () => {
    try {
      const websiteID = await getWebsiteID();
      const response = await fetchData(
        `${API_BASE_URL}/website/${websiteID}/gallery/get-all`
      );
  
      const rawData = Array.isArray(response?.data) ? response.data : [];
      const gallery = normalizeGallery(rawData);
  
      const images = gallery.flatMap(album =>
        album.mediaDetails.images.map(image => ({
          url: `${process.env.S3_BASE_URL + image}`,
          title: album.title
        }))
      );
  
      return images.slice(-4).reverse();
    } catch (err) {
      console.error("❌ getLatestGalleryImages failed:", err);
      return [];
    }
  };
  