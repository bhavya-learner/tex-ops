import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    category: {
      type: Type.STRING,
      enum: ["INVOICE", "SHELF", "SKETCH", "UNKNOWN"],
      description: "The category of the uploaded image based on its content.",
    },
    summary: {
      type: Type.STRING,
      description: "A brief, one-sentence summary of what is detected in the image.",
    },
    invoiceData: {
      type: Type.OBJECT,
      properties: {
        date: { type: Type.STRING, description: "Date found on the invoice (YYYY-MM-DD or DD/MM/YYYY)." },
        totalAmount: { type: Type.NUMBER, description: "Grand total amount of the invoice." },
        gstNumber: { type: Type.STRING, description: "GSTIN or Tax ID number." },
        vendorName: { type: Type.STRING, description: "Name of the vendor or supplier." },
        taxAmount: { type: Type.NUMBER, description: "Total tax or GST amount." },
        items: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Name of the product/service." },
              quantity: { type: Type.NUMBER, description: "Quantity purchased." },
              unitPrice: { type: Type.NUMBER, description: "Price per unit." },
              total: { type: Type.NUMBER, description: "Total line item price." }
            }
          },
          description: "List of items extracted from the invoice table."
        }
      },
      description: "Extracted data if the image is an invoice.",
    },
    shelfData: {
      type: Type.OBJECT,
      properties: {
        itemType: { type: Type.STRING, description: "The specific name of the item stored (e.g., 'Blue Denim Rolls', 'Cotton Spools')." },
        itemCount: { type: Type.INTEGER, description: "Approximate count of distinct items visible." },
        dominantColors: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING },
          description: "List of dominant fabric/material colors." 
        },
        colorCode: { type: Type.STRING, description: "Any visible color code, batch number, or hex code (e.g., 'Lot-402', '#123456')." },
        quantityEstimate: { type: Type.STRING, description: "A qualitative estimate of stock (e.g., 'Low', 'Full', 'Overflowing')." },
      },
      description: "Extracted data if the image is a storage shelf or inventory.",
    },
    sketchData: {
      type: Type.OBJECT,
      properties: {
        designConcept: { type: Type.STRING, description: "Description of the style, cut, and pattern." },
        fabricSuggestion: { type: Type.STRING, description: "Suggested fabrics based on the drape and look." },
      },
      description: "Extracted data if the image is a fashion design sketch.",
    },
  },
  required: ["category", "summary"],
};

export const analyzeImageWithGemini = async (base64Data: string, mimeType: string): Promise<AnalysisResult> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
          {
            text: `Analyze this image for a textile factory application. 
            Identify if it is an INVOICE, a SHELF, or a SKETCH.
            For INVOICES: Extract vendor, date, total, GST, tax amount, and a LIST of all items (name, qty, price, total).
            For SHELVES: Look for specific item names, counts, and color codes.
            For SKETCHES: Describe design and fabric.`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.1, 
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response text from Gemini.");
    }

    const data = JSON.parse(text) as AnalysisResult;
    return data;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};