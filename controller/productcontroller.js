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


exports.getjobs = async(req, res) => {  
    const websiteID = await getWebsiteID(); 
     const data = await fetchData(`${API_BASE_URL}/website/job-listing/get-all-jobs/${websiteID}`);
     return data || null
};
exports.getjobdetails = async (slug) => {  
    const websiteID = await getWebsiteID(); 
    const data = await fetchData(`${API_BASE_URL}/website/job-listing/get-all-jobs/${websiteID}`);

    if (data && Array.isArray(data)) {
        return data.find(job => job.seoDetails?.slug === slug) || null;
    }

    return null;
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
