import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

app.get("/api/tossup", async (req, res) => {
  try {
    // 1. Extract params from your frontend
    const { difficulties, categories, subcategories, alternateSubcategories } = req.query;

    let url = "https://qbreader.org/api/random-tossup";
    const params = [];

    // 2. Build the query string using the CORRECT names from your Docs
    if (difficulties) params.push(`difficulties=${encodeURIComponent(difficulties)}`);
    if (categories) params.push(`categories=${encodeURIComponent(categories)}`);
    if (subcategories) params.push(`subcategories=${encodeURIComponent(subcategories)}`);
    
    // DOCS CONFIRMED: usage is 'alternateSubcategories' (camelCase)
    if (alternateSubcategories) params.push(`alternateSubcategories=${encodeURIComponent(alternateSubcategories)}`);

    if (params.length) {
      url += "?" + params.join("&");
    }

    console.log(`[Backend] Fetching: ${url}`); 

    const r = await fetch(url);

    if (!r.ok) {
      console.log(`[Error] QBReader API returned status: ${r.status}`);
      return res.status(500).json({ error: "QBReader request failed" });
    }

    const data = await r.json();

    // 3. Handle response
    if (Array.isArray(data.tossups)) {
      if (data.tossups.length === 0) {
        return res.status(404).json({ error: "No tossups found for these filters" });
      }
      // Return the first random question found
      return res.json(data.tossups[0]);
    }

    // Fallback for unexpected shapes
    if (!data.question) {
      return res.status(500).json({ error: "Unexpected QBReader response", raw: data });
    }

    res.json(data);

  } catch (err) {
    console.error("[Server Error]", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});