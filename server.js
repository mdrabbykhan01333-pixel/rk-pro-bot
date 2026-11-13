require("dotenv/config");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.OTCHARTS_API_KEY;
const BASE = "https://otcharts.com";
const PUBLIC = path.join(__dirname, "public");

function send(res, status, body, type="application/json; charset=utf-8") {
  res.writeHead(status, {"Content-Type": type, "Access-Control-Allow-Origin": "*", "Cache-Control":"no-store"});
  res.end(body);
}
function safeVenue(v) { return ["quotex","forex"].includes(v) ? v : null; }
async function api(pathname) {
  if (!API_KEY) throw new Error("সার্ভারে OTCHARTS_API_KEY সেট করা নেই");
  const r = await fetch(BASE + pathname, {headers: {"Authorization": "Bearer " + API_KEY, "Accept":"application/json"}});
  const body = await r.text();
  if (!r.ok) throw new Error("Market data provider returned HTTP " + r.status + ": " + body.slice(0,300));
  return body;
}
const mime = {".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json; charset=utf-8"};

http.createServer(async (req,res) => {
  const u = new URL(req.url, "http://localhost");
  try {
    if (u.pathname === "/api/status") {
      return send(res, 200, JSON.stringify({configured: !!API_KEY, provider:"OTCharts read-only market data"}));
    }
    if (u.pathname === "/api/venues") {
      return send(res, 200, await api("/v1/venues"));
    }
    if (u.pathname === "/api/symbols") {
      const venue = safeVenue(u.searchParams.get("venue"));
      if (!venue) return send(res,400,JSON.stringify({error:"venue must be quotex or forex"}));
      return send(res,200,await api("/v1/symbols?venue="+encodeURIComponent(venue)));
    }
    if (u.pathname === "/api/candles") {
      const venue = safeVenue(u.searchParams.get("venue"));
      const symbol = u.searchParams.get("symbol") || "";
      const tf = venue === "quotex" ? "30" : "60";
      if (!venue || !/^[A-Za-z0-9_#./-]{2,40}$/.test(symbol)) return send(res,400,JSON.stringify({error:"Invalid venue or symbol"}));
      return send(res,200,await api("/v1/candles?venue="+venue+"&symbol="+encodeURIComponent(symbol)+"&tf="+tf+"&limit=180"));
    }
    if (u.pathname === "/api/stream") {
      const venue = safeVenue(u.searchParams.get("venue"));
      const symbol = u.searchParams.get("symbol") || "";
      if (!venue || !/^[A-Za-z0-9_#./-]{2,40}$/.test(symbol)) return send(res,400,JSON.stringify({error:"Invalid venue or symbol"}));
      if (!API_KEY) return send(res,503,JSON.stringify({error:"Server API key is not configured"}));
      const upstream = await fetch(BASE+"/v1/stream?venue="+venue+"&symbol="+encodeURIComponent(symbol), {
        headers: {"Authorization":"Bearer "+API_KEY, "Accept":"text/event-stream"}
      });
      if (!upstream.ok || !upstream.body) {
        const msg = await upstream.text();
        return send(res,upstream.status,JSON.stringify({error:"Stream provider error",detail:msg.slice(0,300)}));
      }
      res.writeHead(200, {"Content-Type":"text/event-stream","Cache-Control":"no-cache, no-transform","Connection":"keep-alive","Access-Control-Allow-Origin":"*"});
      const reader = upstream.body.getReader();
      let closed = false;
      req.on("close",()=>{closed=true; try{reader.cancel();}catch{}});
      while(!closed) {
        const {value,done} = await reader.read();
        if(done) break;
        if(value) res.write(Buffer.from(value));
      }
      if(!res.writableEnded) res.end();
      return;
    }
    let file = u.pathname === "/" ? "index.html" : decodeURIComponent(u.pathname.slice(1));
    const full = path.resolve(PUBLIC,file);
    if (!full.startsWith(PUBLIC + path.sep) && full !== path.join(PUBLIC,"index.html")) return send(res,403,"Forbidden","text/plain");
    fs.readFile(full,(err,data)=> {
      if(err) return send(res,404,"Not found","text/plain; charset=utf-8");
      res.writeHead(200,{"Content-Type":mime[path.extname(full)]||"application/octet-stream"});
      res.end(data);
    });
  } catch(e) {
    send(res,502,JSON.stringify({error:e.message || "Unexpected server error"}));
  }
}).listen(PORT,()=>console.log("RK PRO BOT server listening on "+PORT));
