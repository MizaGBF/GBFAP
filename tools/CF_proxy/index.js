export default {
	async fetch(request, env, ctx)
	{
		return await handleRequest(request);
	}
};

async function handleRequest(request)
{
	const valid_origins = ["mizagbf.github.io"];
	const is_preflight = request.method === "OPTIONS";
	const original_url = new URL(request.url);

	// extract target URL from the path and validate it
	// substring(1) is to remove the leading /
	const target_url = original_url.pathname.substring(1) + original_url.search;
	if(!target_url.startsWith("https://prd-game-a-granbluefantasy.akamaized.net/"))
	{
		return new Response(
			"404 Not Found",
			{
				status: 404
			}
		);
	}
	// check origin
	const origin = request.headers.get("Origin");
	if(origin == null || !valid_origins.some(pattern => origin.includes(pattern)))
	{
		return new Response(
			"404 Not Found",
			{
				status: 404
			}
		);
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
			const requestedHeaders = request.headers.get("access-control-request-headers");
			if (requestedHeaders)
			{
				headers.set("Access-Control-Allow-Headers", requestedHeaders);
			}
			headers.delete("X-Content-Type-Options");
		}
		return headers;
	}

	// prepare headers
	const filtered_headers = new Headers();
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
		}
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

		return new Response(
			is_preflight ? null : response.body,
			{
				headers: response_headers,
				status: is_preflight ? 200 : response.status,
				statusText: is_preflight ? "OK" : response.statusText
			}
		);
	} catch (err) {
		return new Response(
			"404 Not Found",
			{
				status: 404
			}
		);
	}
}