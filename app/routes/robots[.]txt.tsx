// app/routes/robots[.]txt.ts
// https://www.robotstxt.org/robotstxt.html
import { LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = async () => {
    const robotText = `
        # Allow general web crawlers
        User-agent: *
        Disallow: 
        `.trim();

    return new Response(robotText, {
        headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "public, max-age=3600",
        },
    });
};