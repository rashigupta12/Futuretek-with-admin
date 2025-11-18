/*eslint-disable @typescript-eslint/no-explicit-any */
// app/api/gst/[number]/route.ts
import { NextResponse } from "next/server";

// GSTIN validation function
function isValidGSTIN(gstin: string): boolean {
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
  
  if (!gstinRegex.test(gstin)) {
    return false;
  }
  // You can add additional checksum validation here if needed
  return true;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ number: string }> }
) {
  const params = await context.params;
  const debug = process.env.NODE_ENV === 'development';
  const gstinNumber = params.number;
  const apiKey = process.env.GST_API_KEY;

  if (debug) {
    console.log("Received GSTIN number:", gstinNumber);
    console.log("API Key available:", !!apiKey);
  }

  // Validate API Key
  if (!apiKey) {
    console.error("GST_API_KEY is not configured in environment variables");
    return NextResponse.json(
      { error: "Server configuration error: API key missing" },
      { status: 500 }
    );
  }

  // Validate GSTIN format
  if (!gstinNumber || typeof gstinNumber !== 'string') {
    return NextResponse.json(
      { error: "GST number is required" },
      { status: 400 }
    );
  }

  const cleanGstin = gstinNumber.trim().toUpperCase();
  
  if (!isValidGSTIN(cleanGstin)) {
    return NextResponse.json(
      { error: "Invalid GSTIN format" },
      { status: 400 }
    );
  }

  try {
    if (debug) console.log("Fetching GST data from external API...");
    
    const apiUrl = `https://sheet.gstincheck.co.in/check/${apiKey}/${cleanGstin}`;
    
    if (debug) console.log("API URL:", apiUrl.replace(apiKey, '****'));
    
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Futuretek-App/1.0'
      },
      // Add timeout
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      if (debug) console.log("API response not OK, status:", response.status);
      
      if (response.status === 404) {
        return NextResponse.json(
          { error: "GSTIN not found in government records" },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: `Failed to fetch data from GST database (Status: ${response.status})` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    if (debug) {
      console.log("RAW GST RESPONSE:", JSON.stringify(data, null, 2));
    }

    // Validate response structure
    if (!data || typeof data !== 'object') {
      return NextResponse.json(
        { error: "Invalid response from GST API" },
        { status: 422 }
      );
    }

    // Check for API-specific error responses
    if (data.error || data.message === 'error') {
      return NextResponse.json(
        { error: data.message || "GST API returned an error" },
        { status: 422 }
      );
    }

    // Check if the API returned a flag indicating invalid GSTIN
    if (data.flag === false || data.sts === "Cancelled") {
      return NextResponse.json(
        { error: "This GSTIN is cancelled or invalid" },
        { status: 422 }
      );
    }

    // Transform response to a standardized format
    // The API may return different field names, so we normalize them
    const normalizedData = {
      gstin: data.gstin || cleanGstin,
      legalName: data.lgnm || data.legalName || data.legal_name || null,
      tradeName: data.tradeNam || data.tradeName || data.trade_name || null,
      status: data.sts || data.status || "Unknown",
      registrationDate: data.rgdt || data.registrationDate || null,
      constitutionOfBusiness: data.ctb || data.constitutionOfBusiness || null,
      taxpayerType: data.dty || data.taxpayerType || null,
      address: null as string | null,
      stateJurisdiction: data.stj || data.stateJurisdiction || null,
      centerJurisdiction: data.ctj || data.centerJurisdiction || null,
      lastUpdatedDate: data.lstupdt || data.lastUpdatedDate || null,
    };

    // Construct address from pradr (principal address) object if available
    if (data.pradr) {
      const addr = data.pradr;
      const addressParts = [
        addr.bno,   // Building/Flat number
        addr.bnm,   // Building name
        addr.st,    // Street
        addr.loc,   // Locality
        addr.dst,   // District
        addr.stcd,  // State code/name
        addr.pncd   // Pincode
      ].filter(Boolean);
      
      normalizedData.address = addressParts.join(", ");
    } else if (data.address) {
      normalizedData.address = data.address;
    }

    if (debug) {
      console.log("NORMALIZED RESPONSE:", JSON.stringify(normalizedData, null, 2));
    }

    return NextResponse.json(normalizedData);

  } catch (error: any) {
    console.error("GST API Error:", error);
    
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      return NextResponse.json(
        { error: "Request timeout: GST service took too long to respond" },
        { status: 408 }
      );
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json(
        { error: "Network error: Unable to connect to GST service" },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: "Internal server error while processing GST data" },
      { status: 500 }
    );
  }
}