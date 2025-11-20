import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define available tools/functions for OpenAI
const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'search_products',
      description: 'Search for products by name, SKU, category, or brand. Returns product details including pricing, inventory, and categorization.',
      parameters: {
        type: 'object',
        properties: {
          searchTerm: {
            type: 'string',
            description: 'Search term to match against product name, SKU, or description'
          },
          categoryId: {
            type: 'string',
            description: 'Filter by category ID'
          },
          brandId: {
            type: 'string',
            description: 'Filter by brand ID'
          },
          limit: {
            type: 'number',
            description: 'Maximum number of results to return (default 10, max 50)'
          }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'check_inventory',
      description: 'Check inventory levels for products. Can filter by product ID, SKU, or show only low stock items.',
      parameters: {
        type: 'object',
        properties: {
          productId: {
            type: 'string',
            description: 'Specific product ID to check'
          },
          sku: {
            type: 'string',
            description: 'Product SKU to search for'
          },
          lowStockOnly: {
            type: 'boolean',
            description: 'If true, only return items at or below reorder level'
          },
          limit: {
            type: 'number',
            description: 'Maximum number of results (default 20, max 100)'
          }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_purchase_orders',
      description: 'Retrieve purchase orders with optional filters for vendor, status, date range, or PO number.',
      parameters: {
        type: 'object',
        properties: {
          poNumber: {
            type: 'string',
            description: 'Search by PO number'
          },
          vendorId: {
            type: 'string',
            description: 'Filter by vendor ID'
          },
          status: {
            type: 'string',
            description: 'Filter by status (pending, received, cancelled)',
            enum: ['pending', 'received', 'cancelled']
          },
          startDate: {
            type: 'string',
            description: 'Start date for date range filter (ISO format)'
          },
          endDate: {
            type: 'string',
            description: 'End date for date range filter (ISO format)'
          },
          limit: {
            type: 'number',
            description: 'Maximum number of results (default 20, max 50)'
          }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_sales_orders',
      description: 'Retrieve sales orders with optional filters for customer, status, date range, or SO number.',
      parameters: {
        type: 'object',
        properties: {
          soNumber: {
            type: 'string',
            description: 'Search by SO number'
          },
          customerId: {
            type: 'string',
            description: 'Filter by customer ID'
          },
          status: {
            type: 'string',
            description: 'Filter by status (fulfilled, pending, cancelled)',
            enum: ['fulfilled', 'pending', 'cancelled']
          },
          startDate: {
            type: 'string',
            description: 'Start date for date range filter (ISO format)'
          },
          endDate: {
            type: 'string',
            description: 'End date for date range filter (ISO format)'
          },
          limit: {
            type: 'number',
            description: 'Maximum number of results (default 20, max 50)'
          }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_vendors',
      description: 'Search and retrieve vendor information including contact details and recent purchase orders.',
      parameters: {
        type: 'object',
        properties: {
          searchTerm: {
            type: 'string',
            description: 'Search term to match against vendor name, email, or contact person'
          },
          status: {
            type: 'string',
            description: 'Filter by vendor status (active, inactive)',
            enum: ['active', 'inactive']
          },
          limit: {
            type: 'number',
            description: 'Maximum number of results (default 20, max 50)'
          }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_customers',
      description: 'Search and retrieve customer information including contact details, credit info, and recent sales orders.',
      parameters: {
        type: 'object',
        properties: {
          searchTerm: {
            type: 'string',
            description: 'Search term to match against customer name, email, or phone'
          },
          customerGroup: {
            type: 'string',
            description: 'Filter by customer group'
          },
          customerCategory: {
            type: 'string',
            description: 'Filter by customer category'
          },
          status: {
            type: 'string',
            description: 'Filter by status (active, inactive)',
            enum: ['active', 'inactive']
          },
          limit: {
            type: 'number',
            description: 'Maximum number of results (default 20, max 50)'
          }
        }
      }
    }
  }
];

// Function to execute tool calls
async function executeFunction(name: string, args: any, request: NextRequest): Promise<any> {
  const functionMap: Record<string, string> = {
    'search_products': '/api/chat/tools/products',
    'check_inventory': '/api/chat/tools/inventory',
    'get_purchase_orders': '/api/chat/tools/purchase-orders',
    'get_sales_orders': '/api/chat/tools/sales-orders',
    'get_vendors': '/api/chat/tools/vendors',
    'get_customers': '/api/chat/tools/customers',
  };

  const endpoint = functionMap[name];
  if (!endpoint) {
    throw new Error(`Unknown function: ${name}`);
  }

  // Get the base URL from the request
  const host = request.headers.get('host') || '';
  const protocol = request.headers.get('x-forwarded-proto') || 'https';
  const baseUrl = `${protocol}://${host}`;

  console.log(`Calling ${baseUrl}${endpoint}`);

  const response = await fetch(`${baseUrl}${endpoint}`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      // Forward cookies for authentication
      'Cookie': request.headers.get('cookie') || '',
    },
    body: JSON.stringify(args),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Function ${name} failed:`, response.status, errorText);
    throw new Error(`Function ${name} failed: ${response.statusText}`);
  }

  return await response.json();
}

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory = [] } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Build messages array with conversation history
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `You are a professional AI assistant for ApexFlow Warehouse ERP.

CORE PRINCIPLES:
- Be extremely concise - show only what's asked for
- Match response detail to query type
- No introductory phrases or unnecessary context
- Limit to 5-8 items unless user asks for more

QUERY-SPECIFIC FORMATS:

INVENTORY/STOCK QUERIES (low stock, inventory levels, stock status):
- Show ONLY: Product name (SKU) | Current stock | Reorder level
- Flag negative stock as CRITICAL
- Sort by most urgent first
- NO pricing, NO categories
Example: "5 items below reorder level:
1. Frozen Corn 16oz (FRZ-013) - CRITICAL | Stock: -41 | Reorder: 60
2. Whole Milk Gallon (DAI-001) - CRITICAL | Stock: -33 | Reorder: 50"

PRODUCT SEARCH QUERIES:
- Show: Product name (SKU) | Price | Stock
- Keep it simple and scannable
Example: "3 matching products:
1. Whole Milk Gallon (DAI-001) | $3.99 | Stock: -33
2. 2% Milk Gallon (DAI-002) | $3.79 | Stock: 38"

SALES ORDER QUERIES:
- Show: Order # | Customer | Date | Total | Status
- Focus on financial data
Example: "Recent sales orders:
1. SO-202511-047 | ShopRite | Nov 1 | $56.66 | Fulfilled
2. SO-202510-037 | Amazon Fresh | Oct 31 | $43.23 | Fulfilled"

PURCHASE ORDER QUERIES:
- Show: PO # | Vendor | Date | Status
Example: "Recent purchase orders:
1. PO-2024-015 | Sysco Foods | Nov 5 | Pending
2. PO-2024-014 | US Foods | Nov 3 | Received"

VENDOR/CUSTOMER QUERIES:
- Show: Name | Contact info | Status
- Brief and actionable

HOW-TO QUESTIONS:
- Numbered steps, very brief
- One sentence per step maximum

CLOSING:
- End with "Need more details?" for complex queries
- Or just end with the data for simple queries
- Never use "Please let me know if..." or similar verbose closings`
      },
      ...conversationHistory,
      {
        role: 'user',
        content: message
      }
    ];

    // Initial API call with tools
    let response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      tools,
      tool_choice: 'auto',
    });

    let responseMessage = response.choices[0].message;
    
    // Handle tool calls
    while (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
      messages.push(responseMessage);
      
      // Execute all tool calls
      for (const toolCall of responseMessage.tool_calls) {
        // Type guard for function tool calls
        if (toolCall.type !== 'function') continue;
        
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);
        
        console.log(`Executing function: ${functionName}`, functionArgs);
        
        try {
          const functionResponse = await executeFunction(functionName, functionArgs, request);
          
          messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(functionResponse),
          });
        } catch (error: any) {
          console.error(`Error executing ${functionName}:`, error);
          messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify({ error: error.message }),
          });
        }
      }
      
      // Get next response from OpenAI
      response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        tools,
        tool_choice: 'auto',
      });
      
      responseMessage = response.choices[0].message;
    }

    const reply = responseMessage.content;

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process chat message',
        details: error.message
      },
      { status: 500 }
    );
  }
}