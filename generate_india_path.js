const fs = require('fs');
const https = require('https');

// A known low-res India outline geojson
const url = 'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson';

https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const geo = JSON.parse(data);
            let india = geo.features.find(f => f.properties.ADMIN === 'India');
            let coords = india.geometry.coordinates;
            // Assuming the geojson has a Polygon or MultiPolygon
            let bestPoly = coords;
            if (india.geometry.type === 'MultiPolygon') {
                let maxArea = 0;
                coords.forEach(poly => {
                    let area = poly[0].length;
                    if (area > maxArea) {
                        maxArea = area;
                        bestPoly = poly;
                    }
                });
            }
            
            const outerRing = bestPoly[0];
            
            const srinagar = { lon: 74.79, lat: 34.08 };
            const bangalore = { lon: 77.59, lat: 12.97 };
            
            const svgS = { x: 270, y: 104 };
            const svgB = { x: 480, y: 420 };
            
            // scale X: svg dx / geo dx
            const scaleX = (svgB.x - svgS.x) / (bangalore.lon - srinagar.lon);
            const scaleY = (svgB.y - svgS.y) / (bangalore.lat - srinagar.lat); // Note: lat decreases down in SVG
            
            let path = "";
            let start = true;
            outerRing.forEach((pt, i) => {
                const lon = pt[0], lat = pt[1];
                const x = svgS.x + (lon - srinagar.lon) * scaleX;
                const y = svgS.y + (lat - srinagar.lat) * scaleY;
                
                // Some filtering to reduce points if needed, or simply round
                if (start) { path += `M${x.toFixed(1)},${y.toFixed(1)} `; start = false; }
                else path += `L${x.toFixed(1)},${y.toFixed(1)} `;
            });
            path += "Z";
            
            fs.writeFileSync('india_path.txt', path);
            console.log("SUCCESS");
        } catch (e) {
            console.log("FALLBACK", e.message);
        }
    });
}).on("error", (err) => {
    console.log("FALLBACK", err.message);
});
