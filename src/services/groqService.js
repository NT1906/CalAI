import Groq from 'groq-sdk';

export async function estimateCalories({ userInput, buttonItems, previousMeals, apiKey }) {
    if (!apiKey) {
        throw new Error('Please set your Groq API key in Settings.');
    }

    const groq = new Groq({
        apiKey,
        dangerouslyAllowBrowser: true,
    });

    // Build context about previously eaten items today
    let previousContext = 'None yet today.';
    if (previousMeals && previousMeals.length > 0) {
        previousContext = previousMeals
            .map((m, i) => `${i + 1}. ${m.description} — ${m.totalCalories} kcal`)
            .join('\n');
    }

    // Build context about quick-tracked button items
    let buttonContext = 'None.';
    if (buttonItems && buttonItems.length > 0) {
        const activeButtons = buttonItems.filter(b => b.quantity > 0);
        if (activeButtons.length > 0) {
            buttonContext = activeButtons
                .map(b => `${b.name}: ${b.quantity} ${b.unit}(s) × ${b.caloriesPerUnit} kcal each = ${b.quantity * b.caloriesPerUnit} kcal`)
                .join('\n');
        }
    }

    const prompt = `You are a precise nutrition and fitness estimation assistant. The user may describe either a MEAL or an EXERCISE activity. Determine which one it is and respond accordingly.

If it is a MEAL: estimate the total calories consumed and macronutrients. Be realistic and accurate. Use standard Indian/international portion sizes.
If it is EXERCISE: estimate the total calories burned based on the activity, duration, and average body weight (~70kg). Set macros to 0.

PREVIOUSLY EATEN TODAY:
${previousContext}

QUICK-TRACKED ITEMS TODAY:
${buttonContext}

USER INPUT: "${userInput}"

You MUST respond ONLY with valid JSON, no extra text. Use this exact format:
{
  "type": "food" or "exercise",
  "totalCalories": <number (positive for food, positive for exercise — the burned amount)>,
  "totalProtein": <number in grams>,
  "totalCarbs": <number in grams>,
  "totalFats": <number in grams>,
  "totalFiber": <number in grams>,
  "items": [{"name": "<item or exercise name>", "calories": <number>, "protein": <number>, "carbs": <number>, "fats": <number>, "fiber": <number>}],
  "explanation": "<brief 1-2 sentence reasoning>"
}`;

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'You are a nutrition and fitness expert AI. You estimate calories and macronutrients from food descriptions, and calories burned from exercise descriptions. Always respond with valid JSON only, no markdown formatting, no code blocks.'
                },
                { role: 'user', content: prompt }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.3,
            max_completion_tokens: 500,
        });

        const responseText = completion.choices[0]?.message?.content?.trim();

        // Try to parse JSON from the response
        let result;
        try {
            // Handle case where response might be wrapped in code blocks
            const jsonStr = responseText.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
            result = JSON.parse(jsonStr);
        } catch (parseErr) {
            // Try to extract JSON from the response
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                result = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('Could not parse AI response. Please try again.');
            }
        }

        return {
            type: result.type || 'food',
            totalCalories: Math.round(result.totalCalories || 0),
            totalProtein: Math.round(result.totalProtein || 0),
            totalCarbs: Math.round(result.totalCarbs || 0),
            totalFats: Math.round(result.totalFats || 0),
            totalFiber: Math.round(result.totalFiber || 0),
            items: (result.items || []).map(item => ({
                name: item.name,
                calories: Math.round(item.calories || 0),
                protein: Math.round(item.protein || 0),
                carbs: Math.round(item.carbs || 0),
                fats: Math.round(item.fats || 0),
                fiber: Math.round(item.fiber || 0),
            })),
            explanation: result.explanation || '',
        };
    } catch (error) {
        if (error.message?.includes('API key')) {
            throw new Error('Invalid Groq API key. Please check your key in Settings.');
        }
        throw error;
    }
}

