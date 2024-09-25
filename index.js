import express from "express";
import bodyParser from "body-parser"; 
import pdf from 'html-pdf';
import fs from 'fs';

const app = express();
const port = 3000;

// Ensure the 'pdfs' directory exists
if (!fs.existsSync('./pdfs')) {
    fs.mkdirSync('./pdfs');
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Set the view engine to EJS
app.set('view engine', 'ejs');


const colorMap = {
    "red": "FF0000",
    "green": "008000",
    "blue": "0000FF",
    "yellow": "FFFF00",
    "black": "000000",
    "white": "FFFFFF",
    // Add more colors as needed
}
// Routes
app.get("/", (req, res) => {
    res.render("index", { qrCodeUrl: null });  // Initial render with no QR code
});

app.post('/generate', (req, res) => {
    const inputText = req.body.text;
    const response = req.body.fileUpload || "";
    // console.log(response);
    const colorName = req.body.colorchoice.toLowerCase(); // Convert to lowercase for consistency
    console.log(colorName);
    const hexColor = colorMap[colorName] || "#000000"; // Default to black if not found
    // Use external API to generate QR code
    const qrCodeUrl = `https://quickchart.io/qr?text=${encodeURIComponent(inputText)}&size=150&dark=${hexColor}&centerImageUrl=${encodeURIComponent(response)}`;
    console.log(qrCodeUrl)
    // Render the same page but now with the generated QR code
    res.render('index', { qrCodeUrl });
});

app.post('/download', (req, res) => {
    const qrCodeUrl = req.body.qrCodeUrl;
    const qrcolor = req.body.qrcolor;
    console.log(qrcolor);
    // Enhanced HTML with styles for better PDF appearance
    const html = `
    <html>
    <head>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                background-color: white;
            }
            .container {
                width: 100%;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                border: 2px solid #333;
                border-radius: 8px;
                background-color: #fff;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            h1 {
                text-align: center;
                color: #333;
            }
            img {
                display: block;
                margin: 20px auto;
                max-width: 100%;
                height: auto;
                color: red;
            }
            .footer {
                text-align: center;
                margin-top: 20px;
                font-size: 14px;
                color: #777;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Your QR Code</h1>
            <img src="${qrCodeUrl}" alt="QR Code"/>
            <div class="footer">
                <p>Generated with PDF with QR Code Generator</p>
            </div>
        </div>
    </body>
    </html>`;

    pdf.create(html).toFile('./pdfs/qr-code.pdf', (err, result) => {
        if (err) return res.send("Error generating PDF");
        res.download(result.filename);
    });
});


// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
