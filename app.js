require('dotenv').config();  // Load environment variables from .env file
const { API_BASE_URL , WEBSITE_ID_KEY, S3_BASE_URL} = require('./config/config');
const { getWebsiteID } = require('./utils/helper');
const { getHomeDesktopBanner ,gettestimonial ,getAdBanner,getHomepopupBanner ,getclientle  } = require('./controller/homecontroller');
const { getBlog ,getBlogfull, getlatestblogs} = require('./controller/blogcontroller');
const { getgallery,getLatestGalleryImages} = require('./controller/gallerycontroller');
const { getProducts, getProductDetails, getProductsByCategory, getCategories ,getjobs,getjobdetails,getotherjobs} = require('./controller/productcontroller');
const { CONTACT_ENQUIRY_DYNAMIC_FIELDS_KEYS  , BOOKING_ENQUIRY_DYNAMIC_FIELDS_KEYS, SERVICE_ENQUIRY_DYNAMIC_FIELDS_KEYS} = require('./config/config');

const express = require('express');
const path = require('path');
const app = express();
const port = 3000;
const metaLogoPath = "/assets/images/Logo/Tikariha_Meta.jpg";
// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Define the views directory

// Serve static files (like CSS, images) from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware to fetch categories and make them available to all routes
app.use(async (req, res, next) => {
    try {
        const categories = await getCategories();
      
        res.locals.categories = categories;
        next();
    } catch (error) {
      
        res.locals.categories = [];
        next();
    }
});

app.get('/', async (req, res) => {
    const baseUrl = req.protocol + '://' + req.get('Host');
    const websiteID = await getWebsiteID();
//     const banners = await getHomeDesktopBanner();
    const testimonial = await gettestimonial();
    const projects = await getProducts();
    const blogs = await getBlog();
//     const gallery= await getgallery();
// //     const products = await getProducts();
//     const clients = await getclientle();
    const popupbanners = await getHomepopupBanner();
//    const latestImages = await getLatestGalleryImages();
   const seoDetails = {
    title: " ",
    metaDescription: "",
    metaImage: `${baseUrl}/${metaLogoPath}`,
    keywords: "",
    canonical: `${baseUrl}`,
};


    res.render('index', {body: "",websiteID,baseUrl,testimonial,seoDetails,projects,blogs,popupbanners});
});


app.get('/about', async (req, res) => {
    const baseUrl = req.protocol + '://' + req.get('Host');
    const seoDetails = {
        title: "",
        metaDescription: "",
        metaImage: `${baseUrl}/${metaLogoPath}`,
        keywords: "",
        canonical: `${baseUrl}/about`,
    };
    
   
    res.render('about', {body: "",baseUrl, seoDetails});
});


app.get('/projects', async (req, res) => {
    const baseUrl = req.protocol + '://' + req.get('Host');
    const websiteID = await getWebsiteID();
    const projects = await getProducts();
    const seoDetails = {
        title: "",
        metaDescription: "",
        metaImage: `${baseUrl}/${metaLogoPath}`,
        keywords: "",
        canonical: `${baseUrl}/projects`,
    };
    
   
    res.render('locations', {body: "",baseUrl, seoDetails,projects,websiteID});
});



app.get('/project/:id', async (req, res) => {
    const baseUrl = req.protocol + '://' + req.get('Host');
    const { id } = req.params;
    const projectDetails = await getProductDetails(id);
    const websiteID = await getWebsiteID();

    if (!projectDetails) {
        return res.redirect('/projects');
    }

    const seoDetails = {
        title: projectDetails.title || "Project Details",
        metaDescription: projectDetails.description ? projectDetails.description.replace(/<[^>]*>/g, '').substring(0, 160) : "",
        metaImage: `${baseUrl}/${metaLogoPath}`,
        keywords: projectDetails.keywords || "",
        canonical: `${baseUrl}/project/${id}`,
    };

    res.render('details', {
        body: "",
        baseUrl,
        project: projectDetails,
        seoDetails,
        S3_BASE_URL,
        API_BASE_URL,
        WEBSITE_ID_KEY,
        websiteID,
        projectDetails
    });
});





app.get('/services', async (req, res) => {
    const baseUrl = req.protocol + '://' + req.get('Host');
    const websiteID = await getWebsiteID(); 

    const seoDetails = {
        title: "",
        metaDescription: "",
        metaImage: `${baseUrl}/${metaLogoPath}`,
        keywords: "",
        canonical: `${baseUrl}/services`,
    };
    
    // Normalize query parameters (handle both 'enq' and 'eng' typos)
    const query = {
        enq: req.query.enq || req.query.eng || null
    };
    
    res.render('services', {
        body: "",
        baseUrl, 
        seoDetails, 
        SERVICE_ENQUIRY_DYNAMIC_FIELDS_KEYS,
        API_BASE_URL,
        WEBSITE_ID_KEY,
        websiteID,
        query // Pass the normalized query object
    });
});


