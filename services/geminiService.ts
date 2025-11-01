import { GoogleGenAI } from "@google/genai";
import type { LicenseInfo, ComparisonData } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const jsonSchemaDescription = `{
    "licensingBody": "string",
    "licenseTypes": ["string"],
    "keyRequirements": ["string"],
    "officialResources": [{ "name": "string", "url": "string" }]
}`;

const getPromptForState = (state: string) => `
  Provide a detailed summary of the home care licensing requirements for the state of ${state}.
  Focus on non-medical home care (companion, personal care) and licensed home health agencies.
  Do not include information about individual caregiver certification unless it's part of the agency licensing process.

  **URL VERIFICATION PROTOCOL (MANDATORY):**
  1. For every official resource you identify, you MUST first perform a real-time check to verify the URL is active and returns a HTTP 200 OK status.
  2. If a URL is broken, leads to a '404 Not Found' error, or redirects to a generic homepage instead of the specific resource, you MUST discard it.
  3. You must then find an alternative, working URL from the same official state government domain (.gov, or equivalent state health department site).
  4. Only include URLs in the final JSON output that you have successfully verified as active and correct according to this protocol. This is a critical step for application accuracy.

  The response must be a single, valid JSON object that adheres to the following structure. Do not include any explanatory text, markdown formatting, or anything else outside of the JSON object itself.

  JSON Structure:
  ${jsonSchemaDescription}
`;

const parseAndValidateResponse = (responseText: string): LicenseInfo => {
    // Clean the response to extract pure JSON
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("API response did not contain a valid JSON object.");
    }
    const cleanResponseText = jsonMatch[0];
    const parsedJson = JSON.parse(cleanResponseText);
    
    // Basic validation
    if (
        !parsedJson.licensingBody ||
        !Array.isArray(parsedJson.licenseTypes) ||
        !Array.isArray(parsedJson.keyRequirements) ||
        !Array.isArray(parsedJson.officialResources)
    ) {
        throw new Error("API response is missing required fields.");
    }
    return parsedJson as LicenseInfo;
}

export async function fetchLicenseInfo(state: string): Promise<{ licenseInfo: LicenseInfo }> {
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: getPromptForState(state),
        config: {
            tools: [{googleSearch: {}}],
            temperature: 0.1,
        },
    });
    
    const licenseInfo = parseAndValidateResponse(response.text);
    return { licenseInfo };

  } catch (error) {
    console.error(`Error fetching or parsing data for ${state}:`, error);
    if (error instanceof SyntaxError) {
        throw new Error(`The API returned malformed data for ${state}. Please try again.`);
    }
    throw new Error(`Could not retrieve valid licensing information for ${state}.`);
  }
}

export async function fetchComparisonInfo(states: string[]): Promise<ComparisonData> {
  const comparisonPrompt = `
    For each of the following states: ${states.join(', ')}, provide the home care licensing information.
    Follow the URL VERIFICATION PROTOCOL for each state as previously defined.

    Return the final output as a single, valid JSON object where each key is a state name, and the value is the corresponding licensing information object.
    The structure for each state's information object must be: ${jsonSchemaDescription}.

    Example for two states:
    {
      "California": { ... California's info ... },
      "Texas": { ... Texas's info ... }
    }
  `;
  try {
     const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: comparisonPrompt,
        config: {
            tools: [{googleSearch: {}}],
            temperature: 0.1,
        },
    });

    const jsonMatch = response.text.trim().match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("API comparison response did not contain a valid JSON object.");
    }
    const responseText = jsonMatch[0];
    const parsedJson = JSON.parse(responseText) as ComparisonData;

    // Optional: Add validation for the structure of the comparison object here
    
    return parsedJson;

  } catch (error) {
    console.error(`Error fetching or parsing comparison data for ${states.join(', ')}:`, error);
    if (error instanceof SyntaxError) {
        throw new Error(`The API returned malformed data for comparison. Please try again.`);
    }
    throw new Error(`Could not retrieve valid comparison information.`);
  }
}
