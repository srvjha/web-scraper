import puppeteer from "puppeteer";
import fs from 'fs'

(async () => {
  const url = "https://blinkit.com/cn/batter/cid/14/1425"; 

 
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--start-maximized"], 
    defaultViewport: null, 
  });

//   const wait = (ms)=>{
//     return new Promise((resolve,reject)=>{
//         setTimeout(()=>{
//             resolve(true)
//         },ms)
        
//     })
//   }

const wait = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  const page = await browser.newPage();  

 
  await page.goto(url, { waitUntil: "domcontentloaded" });
  console.log("Waiting for 5 seconds"); 
  await wait(15000);

  console.log("Waiting for the location bar to appear...");
  await page.waitForSelector(".gcLVHe", { visible: true });

  console.log("Scrolling into view...");
  await page.evaluate(() => {
    document.querySelector(".gcLVHe").scrollIntoView();
  });

  console.log("Clicking the location bar...");
  await page.click(".gcLVHe");  

  console.log("Waiting for the input field...");
  await page.waitForSelector(".fZCGlI", { visible: true });

  console.log("Typing location...");
  await page.type(".fZCGlI", "Surat, Gujarat, India ", { delay: 200 });
  
  await wait(5000);
  await page.waitForSelector(".lcVvPT"); // Wait until the element appears

  await page.evaluate(() => {
    const elements = document.querySelectorAll(".lcVvPT");
    if (elements.length > 0) {
      elements[0].click(); 
    } else {
      console.error("Element not found: .lcVvPT");
    }
  });

  await wait(5000);

  console.log("Done!"); 

  
  await waitForElement(page, ".fzUkAK", 15000);

  await autoScroll(page);


  const products = await page.evaluate(() => {
    const productElements = document.querySelectorAll(".fzUkAK");
    const productList = [];

    productElements.forEach((el) => {
     
      //let details = el.innerText;
      let deliveryTime = el.querySelector(".LikqD").innerText || "";
      let title = el.querySelector(".jTdToW").innerText.split("\n")[0];
      let quantity = el.querySelector(".jTdToW").innerText.split("\n")[1];
      let discountedPrice = Number(el.querySelector(".ljxcbQ").innerText.split("\n")[0].slice(1)) || 0
      let originalPrice = Number(el.querySelector(".ljxcbQ").innerText.split("\n")[1].slice(1)) || 0
      let imageElement = el.querySelector("img"); 
      let imageUrl = imageElement ? imageElement.src : "";

     
        productList.push({deliveryTime,title,quantity,discountedPrice,originalPrice,imageUrl});
      
    });
     console.log(productList.length);
    return productList;
  });

  console.log("Extracted Products:", products);
   fs.writeFileSync('batter.json', JSON.stringify(products, null, 2));

 
  await browser.close();
})();

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 500; 
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 2000); 
    });
  });
}


async function waitForElement(page, selector, timeout = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const exists = await page.evaluate((sel) => !!document.querySelector(sel), selector);
    if (exists) return;
    await new Promise((r) => setTimeout(r, 500)); 
  }
  throw new Error(`Timeout: Element ${selector} not found within ${timeout}ms`);
}