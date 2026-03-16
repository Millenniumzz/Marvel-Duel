import { KEYWORD_MECHANICS, FACTION_KEYWORDS, BATTLE_STYLE_KEYWORDS } from '../constants/keywords'

interface Replacement {
  keyword: string
  placeholder: string
  originalMatch: string
  colorClass: string
}

/**
 * Highlights keywords in text with different colors based on their category
 * - Keywords mechanics: yellow
 * - Faction keywords: cyan
 * - Battle style keywords: colored by type
 * - Character names in brackets [Name]: blue
 * @param text - The text to process
 * @returns JSX with highlighted keywords
 */
export const highlightKeywords = (text: string) => {
  if (!text) return null
  
  let processedText = text
  const replacements: Replacement[] = []
  let placeholderIndex = 0
  
  // First, handle character names in brackets [Name] - highest priority
  const bracketRegex = /\[([^\]]+)\]/g
  let bracketMatch
  while ((bracketMatch = bracketRegex.exec(processedText)) !== null) {
    const placeholder = `__KW${placeholderIndex}__`
    const fullMatch = bracketMatch[0] // [Name]
    const characterName = bracketMatch[1] // Name
    const matchIndex = bracketMatch.index
    
    // Replace this occurrence using substring slicing
    processedText = processedText.substring(0, matchIndex) + 
                   placeholder + 
                   processedText.substring(matchIndex + fullMatch.length)
    
    replacements.push({
      keyword: characterName,
      placeholder,
      originalMatch: fullMatch,
      colorClass: 'text-blue-400 font-bold'
    })
    
    placeholderIndex++
    
    // Reset regex after replacement
    bracketRegex.lastIndex = 0
  }
  
  // Sort all keywords by length (longest first) to avoid partial matches
  const allKeywords = [
    ...KEYWORD_MECHANICS.map(k => ({ 
      keyword: k, 
      colorClass: 'text-yellow-400 font-bold', 
      useWordBoundary: true 
    })),
    ...FACTION_KEYWORDS.map(k => ({ 
      keyword: k, 
      colorClass: 'text-cyan-400 font-bold', 
      useWordBoundary: false 
    })),
    ...BATTLE_STYLE_KEYWORDS.map(k => ({ 
      keyword: k.keyword, 
      colorClass: `${k.color} font-bold`, 
      useWordBoundary: true 
    }))
  ].sort((a, b) => b.keyword.length - a.keyword.length)
  
  // Replace keywords with placeholders
  allKeywords.forEach(({ keyword, colorClass, useWordBoundary }) => {
    // For special character names, create variations
    const isSpecialChar = keyword.includes(' Character')
    const patterns = isSpecialChar 
      ? [keyword + 's', keyword] // Try plural first, then singular
      : [keyword]
    
    patterns.forEach(pattern => {
      // Case-insensitive global replace with optional word boundary
      const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regexPattern = useWordBoundary ? `\\b${escapedPattern}\\b` : escapedPattern
      const regex = new RegExp(regexPattern, 'gi')
      
      let match
      while ((match = regex.exec(processedText)) !== null) {
        const placeholder = `__KW${placeholderIndex}__`
        const matchedText = match[0]
        
        // Replace this occurrence
        processedText = processedText.substring(0, match.index) + 
                       placeholder + 
                       processedText.substring(match.index + matchedText.length)
        
        replacements.push({ 
          keyword: matchedText, 
          placeholder, 
          originalMatch: matchedText,
          colorClass
        })
        
        placeholderIndex++
        
        // Reset regex after replacement
        regex.lastIndex = 0
      }
    })
  })
  
  // Split text and create elements
  const parts = processedText.split(/(__KW\d+__)/)
  
  return (
    <>
      {parts.map((part, index) => {
        const replacement = replacements.find(r => r.placeholder === part)
        if (replacement) {
          return (
            <span key={index} className={replacement.colorClass}>
              {replacement.keyword}
            </span>
          )
        }
        return <span key={index}>{part}</span>
      })}
    </>
  )
}