export async function estimateCaloriesFromImage({ imageBase64, mimeType, userInput, buttonItems, previousMeals, apiKey }) {
    if (!apiKey) {
        throw new Error('Please set your Groq API key in Settings.');
    }

    const groq = new Groq({
        apiKey,
        dangerouslyAllowBrowser: true,
    });

    // Build context about previously eaten items today
    let previousContext = 'None yet today.';
    if (previousMeals && previousMeals.length > 0) {
        previousContext = previousMeals
            .map((m, i) => `${i + 1}. ${m.description} — ${m.totalCalories} kcal`)
            .join('\n');
    }

    // Build context about quick-tracked button items
    let buttonContext = 'None.';
    if (buttonItems && buttonItems.length > 0) {
        const activeButtons = buttonItems.filter(b => b.quantity > 0);
        if (activeButtons.length > 0) {
            buttonContext = activeButtons
                .map(b => `${b.name}: ${b.quantity} ${b.unit}(s) × ${b.caloriesPerUnit} kcal each = ${b.quantity * b.caloriesPerUnit} kcal`)
                .join('\n');
        }
    }

    const additionalContext = userInput?.trim()
        ? `\nADDITIONAL CONTEXT FROM USER: "${userInput.trim()}"`
        : '';

    const prompt = `You are a precise calorie estimation assistant. Look at this food image and estimate the total calories. Be realistic and accurate. Use standard Indian/international portion sizes.

PREVIOUSLY EATEN TODAY:
${previousContext}

QUICK-TRACKED ITEMS TODAY:
${buttonContext}
${additionalContext}

Analyze the food shown in this image and estimate calories and macronutrients.

You MUST respond ONLY with valid JSON, no extra text. Use this exact format:
{
  "totalCalories": <number>,
  "totalProtein": <number in grams>,
  "totalCarbs": <number in grams>,
  "totalFats": <number in grams>,
  "totalFiber": <number in grams>,
  "items": [{"name": "<item name>", "calories": <number>, "protein": <number in grams>, "carbs": <number in grams>, "fats": <number in grams>, "fiber": <number in grams>}],
  "explanation": "<brief 1-2 sentence reasoning>"
}`;

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'You are a nutrition expert AI. You estimate calories and macronutrients (protein, carbs, fats, fiber) from food images accurately. Always respond with valid JSON only, no markdown formatting, no code blocks.'
                },
                {
                    role: 'user',
                    content: [
                        {
                            type: 'image_url',
                            image_url: {
                                url: `data:${mimeType};base64,${imageBase64}`,
                            },
                        },
                        {
                            type: 'text',
                            text: prompt,
                        },
                    ],
                }
            ],
            model: 'meta-llama/llama-4-scout-17b-16e-instruct',
            temperature: 0.3,
            max_completion_tokens: 500,
        });

        const responseText = completion.choices[0]?.message?.content?.trim();

        let result;
        try {
            const jsonStr = responseText.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
            result = JSON.parse(jsonStr);
        } catch (parseErr) {
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                result = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('Could not parse AI response. Please try again.');
            }
        }

        return {
            type: result.type || 'food',
            totalCalories: Math.round(result.totalCalories || 0),
            totalProtein: Math.round(result.totalProtein || 0),
            totalCarbs: Math.round(result.totalCarbs || 0),
            totalFats: Math.round(result.totalFats || 0),
            totalFiber: Math.round(result.totalFiber || 0),
            items: (result.items || []).map(item => ({
                name: item.name,
                calories: Math.round(item.calories || 0),
                protein: Math.round(item.protein || 0),
                carbs: Math.round(item.carbs || 0),
                fats: Math.round(item.fats || 0),
                fiber: Math.round(item.fiber || 0),
            })),
            explanation: result.explanation || '',
        };
    } catch (error) {
        if (error.message?.includes('API key')) {
            throw new Error('Invalid Groq API key. Please check your key in Settings.');
        }
        throw error;
    }
}

export async function estimateButtonCalories({ buttonName, unit, apiKey }) {
    if (!apiKey) {
        throw new Error('Please set your Groq API key in Settings.');
    }

    const groq = new Groq({
        apiKey,
        dangerouslyAllowBrowser: true,
    });

    const prompt = `How many calories are in 1 ${unit} of ${buttonName}? Use standard Indian/international portion sizes. Respond ONLY with a JSON object: {"calories": <number>, "note": "<brief note>"}`;

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: 'You are a nutrition expert. Respond with valid JSON only.' },
                { role: 'user', content: prompt }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.3,
            max_completion_tokens: 100,
        });

        const responseText = completion.choices[0]?.message?.content?.trim();
        const jsonStr = responseText.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
        const result = JSON.parse(jsonStr);
        return Math.round(result.calories || 0);
    } catch {
        return 0;
    }
}
