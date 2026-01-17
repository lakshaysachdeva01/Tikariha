const { API_BASE_URL } = require('../config/config');
const { getWebsiteID, fetchData } = require('../utils/helper');

exports.getHomeDesktopBanner = async(req, res) => {  
    const websiteID = await getWebsiteID(); 
     const data = await fetchData(`${API_BASE_URL}/website/${websiteID}/banners/get-all?bannerType=HERO_BANNER`);
     return data || null
     
};

exports.getAdBanner = async(req, res) => {  
    const websiteID = await getWebsiteID(); 
     const data = await fetchData(`${API_BASE_URL}/website/banner/get-all-banners/${websiteID}?type=AD_BANNER`);
     return data || null
     
};

exports.getHomepopupBanner = async () => {
    try {
        const websiteID = await getWebsiteID();
        const data = await fetchData(`${API_BASE_URL}/website/${websiteID}/banners/get-all?bannerType=POPUP_BANNER`);

        if (data && Array.isArray(data) && data.length > 0) {
            return data; // Return banners
        } else {
            return []; // Return empty array if no banners
        }
    } catch (error) {
        
        return []; // Return empty array on error
    }
};



exports.gettestimonial = async(req, res) => {  
    const websiteID = await getWebsiteID(); 
     const data = await fetchData(`${API_BASE_URL}/website/${websiteID}/testimonials/get-all`);
     return data || null
};


exports.getclientle = async(req, res) => {  
    const websiteID = await getWebsiteID(); 
     const data = await fetchData(`${API_BASE_URL}/website/${websiteID}/associations-management/get-all`);
     return data || null
};



