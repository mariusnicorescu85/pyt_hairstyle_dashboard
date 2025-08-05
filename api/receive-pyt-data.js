// /api/receive-pyt-data.js - Simple Vercel API endpoint

export default function handler(req, res) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method === "POST") {
    try {
      const pytData = req.body;

      console.log("📥 Received PYT data from N8N:", {
        type: Array.isArray(pytData) ? "array" : typeof pytData,
        length: Array.isArray(pytData) ? pytData.length : "N/A",
      });

      // Store data globally (simple in-memory storage)
      global.latestPYTData = {
        data: pytData,
        timestamp: new Date().toISOString(),
        source: "n8n_workflow",
      };

      res.status(200).json({
        success: true,
        message: "PYTHairstyle data received successfully",
        recordCount: Array.isArray(pytData) ? pytData.length : 1,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("❌ Error processing PYT data:", error);
      res.status(500).json({
        error: "Failed to process data",
        details: error.message,
      });
    }
  } else if (req.method === "GET") {
    // Allow dashboard to fetch the latest data
    const latestData = global.latestPYTData || null;

    if (latestData) {
      res.status(200).json({
        success: true,
        data: latestData.data,
        timestamp: latestData.timestamp,
        source: latestData.source,
      });
    } else {
      res.status(404).json({
        success: false,
        message:
          "No PYTHairstyle data available yet. Run your N8N workflow first.",
      });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
