const { API_BASE_URL } = require('../config/config');
const { getWebsiteID, fetchData } = require('../utils/helper');

exports.getBlog = async(req, res) => {  
    const websiteID = await getWebsiteID(); 
   
     const data = await fetchData(`${API_BASE_URL}/website/${websiteID}/posts-and-updates/get-all`);
     if (data && data.length > 0) {
        // Add formatted postDate to each blog item
        data.forEach(blog => {
            if (blog.createdAt) {
                blog.postDate = new Date(blog.createdAt).toLocaleDateString('en-GB', { 
                    day: '2-digit', 
                    month: 'short', 
                    year: 'numeric' 
                });
            } else {
                blog.postDate = "Date unavailable";
            }
        });
    }
     return data || null
};

exports.getBlogfull = async (id) => {
    try {
      const websiteID = await getWebsiteID();
      const response = await fetchData(
        `${API_BASE_URL}/website/${websiteID}/posts-and-updates/get-by-id/${id}`
      );
  
      const blog = response; // ✅ FIXED
      if (!blog) return null;
  
      // Banner normalize
      blog.banner = blog.coverBanner
        ? { bannerType: "IMAGE", image: blog.coverBanner }
        : null;
  
      // Descriptions normalize
      const descriptions = blog.description || [];
      blog.description = descriptions[0]?.description || "";
      blog.multipleDescriptions = descriptions.slice(1);
  
      // Date
      blog.postDate = blog.createdAt
        ? new Date(blog.createdAt).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "Date unavailable";
  
      return blog;
    } catch (err) {
      console.error("❌ getBlogfull failed:", err);
      return null;
    }
  };
  



exports.getlatestblogs = async (id) => {  
    const websiteID = await getWebsiteID();
    const data = await fetchData(`${API_BASE_URL}/website/${websiteID}/posts-and-updates/get-all`);

    if (!data || data.length === 0) {
        return []; // Return an empty array if no data is found
    }

    // Filter blogs with category 'BLOG' and exclude the one matching the provided slug
    const filteredBlogs = data.filter(blog =>  blog._id !== id);

    // Add formatted postDate to each blog item
    filteredBlogs.forEach(blog => {
        if (blog.createdAt) {
            try {
                blog.postDate = new Date(blog.createdAt).toLocaleDateString('en-GB', { 
                    day: '2-digit', 
                    month: 'short', 
                    year: 'numeric' 
                });
            } catch (error) {
                console.error(`Error formatting date for blog with ID ${blog._id}:`, error);
                blog.postDate = "Invalid date format";
            }
        } else {
            blog.postDate = "Date unavailable";
        }
    });

    return filteredBlogs;
};
