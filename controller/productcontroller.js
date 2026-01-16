const { API_BASE_URL } = require('../config/config');
const { getWebsiteID, fetchData } = require('../utils/helper');

exports.getProducts = async(req, res) => {  
   
    const websiteID = await getWebsiteID(); 
 
    const data = await fetchData(`${API_BASE_URL}/website/product-management/get-all-products/${websiteID}`);

    
    // Reverse the array to show products in reverse order
    if (data && Array.isArray(data)) {
        return data.reverse();
    }
    
    return data || [];
    
};

exports.getProductDetails = async(slug) => {
   
    const websiteID = await getWebsiteID(); 
 
    const data = await fetchData(`${API_BASE_URL}/website/product-management/get-product-by-slug/${websiteID}?slug=${slug}`);
 
    return data || null
}

exports.getjobs = async (req, res) => {  
    const websiteID = await getWebsiteID(); 
    const apiResponse = await fetchData(`${API_BASE_URL}/website/${websiteID}/job-openeings/get-all`);

    const items = Array.isArray(apiResponse?.data)
        ? apiResponse.data
        : (Array.isArray(apiResponse) ? apiResponse : []);

    return items;
};

exports.getjobdetails = async (slug) => {  
    try {
        const websiteID = await getWebsiteID(); 
        
        // Try multiple endpoints if needed
        const endpoints = [
            `${API_BASE_URL}/website/${websiteID}/job-openeings/get-by-id/${slug}`,
        ];
        
        let apiResponse = null;
        let lastError = null;
        
        // Try each endpoint until one works
        for (const endpoint of endpoints) {
            try {
                console.log(`Trying endpoint: ${endpoint}`);
                apiResponse = await fetchData(endpoint);
                
                // Check if we got valid data
                if (apiResponse && (apiResponse.data || apiResponse._id)) {
                    console.log(`Success with endpoint: ${endpoint}`);
                    break;
                }
            } catch (error) {
                console.log(`Endpoint failed: ${endpoint}`, error.message);
                lastError = error;
                continue;
            }
        }
        
        if (!apiResponse) {
            console.error('All endpoints failed:', lastError);
            return null;
        }
        
        // Handle different response structures
        if (apiResponse.data) {
            // Structure: { message: "...", data: {...} }
            return apiResponse.data;
        } else if (apiResponse._id) {
            // Structure: direct job object
            return apiResponse;
        } else if (Array.isArray(apiResponse) && apiResponse.length > 0) {
            // Structure: array of jobs
            return apiResponse[0];
        }
        
        console.log('No valid job data found in response:', apiResponse);
        return null;
        
    } catch (error) {
        console.error('Error in getjobdetails:', error);
        return null;
    }
};
exports.getotherjobs = async (slug) => {  
    const websiteID = await getWebsiteID(); 
    const data = await fetchData(`${API_BASE_URL}/website/job-listing/get-all-jobs/${websiteID}`);

    if (data && Array.isArray(data)) {
        return data.filter(job => job.seoDetails?.slug !== slug);
    }

    return [];
};

exports.getProductsByCategory = async(categoryId) => {  

    const websiteID = await getWebsiteID(); 
  
    
    const data = await fetchData(`${API_BASE_URL}/website/product-management/get-all-products/${websiteID}?categories=${categoryId}`);
   
    // Reverse the array to show products in reverse order
    if (data && Array.isArray(data)) {
        return data.reverse();
    }
    
    return data || [];
};

exports.getCategories = async() => {  

    const websiteID = await getWebsiteID(); 
 
    
    try {
        // First try the categories endpoint
        const categoriesData = await fetchData(`${API_BASE_URL}/website/category/get-all-categories/${websiteID}`);
  
        
        if (categoriesData && categoriesData.length > 0) {
          
            return categoriesData;
        }
        
       
        const productsData = await fetchData(`${API_BASE_URL}/website/product-management/get-all-products/${websiteID}`);
     
        
        if (productsData && productsData.length > 0) {
            // Extract unique categories from products
            const uniqueCategories = [];
            const categoryMap = new Map();
            
            productsData.forEach(product => {
                if (product.category && product.category._id && product.category.name) {
                    if (!categoryMap.has(product.category._id)) {
                        categoryMap.set(product.category._id, product.category);
                        uniqueCategories.push(product.category);
                    }
                }
            });
            
         
            return uniqueCategories;
        }
        
        return [];
    } catch (error) {
        console.error('❌ Error fetching categories:', error);
        return [];
    }
};
