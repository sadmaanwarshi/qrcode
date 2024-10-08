import express from "express";
import bodyParser from "body-parser"; 
import pdf from 'html-pdf';
import path from 'path';
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Set the views directory
app.set('views', path.join(__dirname, 'views'));

const colorMap = {
    "red": "FF0000",
    "green": "008000",
    "blue": "0000FF",
    "yellow": "FFFF00",
    "black": "000000",
    "white": "FFFFFF",
    // Add more colors as needed
};

// Routes
app.get("/", (req, res) => {
    res.render("index", { qrCodeUrl: null });
});

app.post('/generate', (req, res) => {
    const inputText = req.body.text;
    const response = req.body.fileUpload || "";
    const colorName = req.body.colorchoice.toLowerCase();
    const hexColor = colorMap[colorName] || "#000000";

    const qrCodeUrl = `https://quickchart.io/qr?text=${encodeURIComponent(inputText)}&size=150&dark=${hexColor}&centerImageUrl=${encodeURIComponent(response)}`;
    
    res.render('index', { qrCodeUrl });
});

app.post('/download', async (req, res) => {
    const qrCodeUrl = req.body.qrCodeUrl;
    const inputTitle = req.body.inputTitle;

    // Enhanced HTML with styles for better PDF appearance
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {
                font-family: 'Arial', sans-serif;
                margin: 0;
                padding: 0;
                background-color: #fff;
            }
            .container {
                width: 90%; 
                max-width: 650px;
                margin: 40px auto;
                padding: 30px;
                background-color: #fff;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                border: 3px solid #000; 
            }
            .main-title {
                font-size: 30px;
                color: #000;
                text-align: center;
                margin-bottom: 10px;
                font-weight: bold;
                text-transform: uppercase;
            }
            h1 {
                font-size: 26px;
                color: #000;
                text-align: center;
                margin-bottom: 20px;
            }
            img {
                display: block;
                margin: 20px auto;
                width: 100%; 
                max-width: 300px; 
                height: auto;
                border: 2px solid #000; 
                border-radius: 8px;
            }
            .footer {
                text-align: center;
                margin-top: 20px;
                font-size: 13px;
                color: #666;
            }
            .footer p {
                margin: 0;
            }
            .footer p span {
                color: #000;
                font-weight: bold;
            }

            /* Media Queries for Responsiveness */
            @media (max-width: 768px) {
                .main-title {
                    font-size: 24px;
                }
                h1 {
                    font-size: 22px;
                }
                .footer {
                    font-size: 12px;
                }
            }

            @media (max-width: 480px) {
                .main-title {
                    font-size: 20px;
                }
                h1 {
                    font-size: 20px;
                }
                img {
                    max-width: 80%; 
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="main-title">${inputTitle}</div>
            <h1>Your QR Code</h1>
            <img src="${qrCodeUrl}" alt="QR Code"/>
            <div class="footer">
                <p>Generated with <span>Tech Titans QR Code Generator</span></p>
            </div>
        </div>
    </body>
    </html>
    `;

    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(html);
        const buffer = await page.pdf({ format: 'A4' });

        await browser.close();

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="qrcode.pdf"',
        });

        res.send(buffer);
    } catch (err) {
        console.error('Error generating PDF:', err);
        return res.status(500).send('Error generating PDF');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
