export default {
	async fetch(request, env, ctx)
	{		
		const valid_origin = "https://mizagbf.github.io";
		const is_preflight = request.method === "OPTIONS";
		const original_url = new URL(request.url);
		
		// filter methods
		if(!is_preflight && request.method !== "GET")
		{
			console.log(`${request.method} | Status: BAD METHOD`);
			return new Response(
				"404 Not Found",
				{
					status: 404
				}
			);
		}

		// extract target URL from the path and validate it
		// substring(1) is to remove the leading /
		const target_url = original_url.pathname.substring(1) + original_url.search;
		if(!target_url.startsWith("https://prd-game-a-granbluefantasy.akamaized.net/"))
		{
			console.log(`${request.method} | ${target_url} | Status: BAD TARGET`);
			return new Response(
				"404 Not Found",
				{
					status: 404
				}
			);
		}
		// check origin
		const origin = request.headers.get("Origin");
		if(origin == null || origin != valid_origin)
		{
			console.log(`${request.method} | ${target_url} | From: ${origin} | Status: BAD ORIGIN | UA: ${request.headers.get("User-Agent")}`);
			return new Response(
				"404 Not Found",
				{
					status: 404
				}
			);
		}
		// check the cache
		const cache = caches.default;
		const cache_key = new Request(request.url, request);
		let cached_response = await cache.match(cache_key);
		if(cached_response)
		{
			console.log(`Cache HIT for: ${target_url}`);
			return cached_response;
		}

		// helper to set up CORS headers
		function setupCORSHeaders(headers) {
			headers.set("Access-Control-Allow-Origin", origin || "*");
			if(is_preflight)
			{
				headers.set(
					"Access-Control-Allow-Methods",
					(
						request.headers.get("access-control-request-method")
						|| "GET"
					)
				);
				const requested_headers = request.headers.get("access-control-request-headers");
				if (requested_headers)
				{
					headers.set("Access-Control-Allow-Headers", requested_headers);
				}
				headers.delete("X-Content-Type-Options");
			}
			return headers;
		}

		// prepare headers
		const filtered_headers = new Headers();
		let has_ua = false;
		for(const [key, value] of request.headers.entries())
		{
			const lower_key = key.toLowerCase();
			if(
				!lower_key.startsWith("origin") &&
				!lower_key.includes("eferer") &&
				!lower_key.startsWith("cf-") &&
				!lower_key.startsWith("x-forw") &&
				lower_key !== "x-cors-headers"
			)
			{
				filtered_headers.set(key, value);
				if(lower_key === "user-agent")
				{
					has_ua = true;
				}
			}
		}
		if(!has_ua) // reject requests without user-agent
		{
			console.log(`${request.method} | ${target_url} | From: ${origin} | Status: NO USER AGENT`);
			return new Response(
				"404 Not Found",
				{
					status: 404
				}
			);
		}
		// inject custom headers
		const custom_headers_raw = request.headers.get("x-cors-headers");
		if(custom_headers_raw)
		{
			try
			{
				const custom = JSON.parse(custom_headers_raw);
				Object.entries(custom).forEach(([k, v]) => filtered_headers.set(k, v));
			} catch (e) {} // ignore malformed JSON
		}

		// EXECUTE
		try
		{
			const response = await fetch(
				target_url,
				{
					method: request.method,
					headers: filtered_headers,
					redirect: "follow",
					body: (request.method !== "GET" && request.method !== "HEAD") ? request.body : null
				}
			);

			let response_headers = new Headers(response.headers);
			const exposed_headers = [];
			const all_received_headers = {};

			for(const [key, value] of response.headers.entries())
			{
				exposed_headers.push(key);
				all_received_headers[key] = value;
			}

			exposed_headers.push("cors-received-headers");
			response_headers = setupCORSHeaders(response_headers);
			response_headers.set("Access-Control-Expose-Headers", exposed_headers.join(","));
			response_headers.set("cors-received-headers", JSON.stringify(all_received_headers));
			response_headers.set("Cache-Control", "public, s-maxage=604800"); // cache for 7 days

			console.log(`${request.method} | ${target_url} | From: ${origin} | Status: OK`);
			const final_response = new Response(
				is_preflight ? null : response.body,
				{
					headers: response_headers,
					status: is_preflight ? 200 : response.status,
					statusText: is_preflight ? "OK" : response.statusText
				}
			);
			if(final_response.status === 200 && !is_preflight)
			{
			  ctx.waitUntil(cache.put(cache_key, final_response.clone()));
			}
			return final_response;
		} catch (err) {
			console.log(`${request.method} | ${target_url} | From: ${origin} | Status: ERROR | ${err}`);
			return new Response(
				"404 Not Found",
				{
					status: 404
				}
			);
		}
	}
};