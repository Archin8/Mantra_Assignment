
  import express from "express"
import helmet from "helmet"
import cors from 'cors'
import {errorMiddleware} from "./middlewares/error.js"
import morgan from "morgan"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"
import schoolMonthlyRoutes from "./routes/schoolMonthly.routes.js"
import grantRoutes from "./routes/grant.routes.js"
  
  dotenv.config({path: './.env',});
  
  export const envMode = process.env.NODE_ENV?.trim() || 'DEVELOPMENT';
  const port = process.env.PORT || 3000;

  // __dirname equivalent for ES modules
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  

  const app = express();
  
                                
  
  
app.use(
  helmet({
    contentSecurityPolicy: envMode !== "DEVELOPMENT",
    crossOriginEmbedderPolicy: envMode !== "DEVELOPMENT",
  })
);
    
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors({origin:'*',credentials:true}));
app.use(morgan('dev'));

// Static file serving for grant evidence images (resolves correctly in both DEV and PROD)
const mediaPath = envMode === 'PRODUCTION'
  ? path.join(__dirname, '../src/data/03_Grant_Reporting_Evidence/images')
  : path.join(__dirname, 'data', '03_Grant_Reporting_Evidence', 'images');

app.use('/api/media', express.static(mediaPath));
  
// API routes
app.use('/api/schools', schoolMonthlyRoutes);
app.use('/api/grants', grantRoutes);

// Serve static frontend files in PRODUCTION
if (envMode === 'PRODUCTION') {
  const frontendPath = path.join(__dirname, '../../Frontend/dist');
  app.use(express.static(frontendPath));
  
  // Serve frontend React app for all non-API paths
  app.get(/^(?!\/api).*$/, (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
} else {
  // Basic root page for development
  app.get('/', (req, res) => {
     res.send('Hello, World!');
  });
}
    
app.get("/*splat", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Page not found",
  });
});
  
  app.use(errorMiddleware);
    
  app.listen(port, () => console.log('Server is working on Port:'+port+' in '+envMode+' Mode.'));
  