app.get('/gallery', async (req, res) => {
    const baseUrl = req.protocol + '://' + req.get('Host');
    
    try {
        const rawGallery = await getgallery();
        
        console.log("=== DEBUG INFO ===");
        console.log("Raw gallery:", rawGallery);
        console.log("Raw gallery type:", typeof rawGallery);
        console.log("Is array?", Array.isArray(rawGallery));
        console.log("Length:", rawGallery ? rawGallery.length : 0);
        
        // Check if we have data
        if (!rawGallery || !Array.isArray(rawGallery) || rawGallery.length === 0) {
            console.log("WARNING: No gallery data found!");
        }
        
        // Try to normalize only if we have data and function exists
        let normalizedGallery = [];
        if (typeof normalizeGallery === 'function' && rawGallery && rawGallery.length > 0) {
            normalizedGallery = normalizeGallery(rawGallery);
        } else {
            console.log("normalizeGallery function not available or no data to normalize");
        }

        const seoDetails = {
            title: "Tikariha Gallery",
            metaDescription: "",
            metaImage: `${baseUrl}/${metaLogoPath}`,
            keywords: "",
            canonical: `${baseUrl}/gallery`,
        };

        res.render('gallery', { 
            body: "", 
            gallery: rawGallery || [], 
            normalizedGallery: normalizedGallery || [],
            seoDetails 
        });
    } catch (error) {
        console.error("Error in /gallery route:", error);
        // Even if there's an error, render the page with empty data
        res.render('gallery', { 
            body: "", 
            gallery: [], 
            normalizedGallery: [],
            seoDetails: {
                title: "Gallery",
                metaDescription: "",
                metaImage: `${req.protocol}://${req.get('Host')}/${metaLogoPath}`,
                keywords: "",
                canonical: `${req.protocol}://${req.get('Host')}/gallery`,
            }
        });
    }
});


app.get('/contact', async (req, res) => {
    const baseUrl = req.protocol + '://' + req.get('Host');
    const websiteID = await getWebsiteID(); 
    
    const seoDetails = {
        title: "",
        metaDescription: "",
        metaImage: `${baseUrl}/${metaLogoPath}`,
        keywords: "",
        canonical: `${baseUrl}/contact`,
    };

    res.render('contact', { body: "", websiteID, API_BASE_URL, WEBSITE_ID_KEY, CONTACT_ENQUIRY_DYNAMIC_FIELDS_KEYS, seoDetails });
});



// app.get('/career', async (req, res) => {
//     const baseUrl = req.protocol + '://' + req.get('Host');
//     const websiteID = await getWebsiteID();
    
//     const seoDetails = {
//         title: "",
//         metaDescription: "",
//         metaImage: `${baseUrl}/${metaLogoPath}`,
//         keywords: "",
//         canonical: `${baseUrl}/career`,
//     };

//     res.render('career', { body: "", seoDetails, websiteID, API_BASE_URL, WEBSITE_ID_KEY, CAREER_ENQUIRY_DYNAMIC_FIELDS_KEYS });
// });


app.get('/posts', async (req, res) => {
    const baseUrl = req.protocol + '://' + req.get('Host');
  
    const blogs = await getBlog();
    const seoDetails = {
        title: "",
        metaDescription: "",
        metaImage: `${baseUrl}/${metaLogoPath}`,
        keywords: "",
        canonical: `${baseUrl}/blogs`,
    };

    res.render('blogs', { body: "", blogs, baseUrl, seoDetails });
});

app.get('/jobs', async (req, res) => {
    const baseUrl = req.protocol + '://' + req.get('Host');
    const jobs = await getjobs();
    const seoDetails = {
        title: "",
        metaDescription: "",
        metaImage: `${baseUrl}/${metaLogoPath}`,
        keywords: "",
        canonical: `${baseUrl}/jobs`,
    };
    
    res.render('jobs', { body: "", baseUrl, seoDetails, jobs });
});


app.get('/job/:slug', async (req, res) => {
    const baseUrl = req.protocol + '://' + req.get('Host');
    const { slug } = req.params;
    const websiteID = await getWebsiteID();
    const job = await getjobdetails(slug);
    // const otherJobs = await getotherjobs(slug);
    const jobDescription = job?.description?.replace(/<[^>]*>/g, '').substring(0, 160) || '';
    const seoDetails = {
        title: job?.seoDetails?.title || `${job?.jobTitle || job?.title || 'Job'} - Tikariha | Career Opportunities`,
        metaDescription: job?.seoDetails?.metaDescription || jobDescription || `Apply for ${job?.jobTitle || job?.title || 'this position'} at Tikariha. Join our team and build your career in hospitality.`,
        metaImage: `${baseUrl}/${metaLogoPath}`,
        keywords: job?.seoDetails?.tags?.join(', ') || `${job?.jobTitle || job?.title} Tikariha, hotel jobs, hospitality careers, Tikariha careers, ${job?.category || 'hotel'} jobs Tikariha, employment opportunities`,
        canonical: `${baseUrl}/job/${slug}`,
    };
    
    res.render('jobdetail', {
        body: "", 
        baseUrl, 
        seoDetails, 
        job,
        websiteID,
        API_BASE_URL,
        WEBSITE_ID_KEY,
        S3_BASE_URL,
       
    });
});






