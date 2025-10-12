const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

const MODEL = "gemini-2.0-flash";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function generateEnhancedCRMResponse(userQuery, context = {}) {
  const { 
    dbResults = {}, 
    userId, 
    userProfile = {},
    conversationHistory = [],
    requestType = 'general'
  } = context;

  // Build comprehensive system prompt with business context
  const systemPrompt = buildSystemPrompt(userProfile, requestType);
  
  // Build user context with all available data
  const userContext = buildUserContext(userQuery, dbResults, userProfile, conversationHistory);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { 
            role: "user",
            parts: [{ text: systemPrompt + "\n\n" + userContext }] 
          }
        ],
        generationConfig: {
          temperature: requestType === 'email_draft' ? 0.7 : 0.4,
          maxOutputTokens: 2048,
        }
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Gemini API failed: ${text}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
}

/**
 * Builds a comprehensive system prompt based on request type
 */
function buildSystemPrompt(userProfile, requestType) {
  const basePrompt = `You are an expert CRM AI assistant with deep knowledge of the business. You have access to:
- Complete account, contact, deal, and activity data
- User's personal task list and calendar
- Historical interaction patterns and business metrics
- Company products and pricing information
- ONLY EVER GIVE DETAILS RELATED TO THE USER, do not give information that a user is not assigned

Your capabilities:
1. **Business Insights**: Analyze trends, identify opportunities, spot risks
2. **Email Writing**: Draft professional, context-aware emails
3. **Task Management**: Track and prioritize user's activities
4. **Proactive Suggestions**: Recommend actions based on data patterns
5. **Relationship Intelligence**: Understand customer dynamics and history

Communication style: Professional, concise, actionable, and personalized.`;

  const typeSpecificPrompts = {
    email_draft: `\n\nSPECIFIC TASK: Draft a professional email.
- Use the user's name and role for signature
- Reference relevant deal/account context naturally
- Match the tone to the relationship stage
- Include a clear call-to-action
- Keep it concise (150-250 words)`,
    
    task_query: `\n\nSPECIFIC TASK: Help with task and activity management.
- Prioritize based on due dates and deal value
- Highlight overdue or urgent items
- Suggest logical next steps
- Consider workload balance`,
    
    insights: `\n\nSPECIFIC TASK: Provide business intelligence and insights.
- Identify trends and patterns in the data
- Highlight opportunities and risks
- Compare against typical benchmarks
- Provide actionable recommendations
- Use specific numbers and metrics`,
    
    general: `\n\nProvide helpful, context-aware assistance based on the user's query.`
  };

  return basePrompt + (typeSpecificPrompts[requestType] || typeSpecificPrompts.general);
}

/**
 * Builds rich user context from all available data
 */
function buildUserContext(userQuery, dbResults, userProfile, conversationHistory) {
  let context = `USER QUERY: "${userQuery}"\n\n`;

  // Add user profile information
  if (userProfile && Object.keys(userProfile).length > 0) {
    context += `USER PROFILE:\n`;
    context += `- Name: ${userProfile.name || 'Unknown'}\n`;
    context += `- Role: ${userProfile.role || 'Sales Representative'}\n`;
    context += `- Email: ${userProfile.email || ''}\n`;
    context += `- Team: ${userProfile.team || ''}\n\n`;
  }

  // Add database results with enhanced formatting
  if (dbResults && Object.keys(dbResults).length > 0) {
    context += `RELEVANT CRM DATA:\n`;
    
    if (dbResults.accounts?.length) {
      context += `\nAccounts (${dbResults.accounts.length}):\n`;
      dbResults.accounts.forEach((acc, i) => {
        context += `  ${i + 1}. ${acc.AccountName} - ${acc.Industry || 'N/A'} - Value: $${acc.AnnualRevenue || 0}\n`;
      });
    }

    if (dbResults.contacts?.length) {
      context += `\nContacts (${dbResults.contacts.length}):\n`;
      dbResults.contacts.forEach((c, i) => {
        context += `  ${i + 1}. ${c.FirstName} ${c.LastName} - ${c.Title || 'N/A'} at ${c.AccountName || 'N/A'}\n`;
      });
    }

    if (dbResults.deals?.length) {
      context += `\nDeals (${dbResults.deals.length}):\n`;
      dbResults.deals.forEach((d, i) => {
        context += `  ${i + 1}. ${d.DealName} - Stage: ${d.Stage} - Value: $${d.Amount} - Close: ${d.CloseDate}\n`;
      });
    }

    if (dbResults.activities?.length) {
      context += `\nActivities/Tasks (${dbResults.activities.length}):\n`;
      dbResults.activities.forEach((a, i) => {
        const status = a.DueDate && new Date(a.DueDate) < new Date() ? '[OVERDUE]' : '';
        context += `  ${i + 1}. ${status} ${a.Subject} - Due: ${a.DueDate || 'No date'} - ${a.Status}\n`;
      });
    }

    if (dbResults.products?.length) {
      context += `\nProducts (${dbResults.products.length}):\n`;
      dbResults.products.forEach((p, i) => {
        context += `  ${i + 1}. ${p.ProductName} - $${p.Price} - ${p.Category || 'N/A'}\n`;
      });
    }

    if (dbResults.insights) {
      context += `\nBUSINESS INSIGHTS:\n${JSON.stringify(dbResults.insights, null, 2)}\n`;
    }
  } else {
    context += `No specific CRM data found for this query.\n\n`;
  }

  // Add recent conversation context (last 3 exchanges)
  if (conversationHistory?.length > 0) {
    context += `\nRECENT CONVERSATION:\n`;
    conversationHistory.slice(-3).forEach(msg => {
      context += `User: ${msg.message}\nAssistant: ${msg.response}\n\n`;
    });
  }

  context += `\nProvide a helpful, specific response based on the above context.`;
  
  return context;
}

/**
 * Detects the type of request from user query
 */
function detectRequestType(userQuery) {
  const query = userQuery.toLowerCase();
  
  if (query.includes('email') || query.includes('write') || query.includes('draft') || query.includes('message')) {
    return 'email_draft';
  }
  if (query.includes('task') || query.includes('todo') || query.includes('due') || query.includes('activity')) {
    return 'task_query';
  }
  if (query.includes('insight') || query.includes('trend') || query.includes('analysis') || 
      query.includes('performance') || query.includes('report')) {
    return 'insights';
  }
  
  return 'general';
}

module.exports = { 
  generateEnhancedCRMResponse, 
  detectRequestType 
};