// app.get('/products', async (req, res) => {
//     try {
//         const baseUrl = req.protocol + '://' + req.get('Host');
//         const categories = res.locals.categories || [];
        
//         // Always load ALL products - JavaScript will handle filtering
//         const products = await getProducts();
        
//         const seoDetails = {
//             title: "Our Products ",
//             metaDescription: "",
//             metaImage: `${baseUrl}/${metaLogoPath}`,
//             keywords: "",
//             canonical: `${baseUrl}/products`,
//         };

//         res.render('Products', { 
//             body: "", 
//             products, 
//             baseUrl, 
//             seoDetails, 
//             S3_BASE_URL, 
//             categoryName: null,
//             categories,
//             selectedCategoryId: null
//         });
//     } catch (error) {
//         console.error('Error loading products page:', error);
//         const baseUrl = req.protocol + '://' + req.get('Host');
//         const seoDetails = {
//             title: "Our Products - Passary Refractories",
//             metaDescription: "Explore our range of high-quality refractory products and solutions",
//             metaImage: `${baseUrl}/${metaLogoPath}`,
//             keywords: "refractory products, industrial materials, passary products",
//             canonical: `${baseUrl}/products`,
//         };
        
//         // Render page with empty products array
//         res.render('Products', { 
//             body: "", 
//             products: [], 
//             baseUrl, 
//             seoDetails, 
//             S3_BASE_URL, 
//             categoryName: null,
//             categories: res.locals.categories || [],
//             selectedCategoryId: null
//         });
//     }
// });


app.get('/thankyou', async (req, res) => {
    const baseUrl = req.protocol + '://' + req.get('Host');
    const seoDetails = {
        title: "",
        metaDescription: "",
        metaImage: `${baseUrl}/${metaLogoPath}`,
        keywords: "",
        canonical: "",
    } 
    res.render('thankyou', {body: "",seoDetails});
});




app.get('/post/:id', async (req, res) => {
    const baseUrl = req.protocol + '://' + req.get('Host');
    const { id } = req.params; // Extract slug from params
    const blogDetails = await getBlogfull(id);
    console.log("BLOG DETAILS 👉", blogDetails);
    const websiteID = await getWebsiteID(); 
   
    const latestblog = await getlatestblogs(id);
    // Extract the first 50 words from the description
    const truncateToWords = (text, wordCount) => {
        if (!text) return '';
        return text.split(' ').slice(0, wordCount).join(' ') + '...';
    };
    const truncatedDescription = truncateToWords(blogDetails?.description, 25);

    // Set the meta image dynamically
   
  
    const seoDetails = {
        title: blogDetails?.seoConfig?.title || "Blog Details",
        metaDescription: blogDetails?.seoConfig?.metaDescription || blogDetails?.description ? blogDetails?.description.replace(/<[^>]*>/g, '').substring(0, 160) : "",
        metaImage: `${baseUrl}/${metaLogoPath}`,
        keywords: blogDetails?.seoConfig?.keywords || "",
        canonical: `${baseUrl}/post/${id}`,
    };

    res.render('blogpost', {
        body: "",
       baseUrl,
       blogDetails,
        seoDetails,
        latestblog,
       websiteID,API_BASE_URL,WEBSITE_ID_KEY
    });
});


// app.get('/product/:slug', async (req, res) => {
//     const baseUrl = req.protocol + '://' + req.get('Host');
//     const { slug } = req.params;
//     const productDetails = await getProductDetails(slug);
//     const websiteID = await getWebsiteID();
    
//     if (!productDetails) {
//         return res.redirect('/products');
//     }

//     const seoDetails = {
//         title: productDetails.title || "Product Details",
//         metaDescription: productDetails.description ? productDetails.description.replace(/<[^>]*>/g, '').substring(0, 160) : "",
//         metaImage: `${baseUrl}/${metaLogoPath}`,
//         keywords: productDetails.keywords || "",
//         canonical: `${baseUrl}/product/${slug}`,
//     };

//     res.render('details', {
//         body: "",
//         baseUrl,
//         product: productDetails,
//         seoDetails,
//         S3_BASE_URL,
//         API_BASE_URL,
//         WEBSITE_ID_KEY,
//         websiteID
//     });
// });

app.use(async (req, res, next) => {
    const baseUrl = req.protocol + '://' + req.get('Host');
    const seoDetails = {
        title: "",
        metaDescription: "",
        metaImage: `${baseUrl}/assets/images/icon/metalogo.png`, // Replace with correct path if needed
        keywords: "",
        canonical: baseUrl + req.originalUrl, // You can use the original URL for canonical
    };
    

    res.status(404).render('404', { seoDetails });
});




app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });